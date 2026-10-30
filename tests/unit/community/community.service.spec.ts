import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../app/composables/useApi'
import { getPost, getPosts } from '../../../app/features/community/community.service'

vi.mock('../../../app/composables/useApi', () => ({
  apiRequest: vi.fn(),
}))

describe('community service', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset()
  })

  it('requests the public post list with crawlable pagination parameters', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [], page: 2, pageSize: 10, total: 0 })

    await getPosts({ page: 2, pageSize: 10 })

    expect(apiRequest).toHaveBeenCalledWith('/v1/posts', {
      query: { page: 2, pageSize: 10 },
    })
  })

  it('omits the default page while keeping the requested page size', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [], page: 1, pageSize: 10, total: 0 })

    await getPosts({ page: 1, pageSize: 10 })

    expect(apiRequest).toHaveBeenCalledWith('/v1/posts', {
      query: { pageSize: 10 },
    })
  })

  it('encodes the post slug and preserves a normalized 404', async () => {
    const notFound = { code: 'NOT_FOUND', message: '请求的内容不存在。', status: 404 }
    vi.mocked(apiRequest).mockRejectedValue(notFound)

    await expect(getPost('nuxt/社区')).rejects.toEqual(notFound)
    expect(apiRequest).toHaveBeenCalledWith('/v1/posts/nuxt%2F%E7%A4%BE%E5%8C%BA')
  })
})
