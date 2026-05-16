import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const REFERRAL_REWARD_CENTS = 500 // €5

/**
 * Process referral reward when a booking is completed.
 * Checks if the organizer or goalkeeper was referred and if this is their first completed booking.
 * If so, marks the referral as COMPLETED and credits the referrer.
 * 
 * ANTI-FRAUD: Blocks rewards when:
 * - The booking is between the referrer and the person they referred (referral loop)
 * - The referrer is involved in the same booking as the referred user
 * 
 * Can run inside an existing transaction (pass tx) or standalone.
 */
export async function processReferralReward(
  organizerId: string,
  goalkeeperId: string | null,
  tx?: any
) {
  const db = tx || prisma

  // Collect both parties of the booking for cross-checking
  const bookingParticipants = new Set<string>([organizerId])
  if (goalkeeperId) bookingParticipants.add(goalkeeperId)

  // Check both the organizer and goalkeeper
  const userIds = [organizerId]
  if (goalkeeperId) userIds.push(goalkeeperId)

  for (const userId of userIds) {
    // Find a referral where this user was referred and hasn't been rewarded yet
    const referral = await db.referral.findFirst({
      where: {
        referredId: userId,
        status: 'SIGNED_UP', // not yet completed
        referrerRewarded: false,
      },
    })

    if (!referral) continue

    // ANTI-FRAUD: Block reward if the referrer is the other party in this booking.
    // e.g. Referrer (organizer) referred a goalkeeper, then books that goalkeeper — no reward.
    // e.g. Referrer (goalkeeper) referred an organizer, organizer books them — no reward.
    if (bookingParticipants.has(referral.referrerId)) {
      console.log(
        `[Referral Anti-Fraud] Blocked reward: referrer ${referral.referrerId} is a participant in the same booking as referred user ${userId}. Booking: org=${organizerId}, gk=${goalkeeperId}`
      )
      continue
    }

    // Check if this is their first completed booking (as organizer or goalkeeper)
    const completedBookingsCount = await db.booking.count({
      where: {
        OR: [
          { organizerId: userId, status: 'COMPLETED' },
          { goalkeeperId: userId, status: 'COMPLETED' },
        ],
      },
    })

    // Only reward on the first completed booking (count is 1 because the current one just got completed)
    if (completedBookingsCount > 1) continue

    // Mark referral as completed and reward the referrer
    await db.referral.update({
      where: { id: referral.id },
      data: {
        status: 'COMPLETED',
        referrerRewarded: true,
      },
    })

    // Add credit to the referrer's account
    await db.user.update({
      where: { id: referral.referrerId },
      data: {
        referralCredit: { increment: REFERRAL_REWARD_CENTS },
      },
    })

    console.log(`Referral reward: €${REFERRAL_REWARD_CENTS / 100} credited to user ${referral.referrerId} for referring user ${userId}`)
  }
}

export function generateReferralCode(): string {
  return 'KG-' + crypto.randomBytes(4).toString('hex').toUpperCase()
}

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true }
  })

  if (user?.referralCode) {
    return user.referralCode
  }

  const code = generateReferralCode()
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code }
  })

  return code
}

export async function getReferralStats(userId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: {
      referred: {
        select: { name: true, email: true, role: true, createdAt: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const totalReferred = referrals.length
  const signedUp = referrals.filter((r: any) => r.status === 'SIGNED_UP' || r.status === 'COMPLETED').length
  const completed = referrals.filter((r: any) => r.status === 'COMPLETED').length
  const totalEarned = referrals.filter((r: any) => r.referrerRewarded).reduce((sum: number, r: any) => sum + r.rewardAmount, 0)

  return {
    referrals,
    totalReferred,
    signedUp,
    completed,
    totalEarned
  }
}
