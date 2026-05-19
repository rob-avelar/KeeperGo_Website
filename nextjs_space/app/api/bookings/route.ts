
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNewBookingAvailableEmail, sendNewBookingAdminAlert } from '@/lib/email'
import { PRICE_PER_HOUR, DIRECT_BOOKING_PREMIUM } from '@/lib/pricing'

const createBookingSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  duration: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  location: z.string().min(1, 'Location is required'),
  latitude: z.union([z.string(), z.number()]).optional().nullable(),
  longitude: z.union([z.string(), z.number()]).optional().nullable(),
  fieldType: z.string().min(1, 'Field type is required'),
  pricePerHour: z.union([z.string(), z.number()]).optional().nullable(),
  specialRequests: z.string().max(500).optional().nullable(),
  bookingType: z.enum(['open', 'direct']).default('open'),
  goalkeeperId: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = session.user.id

    let whereClause: any = {}

    if (session.user.role === 'ORGANIZER') {
      whereClause.organizerId = userId
    } else if (session.user.role === 'GOALKEEPER') {
      whereClause.goalkeeperId = userId
    }

    if (status) {
      whereClause.status = status
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        goalkeeper: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        goalkeeperProfile: {
          select: {
            id: true,
            averageRating: true,
            totalMatches: true
          }
        },
        ratings: true,
        payments: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createBookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const {
      date,
      duration,
      location,
      latitude,
      longitude,
      fieldType,
      pricePerHour: clientPricePerHour,
      specialRequests,
      bookingType,
      goalkeeperId,
    } = parsed.data

    // Validate direct booking
    if (bookingType === 'direct' && !goalkeeperId) {
      return NextResponse.json({ error: 'Goalkeeper ID required for direct booking' }, { status: 400 })
    }

    // Prevent self-booking (organizer booking themselves as goalkeeper)
    if (bookingType === 'direct' && goalkeeperId === session.user.id) {
      return NextResponse.json({ error: 'You cannot book yourself as a goalkeeper' }, { status: 400 })
    }

    const pricePerHour = clientPricePerHour ? Number(clientPricePerHour) : PRICE_PER_HOUR

    const isPremium = bookingType === 'direct'
    const premiumMultiplier = isPremium ? DIRECT_BOOKING_PREMIUM : 1
    const baseAmount = pricePerHour * duration
    const totalAmount = Math.round(baseAmount * premiumMultiplier)

    // Get goalkeeper profile if direct booking
    let goalkeeperProfileId = null
    if (bookingType === 'direct' && goalkeeperId) {
      const goalkeeperProfile = await prisma.goalkeeperProfile.findUnique({
        where: { userId: goalkeeperId }
      })
      goalkeeperProfileId = goalkeeperProfile?.id || null

      // Check if goalkeeper exists
      const goalkeeper = await prisma.user.findUnique({
        where: { id: goalkeeperId }
      })
      if (!goalkeeper || goalkeeper.role !== 'GOALKEEPER') {
        return NextResponse.json({ error: 'Invalid goalkeeper' }, { status: 400 })
      }
    }

    // Calculate confirmation deadline for direct bookings (48h after match end time)
    let confirmationDeadline = null;
    if (bookingType === 'direct') {
      const matchDate = new Date(date);
      const matchEndTime = new Date(matchDate);
      matchEndTime.setHours(matchEndTime.getHours() + Number(duration));
      confirmationDeadline = new Date(matchEndTime);
      confirmationDeadline.setHours(confirmationDeadline.getHours() + 48);
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        organizerId: session.user.id,
        goalkeeperId: bookingType === 'direct' ? goalkeeperId : null,
        goalkeeperProfileId,
        date: new Date(date),
        duration,
        location,
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
        fieldType,
        pricePerHour,
        totalAmount,
        specialRequests,
        status: bookingType === 'direct' ? 'ACCEPTED' : 'PENDING', // Direct bookings go to ACCEPTED (awaiting payment)
        confirmationDeadline,
      }
    })

    // Create notification for direct booking
    if (bookingType === 'direct' && goalkeeperId) {
      await prisma.notification.create({
        data: {
          userId: goalkeeperId,
          type: 'BOOKING_ACCEPTED',
          title: 'Direct Booking - Awaiting Payment',
          message: `You have been directly booked for a match on ${new Date(date).toLocaleDateString()}. Awaiting organizer payment.`,
          bookingId: booking.id
        }
      })
    }

    // NOTE: Email notifications (to goalkeepers and admin) are sent AFTER payment
    // is confirmed, not at booking creation time. See confirm-payment/route.ts and
    // webhooks/stripe/route.ts for the email sending logic.

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Notify all active goalkeepers (except the one already directly booked) about a new match
async function notifyGoalkeepers(
  booking: { date: Date; location: string; fieldType: string; pricePerHour: number; duration: number },
  bookingType: string,
  directGoalkeeperId?: string
) {
  // Find all active goalkeepers with profiles
  const goalkeepers = await prisma.user.findMany({
    where: {
      role: 'GOALKEEPER',
      ...(directGoalkeeperId ? { id: { not: directGoalkeeperId } } : {}),
      goalkeeperProfile: {
        isActive: true,
        blockedUntil: null,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  if (goalkeepers.length === 0) {
    console.log('[Booking] No active goalkeepers to notify')
    return
  }

  console.log(`[Booking] Notifying ${goalkeepers.length} goalkeeper(s) about new match`)

  // Send emails in parallel (max 5 at a time to avoid overwhelming the API)
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

  console.log(`[Booking] Finished notifying goalkeepers`)
}