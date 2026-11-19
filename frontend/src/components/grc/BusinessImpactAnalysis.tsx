import {
  ServerStackIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { BusinessImpactItem } from '../../types/grc'

interface BusinessImpactAnalysisProps {
  impacts: BusinessImpactItem[]
}

export function BusinessImpactAnalysis({
  impacts,
}: BusinessImpactAnalysisProps) {
  const getTierBadge = (criticality: string) => {
    if (criticality.includes('Tier 0')) {
      return 'bg-rose-100 text-rose-800 border-rose-300 font-black'
    }
    if (criticality.includes('Tier 1')) {
      return 'bg-orange-100 text-orange-800 border-orange-300 font-bold'
    }
    return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold'
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ServerStackIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Business Impact Analysis (BIA) & Continuity Objectives
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Criticality tiers, Recovery Time Objectives (RTO), Recovery Point Objectives (RPO), and outage financial exposure.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          5 Core Enterprise Processes Modeled
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {impacts.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-indigo-700">
                  {item.id} • {item.businessUnit}
                </span>
                <h4 className="mt-1 text-sm font-bold text-slate-900">
                  {item.businessProcess}
                </h4>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[9px] ${getTierBadge(
                  item.criticality,
                )}`}
              >
                {item.criticality.split(' - ')[0]}
              </span>
            </div>

            {/* RTO and RPO Cards */}
            <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  RECOVERY TIME (RTO)
                </span>
                <span className="font-mono font-black text-rose-700 text-xs">
                  {item.rto}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  DATA LOSS TOLERANCE (RPO)
                </span>
                <span className="font-mono font-black text-indigo-700 text-xs">
                  {item.rpo}
                </span>
              </div>
            </div>

            {/* Financial and Operational Impact */}
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                  Financial Outage Exposure
                </span>
                <p className="mt-0.5 font-bold text-rose-950">
                  {item.financialImpact}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5 text-slate-600">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  OPERATIONAL RESILIENCE IMPACT
                </span>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  {item.operationalImpact}
                </p>
              </div>
            </div>

            {/* Dependant systems & owner */}
            <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-400">
                  Dependencies:
                </span>
                {item.dependantSystems.map((sys) => (
                  <span
                    key={sys}
                    className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-700"
                  >
                    {sys}
                  </span>
                ))}
              </div>

              <div className="mt-2 text-right text-[10px] font-medium text-slate-400">
                Process Owner: <strong className="text-slate-700">{item.riskOwner}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
