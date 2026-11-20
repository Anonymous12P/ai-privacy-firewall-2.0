import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { useAuth } from '../hooks/useAuth'
import { extractAuthErrorMessage } from '../utils/authErrors'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm({
    resolver: zodResolver(
      z.object({
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
      })
    ),
  })

  async function submit(values: { username: string; password: string }) {
    setError('')
    setIsSubmitting(true)
    try {
      await login(values.username.trim(), values.password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message = extractAuthErrorMessage(
        err,
        'Unable to sign in with those credentials.'
      )
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md border border-slate-200 bg-white p-8 shadow-lg rounded-2xl">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md mb-4">
          <ShieldCheckIcon className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Privacy Firewall</h1>
        <p className="text-sm text-slate-500 mt-1">Secure AI-powered privacy protection using User Behavior Analytics.</p>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h2 className="text-base font-semibold text-slate-800 mb-1">Sign In</h2>
        <p className="text-xs text-slate-400 mb-4">Enter your credentials to access your dashboard.</p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={form.handleSubmit(submit)} className="grid gap-4">
        <Input
          label="Username"
          error={form.formState.errors.username?.message}
          {...form.register('username')}
        />
        <Input
          label="Password"
          type="password"
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full mt-1 py-2.5">
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
          Register
        </Link>
      </p>
    </Card>
  )
}
