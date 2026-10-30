import type { ExamSummary } from '~/features/exam/exam.types'
import { collectExamSitemapUrls, fetchPublicExamSitemapPage } from '~/features/exam/exam.sitemap'
import type { ApiList } from '~/lib/api/api.types'

export default defineSitemapEventHandler((event) => {
  const config = useRuntimeConfig(event)

  return collectExamSitemapUrls(query => fetchPublicExamSitemapPage(
    (path, options) => $fetch<ApiList<ExamSummary>>(path, options),
    config.apiBaseInternal,
    query,
  ))
})
