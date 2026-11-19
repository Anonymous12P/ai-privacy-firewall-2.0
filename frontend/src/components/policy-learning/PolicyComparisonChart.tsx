import { useState } from 'react'
import {
  ArrowsRightLeftIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { PolicyBeforeAfter } from '../../types/policyLearning'

interface PolicyComparisonChartProps {
  comparisons: PolicyBeforeAfter[]
}

export function PolicyComparisonChart({ comparisons }: PolicyComparisonChartProps) {
  const [expandedId, setExpandedId] = useState<string | null>(comparisons[0]?.id ?? null)

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowsRightLeftIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Before & After Policy Differential Inspection
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Side-by-side behavioral rule specification comparison pre- and post-Bayesian feedback optimization.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
          {comparisons.length} Policies Modernized
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {comparisons.map((comp) => {
          const isExpanded = expandedId === comp.id

          return (
            <div
              key={comp.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition hover:border-slate-300"
            >
              {/* Header bar */}
              <div
                className="flex cursor-pointer items-center justify-between bg-slate-50/75 p-3.5 transition hover:bg-slate-100/60"
                onClick={() => setExpandedId(isExpanded ? null : comp.id)}
              >
                <div className="flex items-center gap-2.5">
                  <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-mono font-bold text-indigo-700">
                    {comp.id}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{comp.policyName}</h4>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {comp.department}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {comp.approvalStatus}
                  </span>
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparison Grid */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Old Policy */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Previous Heuristic Policy (v1.0)
                    </span>
                    <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-700">
                      {comp.oldPolicy.fpRate}% FPR
                    </span>
                  </div>
                  <div className="text-xs space-y-1.5">
                    <p>
                      <strong className="text-slate-600">Condition: </strong>
                      <span className="font-mono text-slate-800">{comp.oldPolicy.condition}</span>
                    </p>
                    <p>
                      <strong className="text-slate-600">Action: </strong>
                      <span className="font-semibold text-rose-700">{comp.oldPolicy.action}</span>
                    </p>
                    <p>
                      <strong className="text-slate-600">Trigger Threshold: </strong>
                      <span className="font-mono text-slate-700">{comp.oldPolicy.threshold}</span>
                    </p>
                  </div>
                </div>

                {/* New Policy */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Adaptive Learned Policy (v4.2)
                    </span>
                    <span className="rounded bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                      {comp.newPolicy.fpRate}% FPR (-{(comp.oldPolicy.fpRate - comp.newPolicy.fpRate).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="text-xs space-y-1.5">
                    <p>
                      <strong className="text-emerald-900">Condition: </strong>
                      <span className="font-mono text-emerald-950">{comp.newPolicy.condition}</span>
                    </p>
                    <p>
                      <strong className="text-emerald-900">Action: </strong>
                      <span className="font-semibold text-emerald-700">{comp.newPolicy.action}</span>
                    </p>
                    <p>
                      <strong className="text-emerald-900">Trigger Threshold: </strong>
                      <span className="font-mono font-bold text-emerald-800">{comp.newPolicy.threshold}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/70 p-4 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-800 shrink-0">Change Rationale:</span>
                    <span className="text-slate-600">{comp.changeReason}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-800 shrink-0">Expected Risk Impact:</span>
                    <span className="text-slate-600">{comp.expectedRiskImpact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-900 shrink-0">Decision Shift:</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 font-bold text-indigo-700">
                      <CheckBadgeIcon className="h-3.5 w-3.5" />
                      {comp.expectedDecisionShift}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
