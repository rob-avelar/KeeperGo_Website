export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { retrievePaymentIntent } from '@/lib/stripe'
import { sendPaymentReceivedEmail } from '@/lib/email'

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
        paidAt: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
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

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${paymentIntent.status}` },
        { status: 400 }
      )
    }

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
        data: { status: 'COMPLETED' }
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

    return NextResponse.json({ success: true, message: hasGoalkeeper ? 'Payment confirmed and match confirmed' : 'Payment confirmed, announcement is live' })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
  }
}
