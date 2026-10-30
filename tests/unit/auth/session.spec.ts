import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../app/composables/useApi'
import {
  getSession,
  login,
  logout,
} from '../../../app/features/auth/auth.service'
import { useSessionStore } from '../../../app/features/auth/stores/session'

vi.mock('../../../app/composables/useApi', () => ({
  apiRequest: vi.fn(),
}))

const backendSession = {
  user: {
    id: 'user-1',
    displayName: '林知序',
    email: 'learner@example.com',
    avatarUrl: '/avatars/user-1.png',
  },
}

describe('auth service', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset()
  })

  it('uses session-cookie requests for session lookup, login, and logout', async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce(backendSession)
      .mockResolvedValueOnce(backendSession)
      .mockResolvedValueOnce(undefined)

    await expect(getSession()).resolves.toEqual(backendSession)
    await expect(login({ email: 'learner@example.com', password: 'secret-value' }))
      .resolves.toEqual(backendSession)
    await expect(logout()).resolves.toBeUndefined()

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/v1/session', {
      auth: 'session',
      method: 'GET',
    })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/v1/login', {
      auth: 'session',
      method: 'POST',
      body: {
        email: 'learner@example.com',
        password: 'secret-value',
      },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/v1/logout', {
      auth: 'session',
      method: 'POST',
    })
  })

  it('treats a normalized 401 session response as anonymous and preserves other failures', async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce({
      code: 'UNAUTHORIZED',
      message: '登录状态已失效，请重新登录。',
      status: 401,
    })

    await expect(getSession()).resolves.toBeNull()

    const failure = { code: 'NETWORK_ERROR', message: '网络连接异常，请稍后重试。', status: 0 }
    vi.mocked(apiRequest).mockRejectedValueOnce(failure)
    await expect(getSession()).rejects.toEqual(failure)
  })
})

describe('session store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(apiRequest).mockReset()
  })

  it('keeps only the current user projection and never retains backend credentials', () => {
    const store = useSessionStore()
    store.setSession({
      ...backendSession,
      token: 'must-not-enter-store',
      refreshToken: 'must-not-enter-store',
    } as never)

    expect(store.session).toEqual(backendSession)
    expect(JSON.stringify(store.$state)).not.toContain('must-not-enter-store')
    expect('credentials' in store.$state).toBe(false)
  })

  it('clears the local projection even when backend logout fails', async () => {
    const store = useSessionStore()
    store.setSession(backendSession)
    vi.mocked(apiRequest).mockRejectedValue({
      code: 'NETWORK_ERROR',
      message: '网络连接异常，请稍后重试。',
      status: 0,
    })

    await expect(store.signOut()).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
    expect(store.session).toBeNull()
  })
})
