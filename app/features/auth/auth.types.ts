export interface SessionUser {
  id: string
  displayName: string
  email?: string
  avatarUrl?: string
}

export interface Session {
  user: SessionUser
}

export interface LoginCredentials {
  email: string
  password: string
}
