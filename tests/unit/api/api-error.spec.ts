import { describe, expect, it } from 'vitest'
import { normalizeApiError } from '../../../app/lib/api/api-error'

describe('normalizeApiError', () => {
  it('preserves safe structured validation details from a 422 response', () => {
    const result = normalizeApiError({
      response: {
        status: 422,
        _data: {
          code: 'VALIDATION_FAILED',
          message: '请检查填写内容',
          fieldErrors: {
            email: ['邮箱格式不正确'],
          },
          requestId: 'req-422',
        },
      },
    })

    expect(result).toEqual({
      code: 'VALIDATION_FAILED',
      message: '请检查填写内容',
      status: 422,
      fieldErrors: {
        email: ['邮箱格式不正确'],
      },
      requestId: 'req-422',
    })
  })

  it('returns a stable user-safe result for an unstructured 401 response', () => {
    const result = normalizeApiError({
      response: {
        status: 401,
        _data: '<html><body>upstream stack trace</body></html>',
      },
    })

    expect(result).toEqual({
      code: 'UNAUTHORIZED',
      message: '登录状态已失效，请重新登录。',
      status: 401,
    })
    expect(result.message).not.toContain('stack trace')
  })

  it('normalizes aborted requests as timeouts', () => {
    const error = new Error('The operation was aborted')
    error.name = 'AbortError'

    expect(normalizeApiError(error)).toEqual({
      code: 'REQUEST_TIMEOUT',
      message: '请求超时，请稍后重试。',
      status: 408,
    })
  })

  it('normalizes network exceptions without exposing their raw message', () => {
    const result = normalizeApiError(new TypeError('fetch failed: internal-host:8080'))

    expect(result).toEqual({
      code: 'NETWORK_ERROR',
      message: '网络连接异常，请稍后重试。',
      status: 0,
    })
    expect(result.message).not.toContain('internal-host')
  })

  it('normalizes unknown exceptions without exposing stack or message details', () => {
    const error = new Error('database stack and private details')
    error.stack = 'private backend stack'

    const result = normalizeApiError(error)

    expect(result).toEqual({
      code: 'UNKNOWN_ERROR',
      message: '请求失败，请稍后重试。',
      status: 500,
    })
    expect(JSON.stringify(result)).not.toContain('private')
  })
})
