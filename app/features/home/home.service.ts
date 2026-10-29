import { apiRequest } from '~/composables/useApi'
import type { HomeResponse } from './home.types'

export function getHome(): Promise<HomeResponse> {
  return apiRequest<HomeResponse>('/v1/home')
}
