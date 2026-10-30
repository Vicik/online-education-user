import { apiRequest } from '~/composables/useApi'
import type { ApiList } from '~/lib/api/api.types'
import type { PostDetail, PostQuery, PostSummary } from './community.types'

export function getPosts(query: PostQuery): Promise<ApiList<PostSummary>> {
  return apiRequest<ApiList<PostSummary>>('/v1/posts', {
    query: {
      ...(query.page > 1 ? { page: query.page } : {}),
      ...(query.pageSize ? { pageSize: query.pageSize } : {}),
    },
  })
}

export function getPost(slug: string): Promise<PostDetail> {
  return apiRequest<PostDetail>(`/v1/posts/${encodeURIComponent(slug)}`)
}
