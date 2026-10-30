import type { ApiList } from '~/lib/api/api.types'
import {
  collectCommunitySitemapUrls,
  fetchPublicCommunitySitemapPage,
} from '~/features/community/community.sitemap'
import type { PostSummary } from '~/features/community/community.types'

export default defineSitemapEventHandler((event) => {
  const config = useRuntimeConfig(event)

  return collectCommunitySitemapUrls(query => fetchPublicCommunitySitemapPage(
    (path, options) => $fetch<ApiList<PostSummary>>(path, options),
    config.apiBaseInternal,
    query,
  ))
})
