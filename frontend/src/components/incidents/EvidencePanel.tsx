import { useState } from 'react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { EvidenceCard } from '../../types/incident'

interface EvidencePanelProps {
  evidence: EvidenceCard[]
  evidenceScore: number
}

export function EvidencePanel({
  evidence,
  evidenceScore,
}: EvidencePanelProps) {
  // Store expanded item IDs
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'ev-1': true,
    'ev-2': true,
  })

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <DocumentMagnifyingGlassIcon className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Forensic Evidence & Telemetry Artifacts
            </h3>
            <p className="text-xs text-slate-500">
              Correlated telemetry logs across IAM, behavioral indicators, edge firewalls, and network sockets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Forensic Certainty:</span>
          <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1 font-mono text-sm font-black text-indigo-700">
            {evidenceScore}%
          </span>
        </div>
      </div>

      {evidence.length === 0 ? (
        <p className="mt-4 text-xs text-slate-500">No telemetry artifacts currently attached to this incident.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {evidence.map((card) => {
            const isExpanded = expandedIds[card.id] ?? false

            return (
              <div
                key={card.id}
                className="rounded-xl border border-slate-200/80 bg-white transition hover:border-indigo-200"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(card.id)}
                  className="flex cursor-pointer items-center justify-between p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        card.flagged ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {card.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        Category: {card.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-bold ${
                        card.riskScore >= 75
                          ? 'text-rose-600'
                          : card.riskScore >= 40
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      Risk: {card.riskScore}/100
                    </span>
                    <button
                      type="button"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      className="cursor-pointer text-slate-400"
                    >
                      {isExpanded ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-3.5">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {Object.entries(card.details).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between rounded-lg bg-white p-2 border border-slate-100 text-xs"
                        >
                          <span className="text-slate-500 font-medium">{k}:</span>
                          <span className="font-mono font-semibold text-slate-800">
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
