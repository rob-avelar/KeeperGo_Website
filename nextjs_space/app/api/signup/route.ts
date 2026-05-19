
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  role: z.enum(['ORGANIZER', 'GOALKEEPER'], { message: 'Invalid role' }),
  inviteCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }
    const { email, password, name, role, inviteCode } = parsed.data

    // Check if beta mode is enabled
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'settings' }
    })
    const betaModeEnabled = settings?.betaModeEnabled ?? true

    // Validate invite code if beta mode is enabled
    let invite = null
    if (betaModeEnabled) {
      if (!inviteCode) {
        return NextResponse.json(
          { error: 'Invite code required during beta' },
          { status: 400 }
        )
      }

      invite = await prisma.betaInvite.findUnique({
        where: { code: inviteCode.toUpperCase().trim() }
      })

      if (!invite) {
        return NextResponse.json(
          { error: 'Invalid invite code' },
          { status: 400 }
        )
      }

      if (invite.usedAt) {
        return NextResponse.json(
          { error: 'Invite code already used' },
          { status: 400 }
        )
      }

      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Invite code expired' },
          { status: 400 }
        )
      }

      // Check if invite is restricted to a specific email
      if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: 'This invite code is reserved for another email' },
          { status: 400 }
        )
      }
    }

    const normalizedRole = role as 'ORGANIZER' | 'GOALKEEPER'

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true, roles: true, goalkeeperProfile: true }
    })

    if (existingUser) {
      // ADMIN accounts cannot add other roles
      const existingRoles = (existingUser as any).roles || []
      if (existingUser.role === 'ADMIN' || existingRoles.includes('ADMIN')) {
        return NextResponse.json(
          { error: 'Admin accounts cannot register for other roles. Please use a different email.' },
          { status: 400 }
        )
      }

      // If user exists, verify password and allow adding a new role
      if (!existingUser.password) {
        // Google SSO user - they should use Google to sign in
        return NextResponse.json(
          { error: 'This email is registered with Google. Please use Google sign-in.' },
          { status: 400 }
        )
      }

      const isPasswordValid = await bcrypt.compare(password, existingUser.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Email already registered. If this is your account, use the correct password to add this role.' },
          { status: 400 }
        )
      }

      // Add the new role to the user's roles array (merge, don't overwrite)
      const currentRoles = (existingUser as any).roles || []
      const updatedRoles = currentRoles.includes(normalizedRole) 
        ? currentRoles 
        : [...currentRoles, normalizedRole]

      await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          role: normalizedRole,
          roles: updatedRoles
        }
      })

      // Create goalkeeper profile if adding goalkeeper role and profile doesn't exist
      if (normalizedRole === 'GOALKEEPER' && !existingUser.goalkeeperProfile) {
        await prisma.goalkeeperProfile.create({
          data: {
            userId: existingUser.id,
          }
        })
      }

      // Mark invite as used
      if (invite) {
        await prisma.betaInvite.update({
          where: { id: invite.id },
          data: {
            usedBy: existingUser.id,
            usedAt: new Date()
          }
        })
      }

      return NextResponse.json(
        { message: 'Role updated successfully', userId: existingUser.id, roleAdded: true },
        { status: 200 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: normalizedRole,
        roles: [normalizedRole],
      }
    })

    // Mark invite as used
    if (invite) {
      await prisma.betaInvite.update({
        where: { id: invite.id },
        data: {
          usedBy: user.id,
          usedAt: new Date()
        }
      })
    }

    // Create goalkeeper profile if user is a goalkeeper
    if (normalizedRole === 'GOALKEEPER') {
      await prisma.goalkeeperProfile.create({
        data: {
          userId: user.id,
        }
      })
    }

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
