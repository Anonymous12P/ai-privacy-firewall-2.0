import type { FirewallAction } from '../types/api'

const actionStyles: Record<FirewallAction, string> = {
  BLOCK: 'bg-rose-50 text-rose-700 border-rose-200/90',
  RESTRICT: 'bg-orange-50 text-orange-800 border-orange-200/90',
  WARN: 'bg-amber-50 text-amber-800 border-amber-200/90',
  ALLOW: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
}

export function FirewallActionBadge({
  action,
}: {
  action: FirewallAction | string | null
}) {
  const normalized = (action?.toUpperCase() ?? 'ALLOW') as FirewallAction
  const style = actionStyles[normalized] ?? 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase ${style}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          normalized === 'BLOCK'
            ? 'bg-rose-500'
            : normalized === 'RESTRICT'
              ? 'bg-orange-500'
              : normalized === 'WARN'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
        }`}
      />
      {normalized}
    </span>
  )
}
