import {
  CircleStackIcon,
  LinkIcon,
  NoSymbolIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import type { ResourceProfile } from '../../types/organization'
import { FirewallActionBadge } from '../FirewallActionBadge'

interface ResourceDetailModalProps {
  resource: ResourceProfile | null
  onClose: () => void
}

const confidentialityBadges: Record<string, string> = {
  Strict: 'bg-rose-100 text-rose-800 border-rose-300',
  High: 'bg-amber-100 text-amber-800 border-amber-300',
  Moderate: 'bg-blue-100 text-blue-800 border-blue-300',
  Low: 'bg-slate-100 text-slate-700 border-slate-300',
}

const classificationBadges: Record<string, string> = {
  'Restricted / PII': 'bg-rose-50 text-rose-700 border-rose-200',
  'Top Secret / Trade Secret': 'bg-purple-50 text-purple-700 border-purple-200',
  Confidential: 'bg-amber-50 text-amber-700 border-amber-200',
  Internal: 'bg-slate-100 text-slate-700 border-slate-200',
  Public: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export function ResourceDetailModal({ resource, onClose }: ResourceDetailModalProps) {
  if (!resource) return null

  const isDatabase = resource.type === 'database'
  const isApp = resource.type === 'application'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 via-white to-indigo-50/40 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              {isDatabase ? (
                <CircleStackIcon className="h-6 w-6" />
              ) : isApp ? (
                <ServerStackIcon className="h-6 w-6" />
              ) : (
                <ShieldCheckIcon className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{resource.name}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 uppercase font-mono">
                  {resource.type}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-mono text-slate-500 break-all">
                {resource.endpoint}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[72vh] overflow-y-auto p-5 space-y-5">
          {/* Top Attributes Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Classification
              </span>
              <div className="mt-1">
                <span
                  className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold ${
                    classificationBadges[resource.classification] ?? 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {resource.classification}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Confidentiality
              </span>
              <div className="mt-1">
                <span
                  className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold ${
                    confidentialityBadges[resource.confidentiality] ?? 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {resource.confidentiality}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Active Sessions
              </span>
              <div className="mt-1 flex items-baseline gap-1 text-base font-mono font-bold text-slate-900">
                <UsersIcon className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>{resource.currentSessions}</span>
              </div>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-3">
              <span className="block text-[11px] font-semibold text-rose-800 uppercase">
                Blocked Attempts
              </span>
              <div className="mt-1 flex items-baseline gap-1 text-base font-mono font-bold text-rose-700">
                <NoSymbolIcon className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{resource.blockedRequestsCount}</span>
              </div>
            </div>
          </div>

          {/* Owner & Department */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-indigo-600" />
              <span className="text-slate-500 font-semibold uppercase">Assigned Asset Owner:</span>
              <span className="font-bold text-slate-900">{resource.owner}</span>
            </div>
            <span className="rounded-md bg-white border border-slate-200 px-2 py-1 font-semibold text-slate-700">
              {resource.department}
            </span>
          </div>

          {/* Access Policies */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <ShieldCheckIcon className="h-4 w-4 text-indigo-600" />
              <span>Enforced Access Policies ({resource.accessPolicies.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {resource.accessPolicies.map((pol, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold text-indigo-800"
                >
                  {pol}
                </span>
              ))}
            </div>
          </div>

          {/* Connected Systems */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <LinkIcon className="h-4 w-4 text-slate-500" />
              <span>Connected Components in Topology</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {resource.connectedSystems.map((sys, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-mono font-medium text-slate-700 shadow-2xs"
                >
                  {sys}
                </span>
              ))}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Recent Access Audit Logs
            </span>
            {resource.auditLogs.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Timestamp</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Action</th>
                      <th className="px-3 py-2">Decision</th>
                      <th className="px-3 py-2">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {resource.auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-slate-500">{log.timestamp}</td>
                        <td className="px-3 py-2 font-bold text-slate-900">{log.subject}</td>
                        <td className="px-3 py-2 font-mono uppercase text-[11px] text-slate-600">
                          {log.action}
                        </td>
                        <td className="px-3 py-2">
                          <FirewallActionBadge action={log.decision} />
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-700">
                          {log.riskScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                No active audit anomalies recorded for this asset within current monitoring window.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex justify-between items-center text-xs text-slate-400">
          <span>Asset Identifier: {resource.id}</span>
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
