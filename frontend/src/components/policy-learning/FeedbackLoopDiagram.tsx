import {
  ArrowPathIcon,
  BellAlertIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { FeedbackLoopStage } from '../../types/policyLearning'

interface FeedbackLoopDiagramProps {
  stages: FeedbackLoopStage[]
}

const STAGE_ICONS = [
  BellAlertIcon,
  UserGroupIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ScaleIcon,
  ShieldCheckIcon,
]

export function FeedbackLoopDiagram({ stages }: FeedbackLoopDiagramProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowPathIcon className="h-5 w-5 text-indigo-600 animate-spin-slow" />
            <h3 className="text-base font-bold text-slate-900">
              Autonomous Closed-Loop Feedback Pipeline
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            End-to-end telemetry flow from edge alert ingestion through human triage to automated policy enforcement.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Pipeline Continuous Active
        </span>
      </div>

      {/* Sequential Pipeline Stages Flow */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {stages.map((stage, idx) => {
          const Icon = STAGE_ICONS[idx % STAGE_ICONS.length]!

          return (
            <div
              key={stage.id}
              className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition hover:border-indigo-400 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    0{idx + 1}
                  </span>
                </div>

                <h4 className="mt-2.5 text-xs font-bold text-slate-900">{stage.name}</h4>
                <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                  {stage.description}
                </p>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2 text-[10px] space-y-0.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Throughput:</span>
                  <span className="font-semibold text-slate-700">{stage.throughput}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Latency:</span>
                  <span className="font-mono text-indigo-700">{stage.latency}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
