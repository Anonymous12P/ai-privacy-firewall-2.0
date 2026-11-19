import type { InputHTMLAttributes } from 'react'

export function Input({
  label,
  error,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
      {label}
      <input
        className={`rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none ring-blue-500/20 focus:border-blue-600 focus:ring-4 font-sans transition-all duration-150 shadow-2xs ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600 font-sans font-medium">{error}</span>}
    </label>
  )
}
