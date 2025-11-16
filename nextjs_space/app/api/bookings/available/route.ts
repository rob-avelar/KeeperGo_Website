

export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'GOALKEEPER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all available bookings (no goalkeeper assigned, future dates, pending status)
    const availableBookings = await prisma.booking.findMany({
      where: {
        goalkeeperId: null,
        status: 'PENDING',
        date: {
          gte: new Date() // Only future bookings
        }
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'asc' // Show earliest matches first
      }
    })

    return NextResponse.json(availableBookings)
  } catch (error) {
    console.error('Error fetching available bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
