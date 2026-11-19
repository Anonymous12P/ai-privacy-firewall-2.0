import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { RiskAnalytics } from '../types/api'
import { Card } from './Card'

const colors = ['#10b981', '#f59e0b', '#f43f5e', '#6366f1']

export function RiskDistributionCard({ analytics }: { analytics: RiskAnalytics }) {
  const data = Object.entries(analytics.risk_level_distribution).map(([name, value]) => ({ name, value }))
  return <Card><h2 className="font-semibold text-slate-900">Risk distribution</h2><div className="mt-4 h-64">{data.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="75%" label={({ name, value }) => `${name}: ${value}`}><>{data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</></Pie><Tooltip /></PieChart></ResponsiveContainer> : <p className="pt-20 text-center text-sm text-slate-500">No risk data available.</p>}</div></Card>
}
