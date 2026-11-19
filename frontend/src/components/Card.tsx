import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <section
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/90 bg-white text-slate-900 p-6 shadow-xs hover:shadow-md transition-all duration-200 ${className}`}
    >
      {children}
    </section>
  )
}
