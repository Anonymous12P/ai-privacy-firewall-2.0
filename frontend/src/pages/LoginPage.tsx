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
    <Card className="w-full max-w-md border border-slate-200/90 bg-white p-8 shadow-xl rounded-2xl">
      <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
          <ShieldCheckIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">AI Privacy Firewall</h1>
          <p className="text-xs font-semibold text-blue-600">Privacy Shield Technologies Pvt. Ltd.</p>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="text-base font-bold text-slate-900">SecOps Console Sign In</h2>
        <p className="text-xs text-slate-500 mt-1">Authenticate with your enterprise credentials to access UBA controls.</p>
      </div>

      {error && (
        <div className="mt-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={form.handleSubmit(submit)} className="mt-6 grid gap-4">
        <Input
          label="Username / Security ID"
          error={form.formState.errors.username?.message}
          {...form.register('username')}
        />
        <Input
          label="Password"
          type="password"
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full mt-2 py-3 text-xs">
          {isSubmitting ? 'Authenticating Access...' : 'Sign In To Console'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Need access authorization?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
          Request Personnel Access
        </Link>
      </p>
    </Card>
  )
}
