export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } })

    if (user && user.password) {
      // Only for users with password (not Google SSO)
      // Generate a secure token
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Invalidate any existing tokens for this user
      await prisma.passwordReset.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() }
      })

      // Create new reset token
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        }
      })

      // Send email with reset link
      const appUrl = process.env.NEXTAUTH_URL || 'https://keepergo.nl'
      const resetUrl = `${appUrl}/auth/reset-password?token=${token}`
      const hostname = new URL(appUrl).hostname

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111827; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #a3e635; margin: 0;">KeeperGo</h1>
          </div>
          <h2 style="color: #e5e7eb; margin: 0 0 16px;">Password Reset Request</h2>
          <p style="color: #9ca3af; margin: 0 0 16px;">Hi ${user.name || 'there'},</p>
          <p style="color: #9ca3af; margin: 0 0 24px;">We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: #a3e635; color: #111827; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">This link expires in 1 hour.</p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #374151; margin: 24px 0;" />
          <p style="color: #4b5563; font-size: 12px; text-align: center;">KeeperGo — The #1 Goalkeeper Rental Platform in the Netherlands</p>
        </div>
      `

      await sendNotificationEmail({
        recipientEmail: user.email,
        subject: 'Reset your KeeperGo password',
        htmlBody,
        notificationId: process.env.NOTIF_ID_PASSWORD_RESET || '',
      }).catch((err) => console.error('[ForgotPassword] Error sending email:', err))
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
