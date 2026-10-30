import type { ApiList } from '~/lib/api/api.types'
import type { CourseSummary } from '~/features/course/course.types'
import { collectCourseSitemapUrls, fetchPublicCourseSitemapPage } from '~/features/course/course.sitemap'

export default defineSitemapEventHandler((event) => {
  const config = useRuntimeConfig(event)

  return collectCourseSitemapUrls(query => fetchPublicCourseSitemapPage(
    (path, options) => $fetch<ApiList<CourseSummary>>(path, options),
    config.apiBaseInternal,
    query,
  ))
})
