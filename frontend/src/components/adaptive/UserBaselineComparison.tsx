import {
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { BehaviorBeforeAfter, FirewallDecision, UserBaselineProfile } from '../../types/adaptiveLearning'

interface UserBaselineComparisonProps {
  comparison: BehaviorBeforeAfter[]
  user: UserBaselineProfile
}

export function UserBaselineComparison({
  comparison,
  user,
}: UserBaselineComparisonProps) {
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

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowsRightLeftIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Before vs. After Behavioral Deviation & Decision Trace
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Side-by-side contrast between historical learned baseline and current observed session telemetry for{' '}
            <strong className="text-slate-800">{user.userName}</strong>.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          5 Core Vectors Analyzed
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {comparison.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-bold text-slate-900">
                {item.metric}
              </h4>
              <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-700">
                SHAP Driver: {item.driverFeature}
              </span>
            </div>

            {/* 4 Column Comparison Grid */}
            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              {/* 1. Historical Baseline */}
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  1. Historical Baseline
                </span>
                <p className="font-semibold text-slate-800 leading-snug">
                  {item.oldBehavior}
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-1 text-[10px] text-slate-500">
                  <span>Baseline Action:</span>
                  <span
                    className={`rounded border px-1.5 py-0.2 font-bold ${getDecisionBadge(
                      item.decisionBefore,
                    )}`}
                  >
                    {item.decisionBefore}
                  </span>
                </div>
              </div>

              {/* 2. Current Observed Telemetry */}
              <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                  2. Current Observed Activity
                </span>
                <p className="font-bold text-indigo-950 leading-snug">
                  {item.currentBehavior}
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-indigo-200/50 pt-1 text-[10px] text-indigo-800">
                  <span>Firewall Decision:</span>
                  <span
                    className={`rounded border px-1.5 py-0.2 font-bold ${getDecisionBadge(
                      item.decisionAfter,
                    )}`}
                  >
                    {item.decisionAfter}
                  </span>
                </div>
              </div>

              {/* 3. Expected Baseline Tolerance */}
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  3. Expected Upper Tolerance
                </span>
                <p className="font-medium text-slate-700 leading-snug">
                  {item.expectedBaseline}
                </p>
                <span className="mt-2 block text-[10px] text-slate-400">
                  Calculated from 3σ standard deviation
                </span>
              </div>

              {/* 4. Variance Delta */}
              <div className="rounded-xl bg-slate-50 p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    4. Statistical Variance Delta
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {item.varianceDelta}
                  </p>
                </div>
                <span className="text-[10px] font-medium text-slate-500">
                  Evaluated in real-time pipeline
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
