import type { AsyncData } from '#app'
import type { $Fetch, FetchOptions } from 'ofetch'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { normalizeApiError } from '~/lib/api/api-error'
import type {
  ApiDataOptions,
  ApiErrorShape,
  ApiRequestOptions,
} from '~/lib/api/api.types'

const API_TIMEOUT_MS = 10_000

function withoutCookieHeader(headers: HeadersInit | undefined): Headers | undefined {
  if (!headers) {
    return undefined
  }

  const sanitizedHeaders = new Headers(headers)
  sanitizedHeaders.delete('cookie')
  return sanitizedHeaders
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const config = useRuntimeConfig()
  const { auth = 'public', ...fetchOptions } = options
  const isServer = typeof window === 'undefined'
  const baseURL = isServer ? config.apiBaseInternal : config.public.apiBase
  const credentials = auth === 'session' ? 'include' : 'omit'
  const requestOptions = {
    ...fetchOptions,
    ...(auth === 'public'
      ? { headers: withoutCookieHeader(fetchOptions.headers) }
      : {}),
    baseURL,
    credentials,
    timeout: API_TIMEOUT_MS,
  } satisfies FetchOptions<'json'>

  try {
    if (isServer && auth === 'session') {
      const requestFetch = useRequestFetch() as $Fetch
      return await requestFetch<T>(path, requestOptions)
    }

    const fetch = globalThis.$fetch as $Fetch
    return await fetch<T>(path, requestOptions)
  }
  catch (error: unknown) {
    throw normalizeApiError(error)
  }
}

export function useApiData<T>(
  key: string,
  path: MaybeRefOrGetter<string>,
  options: ApiDataOptions<T> = {},
): AsyncData<T | null, ApiErrorShape | null> {
  const { request, default: defaultValue, ...asyncDataOptions } = options
  const asyncData = useAsyncData(
    key,
    () => apiRequest<T>(toValue(path), request),
    {
      ...asyncDataOptions,
      default: defaultValue ?? (() => null),
    },
  )
  const error = computed<ApiErrorShape | null>(() => {
    const currentError = asyncData.error.value
    if (!currentError) {
      return null
    }

    const cause = typeof currentError === 'object' && currentError !== null && 'cause' in currentError
      ? currentError.cause
      : currentError

    return normalizeApiError(cause)
  })
  const state = {
    data: asyncData.data,
    pending: asyncData.pending,
    refresh: asyncData.refresh,
    execute: asyncData.execute,
    clear: asyncData.clear,
    error,
    status: asyncData.status,
  }
  const result = asyncData.then(() => state)

  return Object.assign(result, state) as AsyncData<T | null, ApiErrorShape | null>
}
