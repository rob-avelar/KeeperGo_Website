export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role, targetRole } = body
    const requestedRole = role || targetRole

    if (!requestedRole || !['ORGANIZER', 'GOALKEEPER'].includes(requestedRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, roles: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ADMIN accounts cannot switch roles
    if (user.role === 'ADMIN' || user.roles.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Admin accounts cannot switch to other roles.' },
        { status: 403 }
      )
    }

    // Only allow switching to a role the user already has
    if (!user.roles.includes(requestedRole)) {
      return NextResponse.json(
        { error: `You don't have the ${requestedRole} role. Please register as ${requestedRole.toLowerCase()} first.` },
        { status: 403 }
      )
    }

    // Update the active role (don't modify roles[])
    await prisma.user.update({
      where: { id: user.id },
      data: { role: requestedRole }
    })

    return NextResponse.json({ success: true, role: requestedRole }, { status: 200 })
  } catch (error) {
    console.error('Error switching role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
