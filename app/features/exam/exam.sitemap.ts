import type { ApiList } from '~/lib/api/api.types'
import { collectSitemapUrls } from '~/lib/seo/sitemap'
import type { CollectSitemapUrlsOptions, SitemapPageQuery, SitemapUrlEntry } from '~/lib/seo/seo.types'
import type { ExamSummary } from './exam.types'

type ExamPageFetcher = (query: SitemapPageQuery) => Promise<ApiList<ExamSummary>>
type ExamSitemapTransport = (
  path: string,
  options: {
    baseURL: string
    credentials: 'omit'
    headers: Headers
    query: SitemapPageQuery
    timeout: number
  },
) => Promise<ApiList<ExamSummary>>

export function fetchPublicExamSitemapPage(
  fetcher: ExamSitemapTransport,
  baseURL: string,
  query: SitemapPageQuery,
): Promise<ApiList<ExamSummary>> {
  return fetcher('/v1/exams', {
    baseURL,
    credentials: 'omit',
    headers: new Headers(),
    query,
    timeout: 10_000,
  })
}

export function collectExamSitemapUrls(
  fetchPage: ExamPageFetcher,
  options: CollectSitemapUrlsOptions = {},
): Promise<SitemapUrlEntry[]> {
  return collectSitemapUrls(
    fetchPage,
    exam => ({
      loc: `/exam/${encodeURIComponent(exam.slug)}`,
      ...(exam.updatedAt ? { lastmod: exam.updatedAt } : {}),
    }),
    options,
  )
}
