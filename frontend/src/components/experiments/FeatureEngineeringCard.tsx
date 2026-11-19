import {
  CpuChipIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { FeatureEngineeringPipelineStage } from '../../types/experiments'

interface FeatureEngineeringCardProps {
  stages: FeatureEngineeringPipelineStage[]
}

export function FeatureEngineeringCard({
  stages,
}: FeatureEngineeringCardProps) {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'raw':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'aggregated':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'temporal':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'behavioral':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'derived':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <CpuChipIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Behavioral Feature Engineering Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              Transformation trace converting asynchronous system logs into structured mathematical feature vectors.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          5 Sequential Stages
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {stages.map((stage) => (
          <div
            key={stage.stageId}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-700">
                  {stage.stageId}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${getCategoryBadge(
                    stage.category,
                  )}`}
                >
                  {stage.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900">
                  {stage.stageName}
                </h4>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                  RAW INPUT TELEMETRY
                </span>
                <p className="text-[11px] text-slate-700 leading-snug">
                  {stage.inputDescription}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                  ENGINEERED REPRESENTATION
                </span>
                <p className="text-[11px] text-slate-700 leading-snug">
                  {stage.outputDescription}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">
                  Transformation Rule / Kernel
                </span>
                <p className="font-mono text-[10px] text-indigo-950 font-semibold leading-tight">
                  {stage.formulaOrRule}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 text-[10px]">
              <span className="font-semibold text-slate-400">Sample Vectors:</span>
              {stage.exampleFeatures.map((feat) => (
                <span
                  key={feat}
                  className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
