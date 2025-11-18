
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Cancellation policy rules
function calculateCancellationFees(
  booking: any,
  cancelledBy: 'ORGANIZER' | 'GOALKEEPER'
) {
  const now = new Date()
  const matchDate = new Date(booking.date)
  const hoursUntilMatch = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  let refundPercentage = 0
  let penaltyPercentage = 0
  let penaltyReason = ''

  if (cancelledBy === 'ORGANIZER') {
    // Organizer cancellation rules
    if (hoursUntilMatch > 48) {
      refundPercentage = 100
      penaltyReason = 'Free cancellation (>48h before match)'
    } else if (hoursUntilMatch > 24) {
      refundPercentage = 50
      penaltyReason = 'Late cancellation (24-48h before): 50% refund'
    } else if (hoursUntilMatch > 12) {
      refundPercentage = 25
      penaltyReason = 'Very late cancellation (12-24h before): 25% refund'
    } else {
      refundPercentage = 0
      penaltyReason = 'Last minute cancellation (<12h before): No refund'
    }

    const refundAmount = Math.round((booking.totalAmount * refundPercentage) / 100)
    const cancellationFee = booking.totalAmount - refundAmount

    return {
      refundAmount,
      cancellationFee,
      penaltyReason,
      hoursUntilMatch: Math.round(hoursUntilMatch * 10) / 10
    }
  } else {
    // Goalkeeper cancellation rules
    const goalkeeperEarnings = Math.round(booking.totalAmount * 0.75) // 75% of total

    if (hoursUntilMatch > 48) {
      penaltyPercentage = 0
      penaltyReason = 'Free cancellation (>48h before match)'
    } else if (hoursUntilMatch > 24) {
      penaltyPercentage = 25
      penaltyReason = 'Late cancellation (24-48h before): 25% penalty on earnings'
    } else if (hoursUntilMatch > 12) {
      penaltyPercentage = 50
      penaltyReason = 'Very late cancellation (12-24h before): 50% penalty on earnings'
    } else {
      penaltyPercentage = 100
      penaltyReason = 'Last minute cancellation (<12h before): 100% penalty + warning'
    }

    const penaltyAmount = Math.round((goalkeeperEarnings * penaltyPercentage) / 100)
    
    // For goalkeeper, the organizer gets full refund
    const refundAmount = booking.totalAmount

    return {
      refundAmount,
      cancellationFee: penaltyAmount, // This is the goalkeeper's penalty
      penaltyReason,
      hoursUntilMatch: Math.round(hoursUntilMatch * 10) / 10,
      isGoalkeeperPenalty: true
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reason } = await request.json()
    const bookingId = params.id

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        organizer: true,
        goalkeeper: true,
        goalkeeperProfile: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is authorized to cancel
    const isOrganizer = booking.organizerId === session.user.id
    const isGoalkeeper = booking.goalkeeperId === session.user.id

    if (!isOrganizer && !isGoalkeeper) {
      return NextResponse.json({ error: 'Unauthorized to cancel this booking' }, { status: 403 })
    }

    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 })
    }

    if (booking.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Cannot cancel completed booking' }, { status: 400 })
    }

    // Check if match has already started
    const now = new Date()
    if (new Date(booking.date) < now) {
      return NextResponse.json({ error: 'Cannot cancel a match that has already started' }, { status: 400 })
    }

    // Calculate cancellation fees
    const cancelledBy = isOrganizer ? 'ORGANIZER' : 'GOALKEEPER'
    const fees = calculateCancellationFees(booking, cancelledBy)

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: session.user.id,
        cancellationReason: reason || fees.penaltyReason,
        cancellationFee: fees.cancellationFee,
        refundAmount: fees.refundAmount
      }
    })

    // Create notification for the other party
    const otherUserId = isOrganizer ? booking.goalkeeperId : booking.organizerId
    
    if (otherUserId) {
      const cancellerName = isOrganizer ? booking.organizer.name : booking.goalkeeper?.name
      const cancellerRole = isOrganizer ? 'organizer' : 'goalkeeper'

      await prisma.notification.create({
        data: {
          userId: otherUserId,
          bookingId: booking.id,
          type: 'BOOKING_CANCELLED',
          title: 'Match Cancelled',
          message: `The ${cancellerRole} ${cancellerName} has cancelled the match on ${new Date(booking.date).toLocaleDateString()}. ${fees.penaltyReason}`,
          data: {
            bookingId: booking.id,
            cancelledBy: cancellerRole,
            refundAmount: fees.refundAmount,
            cancellationFee: fees.cancellationFee,
            hoursUntilMatch: fees.hoursUntilMatch
          }
        }
      })
    }

    // Create notification for the canceller (confirmation)
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        bookingId: booking.id,
        type: 'BOOKING_CANCELLED',
        title: 'Cancellation Confirmed',
        message: `Your cancellation has been processed. ${fees.penaltyReason}`,
        data: {
          bookingId: booking.id,
          refundAmount: fees.refundAmount,
          cancellationFee: fees.cancellationFee,
          hoursUntilMatch: fees.hoursUntilMatch
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
      fees: {
        refundAmount: fees.refundAmount,
        cancellationFee: fees.cancellationFee,
        penaltyReason: fees.penaltyReason,
        hoursUntilMatch: fees.hoursUntilMatch
      }
    })
  } catch (error) {
    console.error('Error cancelling booking:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}
