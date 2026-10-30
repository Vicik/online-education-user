import { apiRequest } from '~/composables/useApi'
import type { LoginCredentials, Session } from './auth.types'

function isUnauthorized(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'status' in error
    && error.status === 401
}

export function projectSession(session: Session): Session {
  const { id, displayName, email, avatarUrl } = session.user

  return {
    user: {
      id,
      displayName,
      ...(email ? { email } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const session = await apiRequest<Session>('/v1/session', {
      auth: 'session',
      method: 'GET',
    })
    return projectSession(session)
  }
  catch (error: unknown) {
    if (isUnauthorized(error)) {
      return null
    }
    throw error
  }
}

export async function login(credentials: LoginCredentials): Promise<Session> {
  const session = await apiRequest<Session>('/v1/login', {
    auth: 'session',
    method: 'POST',
    body: credentials,
  })
  return projectSession(session)
}

export function logout(): Promise<void> {
  return apiRequest<undefined>('/v1/logout', {
    auth: 'session',
    method: 'POST',
  })
}

function hasControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const codePoint = character.codePointAt(0) ?? 0
    return codePoint <= 31 || codePoint === 127
  })
}

export function resolveSafeRedirect(value: unknown, fallback = '/'): string {
  if (typeof value !== 'string') {
    return fallback
  }

  const candidate = value.trim()
  if (
    !candidate.startsWith('/')
    || candidate.startsWith('//')
    || candidate.includes('\\')
    || hasControlCharacter(candidate)
  ) {
    return fallback
  }

  try {
    const base = new URL('https://local.invalid')
    const redirect = new URL(candidate, base)
    if (redirect.origin !== base.origin) {
      return fallback
    }
    const normalizedPath = `${redirect.pathname}${redirect.search}${redirect.hash}`
    return normalizedPath.startsWith('//') ? fallback : normalizedPath
  }
  catch {
    return fallback
  }
}
