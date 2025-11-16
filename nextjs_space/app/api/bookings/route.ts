
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const {
      date,
      duration,
      location,
      latitude,
      longitude,
      fieldType,
      pricePerHour,
      specialRequests
    } = body

    if (!date || !duration || !location || !fieldType || !pricePerHour) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const totalAmount = pricePerHour * duration

    // Create open booking (announcement) without assigned goalkeeper
    const booking = await prisma.booking.create({
      data: {
        organizerId: session.user.id,
        goalkeeperId: null, // Open for any goalkeeper to accept
        goalkeeperProfileId: null,
        date: new Date(date),
        duration: parseInt(duration),
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        fieldType,
        pricePerHour: parseInt(pricePerHour),
        totalAmount,
        specialRequests,
        status: 'PENDING' // Available for goalkeepers to accept
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
