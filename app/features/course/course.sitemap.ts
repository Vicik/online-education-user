import type { ApiList } from '~/lib/api/api.types'
import { collectSitemapUrls } from '~/lib/seo/sitemap'
import type { CollectSitemapUrlsOptions, SitemapPageQuery, SitemapUrlEntry } from '~/lib/seo/seo.types'
import type { CourseSummary } from './course.types'

type CoursePageFetcher = (query: SitemapPageQuery) => Promise<ApiList<CourseSummary>>
type CourseSitemapTransport = (
  path: string,
  options: {
    baseURL: string
    credentials: 'omit'
    headers: Headers
    query: SitemapPageQuery
    timeout: number
  },
) => Promise<ApiList<CourseSummary>>

export function fetchPublicCourseSitemapPage(
  fetcher: CourseSitemapTransport,
  baseURL: string,
  query: SitemapPageQuery,
): Promise<ApiList<CourseSummary>> {
  return fetcher('/v1/courses', {
    baseURL,
    credentials: 'omit',
    headers: new Headers(),
    query,
    timeout: 10_000,
  })
}

export function collectCourseSitemapUrls(
  fetchPage: CoursePageFetcher,
  options: CollectSitemapUrlsOptions = {},
): Promise<SitemapUrlEntry[]> {
  return collectSitemapUrls(
    fetchPage,
    course => ({
      loc: `/course/${encodeURIComponent(course.slug)}`,
      ...(course.updatedAt ? { lastmod: course.updatedAt } : {}),
    }),
    options,
  )
}
