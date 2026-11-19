import {
  ArrowRightIcon,
  CircleStackIcon,
  ComputerDesktopIcon,
  DocumentDuplicateIcon,
  FingerPrintIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { AttackGraphNode } from '../../types/incident'

interface AttackGraphProps {
  nodes: AttackGraphNode[]
}

const DEFAULT_FLOW: AttackGraphNode[] = [
  { id: '1', label: 'User', sublabel: 'Entity Subject', type: 'user', status: 'compromised', details: 'User Credentials' },
  { id: '2', label: 'Endpoint', sublabel: 'Workstation / BYOD', type: 'endpoint', status: 'compromised', details: 'Physical device' },
  { id: '3', label: 'Application', sublabel: 'Corporate Portal', type: 'application', status: 'suspicious', details: 'Web API request' },
  { id: '4', label: 'Firewall', sublabel: 'AI Privacy Engine', type: 'firewall', status: 'blocked', details: 'HARD BLOCK ENFORCED' },
  { id: '5', label: 'Identity', sublabel: 'Okta Directory', type: 'identity', status: 'protected', details: 'Token revoked' },
  { id: '6', label: 'Database', sublabel: 'Cluster Storage', type: 'database', status: 'protected', details: 'Zero extraction' },
  { id: '7', label: 'Sensitive Files', sublabel: 'PII / Trade Secrets', type: 'sensitive_files', status: 'protected', details: 'Fully intact' },
]

function getNodeIcon(type: AttackGraphNode['type']) {
  switch (type) {
    case 'user':
      return <UserIcon className="h-4 w-4" />
    case 'endpoint':
      return <ComputerDesktopIcon className="h-4 w-4" />
    case 'application':
      return <GlobeAltIcon className="h-4 w-4" />
    case 'firewall':
      return <ShieldCheckIcon className="h-5 w-5" />
    case 'identity':
      return <FingerPrintIcon className="h-4 w-4" />
    case 'database':
      return <CircleStackIcon className="h-4 w-4" />
    case 'sensitive_files':
      return <DocumentDuplicateIcon className="h-4 w-4" />
  }
}

export function AttackGraph({ nodes }: AttackGraphProps) {
  const displayNodes = nodes && nodes.length === 7 ? nodes : DEFAULT_FLOW

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Kill Chain & Attack Graph Visualization
          </h3>
          <p className="text-xs text-slate-500">
            End-to-end traversal sequence demonstrating where the AI Privacy Firewall contained the intrusion.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Compromised
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            Enforcement Boundary
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Protected Downstream
          </span>
        </div>
      </div>

      {/* Horizontal Flow Pipeline */}
      <div className="mt-6 overflow-x-auto pb-2">
        <div className="flex min-w-[760px] items-center justify-between gap-2">
          {displayNodes.map((node, index) => {
            const isFirewall = node.type === 'firewall'
            const isProtected = node.status === 'protected'
            const isCompromised = node.status === 'compromised'

            return (
              <div key={node.id} className="flex items-center gap-2 flex-1">
                {/* Node Box */}
                <div
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition flex-1 ${
                    isFirewall
                      ? 'border-red-400 bg-red-50/90 shadow-md ring-2 ring-red-400 scale-105'
                      : isCompromised
                      ? 'border-rose-200 bg-rose-50/70'
                      : isProtected
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-amber-200 bg-amber-50/60'
                  }`}
                >
                  <div
                    className={`rounded-xl p-2 ${
                      isFirewall
                        ? 'bg-red-600 text-white animate-pulse'
                        : isCompromised
                        ? 'bg-rose-100 text-rose-700'
                        : isProtected
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {getNodeIcon(node.type)}
                  </div>

                  <span className="mt-2 text-xs font-bold text-slate-900">
                    {node.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {node.sublabel}
                  </span>

                  <span
                    className={`mt-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      isFirewall
                        ? 'bg-red-700 text-white'
                        : isCompromised
                        ? 'bg-rose-200 text-rose-900'
                        : isProtected
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {isFirewall ? 'CONTAINED' : node.status}
                  </span>

                  <p className="mt-1 text-[10px] text-slate-500 line-clamp-1">
                    {node.details}
                  </p>
                </div>

                {/* Connector Arrow */}
                {index < displayNodes.length - 1 && (
                  <div className="shrink-0 text-slate-300">
                    <ArrowRightIcon
                      className={`h-4 w-4 ${
                        index === 3 ? 'text-red-500' : 'text-slate-300'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
