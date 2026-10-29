import type { ApiList } from '../api/api.types'
import type {
  CollectSitemapUrlsOptions,
  SitemapPageQuery,
  SitemapSource,
  SitemapUrlEntry,
} from './seo.types'

const DEFAULT_SITEMAP_PAGE_SIZE = 100

export async function collectSitemapUrls<T>(
  fetchPage: (query: SitemapPageQuery) => Promise<ApiList<T>>,
  toEntry: (item: T) => SitemapUrlEntry,
  options: CollectSitemapUrlsOptions = {},
): Promise<SitemapUrlEntry[]> {
  const pageSize = options.pageSize ?? DEFAULT_SITEMAP_PAGE_SIZE
  const entries: SitemapUrlEntry[] = []
  let page = 1

  while (true) {
    const result = await fetchPage({ page, pageSize })

    if (result.items.length === 0) {
      return entries
    }

    entries.push(...result.items.map(toEntry))

    if (result.page * result.pageSize >= result.total) {
      return entries
    }

    page += 1
  }
}

function joinApiPath(apiBase: string, path: string): string {
  return `${apiBase.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

export function getSitemapSources(apiBase = '/api'): SitemapSource[] {
  return [
    {
      name: 'courses',
      apiPaths: [joinApiPath(apiBase, '/v1/courses')],
    },
    {
      name: 'exams',
      apiPaths: [joinApiPath(apiBase, '/v1/exams')],
    },
    {
      name: 'promotions',
      apiPaths: [
        joinApiPath(apiBase, '/v1/group-buys'),
        joinApiPath(apiBase, '/v1/flash-sales'),
      ],
    },
    {
      name: 'community',
      apiPaths: [joinApiPath(apiBase, '/v1/posts')],
    },
  ]
}
