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
        email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(8, 'Please confirm your password'),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
      })
    ),
  })

  async function submit(values: { username: string; email?: string; password: string }) {
    setError('')
    setIsSubmitting(true)
    try {
      await registerUser(values.username.trim(), values.password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message = extractAuthErrorMessage(
        err,
        'Unable to complete registration. Please try again.'
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
        <p className="text-sm text-slate-500 mt-1">Create your account to access the AI Privacy Firewall dashboard.</p>
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
          label="Email (optional)"
          type="email"
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <Input
          label="Password"
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
        <Button type="submit" disabled={isSubmitting} className="w-full mt-1 py-2.5">
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
          Sign In
        </Link>
      </p>
    </Card>
  )
}
