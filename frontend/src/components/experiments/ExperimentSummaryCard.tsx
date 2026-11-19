import {
  CheckBadgeIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ExperimentSummaryNarrative } from '../../types/experiments'

interface ExperimentSummaryCardProps {
  summary: ExperimentSummaryNarrative
}

export function ExperimentSummaryCard({ summary }: ExperimentSummaryCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Autonomous Machine Learning Research & Model Validation Synthesis
            </h3>
            <p className="text-xs text-slate-500">
              Reproducible benchmark conclusions synthesized by the AI Privacy Firewall Evaluation Engine • Updated at {summary.generatedAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            Winner: {summary.bestModelName} (F1: {summary.bestModelF1}%)
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-4 text-xs">
        {/* Top 2 Cards: Major Findings & Strongest Features */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
            <div className="flex items-center gap-2 font-bold text-indigo-900 mb-1.5">
              <TrophyIcon className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-wider">
                Major Empirical Findings
              </span>
            </div>
            <p className="leading-relaxed text-indigo-950 font-medium">
              {summary.majorFindings}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1.5">
              <CheckBadgeIcon className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-wider">
                Top Empirical Predictors (SHAP)
              </span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-emerald-950 font-medium">
              {summary.strongestFeatures.map((feat, idx) => (
                <li key={idx} className="leading-snug">
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom 2 Cards: Limitation & Production Recommendation */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
            <div className="flex items-center gap-2 font-bold text-amber-900 mb-1.5">
              <ExclamationCircleIcon className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-wider">
                Model Limitation & Latency Trade-Off
              </span>
            </div>
            <p className="leading-relaxed text-amber-950 font-medium">
              {summary.weaknessLimitation}
            </p>
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
            <div className="flex items-center gap-2 font-bold text-purple-900 mb-1.5">
              <LightBulbIcon className="h-4 w-4 text-purple-700" />
              <span className="text-[11px] uppercase tracking-wider">
                Production Deployment Recommendation
              </span>
            </div>
            <p className="leading-relaxed text-purple-950 font-medium">
              {summary.productionRecommendation}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
