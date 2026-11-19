import {
  CpuChipIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { AdaptiveSummary } from '../../types/adaptiveLearning'

interface AdaptiveLearningSummaryProps {
  summary: AdaptiveSummary
}

export function AdaptiveLearningSummary({
  summary,
}: AdaptiveLearningSummaryProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Autonomous Adaptive Learning & Concept Drift Intelligence
            </h3>
            <p className="text-xs text-slate-500">
              Synthesized by the Bayesian Behavioral Adaptation Engine • Updated at {summary.generatedAt}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
          96.4% Ensemble Cross-Validation
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
        {/* User Risk Trajectory */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
            Subject Behavioral Risk Trajectory
          </span>
          <p className="leading-relaxed text-indigo-950 font-medium">
            {summary.userRiskTrends}
          </p>
        </div>

        {/* Department Baseline Dynamics */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
            Departmental Baseline Shift & Convergence
          </span>
          <p className="leading-relaxed text-blue-950 font-medium">
            {summary.deptBaselineShift}
          </p>
        </div>

        {/* Physical Storage & USB Media Insight */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Hardware Storage & Physical Media Posture
          </span>
          <p className="leading-relaxed text-slate-700">
            {summary.usbNormalizationInsight}
          </p>
        </div>

        {/* Closed-Loop Policy Feedback */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Closed-Loop Analyst Reinforcement Tuning
          </span>
          <p className="leading-relaxed text-slate-700">
            {summary.policyFeedbackTuning}
          </p>
        </div>
      </div>

      {/* Concept Drift Banner */}
      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CpuChipIcon className="h-4 w-4 text-emerald-700 shrink-0" />
          <span className="font-semibold">{summary.conceptDriftMetric}</span>
        </div>
        <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-[10px] text-emerald-800">
          CONTINUOUS ONLINE LEARNING
        </span>
      </div>
    </Card>
  )
}
