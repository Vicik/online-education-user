import { afterEach, describe, expect, it } from 'vitest'
import { formatPromotionEndTime } from '../../../app/features/home/home-formatters'

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
