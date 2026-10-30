import type { PromotionStatus } from './promotion.types'

export function promotionState(
  now: number,
  startsAt: string,
  endsAt: string,
  remaining: number,
): PromotionStatus {
  const start = Date.parse(startsAt)
  const end = Date.parse(endsAt)

  if (!Number.isFinite(now) || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 'ended'
  }

  if (now >= end) {
    return 'ended'
  }

  if (now < start) {
    return 'upcoming'
  }

  if (remaining <= 0) {
    return 'sold-out'
  }

  return 'active'
}
