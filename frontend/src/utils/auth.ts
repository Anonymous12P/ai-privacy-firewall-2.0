const TOKEN_KEY = 'ai-firewall.access-token'

export const getToken = () => window.localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string) => window.localStorage.setItem(TOKEN_KEY, token)
export const removeToken = () => window.localStorage.removeItem(TOKEN_KEY)

export function isTokenExpired(token: string): boolean {
  try {
    const part = token.split('.')[1] ?? ''
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const payload = JSON.parse(atob(padded)) as { exp?: number }
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}
