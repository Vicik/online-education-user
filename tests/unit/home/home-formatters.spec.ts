import { afterEach, describe, expect, it } from 'vitest'
import { formatPromotionEndTime, promotionCountdown } from '../../../app/features/home/home-formatters'

const originalTimeZone = process.env.TZ

describe('formatPromotionEndTime', () => {
  afterEach(() => {
    process.env.TZ = originalTimeZone
  })

  it('renders promotion times in China Standard Time when the server runs in UTC', () => {
    process.env.TZ = 'UTC'

    expect(formatPromotionEndTime('2026-11-30T12:00:00+08:00')).toContain('12:00')
  })

  it('uses a stable fallback for an invalid date', () => {
    expect(formatPromotionEndTime('not-a-date')).toBe('结束时间待定')
  })
})

describe('promotionCountdown', () => {
  it('splits the remaining duration into days, hours, minutes, and seconds', () => {
    const now = new Date('2026-10-29T00:00:00+08:00').getTime()

    expect(promotionCountdown('2026-10-30T02:03:04+08:00', now)).toEqual({
      days: 1,
      hours: '02',
      minutes: '03',
      seconds: '04',
    })
  })

  it('returns null at the exact end boundary and for invalid dates', () => {
    const now = new Date('2026-10-29T00:00:00+08:00').getTime()

    expect(promotionCountdown('2026-10-29T00:00:00+08:00', now)).toBeNull()
    expect(promotionCountdown('not-a-date', now)).toBeNull()
  })
})
