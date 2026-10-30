import { apiRequest } from '~/composables/useApi'
import type { ApiList } from '~/lib/api/api.types'
import type { ExamDetail, ExamQuery, ExamSummary } from './exam.types'

export function getExams(query: ExamQuery): Promise<ApiList<ExamSummary>> {
  return apiRequest<ApiList<ExamSummary>>('/v1/exams', {
    query: {
      ...(query.page > 1 ? { page: query.page } : {}),
      ...(query.pageSize ? { pageSize: query.pageSize } : {}),
    },
  })
}

export function getExam(slug: string): Promise<ExamDetail> {
  return apiRequest<ExamDetail>(`/v1/exams/${encodeURIComponent(slug)}`)
}
