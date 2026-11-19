export function extractAuthErrorMessage(
  error: unknown,
  defaultFallback: string
): string {
  if (!error) return defaultFallback

  if (typeof error === 'string') return error

  if (typeof error === 'object') {
    const err = error as {
      response?: {
        status?: number
        data?: {
          detail?: string | Array<{ loc?: (string | number)[]; msg?: string; type?: string }>
          message?: string
        }
      }
      message?: string
      code?: string
    }

    const status = err.response?.status
    const data = err.response?.data

    if (status === 409) {
      if (typeof data?.detail === 'string') {
        return `${data.detail}. Please sign in or choose a different username.`
      }
      return 'This username is already registered. Please sign in or choose a different username.'
    }

    if (status === 401) {
      if (typeof data?.detail === 'string' && data.detail.trim() && data.detail !== 'Not Found') {
        return data.detail
      }
      return 'Invalid username or password. Please verify your credentials and try again.'
    }

    if (status === 404 || data?.detail === 'Not Found') {
      return 'Authentication service endpoint was not found on the server. Please verify the backend API route configuration.'
    }

    if (status === 422 && Array.isArray(data?.detail) && data.detail.length > 0) {
      const messages = data.detail.map((d) => {
        const fieldName = Array.isArray(d.loc) && d.loc.length > 0 ? String(d.loc[d.loc.length - 1]) : ''
        const fieldPrefix = fieldName && fieldName !== 'body' ? `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ` : ''
        let msg = d.msg ?? 'Invalid value'
        if (msg.includes('at least 6 characters') || msg.includes('at least 8 characters')) {
          msg = 'Must be at least 6 characters long'
        }
        return `${fieldPrefix}${msg}`
      })
      return messages.join('. ')
    }

    if (typeof data?.detail === 'string' && data.detail.trim()) {
      return data.detail
    }

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message
    }

    // Network / CORS errors
    if (
      err.message === 'Network Error' ||
      err.code === 'ERR_NETWORK' ||
      !err.response
    ) {
      return 'Unable to connect to the authentication server. Please check your network connection and verify the backend is running at http://localhost:8000.'
    }

    if (typeof err.message === 'string' && err.message.trim()) {
      return err.message
    }
  }

  return defaultFallback
}
