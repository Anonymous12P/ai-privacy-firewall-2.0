import { describe, expect, it } from 'vitest'
import { extractAuthErrorMessage } from './authErrors'

describe('extractAuthErrorMessage', () => {
  it('returns default fallback when error is null or undefined', () => {
    expect(extractAuthErrorMessage(null, 'Fallback error')).toBe('Fallback error')
    expect(extractAuthErrorMessage(undefined, 'Fallback error')).toBe('Fallback error')
  })

  it('handles 409 Conflict with duplicate account message', () => {
    const error409 = {
      response: {
        status: 409,
        data: {
          detail: 'Username is already registered',
        },
      },
    }
    const message = extractAuthErrorMessage(error409, 'Failed')
    expect(message).toContain('Username is already registered')
    expect(message).toContain('Please sign in or choose a different username')
  })

  it('handles 401 Unauthorized with credentials message', () => {
    const error401 = {
      response: {
        status: 401,
        data: {
          detail: 'Invalid username or password',
        },
      },
    }
    const message = extractAuthErrorMessage(error401, 'Failed')
    expect(message).toBe('Invalid username or password')
  })

  it('replaces generic 404 Not Found with actionable routing guidance', () => {
    const error404 = {
      response: {
        status: 404,
        data: {
          detail: 'Not Found',
        },
      },
    }
    const message = extractAuthErrorMessage(error404, 'Failed')
    expect(message).not.toBe('Not Found')
    expect(message).toContain('Authentication service endpoint was not found on the server')
  })

  it('extracts field-level detail messages from 422 validation errors and formats 6-char rule', () => {
    const error422 = {
      response: {
        status: 422,
        data: {
          detail: [
            { loc: ['body', 'password'], msg: 'String should have at least 6 characters' },
            { loc: ['body', 'username'], msg: "String should match pattern '^[a-zA-Z0-9_.@+-]+$'" },
          ],
        },
      },
    }
    const message = extractAuthErrorMessage(error422, 'Failed')
    expect(message).toContain('Password: Must be at least 6 characters long')
    expect(message).toContain("Username: String should match pattern '^[a-zA-Z0-9_.@+-]+$'")
  })

  it('handles Network / CORS errors with actionable server connectivity guidance', () => {
    const networkError = {
      message: 'Network Error',
    }
    const message = extractAuthErrorMessage(networkError, 'Failed')
    expect(message).toContain('Unable to connect to the authentication server')
    expect(message).toContain('http://localhost:8000')

    const errNetworkCode = {
      code: 'ERR_NETWORK',
    }
    expect(extractAuthErrorMessage(errNetworkCode, 'Failed')).toContain(
      'Unable to connect to the authentication server'
    )
  })

  it('handles string errors directly', () => {
    expect(extractAuthErrorMessage('Direct string error', 'Failed')).toBe('Direct string error')
  })
})
