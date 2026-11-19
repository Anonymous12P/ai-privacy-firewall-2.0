import type { AnalyticsSummary } from '../types/api'
import { Card } from './Card'

export function TopRiskUsersCard({ summary }: { summary: AnalyticsSummary }) {
  return <Card><h2 className="font-semibold text-slate-900">Top risky users</h2>{summary.top_risky_users.length ? <ul className="mt-4 grid gap-3">{summary.top_risky_users.map((user, index) => <li className="flex items-center gap-3 text-sm" key={user}><span className="grid h-7 w-7 place-items-center rounded-full bg-rose-50 text-xs font-bold text-rose-700">{index + 1}</span><span className="text-slate-700">{user}</span></li>)}</ul> : <p className="mt-4 text-sm text-slate-500">No high-risk users recorded.</p>}</Card>
}
