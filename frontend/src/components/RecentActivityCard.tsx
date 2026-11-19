import type { AnalyticsSummary } from '../types/api'
import { Card } from './Card'

export function RecentActivityCard({ summary }: { summary: AnalyticsSummary }) {
  const latest = Object.entries(summary.daily_scan_counts).sort(([first], [second]) => second.localeCompare(first))[0]
  return <Card><h2 className="font-semibold text-slate-900">Latest activity</h2><p className="mt-4 text-2xl font-bold text-slate-900">{latest ? latest[1] : '—'}</p><p className="mt-1 text-sm text-slate-500">{latest ? `scans on ${latest[0]}` : 'No activity recorded'}</p></Card>
}
