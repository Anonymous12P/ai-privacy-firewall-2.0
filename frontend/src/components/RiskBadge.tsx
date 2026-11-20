const styles: Record<string, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
  medium: 'bg-yellow-50 text-yellow-800 border-yellow-200/90',
  elevated: 'bg-amber-50 text-amber-800 border-amber-200/90',
  high: 'bg-orange-50 text-orange-800 border-orange-200/90',
  critical: 'bg-rose-50 text-rose-700 border-rose-200/90',
}

export function RiskBadge({ risk }: { risk: string | null }) {
  const key = risk ? risk.toLowerCase() : 'unavailable'
  const style = styles[key] ?? 'bg-slate-50 text-slate-700 border-slate-200'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${style}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          key === 'critical'
            ? 'bg-rose-500 animate-ping'
            : key === 'high'
              ? 'bg-orange-500'
              : key === 'medium'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
        }`}
      />
      {risk ?? 'Unavailable'}
    </span>
  )
}
