import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { FeatureImportanceItem } from '../../types/experiments'

interface FeatureImportancePanelProps {
  features: FeatureImportanceItem[]
}

export function FeatureImportancePanel({
  features,
}: FeatureImportancePanelProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Global Feature Importance (SHAP TreeExplainer Attribution)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Mean absolute SHAP value impact across all 250,000 evaluated records, isolating key behavioral threat drivers.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          Top 10 Empirical Predictors
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {features.map((item, idx) => {
          const isRisk = item.direction === 'Positive Threat Risk'
          const pct = Math.round((item.importanceWeight / 0.4) * 100)

          return (
            <div
              key={item.feature}
              className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition hover:border-slate-300 hover:shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-600">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {item.displayName}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-400">
                      {item.feature} • {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      isRisk
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isRisk ? (
                      <ArrowUpIcon className="h-2.5 w-2.5" />
                    ) : (
                      <ArrowDownIcon className="h-2.5 w-2.5" />
                    )}
                    {item.direction}
                  </span>

                  <span className="font-mono text-xs font-bold text-slate-900">
                    +{item.importanceWeight.toFixed(3)} SHAP
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      isRisk ? 'bg-indigo-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
