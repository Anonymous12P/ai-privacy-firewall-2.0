import { useState } from 'react'
import {
  BellAlertIcon,
  CheckCircleIcon,
  KeyIcon,
  NoSymbolIcon,
  ShieldExclamationIcon,
  StopCircleIcon,
  UserMinusIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Card } from '../Card'
import type { Incident, TimelineEntry } from '../../types/incident'

interface ContainmentSimulatorProps {
  incident: Incident
  onIncidentUpdated: (updated: Incident) => void
}

interface ActionBtn {
  id: string
  label: string
  icon: typeof StopCircleIcon
  colorClass: string
  description: string
}

const CONTAINMENT_ACTIONS: ActionBtn[] = [
  {
    id: 'isolate_device',
    label: 'Isolate Device',
    icon: StopCircleIcon,
    colorClass: 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100',
    description: 'Disconnect endpoint from local network segment and corporate VPN.',
  },
  {
    id: 'disable_user',
    label: 'Disable User',
    icon: UserMinusIcon,
    colorClass: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100',
    description: 'Suspend active account in Okta and active LDAP identity store.',
  },
  {
    id: 'revoke_token',
    label: 'Revoke Token',
    icon: KeyIcon,
    colorClass: 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100',
    description: 'Invalidate all OAuth2 refresh tokens and session cookies.',
  },
  {
    id: 'terminate_session',
    label: 'Terminate Session',
    icon: NoSymbolIcon,
    colorClass: 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100',
    description: 'Issue TCP reset packets and terminate active application connections.',
  },
  {
    id: 'force_mfa',
    label: 'Force MFA',
    icon: ShieldExclamationIcon,
    colorClass: 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    description: 'Require hardware security key verification on next request.',
  },
  {
    id: 'notify_admin',
    label: 'Notify Admin',
    icon: BellAlertIcon,
    colorClass: 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100',
    description: 'Dispatch high-priority alert to Security Operations On-Call pager.',
  },
]

export function ContainmentSimulator({
  incident,
  onIncidentUpdated,
}: ContainmentSimulatorProps) {
  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({})

  const handleExecuteAction = (action: ActionBtn) => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString()

    // Add timeline entry
    const newEntry: TimelineEntry = {
      id: `tl-cont-${Date.now()}`,
      timestamp: timeStr,
      title: `Containment Executed: ${action.label}`,
      description: action.description,
      type: 'containment',
      status: 'success',
      actor: 'SOC Analyst Console',
    }

    const updatedIncident: Incident = {
      ...incident,
      status: 'Contained',
      timeline: [newEntry, ...incident.timeline],
      investigationNotes: [
        `[${timeStr}] Containment action "${action.label}" executed by analyst.`,
        ...incident.investigationNotes,
      ],
    }

    setExecutedActions((prev) => ({ ...prev, [action.id]: true }))
    onIncidentUpdated(updatedIncident)
    toast.success(`Containment successful: ${action.label} applied to ${incident.affectedUser}`)
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Active Containment & SOAR Action Simulator
          </h3>
          <p className="text-xs text-slate-500">
            Immediate one-click threat containment controls executing across IAM, network, and endpoint vectors.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          Enforcement API Ready
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CONTAINMENT_ACTIONS.map((action) => {
          const isDone = executedActions[action.id] ?? false
          const Icon = action.icon

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleExecuteAction(action)}
              className={`group cursor-pointer flex flex-col items-center justify-center rounded-xl border p-4 text-center transition shadow-xs hover:shadow-md ${
                isDone
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : action.colorClass
              }`}
            >
              <div
                className={`rounded-xl p-2 transition ${
                  isDone
                    ? 'bg-emerald-200 text-emerald-800'
                    : 'bg-white/80 group-hover:scale-110'
                }`}
              >
                {isDone ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              <span className="mt-2 text-xs font-bold">
                {action.label}
              </span>

              <span className="mt-1 text-[9px] uppercase tracking-wider font-semibold opacity-70">
                {isDone ? 'APPLIED ✓' : 'READY'}
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
