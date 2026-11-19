import type { ReactNode } from 'react'
import { Card } from './Card'

export function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string
  value: string | number
  detail?: string
  icon?: ReactNode
}) {
  return (
    <Card className="hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">{label}</p>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 shadow-xs">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl tracking-tight font-sans">
        {value}
      </p>
      {detail && (
        <p className="mt-1.5 text-xs text-slate-500 font-medium flex items-center gap-1.5">
          {detail}
        </p>
      )}
    </Card>
  )
}
