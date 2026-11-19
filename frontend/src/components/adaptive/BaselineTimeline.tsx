import {
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { BaselineTimelineStage, UserBaselineProfile } from '../../types/adaptiveLearning'

interface BaselineTimelineProps {
  stages: BaselineTimelineStage[]
  user: UserBaselineProfile
}

export function BaselineTimeline({ stages, user }: BaselineTimelineProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Longitudinal Baseline Evolution Chronology
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Historical adaptation progression from initial zero-prior cold start to steady-state Gaussian convergence for{' '}
            <strong className="text-slate-800">{user.userName}</strong>.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          4 Evolutionary Stages
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {stages.map((stage, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-4 rounded-xl border p-4 transition ${
              stage.status === 'Active Adaptation'
                ? 'border-indigo-400 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-300'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            {/* Left Phase Badge */}
            <div className="w-40 shrink-0">
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  stage.status === 'Active Adaptation'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {stage.phase}
              </span>
              <span className="mt-1 block font-mono text-[10px] text-slate-400">
                {stage.timeframe}
              </span>
            </div>

            {/* Middle Details */}
            <div className="flex-1 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  Observed Telemetry Pattern:
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    stage.status === 'Active Adaptation'
                      ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {stage.status}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {stage.observedPattern}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] text-slate-500">
                <span>
                  <strong>Impact:</strong> {stage.baselineImpact}
                </span>
                <span className="font-mono font-bold text-indigo-700">
                  {stage.thresholdDelta}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
