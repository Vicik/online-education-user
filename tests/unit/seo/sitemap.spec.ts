import type { ApiList } from '~/lib/api/api.types'
import { describe, expect, it, vi } from 'vitest'
import { collectSitemapUrls, getSitemapSources } from '~/lib/seo/sitemap'

describe('getSitemapSources', () => {
  it('描述课程、考试、活动和社区的已批准公开 API 路径', () => {
    expect(getSitemapSources('https://api.example.com')).toEqual([
      { name: 'courses', apiPaths: ['https://api.example.com/v1/courses'] },
      { name: 'exams', apiPaths: ['https://api.example.com/v1/exams'] },
      {
        name: 'promotions',
        apiPaths: [
          'https://api.example.com/v1/group-buys',
          'https://api.example.com/v1/flash-sales',
        ],
      },
      { name: 'community', apiPaths: ['https://api.example.com/v1/posts'] },
    ])
  })

  it('对相对 API 基础地址保留部署层同源代理路径', () => {
    expect(getSitemapSources('/api')[0]?.apiPaths).toEqual(['/api/v1/courses'])
  })
})

describe('collectSitemapUrls', () => {
  interface Item {
    slug: string
    updatedAt?: string
  }

  it('按 ApiList 元数据读取每一页并保持条目顺序', async () => {
    const pages: Record<number, ApiList<Item>> = {
      1: {
        items: [{ slug: 'course-1' }, { slug: 'course-2' }],
        page: 1,
        pageSize: 2,
        total: 5,
      },
      2: {
        items: [{ slug: 'course-3', updatedAt: '2026-10-28T08:00:00+08:00' }, { slug: 'course-4' }],
        page: 2,
        pageSize: 2,
        total: 5,
      },
      3: {
        items: [{ slug: 'course-5' }],
        page: 3,
        pageSize: 2,
        total: 5,
      },
    }
    const fetchPage = vi.fn(async ({ page }: { page: number, pageSize: number }) => pages[page]!)

    const result = await collectSitemapUrls(
      fetchPage,
      item => ({
        loc: `/course/${item.slug}`,
        ...(item.updatedAt ? { lastmod: item.updatedAt } : {}),
      }),
      { pageSize: 2 },
    )

    expect(fetchPage.mock.calls).toEqual([
      [{ page: 1, pageSize: 2 }],
      [{ page: 2, pageSize: 2 }],
      [{ page: 3, pageSize: 2 }],
    ])
    expect(result).toEqual([
      { loc: '/course/course-1' },
      { loc: '/course/course-2' },
      { loc: '/course/course-3', lastmod: '2026-10-28T08:00:00+08:00' },
      { loc: '/course/course-4' },
      { loc: '/course/course-5' },
    ])
  })

  it('当后端提前返回空页时立即停止', async () => {
    const fetchPage = vi.fn(async ({ page, pageSize }: { page: number, pageSize: number }): Promise<ApiList<Item>> => ({
      items: page === 1 ? [{ slug: 'course-1' }] : [],
      page,
      pageSize,
      total: 10,
    }))

    await expect(collectSitemapUrls(
      fetchPage,
      item => ({ loc: `/course/${item.slug}` }),
      { pageSize: 2 },
    )).resolves.toEqual([{ loc: '/course/course-1' }])

    expect(fetchPage).toHaveBeenCalledTimes(2)
  })
})
