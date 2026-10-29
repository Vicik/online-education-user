import type { FetchOptions } from 'ofetch'
import type { MultiWatchSources } from 'vue'

export interface ApiList<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface ApiErrorShape {
  code: string
  message: string
  status: number
  fieldErrors?: Record<string, string[]>
  requestId?: string
}

export interface ApiRequestOptions extends Omit<FetchOptions<'json'>, 'baseURL' | 'credentials' | 'timeout'> {
  auth?: 'public' | 'session'
}

export interface ApiDataOptions<T> {
  request?: ApiRequestOptions
  default?: () => T | null
  server?: boolean
  lazy?: boolean
  immediate?: boolean
  deep?: boolean
  dedupe?: 'cancel' | 'defer'
  watch?: MultiWatchSources
}
