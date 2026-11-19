import {
  LinkIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import type { TopologyNode } from '../../types/organization'
import { RiskBadge } from '../RiskBadge'

interface TopologyNodeModalProps {
  node: TopologyNode | null
  onClose: () => void
}

export function TopologyNodeModal({ node, onClose }: TopologyNodeModalProps) {
  if (!node) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/70 p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Tier {node.tier} • {node.category.toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {node.status}
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{node.label}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{node.description}</p>
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
        <div className="max-h-[75vh] overflow-y-auto p-5 space-y-5">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Designated Owner
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <UserIcon className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="truncate">{node.owner}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Perimeter Risk Tier
              </span>
              <div className="mt-1">
                <RiskBadge risk={node.riskLevel} />
              </div>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-3">
              <span className="block text-[11px] font-semibold text-rose-800 uppercase">
                Blocked Attempts
              </span>
              <div className="mt-1 flex items-baseline gap-1.5 text-lg font-mono font-bold text-rose-700">
                <NoSymbolIcon className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{node.blockedAttempts}</span>
                <span className="text-[10px] text-rose-500 font-sans font-normal">violations</span>
              </div>
            </div>
          </div>

          {/* Firewall Policies */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <ShieldCheckIcon className="h-4 w-4 text-indigo-600" />
              <span>Active Firewall Policies Enforced ({node.firewallPolicies.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {node.firewallPolicies.map((policy, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold text-indigo-800"
                >
                  {policy}
                </span>
              ))}
            </div>
          </div>

          {/* Connected Systems */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <LinkIcon className="h-4 w-4 text-slate-600" />
              <span>Directly Connected Enterprise Systems</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {node.connectedSystems.map((sys, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs font-mono"
                >
                  {sys}
                </span>
              ))}
            </div>
          </div>

          {/* Allowed Users */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <UserGroupIcon className="h-4 w-4 text-emerald-600" />
              <span>Authorized Personas & Roles</span>
            </div>
            <ul className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 text-xs">
              {node.allowedUsers.map((user, idx) => (
                <li key={idx} className="flex items-center gap-2 text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{user}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex justify-between items-center text-xs text-slate-400">
          <span>Node ID: {node.id}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  )
}
