export interface PostQuery {
  page: number
  pageSize: number
}

export interface PostAuthor {
  id: string
  name: string
  avatarUrl?: string
}

export interface PostSummary {
  id: string
  slug: string
  title: string
  excerpt: string
  author: PostAuthor
  coverImageUrl?: string
  coverImageAlt?: string
  publishedAt: string
  updatedAt?: string
}

export interface SanitizedPostContent {
  format: 'sanitized-html'
  html: string
}

export interface PostDetail extends PostSummary {
  content: SanitizedPostContent
}
