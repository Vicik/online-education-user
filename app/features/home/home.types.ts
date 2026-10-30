import type { CourseSummary } from '../course/course.types'
import type { PromotionSummary } from '../promotion/promotion.types'

export type { PromotionStatus, PromotionSummary } from '../promotion/promotion.types'

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

export interface HomeResponse {
  banners: BannerItem[]
  groupBuys: PromotionSummary[]
  latestCourses: CourseSummary[]
  recommendedCourses: CourseSummary[]
}
