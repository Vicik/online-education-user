import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../app/composables/useApi'
import { getHome } from '../../../app/features/home/home.service'
import type { HomeResponse } from '../../../app/features/home/home.types'

vi.mock('../../../app/composables/useApi', () => ({
  apiRequest: vi.fn(),
}))

const homeResponse: HomeResponse = {
  banners: [],
  groupBuys: [],
  latestCourses: [],
  recommendedCourses: [],
}

describe('getHome', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset()
  })

  it('loads the public home payload from the approved endpoint', async () => {
    vi.mocked(apiRequest).mockResolvedValue(homeResponse)

    await expect(getHome()).resolves.toEqual(homeResponse)
    expect(apiRequest).toHaveBeenCalledWith('/v1/home')
  })
})
