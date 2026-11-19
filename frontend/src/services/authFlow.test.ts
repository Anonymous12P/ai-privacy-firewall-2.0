import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api/client'
import { login, register } from './authService'
import { isTokenExpired } from '../utils/auth'
import { extractAuthErrorMessage } from '../utils/authErrors'

describe('authService and authentication flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // 1. registration success test
  it('registration success test: sends POST request to /auth/register and returns created user', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { username: 'pavan_demo01' },
    })

    const result = await register('pavan_demo01', 'securePass123')

    expect(postSpy).toHaveBeenCalledWith('/auth/register', {
      username: 'pavan_demo01',
      password: 'securePass123',
    })
    expect(result.username).toBe('pavan_demo01')
  })

  // 2. login success test
  it('login success test: sends POST request to /auth/login and returns bearer token', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { access_token: 'mock-jwt-token-xyz', token_type: 'bearer' },
    })

    const result = await login('pavan_demo01', 'securePass123')

    expect(postSpy).toHaveBeenCalledWith('/auth/login', {
      username: 'pavan_demo01',
      password: 'securePass123',
    })
    expect(result.access_token).toBe('mock-jwt-token-xyz')
    expect(result.token_type).toBe('bearer')
  })

  // 3. duplicate username test
  it('duplicate username test: propagates 409 Conflict and extracts clear message', async () => {
    const err409 = {
      response: {
        status: 409,
        data: { detail: 'Username is already registered' },
      },
    }
    vi.spyOn(apiClient, 'post').mockRejectedValueOnce(err409)

    await expect(register('pavan_demo01', 'securePass123')).rejects.toMatchObject({
      response: { status: 409 },
    })

    const errorMsg = extractAuthErrorMessage(err409, 'Default fallback')
    expect(errorMsg).toContain('Username is already registered')
    expect(errorMsg).toContain('Please sign in or choose a different username')
  })

  // 4. password validation test
  it('password validation test: checks 6 character minimum constraint message', () => {
    const err422Short = {
      response: {
        status: 422,
        data: {
          detail: [
            { loc: ['body', 'password'], msg: 'String should have at least 6 characters' },
          ],
        },
      },
    }
    const msg = extractAuthErrorMessage(err422Short, 'Failed')
    expect(msg).toBe('Password: Must be at least 6 characters long')
  })

  // 5. wrong password test
  it('wrong password test: propagates 401 Unauthorized and displays friendly message', async () => {
    const err401 = {
      response: {
        status: 401,
        data: { detail: 'Invalid username or password' },
      },
    }
    vi.spyOn(apiClient, 'post').mockRejectedValueOnce(err401)

    await expect(login('pavan_demo01', 'wrong_password')).rejects.toMatchObject({
      response: { status: 401 },
    })

    const msg = extractAuthErrorMessage(err401, 'Fallback')
    expect(msg).toBe('Invalid username or password')
  })

  // 6. missing field test
  it('missing field test: propagates 422 for missing required fields', async () => {
    const err422Missing = {
      response: {
        status: 422,
        data: {
          detail: [{ loc: ['body', 'password'], msg: 'Field required', type: 'missing' }],
        },
      },
    }
    vi.spyOn(apiClient, 'post').mockRejectedValueOnce(err422Missing)

    await expect(register('pavan_demo01', '')).rejects.toMatchObject({
      response: { status: 422 },
    })

    const msg = extractAuthErrorMessage(err422Missing, 'Fallback')
    expect(msg).toContain('Password: Field required')
  })

  // 7. endpoint path test
  it('endpoint path test: verifies that apiClient constructs the proper versioned endpoint URI', () => {
    const regUri = apiClient.getUri({ url: '/auth/register' })
    const loginUri = apiClient.getUri({ url: '/auth/login' })

    expect(regUri).toContain('/api/v1/auth/register')
    expect(loginUri).toContain('/api/v1/auth/login')
    expect(regUri).not.toContain('/api/v1/api/v1')
    expect(loginUri).not.toContain('/api/v1/api/v1')
  })

  // 8. error message display test
  it('error message display test: ensures backend errors are displayed and not replaced with generic Not Found', () => {
    const customBackendError = {
      response: {
        status: 400,
        data: { detail: 'Custom domain policy rejected this username' },
      },
    }
    expect(extractAuthErrorMessage(customBackendError, 'Fallback')).toBe(
      'Custom domain policy rejected this username'
    )

    const notFoundError = {
      response: {
        status: 404,
        data: { detail: 'Not Found' },
      },
    }
    const notFoundMsg = extractAuthErrorMessage(notFoundError, 'Fallback')
    expect(notFoundMsg).not.toBe('Not Found')
    expect(notFoundMsg).toContain('Authentication service endpoint was not found on the server')
  })

  // 9. route fallback tests
  it('falls back from /auth/register to /register when route returns 404', async () => {
    const postSpy = vi.spyOn(apiClient, 'post')
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({ data: { username: 'fallback_user' } })

    const result = await register('fallback_user', 'password123')

    expect(postSpy).toHaveBeenNthCalledWith(1, '/auth/register', {
      username: 'fallback_user',
      password: 'password123',
    })
    expect(postSpy).toHaveBeenNthCalledWith(2, '/register', {
      username: 'fallback_user',
      password: 'password123',
    })
    expect(result.username).toBe('fallback_user')
  })

  it('falls back from /auth/login to /login when route returns 404', async () => {
    const postSpy = vi.spyOn(apiClient, 'post')
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({ data: { access_token: 'fallback-token', token_type: 'bearer' } })

    const result = await login('fallback_user', 'password123')

    expect(postSpy).toHaveBeenNthCalledWith(1, '/auth/login', {
      username: 'fallback_user',
      password: 'password123',
    })
    expect(postSpy).toHaveBeenNthCalledWith(2, '/login', {
      username: 'fallback_user',
      password: 'password123',
    })
    expect(result.access_token).toBe('fallback-token')
  })

  // 10. token expiration test
  it('validates token expiration decoding including base64url characters', () => {
    const futurePayload = {
      sub: 'secops_analyst',
      exp: Math.floor(Date.now() / 1000) + 3600,
      scope: 'firewall:admin-read_write',
    }
    const base64urlPart = btoa(JSON.stringify(futurePayload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    const mockToken = `eyJhbGciOiJIUzI1NiJ9.${base64urlPart}.signature`

    expect(isTokenExpired(mockToken)).toBe(false)

    const pastPayload = {
      sub: 'secops_analyst',
      exp: Math.floor(Date.now() / 1000) - 100,
    }
    const expiredBase64Part = btoa(JSON.stringify(pastPayload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    const expiredToken = `eyJhbGciOiJIUzI1NiJ9.${expiredBase64Part}.signature`

    expect(isTokenExpired(expiredToken)).toBe(true)
  })
})
