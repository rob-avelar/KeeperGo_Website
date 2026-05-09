import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: list all active venues, optionally filter by city
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    const where: any = { isActive: true }
    if (city) where.city = city

    const venues = await prisma.venue.findMany({
      where,
      orderBy: [{ city: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        type: true,
        isCustom: true,
      },
    })

    // Get unique cities for the filter dropdown
    const cities = [...new Set(venues.map((v: { city: string }) => v.city))].sort()

    return NextResponse.json({ venues, cities })
  } catch (error) {
    console.error('Failed to fetch venues:', error)
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 })
  }
}

// POST: add a custom venue
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, address, city } = body

    if (!name || !city) {
      return NextResponse.json({ error: 'Name and city are required' }, { status: 400 })
    }

    const venue = await prisma.venue.create({
      data: {
        name,
        address: address || null,
        city,
        type: 'Custom',
        isCustom: true,
      },
    })

    return NextResponse.json({ venue })
  } catch (error) {
    console.error('Failed to create venue:', error)
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 })
  }
}
