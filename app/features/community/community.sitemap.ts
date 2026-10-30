import type { ApiList } from '~/lib/api/api.types'
import { collectSitemapUrls } from '~/lib/seo/sitemap'
import type { CollectSitemapUrlsOptions, SitemapPageQuery, SitemapUrlEntry } from '~/lib/seo/seo.types'
import type { PostSummary } from './community.types'

type CommunityPageFetcher = (query: SitemapPageQuery) => Promise<ApiList<PostSummary>>
type CommunitySitemapTransport = (
  path: string,
  options: {
    baseURL: string
    credentials: 'omit'
    headers: Headers
    query: SitemapPageQuery
    timeout: number
  },
) => Promise<ApiList<PostSummary>>

export function fetchPublicCommunitySitemapPage(
  fetcher: CommunitySitemapTransport,
  baseURL: string,
  query: SitemapPageQuery,
): Promise<ApiList<PostSummary>> {
  return fetcher('/v1/posts', {
    baseURL,
    credentials: 'omit',
    headers: new Headers(),
    query,
    timeout: 10_000,
  })
}

export function collectCommunitySitemapUrls(
  fetchPage: CommunityPageFetcher,
  options: CollectSitemapUrlsOptions = {},
): Promise<SitemapUrlEntry[]> {
  return collectSitemapUrls(
    fetchPage,
    post => ({
      loc: `/community/${encodeURIComponent(post.slug)}`,
      ...(post.updatedAt ? { lastmod: post.updatedAt } : {}),
    }),
    options,
  )
}
