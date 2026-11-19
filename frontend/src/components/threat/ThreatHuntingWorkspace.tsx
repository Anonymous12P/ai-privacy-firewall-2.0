import { useState } from 'react'
import {
  MagnifyingGlassCircleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Card } from '../Card'
import type { HuntingPrebuiltQuery } from '../../types/threatIntel'

interface ThreatHuntingWorkspaceProps {
  queries: HuntingPrebuiltQuery[]
}

export function ThreatHuntingWorkspace({
  queries,
}: ThreatHuntingWorkspaceProps) {
  const [selectedHuntId, setSelectedHuntId] = useState<string>(
    queries[0]?.id ?? '',
  )
  const [isExecuting, setIsExecuting] = useState(false)
  const [huntHistory, setHuntHistory] = useState<Record<string, string>>({})

  const activeHunt =
    queries.find((q) => q.id === selectedHuntId) ?? queries[0]!

  const handleExecuteHunt = () => {
    setIsExecuting(true)
    const timeStr = new Date().toLocaleTimeString()
    setTimeout(() => {
      setIsExecuting(false)
      setHuntHistory((prev) => ({ ...prev, [activeHunt.id]: timeStr }))
      toast.success(`Threat hunt "${activeHunt.name}" executed across telemetry lake`)
    }, 600)
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <MagnifyingGlassCircleIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Autonomous Threat Hunting Console & Hypothesis Lab
            </h3>
            <p className="text-xs text-slate-500">
              Proactive adversary discovery across enterprise behavioral vectors, query syntax correlation, and live telemetry execution.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExecuteHunt}
          disabled={isExecuting}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
        >
          <PlayIcon className="h-4 w-4" />
          <span>{isExecuting ? 'Querying Telemetry Lake...' : 'Run Active Hunt'}</span>
        </button>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-3">
        {/* Left Column: Prebuilt Hunt Playbooks */}
        <div className="space-y-2 lg:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Prebuilt Hunting Playbooks
          </span>

          <div className="space-y-2">
            {queries.map((q) => {
              const isSelected = q.id === activeHunt.id
              const isDetected = q.status === 'Detected'

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedHuntId(q.id)}
                  className={`cursor-pointer rounded-xl border p-3 transition ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-300'
                      : 'border-slate-200/80 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold text-slate-400">
                      {q.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        isDetected
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {q.matchingEvents} Hits
                    </span>
                  </div>

                  <h4 className="mt-1 font-bold text-xs text-slate-900">
                    {q.name}
                  </h4>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Risk: {q.riskScore}/100</span>
                    <span>Confidence: {q.confidence}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right 2 Columns: Active Hunt Details & Query Workspace */}
        {activeHunt && (
          <div className="space-y-5 lg:col-span-2">
            {/* Hunt Query Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase">
                    HYPOTHESIS #{activeHunt.id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeHunt.name}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">LAST RUN</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {huntHistory[activeHunt.id] ?? 'Telemetry Live Stream'}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                {activeHunt.description}
              </p>

              {/* DSL Query Code Box */}
              <div className="mt-4 rounded-xl bg-slate-900 p-3.5 text-xs text-emerald-400 font-mono shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-2">
                  <span>TELEMETRY DSL QUERY SYNTAX</span>
                  <span className="text-indigo-400">INDEX: firewall_behavior_v2</span>
                </div>
                <code>{activeHunt.querySyntax}</code>
              </div>

              {/* Matched Entities */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs border-t border-slate-100 pt-3">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block">IMPLICATED IDENTITIES</span>
                  <p className="mt-1 font-semibold text-slate-800">
                    {activeHunt.users.length > 0 ? activeHunt.users.join(', ') : 'None (Baseline Clean)'}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block">DEVICES</span>
                  <p className="mt-1 font-semibold text-slate-800 truncate">
                    {activeHunt.devices.length > 0 ? activeHunt.devices.join(', ') : 'None'}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block">SENSITIVE RESOURCES</span>
                  <p className="mt-1 font-mono font-semibold text-slate-800 truncate">
                    {activeHunt.resources.length > 0 ? activeHunt.resources.join(', ') : 'All Safe'}
                  </p>
                </div>
              </div>
            </div>

            {/* Matched Events Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                Hunting Correlation Timeline & Flagged Events
              </h5>

              {activeHunt.timeline.length === 0 ? (
                <p className="mt-4 text-xs text-slate-500">
                  Zero anomalous events matched this hunting signature. Threat vector is clean.
                </p>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {activeHunt.timeline.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] font-bold text-indigo-700">
                          {item.time}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{item.event}</p>
                          <span className="text-[10px] text-slate-500">User: {item.user}</span>
                        </div>
                      </div>

                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          item.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.severity}
                      </span>
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
