import type { ApiList } from '~/lib/api/api.types'
import { loadNuxtConfig } from 'nuxt/kit'
import { describe, expect, it, vi } from 'vitest'
import { collectExamSitemapUrls, fetchPublicExamSitemapPage } from '../../../app/features/exam/exam.sitemap'
import type { ExamSummary } from '../../../app/features/exam/exam.types'

function exam(slug: string, updatedAt?: string): ExamSummary {
  return {
    id: slug,
    slug,
    title: `考试 ${slug}`,
    description: `考试 ${slug} 介绍`,
    durationMinutes: 45,
    questionCount: 30,
    ...(updatedAt ? { updatedAt } : {}),
  }
}

describe('exam sitemap', () => {
  it('fetches every page publicly without inherited session credentials', async () => {
    const fetcher = vi.fn().mockResolvedValue({ items: [], page: 1, pageSize: 100, total: 0 })

    await fetchPublicExamSitemapPage(fetcher, 'http://api.internal', { page: 1, pageSize: 100 })

    expect(fetcher).toHaveBeenCalledWith('/v1/exams', {
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

  it('wires only the internal exam projection to the named exams sitemap', async () => {
    const config = await loadNuxtConfig({ cwd: process.cwd() })

    expect(config.sitemap?.sitemaps?.exams).toEqual({
      sources: ['/__sitemap__/exams'],
    })
  })

  it('encodes every public detail slug and excludes attempt routes', async () => {
    const pages: Record<number, ApiList<ExamSummary>> = {
      1: { items: [exam('front/end'), exam('基础 能力')], page: 1, pageSize: 2, total: 3 },
      2: { items: [exam('advanced', '2026-10-30T08:00:00+08:00')], page: 2, pageSize: 2, total: 3 },
    }
    const fetchPage = vi.fn(async ({ page }: { page: number, pageSize: number }) => pages[page]!)

    const urls = await collectExamSitemapUrls(fetchPage, { pageSize: 2 })

    expect(urls).toEqual([
      { loc: '/exam/front%2Fend' },
      { loc: '/exam/%E5%9F%BA%E7%A1%80%20%E8%83%BD%E5%8A%9B' },
      { loc: '/exam/advanced', lastmod: '2026-10-30T08:00:00+08:00' },
    ])
    expect(urls.every(url => !url.loc.startsWith('/exam/attempt/'))).toBe(true)
    expect(fetchPage).toHaveBeenCalledTimes(2)
  })
})
