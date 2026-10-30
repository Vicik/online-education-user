import type { ApiList } from '~/lib/api/api.types'
import { loadNuxtConfig } from 'nuxt/kit'
import { describe, expect, it, vi } from 'vitest'
import {
  collectCommunitySitemapUrls,
  fetchPublicCommunitySitemapPage,
} from '../../../app/features/community/community.sitemap'
import type { PostSummary } from '../../../app/features/community/community.types'

function post(slug: string, updatedAt?: string): PostSummary {
  return {
    id: slug,
    slug,
    title: `帖子 ${slug}`,
    excerpt: `帖子 ${slug} 摘要`,
    author: { id: 'author-1', name: '林同学' },
    publishedAt: '2026-10-28T09:00:00+08:00',
    ...(updatedAt ? { updatedAt } : {}),
  }
}

describe('community sitemap', () => {
  it('fetches public post pages without inherited credentials', async () => {
    const fetcher = vi.fn().mockResolvedValue({ items: [], page: 1, pageSize: 100, total: 0 })

    await fetchPublicCommunitySitemapPage(fetcher, 'http://api.internal', { page: 1, pageSize: 100 })

    expect(fetcher).toHaveBeenCalledWith('/v1/posts', {
      baseURL: 'http://api.internal',
      credentials: 'omit',
      headers: new Headers(),
      query: { page: 1, pageSize: 100 },
      timeout: 10_000,
    })
    const headers = fetcher.mock.calls[0]![1].headers as Headers
    expect(headers.has('cookie')).toBe(false)
    expect(headers.has('authorization')).toBe(false)
  })

  it('wires only the internal community projection to the named sitemap', async () => {
    const config = await loadNuxtConfig({ cwd: process.cwd() })

    expect(config.sitemap?.sitemaps?.community).toEqual({
      sources: ['/__sitemap__/community'],
    })
  })

  it('exhausts the public contract, encodes slugs, and maps updatedAt', async () => {
    const pages: Record<number, ApiList<PostSummary>> = {
      1: { items: [post('nuxt/ssr')], page: 1, pageSize: 1, total: 2 },
      2: {
        items: [post('学习 方法', '2026-10-30T12:00:00+08:00')],
        page: 2,
        pageSize: 1,
        total: 2,
      },
    }
    const fetchPage = vi.fn(async ({ page }: { page: number, pageSize: number }) => pages[page]!)

    await expect(collectCommunitySitemapUrls(fetchPage, { pageSize: 1 })).resolves.toEqual([
      { loc: '/community/nuxt%2Fssr' },
      { loc: '/community/%E5%AD%A6%E4%B9%A0%20%E6%96%B9%E6%B3%95', lastmod: '2026-10-30T12:00:00+08:00' },
    ])
    expect(fetchPage).toHaveBeenCalledTimes(2)
  })

  it('projects no publication state because unpublished posts stay outside the public list contract', async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      items: [post('public-post')],
      page: 1,
      pageSize: 100,
      total: 1,
    })

    const entries = await collectCommunitySitemapUrls(fetchPage)

    expect(entries).toEqual([{ loc: '/community/public-post' }])
    expect(entries[0]).not.toHaveProperty('published')
    expect(entries[0]).not.toHaveProperty('author')
  })
})
