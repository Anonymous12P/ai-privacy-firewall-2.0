import {
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import type { AdaptivePolicy } from '../../types/policy'
import { FirewallActionBadge } from '../FirewallActionBadge'

interface PolicyVersionModalProps {
  policy: AdaptivePolicy | null
  onClose: () => void
}

export function PolicyVersionModal({ policy, onClose }: PolicyVersionModalProps) {
  if (!policy) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-100 bg-slate-50/70 p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Current: v{policy.version}
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {policy.id}</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{policy.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable audit history of policy version revisions and author modifications.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="max-h-[65vh] overflow-y-auto p-5 space-y-4">
          {policy.versionHistory.length > 0 ? (
            <div className="space-y-4">
              {policy.versionHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="relative flex items-start gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-200">
                    v{item.version}
                  </div>

                  <div className="flex-1 min-w-0 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.changeSummary}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 pt-0.5">
                      <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                      <span>Author: {item.author}</span>
                      <span>•</span>
                      <span>Snapshot Conditions: {item.snapshot.conditionsCount}</span>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <FirewallActionBadge action={item.snapshot.action} />
                      <span className="text-[10px] text-slate-400 font-mono">
                        Risk Tier: {item.snapshot.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No version history records found for this policy.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex justify-between items-center text-xs text-slate-400">
          <span>{policy.versionHistory.length} Recorded Versions</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
