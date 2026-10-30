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

export default defineNuxtRouteMiddleware((to) => {
  const sessionStatus = useState<AuthSessionStatus>('auth:session-status', () => 'unknown')
  return runAuthGuard(to.fullPath, sessionStatus.value, navigateTo)
})
