import {
  ArrowPathRoundedSquareIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  LightBulbIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { PolicyLearningSummaryData } from '../../types/policyLearning'

interface PolicyLearningSummaryProps {
  summary: PolicyLearningSummaryData
}

export function PolicyLearningSummary({ summary }: PolicyLearningSummaryProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Executive Research Synthesis: Adaptive Policy Learning
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            High-level analytical findings, closed-loop telemetry gains, and strategic policy roadmap.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          {summary.overallFirewallStance}
        </span>
      </div>

      {/* Top Level Summary Cards */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Most Improved Policy
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900 truncate" title={summary.mostImprovedPolicy}>
            {summary.mostImprovedPolicy.split(':')[0]}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-emerald-700">
            -88.6% False Positives
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Top FP Reduction
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900 truncate">
            {summary.topFpReductionDept}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Developer Workflow</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Most Tuned Sector
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900 truncate">
            {summary.mostTunedDept}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-rose-700">Hardened Thresholds</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Feedback Impact
          </p>
          <p className="mt-1 text-sm font-bold text-indigo-700">
            1,240 FPs Saved/Mo
          </p>
          <p className="mt-0.5 text-xs text-slate-500">84 SOC Hours Freed</p>
        </div>
      </div>

      {/* Narrative Synthesis */}
      <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Executive Behavioral Narrative
        </h4>
        <p className="mt-2 text-xs leading-relaxed text-slate-700">
          {summary.executiveNarrative}
        </p>
      </div>

      {/* Key Achievements & Next Actions */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Achievements */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quantified Learning Achievements
            </h4>
          </div>
          <ul className="mt-2.5 space-y-2">
            {summary.keyAchievements.map((ach) => (
              <li key={ach} className="flex items-start gap-2 text-xs text-slate-600">
                <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                <span>{ach}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Actions */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
          <div className="flex items-center gap-2">
            <LightBulbIcon className="h-4 w-4 text-amber-600" />
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Recommended Next Governance Actions
            </h4>
          </div>
          <ul className="mt-2.5 space-y-2">
            {summary.recommendedNextActions.map((act) => (
              <li key={act} className="flex items-start gap-2 text-xs text-amber-900/90">
                <ArrowPathRoundedSquareIcon className="h-3.5 w-3.5 shrink-0 text-amber-700 mt-0.5" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
