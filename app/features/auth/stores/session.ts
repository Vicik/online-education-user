import { defineStore } from 'pinia'
import {
  getSession,
  login,
  logout,
  projectSession,
} from '../auth.service'
import type { LoginCredentials, Session } from '../auth.types'

interface SessionState {
  session: Session | null
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    session: null,
  }),
  getters: {
    isAuthenticated: state => state.session !== null,
  },
  actions: {
    setSession(session: Session | null) {
      this.session = session ? projectSession(session) : null
    },
    async hydrate(): Promise<Session | null> {
      const session = await getSession()
      this.setSession(session)
      return this.session
    },
    async authenticate(credentials: LoginCredentials): Promise<Session> {
      const session = await login(credentials)
      this.setSession(session)
      return this.session as Session
    },
    async signOut(): Promise<void> {
      try {
        await logout()
      }
      finally {
        this.setSession(null)
      }
    },
  },
})
