
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (role !== 'ORGANIZER' && role !== 'GOALKEEPER') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user with role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role }
    })

    // If role is GOALKEEPER, create a goalkeeper profile
    if (role === 'GOALKEEPER') {
      const existingProfile = await prisma.goalkeeperProfile.findUnique({
        where: { userId: user.id }
      })

      if (!existingProfile) {
        await prisma.goalkeeperProfile.create({
          data: {
            userId: user.id,
            bio: '',
            experienceLevel: 'BEGINNER',
            preferredFields: [],
            serviceRadius: 10,
            hourlyRateMin: 2000, // €20 default
            hourlyRateMax: 3000, // €30 default
          }
        })
      }
    }

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 })
  } catch (error) {
    console.error('Error completing registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
