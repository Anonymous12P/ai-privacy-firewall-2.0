import { useState } from 'react'
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { AnomalyTrendItem, FirewallDecision } from '../../types/adaptiveLearning'

interface AnomalyTrendTableProps {
  anomalies: AnomalyTrendItem[]
}

export function AnomalyTrendTable({ anomalies }: AnomalyTrendTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('ALL')

  const filtered = anomalies.filter((a) => {
    const matchesSearch =
      a.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.anomalyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDept = selectedDept === 'ALL' || a.department === selectedDept
    return matchesSearch && matchesDept
  })

  const getDecisionBadge = (decision: FirewallDecision) => {
    switch (decision) {
      case 'ALLOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'WARN':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'RESTRICT':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'BLOCK':
        return 'bg-rose-100 text-rose-800 border-rose-200'
    }
  }

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'Spiking':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
            <ArrowTrendingUpIcon className="h-3 w-3" /> Spiking
          </span>
        )
      case 'Increasing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
            <ArrowTrendingUpIcon className="h-3 w-3" /> Increasing
          </span>
        )
      case 'Decaying':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowTrendingDownIcon className="h-3 w-3" /> Decaying
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <MinusIcon className="h-3 w-3" /> Stabilizing
          </span>
        )
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldExclamationIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Active Behavioral Anomaly Velocity & Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time anomaly events classified across statistical behavioral deviations and automated enforcement dispositions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, anomaly..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-52 rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3.5 py-3">Anomaly ID</th>
              <th className="px-3.5 py-3">User & Department</th>
              <th className="px-3.5 py-3">Anomaly Pattern</th>
              <th className="px-3.5 py-3">Threat Score</th>
              <th className="px-3.5 py-3">Trajectory</th>
              <th className="px-3.5 py-3">Firewall Decision</th>
              <th className="px-3.5 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition">
                <td className="px-3.5 py-3 font-mono font-bold text-indigo-700">
                  {item.id}
                </td>
                <td className="px-3.5 py-3">
                  <span className="font-bold text-slate-900 block">
                    {item.user}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.department}
                  </span>
                </td>
                <td className="px-3.5 py-3 font-medium text-slate-800">
                  {item.anomalyType}
                </td>
                <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                  {item.score} / 100
                </td>
                <td className="px-3.5 py-3">{getTrendBadge(item.trend)}</td>
                <td className="px-3.5 py-3">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${getDecisionBadge(
                      item.decision,
                    )}`}
                  >
                    {item.decision}
                  </span>
                </td>
                <td className="px-3.5 py-3 font-mono text-[11px] text-slate-500">
                  {item.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
