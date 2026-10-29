import type { ApiErrorShape } from './api.types'

type UnknownRecord = Record<string, unknown>

const DEFAULT_ERRORS: Record<number, Omit<ApiErrorShape, 'status'>> = {
  400: { code: 'BAD_REQUEST', message: '请求参数有误，请检查后重试。' },
  401: { code: 'UNAUTHORIZED', message: '登录状态已失效，请重新登录。' },
  403: { code: 'FORBIDDEN', message: '暂时没有权限执行此操作。' },
  404: { code: 'NOT_FOUND', message: '请求的内容不存在。' },
  409: { code: 'CONFLICT', message: '当前状态已发生变化，请刷新后重试。' },
  422: { code: 'VALIDATION_FAILED', message: '请检查填写内容。' },
  429: { code: 'TOO_MANY_REQUESTS', message: '请求过于频繁，请稍后重试。' },
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function readStatus(error: unknown): number | undefined {
  if (!isRecord(error)) {
    return undefined
  }

  const response = isRecord(error.response) ? error.response : undefined
  const status = response?.status ?? error.statusCode ?? error.status

  return typeof status === 'number' && Number.isFinite(status) ? status : undefined
}

function readPayload(error: unknown): UnknownRecord | undefined {
  if (!isRecord(error)) {
    return undefined
  }

  const response = isRecord(error.response) ? error.response : undefined
  const payload = response?._data ?? response?.data ?? error.data

  return isRecord(payload) ? payload : undefined
}

function readSafeCode(value: unknown): string | undefined {
  return typeof value === 'string' && /^[a-z0-9:_-]{1,64}$/i.test(value) ? value : undefined
}

function readSafeMessage(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const message = value.trim()
  if (!message || message.length > 300 || /<[^>]+>/.test(message)) {
    return undefined
  }

  return message
}

function readFieldErrors(value: unknown): Record<string, string[]> | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string[]] => Array.isArray(entry[1])
      && entry[1].every(message => typeof message === 'string' && readSafeMessage(message) !== undefined),
  )

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

function readRequestId(value: unknown): string | undefined {
  return typeof value === 'string' && /^[a-z0-9._:-]{1,128}$/i.test(value) ? value : undefined
}

function readNormalizedError(error: unknown): ApiErrorShape | undefined {
  if (!isRecord(error)) {
    return undefined
  }

  const code = readSafeCode(error.code)
  const message = readSafeMessage(error.message)
  const status = typeof error.status === 'number' && Number.isFinite(error.status)
    ? error.status
    : undefined

  if (!code || !message || status === undefined) {
    return undefined
  }

  const fieldErrors = readFieldErrors(error.fieldErrors)
  const requestId = readRequestId(error.requestId)

  return {
    code,
    message,
    status,
    ...(fieldErrors ? { fieldErrors } : {}),
    ...(requestId ? { requestId } : {}),
  }
}

function isAbortError(error: unknown): boolean {
  if (!isRecord(error)) {
    return false
  }

  if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    return true
  }

  return isRecord(error.cause)
    && (error.cause.name === 'AbortError' || error.cause.name === 'TimeoutError')
}

export function normalizeApiError(error: unknown): ApiErrorShape {
  if (isAbortError(error)) {
    return {
      code: 'REQUEST_TIMEOUT',
      message: '请求超时，请稍后重试。',
      status: 408,
    }
  }

  const normalizedError = readNormalizedError(error)
  if (normalizedError) {
    return normalizedError
  }

  const status = readStatus(error)
  const payload = readPayload(error)

  if (status !== undefined) {
    const fallback = DEFAULT_ERRORS[status]
      ?? (status >= 500
        ? { code: 'SERVICE_UNAVAILABLE', message: '服务暂时不可用，请稍后重试。' }
        : { code: 'REQUEST_FAILED', message: '请求失败，请稍后重试。' })
    const fieldErrors = readFieldErrors(payload?.fieldErrors)
    const requestId = readRequestId(payload?.requestId)

    return {
      code: readSafeCode(payload?.code) ?? fallback.code,
      message: readSafeMessage(payload?.message) ?? fallback.message,
      status,
      ...(fieldErrors ? { fieldErrors } : {}),
      ...(requestId ? { requestId } : {}),
    }
  }

  if (error instanceof TypeError) {
    return {
      code: 'NETWORK_ERROR',
      message: '网络连接异常，请稍后重试。',
      status: 0,
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: '请求失败，请稍后重试。',
    status: 500,
  }
}
