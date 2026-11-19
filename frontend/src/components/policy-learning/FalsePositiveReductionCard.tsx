import {
  ArrowDownRightIcon,
  CheckBadgeIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { FpReductionMetrics } from '../../types/policyLearning'

interface FalsePositiveReductionCardProps {
  metrics: FpReductionMetrics
}

export function FalsePositiveReductionCard({ metrics }: FalsePositiveReductionCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              False Positive Reduction Engine
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Minimizes legitimate workflow disruption through Bayesian analyst feedback pruning.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-black text-emerald-700">
          <ArrowDownRightIcon className="h-4 w-4" />
          -{metrics.reductionPercentage}% Error Reduction
        </div>
      </div>

      {/* Main KPI Badges */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Previous FPR (v1.0)
          </p>
          <p className="mt-1 text-2xl font-black text-slate-400 line-through">
            {metrics.previousFpr}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">Heuristic baseline</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            Current FPR (v4.2)
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {metrics.currentFpr}%
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-700 font-semibold">Active Adaptive Stance</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Alarms Prevented
            </p>
            <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {metrics.falseAlarmsPreventedMonthly.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Per Month</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Analyst Hours Saved
            </p>
            <ClockIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-indigo-700">
            {metrics.analystHoursSavedMonthly} hrs
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Monthly SOC Capacity</p>
        </div>
      </div>

      {/* Version-by-Version FPR Progression Bar */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          FPR Trajectory Across Architectural Iterations
        </h4>
        <div className="mt-3 space-y-2.5">
          {metrics.historicalFprData.map((d) => {
            const widthPct = Math.min(100, (d.fpr / 8.0) * 100)
            return (
              <div key={d.version} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{d.version}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{d.fpr}% FPR</span>
                    <span className="text-[10px] text-slate-400">
                      (Industry benchmark: {d.benchmark}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-500"
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
