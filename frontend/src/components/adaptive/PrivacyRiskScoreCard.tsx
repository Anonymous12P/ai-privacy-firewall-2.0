import {
  EyeIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { PrivacyRiskScore, PrivacySeverity } from '../../types/adaptiveLearning'

interface PrivacyRiskScoreCardProps {
  scores: PrivacyRiskScore[]
}

export function PrivacyRiskScoreCard({ scores }: PrivacyRiskScoreCardProps) {
  const getTierBadge = (tier: PrivacySeverity) => {
    switch (tier) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Departmental & Subject Privacy Risk Indices
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Multi-factor privacy scoring evaluating PII extraction velocity, cross-department queries, and consent compliance.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          6 Enterprise Subjects Monitored
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {scores.map((item) => (
          <div
            key={item.userId}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-[10px] font-bold text-indigo-700">
                    {item.userId} • {item.department}
                  </span>
                  <h4 className="mt-0.5 text-sm font-bold text-slate-900">
                    {item.userName}
                  </h4>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold ${getTierBadge(
                    item.tier,
                  )}`}
                >
                  {item.tier} Risk
                </span>
              </div>

              {/* Score bar */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Privacy Risk Score
                  </span>
                  <span className="font-black text-slate-900 text-sm">
                    {item.score} / 100
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.score >= 75
                        ? 'bg-rose-500'
                        : item.score >= 50
                          ? 'bg-orange-500'
                          : item.score >= 30
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>

              {/* 4 Factor breakdown */}
              <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    PII ACCESS RATE
                  </span>
                  <span className="font-bold text-slate-800">
                    {item.piiAccessRate} / hr
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    CROSS-DEPT FREQ
                  </span>
                  <span className="font-bold text-slate-800">
                    {item.crossDeptAccessFreq} / wk
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    BULK EGRESS RATE
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {item.bulkEgressVelocityMb} MB
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    CONSENT ALIGNED
                  </span>
                  <span className="font-bold text-emerald-700">
                    {item.consentCompliancePct}%
                  </span>
                </div>
              </div>

              {/* Explanation narrative */}
              <p className="mt-3 text-[11px] leading-relaxed text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                {item.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
