import {
  GlobeAltIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { FirewallActionBadge } from '../FirewallActionBadge'
import type { Incident } from '../../types/incident'

interface IncidentDetailsModalProps {
  incident: Incident | null
  isOpen: boolean
  onClose: () => void
}

export function IncidentDetailsModal({
  incident,
  isOpen,
  onClose,
}: IncidentDetailsModalProps) {
  if (!isOpen || !incident) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 rounded-lg p-2 ${
                incident.severity === 'Critical'
                  ? 'bg-rose-100 text-rose-700'
                  : incident.severity === 'High'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              <ShieldExclamationIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-700">
                  {incident.id}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  {incident.priority}
                </span>
                <FirewallActionBadge action={incident.firewallDecision} />
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {incident.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 p-6">
          {/* Summary Box */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Executive Incident Summary
            </h4>
            <p className="mt-1.5 text-sm text-slate-800 leading-relaxed font-medium">
              {incident.summary}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500">Threat Score</span>
              <p className="mt-1 text-xl font-black text-rose-600">
                {incident.threatScore}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500">Risk Index</span>
              <p className="mt-1 text-xl font-black text-amber-600">
                {incident.riskScore} / 100
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500">AI Confidence</span>
              <p className="mt-1 text-xl font-black text-emerald-600">
                {incident.aiConfidence}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500">Evidence Certainty</span>
              <p className="mt-1 text-xl font-black text-indigo-600">
                {incident.evidenceScore}%
              </p>
            </div>
          </div>

          {/* Forensic Metadata Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Subject & Entity Details */}
            <div className="rounded-xl border border-slate-200/80 p-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <UserCircleIcon className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Subject & Asset Information
                </h4>
              </div>
              <dl className="mt-3 divide-y divide-slate-100 text-xs">
                <div className="flex justify-between py-2">
                  <dt className="text-slate-500">Affected User:</dt>
                  <dd className="font-semibold text-slate-900">{incident.affectedUser}</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-slate-500">Role / Department:</dt>
                  <dd className="font-semibold text-slate-900">
                    {incident.role} ({incident.department})
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-slate-500">Target Asset:</dt>
                  <dd className="font-mono font-semibold text-slate-900 truncate max-w-[200px]">
                    {incident.targetResource}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-slate-500">Operation:</dt>
                  <dd className="font-semibold text-slate-900">{incident.operation}</dd>
                </div>
              </dl>
            </div>

            {/* Environmental & Network Telemetry */}
            <div className="rounded-xl border border-slate-200/80 p-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <GlobeAltIcon className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Network & Posture Telemetry
                </h4>
              </div>
              <dl className="mt-3 divide-y divide-slate-100 text-xs">
                <div className="flex justify-between py-2">
                  <dt className="text-slate-500">Endpoint Device:</dt>
                  <dd className="font-semibold text-slate-900">{incident.device}</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-slate-500">Source IP / Country:</dt>
                  <dd className="font-mono font-semibold text-slate-900">
                    {incident.sourceIp} ({incident.country})
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-slate-500">Classification Model:</dt>
                  <dd className="font-semibold text-slate-900">{incident.modelUsed}</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-slate-500">Assigned SOC Lead:</dt>
                  <dd className="font-semibold text-indigo-700">{incident.assignedAnalyst}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Policy & Rules Guardrails */}
          <div className="rounded-xl border border-slate-200/80 p-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Firewall Rule & Policy Mapping
              </h4>
            </div>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <span className="text-[10px] text-slate-500 block">Detection Rule</span>
                <span className="font-mono font-semibold text-slate-900">{incident.detectionRule}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <span className="text-[10px] text-slate-500 block">Triggered Adaptive Policy</span>
                <span className="font-semibold text-indigo-700">{incident.triggeredPolicy}</span>
              </div>
            </div>
          </div>

          {/* Behavior Indicators Tags */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Active Behavioral Indicators
            </h4>
            <div className="flex flex-wrap gap-2">
              {incident.behaviorIndicators.map((ind, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800"
                >
                  ⚠ {ind}
                </span>
              ))}
            </div>
          </div>

          {/* Analyst Notes Log */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Investigation Notes Log
            </h4>
            <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700">
              {incident.investigationNotes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md">
          <span className="text-xs text-slate-500">
            Created: {incident.createdTime} {incident.closedTime ? `• Closed: ${incident.closedTime}` : ''}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
          >
            Close Investigation View
          </button>
        </div>
      </div>
    </div>
  )
}
