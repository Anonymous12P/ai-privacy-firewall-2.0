import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ModelAnalytics } from '../types/api'
import { Card } from './Card'

export function ModelPerformanceCard({ analytics }: { analytics: ModelAnalytics }) {
  const data = Object.entries(analytics.model_usage).map(([name, scans]) => ({ name, scans }))
  return <Card><h2 className="font-semibold text-slate-900">Model usage</h2><div className="mt-4 h-64">{data.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ left: 20, right: 12 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="scans" fill="#4f46e5" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer> : <p className="pt-20 text-center text-sm text-slate-500">No model data available.</p>}</div></Card>
}
