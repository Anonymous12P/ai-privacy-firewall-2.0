import { Card } from '../Card'
import type { CampaignIntelligenceRecord } from '../../types/threatIntel'

interface CampaignIntelligenceProps {
  campaigns: CampaignIntelligenceRecord[]
}

const STATUS_COLORS: Record<CampaignIntelligenceRecord['status'], string> = {
  Active: 'bg-rose-100 text-rose-800 border-rose-200',
  Disrupted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Monitoring: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Dormant: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function CampaignIntelligence({ campaigns }: CampaignIntelligenceProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Adversary Campaign Intelligence & Attribution Tracking
          </h3>
          <p className="text-xs text-slate-500">
            Strategic threat actor profiles, targeted commercial sectors, C2 command infrastructure, and campaign lifecycle state.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
          {campaigns.length} Tracked Campaigns
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md"
          >
            {/* Campaign Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">
                    {camp.name}
                  </h4>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                      STATUS_COLORS[camp.status]
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-indigo-700">
                    Actor: {camp.threatActor}
                  </span>
                  <span>•</span>
                  <span>Origin: {camp.country}</span>
                  <span>•</span>
                  <span>{camp.timeline}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700">
                  {camp.confidence}% Attribution Confidence
                </span>
              </div>
            </div>

            {/* Strategic Objective */}
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block text-[10px] uppercase tracking-wider mb-0.5">
                Strategic Threat Objective
              </span>
              <p className="leading-relaxed">{camp.objectives}</p>
            </div>

            {/* Target Industries & Infrastructure */}
            <div className="mt-4 grid gap-4 text-xs sm:grid-cols-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  INDUSTRY SECTORS
                </span>
                <div className="flex flex-wrap gap-1">
                  {camp.industryTargets.map((ind, i) => (
                    <span
                      key={i}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  KNOWN C2 INFRASTRUCTURE
                </span>
                <div className="space-y-0.5 font-mono text-[11px] text-slate-700">
                  {camp.infrastructure.map((infra, i) => (
                    <p key={i}>↳ {infra}</p>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  MALWARE TOOLKITS & MITRE
                </span>
                <div className="flex flex-wrap gap-1">
                  {camp.malwareUsed.map((m, i) => (
                    <span
                      key={i}
                      className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-700"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
