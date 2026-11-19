import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type {
  AIResearchInfo,
  ModelDriftData,
} from '../../types/analytics'

interface ExecutiveSummaryCardProps {
  summary: string
  modelDrift: ModelDriftData
  researchInfo: AIResearchInfo
}

export function ExecutiveSummaryCard({
  summary,
  modelDrift,
  researchInfo,
}: ExecutiveSummaryCardProps) {
  const isStable = modelDrift.status === 'Stable'
  const isSlight = modelDrift.status === 'Slight Drift'

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* 1. Executive Intelligence Narrative (2 Columns) */}
      <Card className="p-6 lg:col-span-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Executive AI Threat Narrative
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Synthesis
          </span>
        </div>

        <div className="mt-4 rounded-xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/50 p-4">
          <p className="text-sm leading-relaxed text-slate-800 font-medium">
            {summary}
          </p>
        </div>

        {/* AI Research / Model Metadata Strip */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <CpuChipIcon className="h-4 w-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              AI Research & Model Lineage
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <span className="text-[10px] text-slate-500 block">Current Architecture</span>
              <span className="font-semibold text-slate-900">{researchInfo.currentModel}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <span className="text-[10px] text-slate-500 block">Benchmark Dataset</span>
              <span className="font-semibold text-slate-900">{researchInfo.trainingDataset}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <span className="text-[10px] text-slate-500 block">Training / Validation Samples</span>
              <span className="font-semibold text-slate-900">
                {researchInfo.trainingSamples.toLocaleString()} / {researchInfo.validationSamples.toLocaleString()}
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <span className="text-[10px] text-slate-500 block">Inference Latency</span>
              <span className="font-semibold text-emerald-600">{researchInfo.inferenceTime}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 sm:col-span-2">
              <span className="text-[10px] text-slate-500 block">Model Retraining Checkpoint</span>
              <span className="font-semibold text-slate-900">{researchInfo.lastRetrained}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Model Drift Monitoring Card (1 Column) */}
      <Card className="p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Model Drift & Stability
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                isStable
                  ? 'bg-emerald-100 text-emerald-800'
                  : isSlight
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {modelDrift.status}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-xs text-slate-600">Yesterday Accuracy</span>
              <span className="font-mono text-sm font-bold text-slate-900">
                {modelDrift.yesterdayAccuracy}%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-xs text-slate-600">Today Accuracy</span>
              <span className="font-mono text-sm font-bold text-slate-900">
                {modelDrift.todayAccuracy}%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <span className="text-xs text-slate-600">Variance (Delta)</span>
              <span
                className={`flex items-center gap-1 font-mono text-sm font-bold ${
                  modelDrift.difference >= 0
                    ? 'text-emerald-600'
                    : Math.abs(modelDrift.difference) < 0.1
                    ? 'text-slate-700'
                    : 'text-rose-600'
                }`}
              >
                {modelDrift.difference >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4" />
                )}
                {modelDrift.difference > 0 ? `+${modelDrift.difference}` : modelDrift.difference}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200/60 bg-slate-50/70 p-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            {isStable ? (
              <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />
            )}
            <span>{modelDrift.driftMetric}</span>
          </div>
          <p className="mt-1 text-slate-500">
            {isStable
              ? 'Feature distributions and prediction calibration remain well within safe tolerance.'
              : 'Mild feature divergence detected. Retraining trigger threshold: PSI > 0.10.'}
          </p>
        </div>
      </Card>
    </div>
  )
}
