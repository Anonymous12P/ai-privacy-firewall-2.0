import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ThreatIntelSource } from '../../types/threatIntel'

interface ThreatIntelSourcesProps {
  sources: ThreatIntelSource[]
}

export function ThreatIntelSources({ sources }: ThreatIntelSourcesProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Integrated Global Threat Intelligence Ingestion Feeds
          </h3>
          <p className="text-xs text-slate-500">
            Continuous real-time synchronization with international cyber defense bodies, commercial threat databases, and internal firewall telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            All 8 Feeds Online
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        {sources.map((src) => (
          <div
            key={src.name}
            className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 transition hover:border-indigo-300 hover:shadow-xs text-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                  {src.type}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <CheckCircleIcon className="h-3 w-3" />
                  {src.status}
                </span>
              </div>

              <h4 className="mt-2 font-bold text-slate-900 line-clamp-1">
                {src.name}
              </h4>
              <p className="text-[10px] text-slate-400">{src.provider}</p>
            </div>

            <div className="mt-3 border-t border-slate-100 pt-2 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Ingested:</span>
                <span className="font-mono font-bold text-slate-900">
                  {src.recordsIngested.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Sync: {src.lastSync}</span>
                <span className="font-bold text-indigo-700">Trust: {src.trustScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
