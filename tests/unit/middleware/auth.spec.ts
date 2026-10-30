import { describe, expect, it, vi } from 'vitest'
import {
  getAuthRedirect,
  runAuthGuard,
  runSessionGuard,
} from '../../../app/middleware/auth'

describe('auth middleware', () => {
  it('redirects a known anonymous session to the same-origin login path', () => {
    expect(getAuthRedirect('/exam/attempt/exam-1?from=list', 'anonymous'))
      .toBe('/login?redirect=%2Fexam%2Fattempt%2Fexam-1%3Ffrom%3Dlist')

    const navigate = vi.fn(path => path)
    runAuthGuard('/exam/attempt/exam-1?from=list', 'anonymous', navigate)
    expect(navigate).toHaveBeenCalledWith('/login?redirect=%2Fexam%2Fattempt%2Fexam-1%3Ffrom%3Dlist')
  })

  it('does not invent authentication while the session contract is unresolved', () => {
    expect(getAuthRedirect('/exam/attempt/exam-1', 'unknown')).toBeUndefined()
    expect(getAuthRedirect('/exam/attempt/exam-1', 'authenticated')).toBeUndefined()
  })

  it('resolves an anonymous backend session before redirecting the protected route', async () => {
    const hydrate = vi.fn().mockResolvedValue(null)
    const setStatus = vi.fn()
    const navigate = vi.fn(path => path)

    await expect(runSessionGuard(
      '/exam/attempt/exam-1',
      null,
      hydrate,
      setStatus,
      navigate,
    )).resolves.toBe('/login?redirect=%2Fexam%2Fattempt%2Fexam-1')

    expect(hydrate).toHaveBeenCalledOnce()
    expect(setStatus).toHaveBeenCalledWith('anonymous')
  })

  it('uses the authenticated store projection without reloading the session', async () => {
    const hydrate = vi.fn()
    const setStatus = vi.fn()
    const navigate = vi.fn()

    await expect(runSessionGuard(
      '/exam/attempt/exam-1',
      { user: { id: 'user-1', displayName: '林知序' } },
      hydrate,
      setStatus,
      navigate,
    )).resolves.toBeUndefined()

    expect(hydrate).not.toHaveBeenCalled()
    expect(setStatus).toHaveBeenCalledWith('authenticated')
    expect(navigate).not.toHaveBeenCalled()
  })

  it('fails closed when the session endpoint cannot be reached', async () => {
    const hydrate = vi.fn().mockRejectedValue(new Error('network unavailable'))
    const setStatus = vi.fn()
    const navigate = vi.fn(path => path)

    await runSessionGuard('/exam/attempt/exam-1', null, hydrate, setStatus, navigate)

    expect(setStatus).toHaveBeenCalledWith('anonymous')
    expect(navigate).toHaveBeenCalledWith('/login?redirect=%2Fexam%2Fattempt%2Fexam-1')
  })
})
