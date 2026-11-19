import axios from 'axios'
import { getToken, removeToken } from '../utils/auth'

export function resolveBaseUrl(): string {
  const envUrl =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
      ? String(import.meta.env.VITE_API_URL).trim()
      : ''
  if (envUrl) {
    // Normalize localhost to 127.0.0.1 to avoid Windows IPv6 port collisions with Docker
    const normalized = envUrl.replace(/localhost:8000/g, '127.0.0.1:8000')
    if (!normalized.includes('/api/v1')) {
      return `${normalized.replace(/\/+$/, '')}/api/v1`
    }
    return normalized.replace(/\/+$/, '')
  }
  // In the browser, use relative '/api/v1' path so Vite dev proxy forwards to http://127.0.0.1:8000
  if (typeof window !== 'undefined' && window.location) {
    return '/api/v1'
  }
  return 'http://127.0.0.1:8000/api/v1'
}

export const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(error)
  },
)
