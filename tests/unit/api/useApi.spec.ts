import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../app/composables/useApi'

const mocks = vi.hoisted(() => ({
  requestFetch: vi.fn(),
}))

mockNuxtImport('useRequestFetch', () => () => mocks.requestFetch)

describe('apiRequest', () => {
  beforeEach(() => {
    mocks.requestFetch.mockReset()
    vi.stubGlobal('$fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses the internal API base for public server requests without forwarding request cookies', async () => {
    vi.stubGlobal('window', undefined)
    const fetchMock = vi.mocked(globalThis.$fetch)
    fetchMock.mockResolvedValue({ source: 'server' })

    await expect(apiRequest<{ source: string }>('/v1/home', {
      headers: {
        'cookie': 'session=must-not-leak',
        'x-request-id': 'safe-header',
      },
    })).resolves.toEqual({ source: 'server' })

    expect(mocks.requestFetch).not.toHaveBeenCalled()
    const requestOptions = fetchMock.mock.calls[0]?.[1]
    const headers = new Headers(requestOptions?.headers)

    expect(headers.get('cookie')).toBeNull()
    expect(headers.get('x-request-id')).toBe('safe-header')
    expect(fetchMock).toHaveBeenCalledWith('/v1/home', expect.objectContaining({
      baseURL: 'http://localhost:8080',
      credentials: 'omit',
      timeout: 10_000,
    }))
  })

  it('uses the public API base for public browser requests', async () => {
    const fetchMock = vi.mocked(globalThis.$fetch)
    fetchMock.mockResolvedValue({ source: 'browser' })

    await apiRequest('/v1/courses', {
      query: { page: 2 },
    })

    expect(fetchMock).toHaveBeenCalledWith('/v1/courses', expect.objectContaining({
      baseURL: '/api',
      credentials: 'omit',
      query: { page: 2 },
      timeout: 10_000,
    }))
  })

  it('uses request fetch only for explicit session requests on the server', async () => {
    vi.stubGlobal('window', undefined)
    mocks.requestFetch.mockResolvedValue({ id: 'session-user' })

    await expect(apiRequest('/v1/session', { auth: 'session' }))
      .resolves.toEqual({ id: 'session-user' })

    expect(mocks.requestFetch).toHaveBeenCalledWith('/v1/session', expect.objectContaining({
      baseURL: 'http://localhost:8080',
      credentials: 'include',
      timeout: 10_000,
    }))
    expect(globalThis.$fetch).not.toHaveBeenCalled()
  })

  it('uses credentialed public-base fetch for session requests in the browser', async () => {
    const fetchMock = vi.mocked(globalThis.$fetch)
    fetchMock.mockResolvedValue({ id: 'session-user' })

    await apiRequest('/v1/session', { auth: 'session' })

    expect(fetchMock).toHaveBeenCalledWith('/v1/session', expect.objectContaining({
      baseURL: '/api',
      credentials: 'include',
      timeout: 10_000,
    }))
    expect(mocks.requestFetch).not.toHaveBeenCalled()
  })

  it('converts fetch failures to the normalized API error shape', async () => {
    const fetchMock = vi.mocked(globalThis.$fetch)
    fetchMock.mockRejectedValue({
      response: {
        status: 503,
        _data: '<html>proxy error</html>',
      },
    })

    await expect(apiRequest('/v1/home')).rejects.toEqual({
      code: 'SERVICE_UNAVAILABLE',
      message: '服务暂时不可用，请稍后重试。',
      status: 503,
    })
  })
})
