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

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm({
    resolver: zodResolver(
      z.object({
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Please enter a valid enterprise email'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(8, 'Please confirm your password'),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
      })
    ),
  })

  async function submit(values: { username: string; email: string; password: string }) {
    setError('')
    setIsSubmitting(true)
    try {
      await registerUser(values.username.trim(), values.password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message = extractAuthErrorMessage(
        err,
        'Unable to complete registration. Please verify details.'
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
        <h2 className="text-base font-bold text-slate-900">Provision Personnel Account</h2>
        <p className="text-xs text-slate-500 mt-1">Register enterprise user identity for Zero Trust role access.</p>
      </div>

      {error && (
        <div className="mt-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={form.handleSubmit(submit)} className="mt-6 grid gap-4">
        <Input
          label="Security Username"
          error={form.formState.errors.username?.message}
          {...form.register('username')}
        />
        <Input
          label="Enterprise Email"
          type="email"
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <Input
          label="Password (min. 8 characters)"
          type="password"
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />
        <Input
          label="Confirm Password"
          type="password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full mt-2 py-3 text-xs">
          {isSubmitting ? 'Provisioning Account...' : 'Provision Access'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Already have credentials?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
          Sign In
        </Link>
      </p>
    </Card>
  )
}
