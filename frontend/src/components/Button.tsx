import type { ButtonHTMLAttributes } from 'react'

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className}`}
      {...props}
    />
  )
}
