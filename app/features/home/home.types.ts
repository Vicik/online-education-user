export interface BannerItem {
  id: string
  title: string
  description?: string
  imageUrl: string
  imageAlt: string
  href: string
  width: number
  height: number
}

export interface CourseSummary {
  id: string
  slug: string
  title: string
  imageUrl: string
  imageAlt: string
  price: number
  originalPrice?: number
}

export type PromotionStatus = 'upcoming' | 'active' | 'sold-out' | 'ended'

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
}

export interface HomeResponse {
  banners: BannerItem[]
  groupBuys: PromotionSummary[]
  latestCourses: CourseSummary[]
  recommendedCourses: CourseSummary[]
}
