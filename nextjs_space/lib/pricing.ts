// ─── KeeperGo Pricing Constants ───────────────────────────────────
// All monetary values are in CENTS (€25.00 = 2500)
// Change these values to update pricing across the entire platform.

/** Fixed hourly rate charged to organizers, in cents */
export const PRICE_PER_HOUR = 2500 // €25.00

/** Goalkeeper's share of the total booking amount (0.65 = 65%) */
export const GOALKEEPER_SHARE = 0.65

/** Platform's share of the total booking amount (0.35 = 35%) */
export const PLATFORM_SHARE = 0.35

/** Premium multiplier for direct bookings (1.25 = +25%) */
export const DIRECT_BOOKING_PREMIUM = 1.25

// ─── Helper functions ─────────────────────────────────────────────

/** Calculate goalkeeper earnings from a total amount in cents */
export function calcGoalkeeperEarning(totalAmountCents: number): number {
  return Math.floor(totalAmountCents * GOALKEEPER_SHARE)
}

/** Calculate platform fee from a total amount in cents */
export function calcPlatformFee(totalAmountCents: number): number {
  return totalAmountCents - calcGoalkeeperEarning(totalAmountCents)
}
