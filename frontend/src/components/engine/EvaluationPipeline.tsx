import {
  ArrowRightIcon,
  BoltIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  FingerPrintIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import type { FirewallAction } from '../../types/api'

interface EvaluationPipelineProps {
  decision: FirewallAction
  activeStage?: number
}

const stages = [
  { id: 'request', label: '1. Request', desc: 'Ingress & Subject', icon: ArrowRightIcon },
  { id: 'behavior', label: '2. Behavior', desc: 'UBA Indicators', icon: FingerPrintIcon },
  { id: 'models', label: '3. AI Models', desc: '4-Model Ensemble', icon: CpuChipIcon },
  { id: 'explainability', label: '4. Explainability', desc: 'SHAP Attribution', icon: SparklesIcon },
  { id: 'policy', label: '5. Policy Engine', desc: 'Rule Governance', icon: ShieldCheckIcon },
  { id: 'decision', label: '6. Decision', desc: 'Action Enforcement', icon: BoltIcon },
  { id: 'audit', label: '7. Audit Log', desc: 'Trail Recorded', icon: DocumentCheckIcon },
]

export function EvaluationPipeline({ decision }: EvaluationPipelineProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
          </span>
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Real-Time Firewall Evaluation Pipeline
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
          <InformationCircleIcon className="h-4 w-4 text-indigo-500" />
          <span>Continuous Zero-Trust Verification Cycle</span>
        </div>
      </div>

      {/* Horizontal Step Pipeline Flow */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {stages.map((stage, idx) => {
          const Icon = stage.icon
          const isDecisionStage = stage.id === 'decision'

          return (
            <div
              key={stage.id}
              className={`relative flex flex-col justify-between rounded-xl border p-2.5 transition-all duration-300 ${
                isDecisionStage
                  ? decision === 'BLOCK'
                    ? 'border-rose-400 bg-rose-50/70 text-rose-900 ring-1 ring-rose-300'
                    : decision === 'RESTRICT'
                      ? 'border-amber-400 bg-amber-50/70 text-amber-900 ring-1 ring-amber-300'
                      : decision === 'WARN'
                        ? 'border-yellow-400 bg-yellow-50/70 text-yellow-900 ring-1 ring-yellow-300'
                        : 'border-emerald-400 bg-emerald-50/70 text-emerald-900 ring-1 ring-emerald-300'
                  : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                    isDecisionStage
                      ? 'bg-white shadow-2xs'
                      : 'bg-indigo-100/80 text-indigo-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {idx < stages.length - 1 && (
                  <span className="text-slate-300 hidden lg:inline font-bold">→</span>
                )}
              </div>

              <div className="mt-2">
                <div className="font-bold text-xs leading-tight truncate">{stage.label}</div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{stage.desc}</p>
              </div>

              {isDecisionStage && (
                <div className="mt-2">
                  <span
                    className={`inline-block font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      decision === 'BLOCK'
                        ? 'bg-rose-200 text-rose-800'
                        : decision === 'RESTRICT'
                          ? 'bg-amber-200 text-amber-800'
                          : decision === 'WARN'
                            ? 'bg-yellow-200 text-yellow-900'
                            : 'bg-emerald-200 text-emerald-800'
                    }`}
                  >
                    {decision}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
