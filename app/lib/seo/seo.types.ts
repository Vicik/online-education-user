export type SeoSchema = Record<string, unknown>

export interface PageSeoInput {
  title: string
  description: string
  path: string
  image?: string
  noindex?: boolean
  schema?: SeoSchema | SeoSchema[]
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface CourseSeoSource {
  name: string
  description: string
  url: string
  image?: string
  providerName?: string
}

export interface ArticleSeoSource {
  headline: string
  description: string
  url: string
  authorName: string
  datePublished: string
  dateModified?: string
  image?: string
}

export type SitemapName = 'courses' | 'exams' | 'promotions' | 'community'

export interface SitemapSource {
  name: SitemapName
  apiPaths: string[]
}

export interface SitemapUrlEntry {
  loc: string
  lastmod?: string
}

export interface SitemapPageQuery {
  page: number
  pageSize: number
}

export interface CollectSitemapUrlsOptions {
  pageSize?: number
}
