import { apiRequest } from '~/composables/useApi'
import type { ApiList } from '~/lib/api/api.types'
import type { PromotionDetail, PromotionQuery, PromotionSummary } from './promotion.types'

function listQuery(query: PromotionQuery) {
  return {
    ...(query.page > 1 ? { page: query.page } : {}),
    ...(query.pageSize ? { pageSize: query.pageSize } : {}),
  }
}

export function getGroupBuys(query: PromotionQuery): Promise<ApiList<PromotionSummary>> {
  return apiRequest<ApiList<PromotionSummary>>('/v1/group-buys', { query: listQuery(query) })
}

export function getGroupBuy(slug: string): Promise<PromotionDetail> {
  return apiRequest<PromotionDetail>(`/v1/group-buys/${encodeURIComponent(slug)}`)
}

export function getFlashSales(query: PromotionQuery): Promise<ApiList<PromotionSummary>> {
  return apiRequest<ApiList<PromotionSummary>>('/v1/flash-sales', { query: listQuery(query) })
}

export function getFlashSale(slug: string): Promise<PromotionDetail> {
  return apiRequest<PromotionDetail>(`/v1/flash-sales/${encodeURIComponent(slug)}`)
}
