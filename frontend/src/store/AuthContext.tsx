import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { UserResponse } from '../types/api'
import * as authService from '../services/authService'
import { getToken, isTokenExpired, removeToken, setToken } from '../utils/auth'

interface AuthContextValue {
  token: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    const stored = getToken()
    return stored && !isTokenExpired(stored) ? stored : null
  })
  const [user, setUser] = useState<UserResponse | null>(() => {
    const stored = getToken()
    if (stored && !isTokenExpired(stored)) {
      try {
        const part = stored.split('.')[1] ?? ''
        const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
        const payload = JSON.parse(atob(padded)) as { sub?: string }
        if (payload.sub) return { username: payload.sub }
      } catch {
        // ignore
      }
    }
    return null
  })

  useEffect(() => {
    const expire = () => { setTokenState(null); setUser(null); window.location.assign('/login') }
    window.addEventListener('auth:expired', expire)
    if (!token && getToken()) removeToken()
    return () => window.removeEventListener('auth:expired', expire)
  }, [token])

  const login = async (username: string, password: string): Promise<void> => {
    const trimmedUsername = username.trim()
    const data = await authService.login(trimmedUsername, password)
    setToken(data.access_token)
    setTokenState(data.access_token)
    setUser({ username: trimmedUsername })
  }

  const register = async (username: string, password: string): Promise<void> => {
    const trimmedUsername = username.trim()
    await authService.register(trimmedUsername, password)
    await login(trimmedUsername, password)
  }

  const logout = (): void => {
    removeToken()
    setTokenState(null)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
  }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
