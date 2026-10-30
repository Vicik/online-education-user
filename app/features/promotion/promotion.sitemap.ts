import type { ApiList } from '~/lib/api/api.types'
import { collectSitemapUrls } from '~/lib/seo/sitemap'
import type { CollectSitemapUrlsOptions, SitemapPageQuery, SitemapUrlEntry } from '~/lib/seo/seo.types'
import type { PromotionKind, PromotionSummary } from './promotion.types'

type PromotionPageFetcher = (query: SitemapPageQuery) => Promise<ApiList<PromotionSummary>>
type PromotionSitemapTransport = (
  path: string,
  options: {
    baseURL: string
    credentials: 'omit'
    headers: Headers
    query: SitemapPageQuery
    timeout: number
  },
) => Promise<ApiList<PromotionSummary>>

const apiPaths: Record<PromotionKind, string> = {
  'group-buy': '/v1/group-buys',
  'flash-sale': '/v1/flash-sales',
}

export function fetchPublicPromotionSitemapPage(
  fetcher: PromotionSitemapTransport,
  baseURL: string,
  kind: PromotionKind,
  query: SitemapPageQuery,
): Promise<ApiList<PromotionSummary>> {
  return fetcher(apiPaths[kind], {
    baseURL,
    credentials: 'omit',
    headers: new Headers(),
    query,
    timeout: 10_000,
  })
}

export async function collectPromotionSitemapUrls(
  fetchGroupBuys: PromotionPageFetcher,
  fetchFlashSales: PromotionPageFetcher,
  options: CollectSitemapUrlsOptions = {},
): Promise<SitemapUrlEntry[]> {
  const [groupBuys, flashSales] = await Promise.all([
    collectSitemapUrls(fetchGroupBuys, promotion => ({
      loc: `/group-buy/${encodeURIComponent(promotion.slug)}`,
      ...(promotion.updatedAt ? { lastmod: promotion.updatedAt } : {}),
    }), options),
    collectSitemapUrls(fetchFlashSales, promotion => ({
      loc: `/flash-sale/${encodeURIComponent(promotion.slug)}`,
      ...(promotion.updatedAt ? { lastmod: promotion.updatedAt } : {}),
    }), options),
  ])

  return [...groupBuys, ...flashSales]
}
