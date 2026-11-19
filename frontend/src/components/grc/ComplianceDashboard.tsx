import { useState } from 'react'
import {
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../Card'
import type { ComplianceFramework } from '../../types/grc'

interface ComplianceDashboardProps {
  frameworks: ComplianceFramework[]
}

export function ComplianceDashboard({
  frameworks,
}: ComplianceDashboardProps) {
  const [selectedFrameworkName, setSelectedFrameworkName] = useState<string>(
    frameworks[0]?.name ?? 'ISO 27001',
  )
  const [viewMode, setViewMode] = useState<'radar' | 'bar'>('bar')

  const activeFramework =
    frameworks.find((f) => f.name === selectedFrameworkName) ?? frameworks[0]!

  const radarData = activeFramework.categories.map((c) => ({
    category: c.name,
    score: c.score,
    benchmark: 90,
  }))

  const comparisonData = frameworks.map((f) => ({
    name: f.name,
    score: f.overallScore,
    passed: f.controlsPassed,
    failed: f.controlsFailed,
    pending: f.controlsPending,
  }))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Substantial':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Regulatory Compliance Posture & Framework Benchmarks
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Multi-standard compliance tracking across ISO 27001, NIST CSF, SOC 2 Type II, GDPR, HIPAA, and PCI-DSS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode('bar')}
              className={`cursor-pointer rounded-lg px-3 py-1 transition ${
                viewMode === 'bar'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Cross-Standard Comparison
            </button>
            <button
              type="button"
              onClick={() => setViewMode('radar')}
              className={`cursor-pointer rounded-lg px-3 py-1 transition ${
                viewMode === 'radar'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Domain Radar Analysis
            </button>
          </div>
        </div>
      </div>

      {/* 6 Framework Cards */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {frameworks.map((f) => {
          const isSelected = f.name === activeFramework.name
          return (
            <div
              key={f.name}
              onClick={() => setSelectedFrameworkName(f.name)}
              className={`cursor-pointer rounded-2xl border p-3.5 transition duration-150 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{f.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {f.version}
                  </span>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${getStatusBadge(
                    f.status,
                  )}`}
                >
                  {f.status}
                </span>
              </div>

              {/* Score bar */}
              <div className="mt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-slate-900">
                    {f.overallScore}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {f.controlsPassed}/{f.totalControls} Controls
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      f.overallScore >= 95
                        ? 'bg-emerald-500'
                        : f.overallScore >= 90
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                    }`}
                    style={{ width: `${f.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Controls metrics breakdown */}
              <div className="mt-3 grid grid-cols-3 gap-1 border-t border-slate-100 pt-2 text-center text-[10px]">
                <div>
                  <span className="font-bold text-emerald-600">
                    {f.controlsPassed}
                  </span>
                  <span className="block text-slate-400">Passed</span>
                </div>
                <div>
                  <span className="font-bold text-rose-600">
                    {f.controlsFailed}
                  </span>
                  <span className="block text-slate-400">Failed</span>
                </div>
                <div>
                  <span className="font-bold text-amber-600">
                    {f.controlsPending}
                  </span>
                  <span className="block text-slate-400">Pending</span>
                </div>
              </div>

              {/* Assessment dates */}
              <div className="mt-2.5 border-t border-slate-100 pt-2 text-[10px] text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Assessed:</span>
                  <span className="font-mono text-slate-700">{f.lastAssessment}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next Audit:</span>
                  <span className="font-mono text-indigo-700 font-semibold">{f.nextAudit}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Visual Chart Section */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              {viewMode === 'bar'
                ? 'Cross-Framework Readiness Overview'
                : `Domain Maturity Radar: ${activeFramework.name}`}
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              {viewMode === 'bar'
                ? 'Comparative Pass/Fail Distribution across Enterprise Standards'
                : activeFramework.description}
            </h4>
          </div>
          {viewMode === 'radar' && (
            <span className="text-xs text-slate-500">
              Benchmark Target: <strong>90% Threshold</strong>
            </span>
          )}
        </div>

        <div className="mt-4 h-72 w-full">
          {viewMode === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: unknown) => [`${val}`, 'Count / Score']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="score" name="Overall Compliance (%)" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.score >= 95 ? '#10b981' : entry.score >= 90 ? '#4f46e5' : '#f59e0b'}
                    />
                  ))}
                </Bar>
                <Bar dataKey="passed" name="Controls Passed" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" name="Controls Failed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Controls Pending" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#334155', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                <Radar name={activeFramework.name} dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="Target Benchmark (90%)" dataKey="benchmark" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Tooltip
                  formatter={(val: unknown) => [`${val}%`, 'Score']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  )
}
