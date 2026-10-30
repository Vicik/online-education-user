import type { ApiList } from '~/lib/api/api.types'
import { loadNuxtConfig } from 'nuxt/kit'
import { describe, expect, it, vi } from 'vitest'
import { collectCourseSitemapUrls, fetchPublicCourseSitemapPage } from '../../../app/features/course/course.sitemap'
import type { CourseSummary } from '../../../app/features/course/course.types'

function course(slug: string, updatedAt?: string): CourseSummary {
  return {
    id: slug,
    slug,
    title: `课程 ${slug}`,
    description: `课程 ${slug} 简介`,
    imageUrl: `/img/${slug}.jpg`,
    imageAlt: `课程 ${slug} 封面`,
    price: 99,
    ...(updatedAt ? { updatedAt } : {}),
  }
}

describe('course sitemap', () => {
  it('fetches sitemap pages without inherited credentials and with the API timeout', async () => {
    const fetcher = vi.fn().mockResolvedValue({ items: [], page: 1, pageSize: 100, total: 0 })

    await fetchPublicCourseSitemapPage(fetcher, 'http://api.internal', { page: 1, pageSize: 100 })

    expect(fetcher).toHaveBeenCalledWith('/v1/courses', {
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

  it('wires only the internal course projection to the named courses sitemap', async () => {
    const config = await loadNuxtConfig({ cwd: process.cwd() })

    expect(config.sitemap?.sitemaps?.courses).toEqual({
      sources: ['/__sitemap__/courses'],
    })
  })

  it('collects every public detail URL, encodes slugs, and maps updatedAt', async () => {
    const pages: Record<number, ApiList<CourseSummary>> = {
      1: { items: [course('nuxt/ssr'), course('vue-3')], page: 1, pageSize: 2, total: 3 },
      2: {
        items: [course('类型 设计', '2026-10-29T12:00:00+08:00')],
        page: 2,
        pageSize: 2,
        total: 3,
      },
    }
    const fetchPage = vi.fn(async ({ page }: { page: number, pageSize: number }) => pages[page]!)

    await expect(collectCourseSitemapUrls(fetchPage, { pageSize: 2 })).resolves.toEqual([
      { loc: '/course/nuxt%2Fssr' },
      { loc: '/course/vue-3' },
      { loc: '/course/%E7%B1%BB%E5%9E%8B%20%E8%AE%BE%E8%AE%A1', lastmod: '2026-10-29T12:00:00+08:00' },
    ])
    expect(fetchPage.mock.calls).toEqual([
      [{ page: 1, pageSize: 2 }],
      [{ page: 2, pageSize: 2 }],
    ])
  })

  it('stops safely when the backend returns an early empty page', async () => {
    const fetchPage = vi.fn(async ({ page, pageSize }: { page: number, pageSize: number }): Promise<ApiList<CourseSummary>> => ({
      items: page === 1 ? [course('first')] : [],
      page,
      pageSize,
      total: 50,
    }))

    await expect(collectCourseSitemapUrls(fetchPage, { pageSize: 20 })).resolves.toEqual([
      { loc: '/course/first' },
    ])
    expect(fetchPage).toHaveBeenCalledTimes(2)
  })
})
