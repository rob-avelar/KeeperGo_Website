export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentIntentForBooking } from '@/lib/stripe'
import { calcGoalkeeperEarning, calcPlatformFee } from '@/lib/pricing'

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

    // Fetch booking with goalkeeper's Stripe info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        goalkeeperProfile: {
          select: {
            stripeAccountId: true,
            stripeChargesEnabled: true,
          }
        },
        goalkeeper: {
          select: { id: true, name: true }
        },
        payments: {
          where: { status: { in: ['PENDING', 'PROCESSING'] } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Only the organizer can pay
    if (booking.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Only the organizer can pay for this booking' }, { status: 403 })
    }

    // Booking must be ACCEPTED (goalkeeper accepted, awaiting payment)
    if (booking.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: `Cannot pay for a booking with status: ${booking.status}` },
        { status: 400 }
      )
    }

    // Check if there's already a pending payment with a valid client secret
    const existingPayment = booking.payments[0]
    if (existingPayment?.stripeClientSecret && existingPayment?.stripePaymentId) {
      return NextResponse.json({
        clientSecret: existingPayment.stripeClientSecret,
        paymentId: existingPayment.id,
        amount: booking.totalAmount,
      })
    }

    // Check if organizer has referral credit to apply
    const organizer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCredit: true }
    })

    const availableCredit = organizer?.referralCredit || 0
    const creditToApply = Math.min(availableCredit, booking.totalAmount)
    const chargeAmount = booking.totalAmount - creditToApply

    // Get goalkeeper's Stripe account (for destination charge)
    const goalkeeperStripeAccountId = booking.goalkeeperProfile?.stripeAccountId || null

    let paymentIntent: any = null
    let stripeClientSecret: string | null = null
    let stripePaymentId: string | null = null

    if (chargeAmount > 0) {
      // Create PaymentIntent for the remaining amount after credit
      paymentIntent = await createPaymentIntentForBooking(
        chargeAmount,
        bookingId,
        goalkeeperStripeAccountId
      )
      stripeClientSecret = paymentIntent.client_secret
      stripePaymentId = paymentIntent.id
    }

    // Calculate fee split (based on full booking amount)
    const goalkeeperEarning = calcGoalkeeperEarning(booking.totalAmount)
    const platformFee = calcPlatformFee(booking.totalAmount)

    // Deduct credit from organizer's account
    if (creditToApply > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCredit: { decrement: creditToApply } }
      })
    }

    // Create Payment record in DB
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        bookingId: bookingId,
        stripePaymentId: stripePaymentId || `credit_${bookingId}_${Date.now()}`,
        amount: booking.totalAmount,
        platformFee,
        goalkeeperEarning,
        status: chargeAmount > 0 ? 'PENDING' : 'COMPLETED',
        stripeClientSecret: stripeClientSecret,
        paymentMethod: chargeAmount > 0
          ? (goalkeeperStripeAccountId ? 'stripe_destination' : 'stripe_platform')
          : 'referral_credit',
      }
    })

    // If fully covered by credit, also mark booking as CONFIRMED
    if (chargeAmount === 0) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' }
      })

      // Notify goalkeeper
      if (booking.goalkeeperId) {
        await prisma.notification.create({
          data: {
            userId: booking.goalkeeperId,
            bookingId: bookingId,
            title: 'Payment Received - Match Confirmed!',
            message: `Payment received (via referral credit)! The match on ${new Date(booking.date).toLocaleDateString()} is now confirmed.`,
            type: 'PAYMENT_RECEIVED'
          }
        })
      }
    }

    return NextResponse.json({
      clientSecret: stripeClientSecret,
      paymentId: payment.id,
      amount: booking.totalAmount,
      creditApplied: creditToApply,
      chargeAmount,
      fullyCoveredByCredit: chargeAmount === 0,
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
