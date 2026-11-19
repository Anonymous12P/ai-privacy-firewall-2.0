import { useState } from 'react'
import {
  FireIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { HeatmapCell, RiskItem } from '../../types/grc'

interface RiskHeatmapProps {
  heatmap: HeatmapCell[]
  risks: RiskItem[]
  onSelectRisk?: (risk: RiskItem) => void
}

export function RiskHeatmap({
  heatmap,
  risks,
  onSelectRisk,
}: RiskHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<{
    likelihood: number
    impact: number
  } | null>(null)

  const activeRisks = selectedCell
    ? risks.filter(
        (r) =>
          r.likelihood === selectedCell.likelihood &&
          r.impact === selectedCell.impact,
      )
    : []

  const impactLabels: Record<number, string> = {
    5: '5 - Catastrophic',
    4: '4 - Major',
    3: '3 - Moderate',
    2: '2 - Minor',
    1: '1 - Negligible',
  }

  const likelihoodLabels: Record<number, string> = {
    1: '1 - Rare',
    2: '2 - Unlikely',
    3: '3 - Moderate',
    4: '4 - Likely',
    5: '5 - Almost Certain',
  }

  const getCellBg = (severity: string, isSelected: boolean) => {
    if (isSelected) {
      return 'ring-4 ring-indigo-500 ring-offset-2 scale-105 z-10'
    }
    switch (severity) {
      case 'Critical':
        return 'bg-rose-500/90 text-white hover:bg-rose-600 shadow-sm'
      case 'High':
        return 'bg-orange-500/90 text-white hover:bg-orange-600 shadow-sm'
      case 'Medium':
        return 'bg-amber-400/90 text-slate-900 hover:bg-amber-500'
      case 'Low':
        return 'bg-emerald-500/90 text-white hover:bg-emerald-600'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900">
              5×5 Enterprise Risk Matrix & Heatmap
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Qualitative probability vs. business consequence distribution. Click any cell to inspect linked risks.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-rose-500" />
            <span className="text-slate-600">Critical (15-25)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-orange-500" />
            <span className="text-slate-600">High (10-14)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-400" />
            <span className="text-slate-600">Medium (5-9)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-500" />
            <span className="text-slate-600">Low (1-4)</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Heatmap Grid */}
        <div className="lg:col-span-8">
          <div className="relative">
            {/* Impact Y-axis header */}
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Impact (Severity Consequence) ↑
            </div>

            <div className="grid grid-cols-6 gap-2">
              {/* Header row: Impact Label placeholder + Likelihoods */}
              <div className="text-center text-[10px] font-bold text-slate-400">
                IMPACT / LIKELIHOOD
              </div>
              {[1, 2, 3, 4, 5].map((l) => (
                <div
                  key={l}
                  className="text-center text-[10px] font-bold text-slate-500"
                >
                  {likelihoodLabels[l]}
                </div>
              ))}

              {/* 5 Rows: Impact 5 down to 1 */}
              {[5, 4, 3, 2, 1].map((impactVal) => (
                <div key={`row-${impactVal}`} className="contents">
                  {/* Row header */}
                  <div className="flex items-center justify-end pr-2 text-right text-[10px] font-bold text-slate-600">
                    {impactLabels[impactVal]}
                  </div>

                  {/* 5 Cells */}
                  {[1, 2, 3, 4, 5].map((likelihoodVal) => {
                    const cell = heatmap.find(
                      (c) =>
                        c.impact === impactVal && c.likelihood === likelihoodVal,
                    )
                    const isSelected =
                      selectedCell?.impact === impactVal &&
                      selectedCell?.likelihood === likelihoodVal

                    const count = cell?.count ?? 0
                    const severity = cell?.severity ?? 'Low'

                    return (
                      <button
                        key={`cell-${impactVal}-${likelihoodVal}`}
                        type="button"
                        onClick={() =>
                          setSelectedCell(
                            isSelected
                              ? null
                              : { impact: impactVal, likelihood: likelihoodVal },
                          )
                        }
                        className={`cursor-pointer group relative flex h-14 flex-col items-center justify-center rounded-xl p-2 transition duration-150 ${getCellBg(
                          severity,
                          isSelected,
                        )}`}
                      >
                        <span className="text-base font-black">
                          {count > 0 ? count : '-'}
                        </span>
                        <span className="text-[9px] font-medium opacity-80">
                          Score {impactVal * likelihoodVal}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Bottom X-axis label */}
            <div className="mt-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
              Likelihood (Probability Frequency) →
            </div>
          </div>
        </div>

        {/* Drilldown Panel for Selected Cell */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Cell Drilldown
              </span>
              <h4 className="text-xs font-bold text-slate-900">
                {selectedCell
                  ? `Impact ${selectedCell.impact} × Likelihood ${selectedCell.likelihood}`
                  : 'Select Any Matrix Cell'}
              </h4>
            </div>
            {selectedCell && (
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {!selectedCell ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <InformationCircleIcon className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              Click on any cell in the 5×5 heatmap to inspect the associated risk IDs, owners, and mitigation strategies.
            </div>
          ) : activeRisks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Zero enterprise risks currently classified at this coordinate.
            </div>
          ) : (
            <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {activeRisks.map((risk) => (
                <div
                  key={risk.id}
                  onClick={() => onSelectRisk?.(risk)}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xs transition hover:border-indigo-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-indigo-600">
                      {risk.id}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        risk.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : risk.severity === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : risk.severity === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {risk.severity} ({risk.riskScore}/25)
                    </span>
                  </div>
                  <h5 className="mt-1 font-bold text-slate-900">{risk.name}</h5>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{risk.businessUnit}</span>
                    <span>{risk.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
