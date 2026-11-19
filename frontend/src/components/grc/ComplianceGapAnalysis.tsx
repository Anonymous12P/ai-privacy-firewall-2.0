import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ComplianceGapItem } from '../../types/grc'

interface ComplianceGapAnalysisProps {
  gaps: ComplianceGapItem[]
}

export function ComplianceGapAnalysis({ gaps }: ComplianceGapAnalysisProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Compliance Gap Analysis & Remediation Pathway
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Pipeline trace from implemented posture to regulatory deficiencies, residual risk calculation, and corrective actions.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {gaps.length} Actionable Gaps Identified
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {gaps.map((gap) => (
          <div
            key={gap.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
          >
            {/* Top header row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-700">
                  {gap.id}
                </span>
                <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  {gap.framework} ({gap.controlId})
                </span>
                <h4 className="text-xs font-bold text-slate-900">
                  {gap.controlName}
                </h4>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    gap.riskLevel === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : gap.riskLevel === 'High'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {gap.riskLevel} Risk Gap
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Owner: <strong className="text-slate-800">{gap.remediationOwner}</strong>
                </span>
              </div>
            </div>

            {/* 4-Stage Flow Pipeline */}
            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Step 1: Implemented Controls */}
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                  <CheckCircleIcon className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] uppercase">1. Implemented Aspects</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  {gap.implementedAspects}
                </p>
              </div>

              {/* Step 2: Missing Controls */}
              <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] uppercase">2. Missing Deficiencies</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  {gap.missingAspects}
                </p>
              </div>

              {/* Step 3: Recommended Action */}
              <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-800 mb-1">
                  <LightBulbIcon className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] uppercase">3. Recommended Action</span>
                </div>
                <p className="text-[11px] text-indigo-900 leading-relaxed font-medium">
                  {gap.recommendedAction}
                </p>
              </div>

              {/* Step 4: Progress & Effort */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Remediation Progress</span>
                    <span className="text-indigo-700">{gap.progress}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${gap.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Est. Effort:</span>
                  <span className="font-bold text-slate-800">
                    {gap.estimatedEffortDays} calendar days
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
