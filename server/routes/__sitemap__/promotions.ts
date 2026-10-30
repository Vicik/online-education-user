import {
  collectPromotionSitemapUrls,
  fetchPublicPromotionSitemapPage,
} from '~/features/promotion/promotion.sitemap'
import type { PromotionSummary } from '~/features/promotion/promotion.types'
import type { ApiList } from '~/lib/api/api.types'

export default defineSitemapEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const fetchPage = (kind: 'group-buy' | 'flash-sale') => (query: { page: number, pageSize: number }) =>
    fetchPublicPromotionSitemapPage(
      (path, options) => $fetch<ApiList<PromotionSummary>>(path, options),
      config.apiBaseInternal,
      kind,
      query,
    )

  return collectPromotionSitemapUrls(fetchPage('group-buy'), fetchPage('flash-sale'))
})
