import {
  BanknotesIcon,
  CircleStackIcon,
  CodeBracketIcon,
  FingerPrintIcon,
  GlobeAltIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'
import type { TopologyNode } from '../../types/organization'
import { RiskBadge } from '../RiskBadge'

interface TopologyDiagramProps {
  nodes: TopologyNode[]
  onSelectNode: (node: TopologyNode) => void
}

const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  GlobeAltIcon,
  ServerStackIcon,
  UserGroupIcon,
  BanknotesIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  FingerPrintIcon,
  CircleStackIcon,
}

export function TopologyDiagram({ nodes, onSelectNode }: TopologyDiagramProps) {
  const getNode = (id: string) => nodes.find((n) => n.id === id)

  const internetNode = getNode('node-internet')
  const gatewayNode = getNode('node-gateway')
  const hrPortalNode = getNode('node-hr-portal')
  const financeNode = getNode('node-finance')
  const gitlabNode = getNode('node-gitlab')
  const firewallNode = getNode('node-firewall')
  const identityNode = getNode('node-identity')
  const customerDbNode = getNode('node-customer-db')
  const financeDbNode = getNode('node-finance-db')
  const medicalDbNode = getNode('node-medical-db')

  const renderNodeCard = (
    node?: TopologyNode,
    customClass = '',
    isFirewall = false,
  ) => {
    if (!node) return null
    const Icon = iconMap[node.iconName] ?? ServerStackIcon

    return (
      <button
        type="button"
        onClick={() => onSelectNode(node)}
        className={`group relative text-left rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
          isFirewall
            ? 'border-indigo-400 bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-lg shadow-indigo-900/30 ring-2 ring-indigo-400/50'
            : 'border-slate-200/90 bg-white shadow-md hover:border-indigo-300'
        } ${customClass}`}
      >
        {/* Status Beacon */}
        <div className="flex items-center justify-between gap-2 border-b pb-2 mb-2 border-slate-100 group-hover:border-indigo-100">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isFirewall ? 'text-indigo-200' : 'text-slate-400'
              }`}
            >
              {node.category}
            </span>
          </div>
          <RiskBadge risk={node.riskLevel} />
        </div>

        {/* Node Name & Icon */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${
              isFirewall
                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 shadow-inner'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={`font-bold text-sm leading-tight truncate ${
                isFirewall ? 'text-white' : 'text-slate-900'
              }`}
            >
              {node.label}
            </div>
            <p
              className={`mt-0.5 text-[11px] truncate ${
                isFirewall ? 'text-indigo-200/80' : 'text-slate-500'
              }`}
            >
              Owner: {node.owner}
            </p>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div
          className={`mt-3 flex items-center justify-between text-[10px] pt-2 border-t ${
            isFirewall ? 'border-indigo-700/60 text-indigo-200' : 'border-slate-100 text-slate-400'
          }`}
        >
          <span>{node.connectedSystems.length} connected</span>
          <span className="font-mono text-rose-500 font-bold">
            {node.blockedAttempts} blocked
          </span>
        </div>
      </button>
    )
  }

  return (
    <div className="relative rounded-3xl border border-slate-200/80 bg-linear-to-b from-slate-50/80 via-white to-slate-50/80 p-6 sm:p-10 shadow-inner overflow-x-auto">
      {/* Top Banner Guide */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Interactive Enterprise Architecture Topology
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Click any component or boundary node to inspect ownership, firewall policies, connected systems, and blocked access attempts.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
            Applications
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Protected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-600" />
            Sensitive Assets
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Firewall Barrier
          </span>
        </div>
      </div>

      <div className="min-w-[760px] py-8 flex flex-col items-center">
        {/* Tier 1: Internet / Public Traffic */}
        <div className="w-72">{renderNodeCard(internetNode)}</div>

        {/* Vertical Line 1 */}
        <div className="flex flex-col items-center my-2">
          <div className="h-8 w-0.5 bg-slate-300" />
          <div className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
            TLS 1.3 Ingress
          </div>
          <div className="h-4 w-0.5 bg-slate-300" />
        </div>

        {/* Tier 2: Edge API Gateway */}
        <div className="w-80">{renderNodeCard(gatewayNode)}</div>

        {/* Fan-Out Connector to Applications */}
        <div className="w-full max-w-3xl flex flex-col items-center my-2">
          <div className="h-6 w-0.5 bg-slate-300" />
          {/* Horizontal crossbar spanning 3 apps */}
          <div className="w-4/5 h-0.5 bg-slate-300 relative">
            {/* Left drop */}
            <div className="absolute left-0 top-0 h-6 w-0.5 bg-slate-300" />
            {/* Center drop */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 h-6 w-0.5 bg-slate-300" />
            {/* Right drop */}
            <div className="absolute right-0 top-0 h-6 w-0.5 bg-slate-300" />
          </div>
          <div className="h-6" />
        </div>

        {/* Tier 3: Applications Tier */}
        <div className="w-full max-w-4xl grid grid-cols-3 gap-6">
          <div>{renderNodeCard(hrPortalNode)}</div>
          <div>{renderNodeCard(financeNode)}</div>
          <div>{renderNodeCard(gitlabNode)}</div>
        </div>

        {/* Convergence Connector down into AI Privacy Firewall */}
        <div className="w-full max-w-3xl flex flex-col items-center my-3">
          <div className="w-4/5 h-0.5 bg-slate-300 relative">
            <div className="absolute left-0 bottom-0 h-6 w-0.5 bg-slate-300" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-6 w-0.5 bg-slate-300" />
            <div className="absolute right-0 bottom-0 h-6 w-0.5 bg-slate-300" />
          </div>
          <div className="h-6 w-0.5 bg-slate-300" />
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full shadow-2xs">
            <span>▼ Zero-Trust Inspection Boundary ▼</span>
          </div>
          <div className="h-4 w-0.5 bg-rose-400" />
        </div>

        {/* Tier 4: The AI Privacy Firewall (The Core Protection Boundary) */}
        <div className="w-full max-w-3xl">
          {renderNodeCard(firewallNode, 'w-full', true)}
        </div>

        {/* Vertical Line down to Identity Core */}
        <div className="flex flex-col items-center my-3">
          <div className="h-4 w-0.5 bg-indigo-400" />
          <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Continuous Policy Evaluation Passed
          </div>
          <div className="h-6 w-0.5 bg-slate-300" />
        </div>

        {/* Tier 5: Zero-Trust Identity Core */}
        <div className="w-80">{renderNodeCard(identityNode)}</div>

        {/* Fan-Out Connector to Sensitive Assets */}
        <div className="w-full max-w-3xl flex flex-col items-center my-2">
          <div className="h-6 w-0.5 bg-slate-300" />
          {/* Horizontal crossbar spanning 3 databases */}
          <div className="w-4/5 h-0.5 bg-slate-300 relative">
            <div className="absolute left-0 top-0 h-6 w-0.5 bg-slate-300" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 h-6 w-0.5 bg-slate-300" />
            <div className="absolute right-0 top-0 h-6 w-0.5 bg-slate-300" />
          </div>
          <div className="h-6" />
        </div>

        {/* Tier 6: High-Security Sensitive Assets Tier */}
        <div className="w-full max-w-4xl grid grid-cols-3 gap-6">
          <div>{renderNodeCard(customerDbNode)}</div>
          <div>{renderNodeCard(financeDbNode)}</div>
          <div>{renderNodeCard(medicalDbNode)}</div>
        </div>
      </div>
    </div>
  )
}
