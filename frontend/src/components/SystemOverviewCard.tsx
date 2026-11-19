import type { SystemAdmin } from '../types/api'
import { Card } from './Card'

export function SystemOverviewCard({ system }: { system: SystemAdmin }) {
  const uptime = system.uptime_seconds === null ? '—' : `${Math.floor(system.uptime_seconds / 3600)}h ${Math.floor((system.uptime_seconds % 3600) / 60)}m`
  return <Card><h2 className="font-semibold text-slate-900">System information</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2">{[['Application', system.app_name], ['Version', system.version], ['Environment', system.environment], ['Python', system.python_version], ['Database', system.database_mode], ['Uptime', uptime]].map(([label, value]) => <div key={label}><dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-700">{value}</dd></div>)}</dl></Card>
}
