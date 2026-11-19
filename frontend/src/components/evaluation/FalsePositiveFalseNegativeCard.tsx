import {
  ArrowDownRightIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { FprFnrAnalysis } from '../../types/evaluation'

interface FalsePositiveFalseNegativeCardProps {
  analysis: FprFnrAnalysis
}

export function FalsePositiveFalseNegativeCard({
  analysis,
}: FalsePositiveFalseNegativeCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Operational Trade-Offs: False Positive & False Negative Optimization
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Simultaneous minimization of $\alpha$ (type I error / false alarm) and $\beta$ (type II error / threat leakage).
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
          Optimal Pareto Frontier
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* False Positive Card */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              False Positive Rate (FPR / Type I Error)
            </h4>
            <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-xs font-black text-amber-800">
              -{analysis.fprReductionPct}%
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-slate-400 line-through">
              {analysis.preTuningFpr}%
            </span>
            <ArrowDownRightIcon className="h-5 w-5 text-emerald-600" />
            <span className="text-3xl font-black text-emerald-700">
              {analysis.postTuningFpr}%
            </span>
          </div>

          <div className="rounded-lg bg-white p-3 border border-amber-200/60 text-xs space-y-1">
            <p className="flex items-center justify-between text-slate-600">
              <span>Alarms Prevented:</span>
              <strong className="text-slate-900 font-mono">
                {analysis.alarmsPreventedMonthly.toLocaleString()} / mo
              </strong>
            </p>
            <p className="flex items-center justify-between text-slate-600">
              <span>Analyst Time Recovered:</span>
              <strong className="text-emerald-700 font-mono">
                {analysis.analystHoursSavedMonthly} hrs / mo
              </strong>
            </p>
          </div>
        </div>

        {/* False Negative Card */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              False Negative Rate (FNR / Type II Error)
            </h4>
            <span className="rounded-full bg-indigo-100 border border-indigo-300 px-2 py-0.5 text-xs font-black text-indigo-800">
              -{analysis.fnrReductionPct}%
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-slate-400 line-through">
              {analysis.preTuningFnr}%
            </span>
            <ArrowDownRightIcon className="h-5 w-5 text-indigo-600" />
            <span className="text-3xl font-black text-indigo-800">
              {analysis.postTuningFnr}%
            </span>
          </div>

          <div className="rounded-lg bg-white p-3 border border-indigo-200/60 text-xs space-y-1">
            <p className="flex items-center justify-between text-slate-600">
              <span>Missed Threats Intercepted:</span>
              <strong className="text-indigo-800 font-mono">
                {analysis.missedThreatsPrevented} incidents
              </strong>
            </p>
            <p className="flex items-center justify-between text-slate-600">
              <span>MITRE ATT&CK Coverage:</span>
              <strong className="text-emerald-700 font-mono">
                {analysis.coverageScore}%
              </strong>
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
