
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    // Find the user by email or session
    let user = null
    const session = await getServerSession(authOptions)
    
    if (session?.user?.id) {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { goalkeeperProfile: true }
      })
    }
    
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
        include: { goalkeeperProfile: true }
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ADMIN accounts cannot add other roles
    const currentRoles: string[] = (user as any).roles || []
    if ((user as any).role === 'ADMIN' || currentRoles.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Admin accounts cannot register for other roles.' },
        { status: 400 }
      )
    }

    // Update user with role — add to roles[] (merge, don't overwrite)
    const updatedRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role]

    await prisma.user.update({
      where: { id: user.id },
      data: { role, roles: updatedRoles }
    })

    // If role is GOALKEEPER, create a goalkeeper profile
    if (role === 'GOALKEEPER' && !user.goalkeeperProfile) {
      await prisma.goalkeeperProfile.create({
        data: {
          userId: user.id,
          bio: '',
          experienceLevel: 'BEGINNER',
          preferredFields: [],
          serviceRadius: 10,
          hourlyRateMin: 2500,
          hourlyRateMax: 3000,
        }
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error completing registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
