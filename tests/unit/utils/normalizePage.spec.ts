import { describe, expect, it } from 'vitest'
import { normalizePage } from '~/utils/normalizePage'

describe('normalizePage', () => {
  it.each([
    undefined,
    null,
    '',
    'abc',
    '0',
    0,
    -1,
    1.5,
    Number.NaN,
    ['2'],
  ])('将非法页码 %j 归一化为 1', (value) => {
    expect(normalizePage(value)).toBe(1)
  })

  it.each([
    ['1', 1],
    ['12', 12],
    [3, 3],
  ])('保留有效正整数页码 %j', (value, expected) => {
    expect(normalizePage(value)).toBe(expected)
  })
})
