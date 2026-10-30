import type { ApiList } from '~/lib/api/api.types'
import { loadNuxtConfig } from 'nuxt/kit'
import { describe, expect, it, vi } from 'vitest'
import {
  collectPromotionSitemapUrls,
  fetchPublicPromotionSitemapPage,
} from '../../../app/features/promotion/promotion.sitemap'
import type { PromotionSummary } from '../../../app/features/promotion/promotion.types'

function promotion(slug: string, updatedAt?: string): PromotionSummary {
  return {
    id: slug,
    slug,
    title: `活动 ${slug}`,
    imageUrl: `/img/${slug}.jpg`,
    imageAlt: `活动 ${slug} 封面`,
    price: 9.9,
    status: 'active',
    startsAt: '2026-10-30T10:00:00+08:00',
    endsAt: '2026-10-31T10:00:00+08:00',
    remaining: 10,
    ...(updatedAt ? { updatedAt } : {}),
  }
}

describe('promotion sitemap', () => {
  it.each([
    ['group-buy', '/v1/group-buys'],
    ['flash-sale', '/v1/flash-sales'],
  ] as const)('fetches %s pages publicly without inherited credentials', async (kind, path) => {
    const fetcher = vi.fn().mockResolvedValue({ items: [], page: 1, pageSize: 100, total: 0 })

    await fetchPublicPromotionSitemapPage(fetcher, 'http://api.internal', kind, { page: 1, pageSize: 100 })

    expect(fetcher).toHaveBeenCalledWith(path, {
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

  it('wires only the internal promotion projection to the named sitemap', async () => {
    const config = await loadNuxtConfig({ cwd: process.cwd() })

    expect(config.sitemap?.sitemaps?.promotions).toEqual({
      sources: ['/__sitemap__/promotions'],
    })
  })

  it('exhausts both APIs and keeps encoded route prefixes distinct', async () => {
    const groupPages: Record<number, ApiList<PromotionSummary>> = {
      1: { items: [promotion('双人/拼团')], page: 1, pageSize: 1, total: 2 },
      2: { items: [promotion('三人团', '2026-10-30T12:00:00+08:00')], page: 2, pageSize: 1, total: 2 },
    }
    const flashPages: Record<number, ApiList<PromotionSummary>> = {
      1: { items: [promotion('限时 秒杀')], page: 1, pageSize: 1, total: 1 },
    }
    const fetchGroupBuys = vi.fn(async ({ page }: { page: number, pageSize: number }) => groupPages[page]!)
    const fetchFlashSales = vi.fn(async ({ page }: { page: number, pageSize: number }) => flashPages[page]!)

    await expect(collectPromotionSitemapUrls(fetchGroupBuys, fetchFlashSales, { pageSize: 1 })).resolves.toEqual([
      { loc: '/group-buy/%E5%8F%8C%E4%BA%BA%2F%E6%8B%BC%E5%9B%A2' },
      { loc: '/group-buy/%E4%B8%89%E4%BA%BA%E5%9B%A2', lastmod: '2026-10-30T12:00:00+08:00' },
      { loc: '/flash-sale/%E9%99%90%E6%97%B6%20%E7%A7%92%E6%9D%80' },
    ])
    expect(fetchGroupBuys).toHaveBeenCalledTimes(2)
    expect(fetchFlashSales).toHaveBeenCalledTimes(1)
  })

  it('projects only public URL metadata without deriving stock or eligibility', async () => {
    const item = promotion('sold-out')
    item.status = 'sold-out'
    item.remaining = 0
    const fetchGroupBuys = vi.fn().mockResolvedValue({ items: [item], page: 1, pageSize: 100, total: 1 })
    const fetchFlashSales = vi.fn().mockResolvedValue({ items: [], page: 1, pageSize: 100, total: 0 })

    const entries = await collectPromotionSitemapUrls(fetchGroupBuys, fetchFlashSales)

    expect(entries).toEqual([{ loc: '/group-buy/sold-out' }])
    expect(entries[0]).not.toHaveProperty('status')
    expect(entries[0]).not.toHaveProperty('remaining')
  })
})
