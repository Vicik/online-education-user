import { apiRequest } from '~/composables/useApi'
import type { ApiList } from '~/lib/api/api.types'
import type { CourseDetail, CourseQuery, CourseSummary } from './course.types'

export function getCourses(query: CourseQuery): Promise<ApiList<CourseSummary>> {
  const category = query.category?.trim()
  const keyword = query.keyword?.trim()

  return apiRequest<ApiList<CourseSummary>>('/v1/courses', {
    query: {
      ...(query.page > 1 ? { page: query.page } : {}),
      ...(query.pageSize ? { pageSize: query.pageSize } : {}),
      ...(category ? { category } : {}),
      ...(keyword ? { keyword } : {}),
      ...(query.sort ? { sort: query.sort } : {}),
    },
  })
}

export function getCourse(slug: string): Promise<CourseDetail> {
  return apiRequest<CourseDetail>(`/v1/courses/${encodeURIComponent(slug)}`)
}
