import { useState } from 'react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Card } from '../Card'
import type { RecommendedAction } from '../../types/incident'

interface ResponseRecommendationsProps {
  recommendations: RecommendedAction[]
  onExecuteRecommendation?: (action: RecommendedAction) => void
}

const DEFAULT_RECOMMENDATIONS: RecommendedAction[] = [
  {
    id: 'def-1',
    action: 'Quarantine Device & Revoke Removable USB Permissions',
    priority: 'Critical',
    reason: 'Hardware storage attachments violate corporate zero-trust baseline.',
    estimatedImpact: 'Isolates endpoint from internal network segments immediately.',
    executed: false,
  },
  {
    id: 'def-2',
    action: 'Revoke Active OAuth Tokens & Terminate SSO Session',
    priority: 'High',
    reason: 'Invalidate hijacked authentication cookies and tokens.',
    estimatedImpact: 'Forces immediate MFA challenge on all user sessions.',
    executed: false,
  },
  {
    id: 'def-3',
    action: 'Dispatch Incident Escalation to Department Lead & SOC Auditor',
    priority: 'Medium',
    reason: 'Mandatory compliance reporting under SOC 2 Section CC6.8.',
    estimatedImpact: 'Alerts department supervisor via encrypted Slack webhook.',
    executed: false,
  },
]

export function ResponseRecommendations({
  recommendations,
  onExecuteRecommendation,
}: ResponseRecommendationsProps) {
  const [items, setItems] = useState<RecommendedAction[]>(() =>
    recommendations && recommendations.length > 0
      ? recommendations
      : DEFAULT_RECOMMENDATIONS,
  )

  const handleExecute = (rec: RecommendedAction) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === rec.id ? { ...item, executed: true } : item,
      ),
    )
    toast.success(`Action applied: ${rec.action}`)
    if (onExecuteRecommendation) {
      onExecuteRecommendation(rec)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <WrenchScrewdriverIcon className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              AI Automated Containment Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              Prescriptive SOAR incident response playbooks prioritized by threat potential.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
          SOAR Playbooks Active
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((rec) => {
          const isCritical = rec.priority === 'Critical'
          const isHigh = rec.priority === 'High'

          return (
            <div
              key={rec.id}
              className={`rounded-xl border p-4 transition ${
                rec.executed
                  ? 'border-emerald-200 bg-emerald-50/40 opacity-80'
                  : isCritical
                  ? 'border-rose-200 bg-rose-50/40 hover:bg-rose-50/70'
                  : isHigh
                  ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/70'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 rounded-lg p-2 ${
                      rec.executed
                        ? 'bg-emerald-100 text-emerald-700'
                        : isCritical
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {rec.executed ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <ExclamationTriangleIcon className="h-4 w-4" />
                    )}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          rec.executed
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.priority}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        {rec.action}
                      </h4>
                    </div>

                    <p className="mt-1 text-xs text-slate-600">
                      {rec.reason}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Estimated Impact:</span>
                      <span>{rec.estimatedImpact}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={rec.executed}
                  onClick={() => handleExecute(rec)}
                  className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-xs ${
                    rec.executed
                      ? 'bg-emerald-600 text-white cursor-default'
                      : isCritical
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {rec.executed ? 'Executed ✓' : 'Execute Action'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
