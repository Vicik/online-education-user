import { describe, expect, it, vi } from 'vitest'
import { getAuthRedirect, runAuthGuard } from '../../../app/middleware/auth'

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
})
