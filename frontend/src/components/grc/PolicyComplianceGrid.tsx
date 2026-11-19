import {
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentCheckIcon,
  MinusIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { PolicyComplianceItem } from '../../types/grc'

interface PolicyComplianceGridProps {
  policies: PolicyComplianceItem[]
}

export function PolicyComplianceGrid({ policies }: PolicyComplianceGridProps) {
  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'Improving':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUpIcon className="h-3 w-3" /> Improving
          </span>
        )
      case 'Declining':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
            <ArrowDownIcon className="h-3 w-3" /> Declining
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <MinusIcon className="h-3 w-3" /> Stable
          </span>
        )
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DocumentCheckIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Corporate Security Policy Adherence & Attestation
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time compliance tracking across operational governance policies, violation counts, and organizational coverage.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
          97.8% Global Policy Adherence
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {policies.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-[10px] font-bold text-indigo-700">
                    {p.id}
                  </span>
                  <h4 className="mt-1 text-sm font-bold text-slate-900">
                    {p.name}
                  </h4>
                </div>
                {getTrendBadge(p.trend)}
              </div>

              {/* Compliance bar */}
              <div className="mt-3.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Compliance Score
                  </span>
                  <span className="font-black text-slate-900 text-sm">
                    {p.compliancePct}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      p.compliancePct >= 98
                        ? 'bg-emerald-500'
                        : p.compliancePct >= 95
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                    }`}
                    style={{ width: `${p.compliancePct}%` }}
                  />
                </div>
              </div>

              {/* Violations & Departments */}
              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-slate-700">
                  <span className="text-[11px] font-medium">30-Day Violations:</span>
                  <span
                    className={`font-bold ${
                      p.violationsCount === 0
                        ? 'text-emerald-700'
                        : p.violationsCount > 5
                          ? 'text-rose-700'
                          : 'text-amber-700'
                    }`}
                  >
                    {p.violationsCount} Recorded
                  </span>
                </div>

                <div className="text-[11px] text-slate-500">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                    APPLICABLE DEPARTMENTS:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {p.departments.map((dept) => (
                      <span
                        key={dept}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-700"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Updated: {p.lastUpdated}</span>
              <span>Next Review: {p.mandatoryReviewDate}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
