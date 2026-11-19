import { useState } from 'react'
import {
  ArrowDownIcon,
  CircleStackIcon,
  ComputerDesktopIcon,
  FingerPrintIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { RelationshipGraphNode } from '../../types/threatIntel'

interface IocRelationshipGraphProps {
  nodes: RelationshipGraphNode[]
}

function getNodeIcon(type: RelationshipGraphNode['type']) {
  switch (type) {
    case 'actor':
      return <UserGroupIcon className="h-5 w-5" />
    case 'campaign':
      return <GlobeAltIcon className="h-5 w-5" />
    case 'malware':
      return <FingerPrintIcon className="h-5 w-5" />
    case 'domain':
      return <GlobeAltIcon className="h-5 w-5" />
    case 'ip':
      return <GlobeAltIcon className="h-5 w-5" />
    case 'endpoint':
      return <ComputerDesktopIcon className="h-5 w-5" />
    case 'firewall':
      return <ShieldCheckIcon className="h-5 w-5" />
    case 'database':
      return <CircleStackIcon className="h-5 w-5" />
  }
}

export function IocRelationshipGraph({ nodes }: IocRelationshipGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    nodes[0]?.id ?? 'node-actor',
  )

  const activeNode = nodes.find((n) => n.id === selectedNodeId) ?? nodes[0]!

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Adversary Threat Relationship & IOC Graph
          </h3>
          <p className="text-xs text-slate-500">
            Interactive multi-hop provenance graph tracing threat actor attribution down to intercepted database queries.
          </p>
        </div>
        <span className="text-xs text-slate-400">
          Click any node to inspect relationship details
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Graph Visual Pipeline (Vertical / Flow) */}
        <div className="space-y-3 lg:col-span-2">
          {nodes.map((node, index) => {
            const isSelected = node.id === selectedNodeId
            const isFirewall = node.type === 'firewall'
            const isProtected = node.status === 'protected'

            return (
              <div key={node.id} className="flex flex-col items-center">
                {/* Node Box */}
                <div
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full cursor-pointer flex items-center justify-between rounded-2xl border p-4 transition shadow-xs ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-400 scale-[1.01]'
                      : isFirewall
                      ? 'border-red-400 bg-red-50/70 hover:bg-red-50'
                      : isProtected
                      ? 'border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`rounded-xl p-2.5 ${
                        isFirewall
                          ? 'bg-red-600 text-white'
                          : isProtected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {getNodeIcon(node.type)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {node.type}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                            node.status === 'blocked'
                              ? 'bg-red-200 text-red-900'
                              : node.status === 'protected'
                              ? 'bg-emerald-200 text-emerald-900'
                              : node.status === 'hostile'
                              ? 'bg-rose-200 text-rose-900'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {node.status}
                        </span>
                      </div>
                      <h4 className="mt-0.5 text-sm font-bold text-slate-900">
                        {node.label}
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-indigo-600">
                    {isSelected ? 'Selected ●' : 'Inspect →'}
                  </span>
                </div>

                {/* Downward Connector Arrow */}
                {index < nodes.length - 1 && (
                  <div className="my-1 text-slate-300">
                    <ArrowDownIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Node Detail Inspector Box */}
        {activeNode && (
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/50 p-5 shadow-xs h-fit sticky top-6">
            <div className="flex items-center gap-2 border-b border-indigo-100 pb-3">
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-800 uppercase">
                {activeNode.type} NODE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeNode.id}
              </span>
            </div>

            <h4 className="mt-3 text-base font-bold text-slate-900">
              {activeNode.label}
            </h4>

            <div className="mt-3 text-xs text-slate-700 leading-relaxed font-medium">
              <p>{activeNode.details}</p>
            </div>

            <div className="mt-5 border-t border-indigo-100/70 pt-4 text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                OUTBOUND RELATIONSHIPS
              </span>
              {activeNode.connectedTo.length === 0 ? (
                <p className="text-slate-500 italic">Target Endpoint Asset (Leaf Node)</p>
              ) : (
                <div className="space-y-1">
                  {activeNode.connectedTo.map((target) => (
                    <div
                      key={target}
                      className="rounded-lg bg-white border border-indigo-100 p-2 font-mono text-[11px] text-indigo-900"
                    >
                      ↳ Connects to: <span className="font-bold">{target}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
