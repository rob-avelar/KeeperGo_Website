export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { retrievePaymentIntent } from '@/lib/stripe'
import { sendPaymentReceivedEmail, sendNewBookingAvailableEmail, sendNewBookingAdminAlert } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id

    // Fetch booking with payment
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        organizerId: true,
        goalkeeperId: true,
        status: true,
        totalAmount: true,
        date: true,
        location: true,
        fieldType: true,
        duration: true,
        pricePerHour: true,
        paidAt: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        organizer: {
          select: { id: true, name: true, email: true }
        },
        goalkeeper: {
          select: { id: true, name: true, email: true, emailNotifications: true }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Already paid
    if (booking.paidAt) {
      return NextResponse.json({ success: true, message: 'Booking already paid' })
    }

    // Already confirmed (legacy)
    if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Booking already confirmed' })
    }

    const payment = booking.payments[0]
    if (!payment?.stripePaymentId) {
      return NextResponse.json({ error: 'No payment found for this booking' }, { status: 400 })
    }

    // Verify payment with Stripe
    const paymentIntent = await retrievePaymentIntent(payment.stripePaymentId)

    // For async payment methods (iDEAL, PayPal), status may be 'processing'
    if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'processing') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${paymentIntent.status}` },
        { status: 400 }
      )
    }

    // If still processing (async methods like iDEAL), mark as processing and treat as success for UX
    const isProcessing = paymentIntent.status === 'processing'

    // Determine new status based on booking type:
    // - Direct booking (has goalkeeper) → CONFIRMED (paid + goalkeeper assigned)
    // - Open booking (no goalkeeper) → stay PENDING (paid, waiting for goalkeeper)
    const hasGoalkeeper = !!booking.goalkeeperId
    const newStatus = hasGoalkeeper ? 'CONFIRMED' : booking.status // keep PENDING for open bookings

    // Update booking and payment in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Update booking: set paidAt and status
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          paidAt: new Date(),
          status: newStatus,
        }
      })

      // Update payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: isProcessing ? 'PROCESSING' : 'COMPLETED' }
      })

      // Notify goalkeeper that payment is received (only if assigned)
      if (booking.goalkeeperId) {
        await tx.notification.create({
          data: {
            userId: booking.goalkeeperId,
            bookingId: bookingId,
            title: 'Payment Received - Match Confirmed!',
            message: `The organizer has paid €${(booking.totalAmount / 100).toFixed(2)} for the match on ${new Date(booking.date).toLocaleDateString()}. The match is now confirmed!`,
            type: 'PAYMENT_RECEIVED'
          }
        })
      }

      // Notify organizer
      const orgMessage = hasGoalkeeper
        ? `Your payment of €${(booking.totalAmount / 100).toFixed(2)} was successful. The match is confirmed!`
        : `Your payment of €${(booking.totalAmount / 100).toFixed(2)} was successful. Your match announcement is now live — goalkeepers can accept it.`
      await tx.notification.create({
        data: {
          userId: session.user.id,
          bookingId: bookingId,
          title: hasGoalkeeper ? 'Payment Successful — Match Confirmed' : 'Payment Successful — Announcement Live',
          message: orgMessage,
          type: 'BOOKING_CONFIRMED'
        }
      })
    })

    // Send payment received email to goalkeeper (if assigned)
    if (booking.goalkeeper?.email && booking.goalkeeper.emailNotifications) {
      sendPaymentReceivedEmail(
        booking.goalkeeper.email,
        booking.goalkeeper.name || 'Goalkeeper',
        booking.totalAmount,
        booking.date,
        booking.location
      ).catch(err => console.error('[ConfirmPayment] Email send error:', err))
    }

    // Now that payment is confirmed, send booking notification emails
    // Notify all active goalkeepers about the new match (for open bookings)
    if (!hasGoalkeeper) {
      notifyGoalkeepers(booking).catch(err =>
        console.error('[ConfirmPayment] Error notifying goalkeepers:', err)
      )
    }

    // Send admin alert email
    sendNewBookingAdminAlert(
      booking.organizer?.name || 'Unknown',
      booking.organizer?.email || '',
      booking.date,
      booking.location,
      booking.fieldType,
      booking.pricePerHour,
      booking.duration,
      hasGoalkeeper ? 'direct' : 'open'
    ).catch(err => console.error('[ConfirmPayment] Error sending admin alert:', err))

    return NextResponse.json({ success: true, message: hasGoalkeeper ? 'Payment confirmed and match confirmed' : 'Payment confirmed, announcement is live' })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
  }
}

// Notify all active goalkeepers about a new paid open match
async function notifyGoalkeepers(
  booking: { date: Date; location: string; fieldType: string; pricePerHour: number; duration: number; goalkeeperId: string | null }
) {
  const goalkeepers = await prisma.user.findMany({
    where: {
      role: 'GOALKEEPER',
      ...(booking.goalkeeperId ? { id: { not: booking.goalkeeperId } } : {}),
      goalkeeperProfile: {
        isActive: true,
        blockedUntil: null,
      },
    },
    select: { id: true, name: true, email: true },
  })

  if (goalkeepers.length === 0) {
    console.log('[ConfirmPayment] No active goalkeepers to notify')
    return
  }

  console.log(`[ConfirmPayment] Notifying ${goalkeepers.length} goalkeeper(s) about paid match`)

  const batchSize = 5
  for (let i = 0; i < goalkeepers.length; i += batchSize) {
    const batch = goalkeepers.slice(i, i + batchSize)
    await Promise.allSettled(
      batch.map((gk: any) =>
        sendNewBookingAvailableEmail(
          gk.email,
          gk.name || 'Goalkeeper',
          booking.date,
          booking.location,
          booking.fieldType,
          booking.pricePerHour,
          booking.duration
        )
      )
    )
  }

  console.log(`[ConfirmPayment] Finished notifying goalkeepers`)
}
