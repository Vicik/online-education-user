import { describe, expect, it } from 'vitest'
import { promotionState } from '../../../app/features/promotion/promotion-state'

describe('promotionState', () => {
  const startsAt = '2026-10-30T10:00:00+08:00'
  const endsAt = '2026-10-30T12:00:00+08:00'

  it('becomes active at the exact start timestamp', () => {
    expect(promotionState(Date.parse(startsAt), startsAt, endsAt, 8)).toBe('active')
  })

  it('becomes ended at the exact end timestamp', () => {
    expect(promotionState(Date.parse(endsAt), startsAt, endsAt, 8)).toBe('ended')
  })

  it('reports sold-out when active inventory reaches zero', () => {
    expect(promotionState(Date.parse('2026-10-30T11:00:00+08:00'), startsAt, endsAt, 0)).toBe('sold-out')
  })

  it('reports upcoming before the start timestamp', () => {
    expect(promotionState(Date.parse('2026-10-30T09:59:59+08:00'), startsAt, endsAt, 8)).toBe('upcoming')
  })

  it.each([
    [Number.NaN, startsAt, endsAt],
    [Date.parse('2026-10-30T11:00:00+08:00'), 'not-a-date', endsAt],
    [Date.parse('2026-10-30T11:00:00+08:00'), startsAt, 'not-a-date'],
    [Date.parse('2026-10-30T11:00:00+08:00'), endsAt, startsAt],
  ])('fails closed as ended for invalid time input', (now, start, end) => {
    expect(promotionState(now, start, end, 8)).toBe('ended')
  })
})
