export type CourseSort = 'latest' | 'recommended' | 'price-asc' | 'price-desc'

export interface CourseQuery {
  page: number
  pageSize: number
  category?: string
  keyword?: string
  sort?: CourseSort
}

export interface CourseSummary {
  id: string
  slug: string
  title: string
  description?: string
  imageUrl: string
  imageAlt: string
  price: number
  originalPrice?: number
  category?: string
  categoryLabel?: string
  updatedAt?: string
}

export interface CourseTeacher {
  id: string
  name: string
  title?: string
  avatarUrl?: string
}

export interface CourseOutlineSection {
  id: string
  title: string
  lessons: string[]
}

export interface CourseDetail extends CourseSummary {
  description: string
  teacher: CourseTeacher
  audience: string[]
  outline: CourseOutlineSection[]
  publishedAt: string
  updatedAt?: string
}
