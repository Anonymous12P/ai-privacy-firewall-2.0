import { apiClient } from '../api/client'
import type { TokenResponse, UserResponse } from '../types/api'

export async function login(username: string, password: string): Promise<TokenResponse> {
  const payload = { username: username.trim(), password }
  try {
    return (await apiClient.post<TokenResponse>('/auth/login', payload)).data
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } }
    if (err?.response?.status === 404) {
      try {
        return (await apiClient.post<TokenResponse>('/login', payload)).data
      } catch {
        throw error
      }
    }
    throw error
  }
}

export async function register(username: string, password: string): Promise<UserResponse> {
  const payload = { username: username.trim(), password }
  try {
    return (await apiClient.post<UserResponse>('/auth/register', payload)).data
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } }
    if (err?.response?.status === 404) {
      try {
        return (await apiClient.post<UserResponse>('/register', payload)).data
      } catch {
        throw error
      }
    }
    throw error
  }
}
