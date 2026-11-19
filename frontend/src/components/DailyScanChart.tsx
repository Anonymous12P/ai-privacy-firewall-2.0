import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AnalyticsSummary } from '../types/api'
import { Card } from './Card'

export function DailyScanChart({ summary }: { summary: AnalyticsSummary }) {
  const data = Object.entries(summary.daily_scan_counts).sort(([first], [second]) => first.localeCompare(second)).map(([date, scans]) => ({ date, scans }))
  return <Card className="lg:col-span-2"><h2 className="font-semibold text-slate-900">Daily scans</h2><div className="mt-4 h-72">{data.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="scans" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer> : <p className="pt-24 text-center text-sm text-slate-500">No daily activity available.</p>}</div></Card>
}
