import {
  AdjustmentsHorizontalIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { AdaptiveThresholdItem } from '../../types/adaptiveLearning'

interface ThresholdAdaptationCardProps {
  thresholds: AdaptiveThresholdItem[]
}

export function ThresholdAdaptationCard({
  thresholds,
}: ThresholdAdaptationCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Adaptive Policy Threshold Calibrations
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Dynamic threshold relaxation and tightening driven by automated true/false positive feedback loops and departmental shifts.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          {thresholds.length} Active Dynamic Rules
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {thresholds.map((item) => {
          const isRelaxed = item.direction === 'Relaxed'

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700">
                    {item.id}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {item.department}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    {item.ruleName}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    Trigger: {item.trigger}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isRelaxed
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isRelaxed ? (
                      <ArrowUpIcon className="h-3 w-3" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3" />
                    )}
                    {item.direction} ({item.delta > 0 ? `+${item.delta}` : item.delta})
                  </span>
                </div>
              </div>

              {/* Threshold before/after metrics */}
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    PREVIOUS THRESHOLD
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {item.previousThreshold}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    ADAPTED THRESHOLD
                  </span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">
                    {item.updatedThreshold}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5 sm:col-span-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Adaptation Rationale
                    </span>
                    <p className="text-[11px] text-slate-700 leading-snug">
                      {item.reason}
                    </p>
                  </div>
                  <span className="mt-2 text-right font-mono text-[9px] text-slate-400">
                    Adapted {item.adaptedAt}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
