import {
  ArrowDownIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import type { AdaptivePolicy } from '../../types/policy'
import { Card } from '../Card'
import { FirewallActionBadge } from '../FirewallActionBadge'

interface RuleFlowDiagramProps {
  policies: AdaptivePolicy[]
  onSelectPolicy?: (policy: AdaptivePolicy) => void
}

export function RuleFlowDiagram({ policies, onSelectPolicy }: RuleFlowDiagramProps) {
  const sortedPolicies = [...policies]
    .filter((p) => p.enabled)
    .sort((a, b) => a.priority - b.priority)

  return (
    <Card className="p-6 shadow-xs overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Visual Policy Evaluation Precedence Flow
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time execution pipeline: policies evaluate sequentially by priority until the first rule condition chain matches.
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
          {sortedPolicies.length} Active Rules in Chain
        </span>
      </div>

      <div className="min-w-[680px] flex flex-col items-center py-4">
        {/* Entry: Ingress Access Request */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-center shadow-2xs font-mono text-xs font-bold text-indigo-900">
          📥 Incoming Access Request & Behavioral Vector
        </div>

        <ArrowDownIcon className="h-5 w-5 text-slate-400 my-2" />

        {/* Chain of Policies */}
        <div className="w-full max-w-2xl space-y-3">
          {sortedPolicies.map((pol, idx) => (
            <div key={pol.id} className="flex flex-col items-center">
              <div
                onClick={() => onSelectPolicy?.(pol)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-indigo-400 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 font-mono text-xs font-bold text-indigo-700">
                      #{pol.priority}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{pol.name}</h4>
                  </div>
                  <FirewallActionBadge action={pol.action} />
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Conditions (AND): </span>
                  <span className="font-mono">
                    {pol.conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(' AND ')}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    <span>Match? Enforce {pol.action} ({pol.enforcementMode})</span>
                  </div>
                  <span className="text-slate-400">
                    No Match? Proceed to Priority #{sortedPolicies[idx + 1]?.priority ?? 'Default'} →
                  </span>
                </div>
              </div>

              {idx < sortedPolicies.length - 1 && (
                <ArrowDownIcon className="h-4 w-4 text-slate-300 my-1.5" />
              )}
            </div>
          ))}
        </div>

        <ArrowDownIcon className="h-5 w-5 text-slate-400 my-2" />

        {/* Default Security Fallback */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-center shadow-2xs text-xs text-slate-600 font-medium">
          🔒 Zero-Trust Default Fallback: If no explicit rule matches, system denies or quarantine-evaluates.
        </div>
      </div>
    </Card>
  )
}
