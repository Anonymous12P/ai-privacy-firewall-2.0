import {
  ArrowDownRightIcon,
  CheckBadgeIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { FnReductionMetrics } from '../../types/policyLearning'

interface FalseNegativeReductionCardProps {
  metrics: FnReductionMetrics
}

export function FalseNegativeReductionCard({ metrics }: FalseNegativeReductionCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldExclamationIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              False Negative & Leakage Elimination
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Closes detection blindspots through automated behavioral correlation and threat feedback.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-black text-indigo-700">
          <ArrowDownRightIcon className="h-4 w-4" />
          -{metrics.reductionPercentage}% Leakage Drop
        </div>
      </div>

      {/* Main KPI Badges */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Previous FNR (v1.0)
          </p>
          <p className="mt-1 text-2xl font-black text-slate-400 line-through">
            {metrics.previousFnr}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">Heuristic baseline</p>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
          <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
            Current FNR (v4.2)
          </p>
          <p className="mt-1 text-2xl font-black text-indigo-700">
            {metrics.currentFnr}%
          </p>
          <p className="mt-0.5 text-[10px] text-indigo-600 font-semibold">&lt; 1% High Assurance</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Missed Threats Prevented
            </p>
            <LockClosedIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {metrics.missedThreatsPrevented}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Stealth Incidents Intercepted</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Risk Coverage
            </p>
            <CheckBadgeIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-indigo-700">
            {metrics.coveragePercentage}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">MITRE ATT&CK Matrix</p>
        </div>
      </div>

      {/* Version-by-Version FNR Progression Bar */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          FNR Trajectory Across Architectural Iterations
        </h4>
        <div className="mt-3 space-y-2.5">
          {metrics.historicalFnrData.map((d) => {
            const widthPct = Math.min(100, (d.fnr / 5.0) * 100)
            return (
              <div key={d.version} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{d.version}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{d.fnr}% FNR</span>
                    <span className="text-[10px] text-slate-400">
                      (Industry benchmark: {d.benchmark}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-400 to-indigo-600 transition-all duration-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
