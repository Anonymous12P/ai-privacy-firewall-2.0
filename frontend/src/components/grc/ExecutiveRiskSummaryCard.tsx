import {
  ExclamationCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ExecutiveRiskSummary } from '../../types/grc'

interface ExecutiveRiskSummaryCardProps {
  summary: ExecutiveRiskSummary
}

export function ExecutiveRiskSummaryCard({
  summary,
}: ExecutiveRiskSummaryCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Autonomous AI Executive Governance & Risk Intelligence Summary
            </h3>
            <p className="text-xs text-slate-500">
              Synthesized by the Privacy Firewall Risk Intelligence Engine • Updated at {summary.generatedAt}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          Board-Ready Brief
        </span>
      </div>

      <div className="mt-5 space-y-4 text-xs">
        {/* Posture Overview */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
          <div className="flex items-center gap-2 font-bold text-indigo-900 mb-1">
            <ShieldCheckIcon className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-wider">
              Current Enterprise Risk Posture
            </span>
          </div>
          <p className="leading-relaxed text-indigo-950 font-medium">
            {summary.currentRiskPosture}
          </p>
        </div>

        {/* 2-Column: Highest Risks & Compliance Issues */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
            <div className="flex items-center gap-2 font-bold text-rose-900 mb-2">
              <ExclamationCircleIcon className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-wider">
                Top Priority Enterprise Risks
              </span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-rose-950">
              {summary.highestRisks.map((risk, idx) => (
                <li key={idx} className="leading-snug">
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
            <div className="flex items-center gap-2 font-bold text-amber-900 mb-2">
              <ExclamationCircleIcon className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-wider">
                Regulatory & Compliance Watchlist
              </span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-amber-950">
              {summary.complianceIssues.map((issue, idx) => (
                <li key={idx} className="leading-snug">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Audit Readiness & Business Impact */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Independent Audit Readiness Assessment
            </span>
            <p className="leading-relaxed text-slate-700">
              {summary.auditReadiness}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Business Continuity & Operational Impact
            </span>
            <p className="leading-relaxed text-slate-700">
              {summary.businessImpact}
            </p>
          </div>
        </div>

        {/* Actionable Strategic Recommendations */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-2.5">
            <LightBulbIcon className="h-4 w-4 text-amber-500" />
            <span className="text-[11px] uppercase tracking-wider">
              Strategic GRC Recommendations
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {summary.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-700 font-medium"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
