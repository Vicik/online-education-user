import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../app/composables/useApi'
import { getCourse, getCourses } from '../../../app/features/course/course.service'

vi.mock('../../../app/composables/useApi', () => ({
  apiRequest: vi.fn(),
}))

describe('course service', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset()
  })

  it('serializes only meaningful catalogue query parameters', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [], page: 2, pageSize: 12, total: 0 })

    await getCourses({
      page: 2,
      pageSize: 12,
      category: 'frontend',
      keyword: ' Nuxt SSR ',
      sort: 'latest',
    })

    expect(apiRequest).toHaveBeenCalledWith('/v1/courses', {
      query: {
        page: 2,
        pageSize: 12,
        category: 'frontend',
        keyword: 'Nuxt SSR',
        sort: 'latest',
      },
    })
  })

  it('omits empty and default list parameters', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [], page: 1, pageSize: 12, total: 0 })

    await getCourses({ page: 1, pageSize: 12, category: '', keyword: '  ' })

    expect(apiRequest).toHaveBeenCalledWith('/v1/courses', {
      query: { pageSize: 12 },
    })
  })

  it('encodes the course slug and preserves a normalized 404', async () => {
    const notFound = { code: 'NOT_FOUND', message: '请求的内容不存在。', status: 404 }
    vi.mocked(apiRequest).mockRejectedValue(notFound)

    await expect(getCourse('nuxt/进阶')).rejects.toEqual(notFound)
    expect(apiRequest).toHaveBeenCalledWith('/v1/courses/nuxt%2F%E8%BF%9B%E9%98%B6')
  })
})
