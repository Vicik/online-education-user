export type PromotionKind = 'group-buy' | 'flash-sale'

export type PromotionStatus = 'upcoming' | 'active' | 'sold-out' | 'ended'

export interface PromotionQuery {
  page: number
  pageSize: number
}

export interface PromotionSummary {
  id: string
  slug: string
  title: string
  imageUrl: string
  imageAlt: string
  price: number
  originalPrice?: number
  status: PromotionStatus
  startsAt?: string
  endsAt: string
  remaining?: number
  soldCount?: number
  groupSize?: number
  updatedAt?: string
}

export interface PromotionDetail extends PromotionSummary {
  description: string
  details: string[]
  remaining: number
  startsAt: string
}
