import type { Session } from '~/features/auth/auth.types'
import { useSessionStore } from '~/features/auth/stores/session'

export type AuthSessionStatus = 'unknown' | 'authenticated' | 'anonymous'

export function getAuthRedirect(
  fullPath: string,
  sessionStatus: AuthSessionStatus,
): string | undefined {
  return sessionStatus === 'anonymous'
    ? `/login?redirect=${encodeURIComponent(fullPath)}`
    : undefined
}

export function runAuthGuard<T>(
  fullPath: string,
  sessionStatus: AuthSessionStatus,
  navigate: (path: string) => T,
): T | undefined {
  const redirect = getAuthRedirect(fullPath, sessionStatus)
  return redirect ? navigate(redirect) : undefined
}

export async function runSessionGuard<T>(
  fullPath: string,
  currentSession: Session | null,
  hydrate: () => Promise<Session | null>,
  setStatus: (status: AuthSessionStatus) => void,
  navigate: (path: string) => T,
): Promise<T | undefined> {
  let sessionStatus: AuthSessionStatus

  try {
    const session = currentSession ?? await hydrate()
    sessionStatus = session ? 'authenticated' : 'anonymous'
  }
  catch {
    sessionStatus = 'anonymous'
  }

  setStatus(sessionStatus)
  return runAuthGuard(fullPath, sessionStatus, navigate)
}

export default defineNuxtRouteMiddleware(async (to) => {
  const sessionStore = useSessionStore()
  const sessionStatus = useState<AuthSessionStatus>('auth:session-status', () => 'unknown')
  return runSessionGuard(
    to.fullPath,
    sessionStore.session,
    () => sessionStore.hydrate(),
    status => sessionStatus.value = status,
    navigateTo,
  )
})
