import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalculatorIcon,
  MinusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ScoreDecomposition } from '../../types/riskTuning'

interface ScoreDecompositionPanelProps {
  decomposition: ScoreDecomposition
}

export function ScoreDecompositionPanel({ decomposition }: ScoreDecompositionPanelProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalculatorIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Explainable Privacy Risk Score Decomposition
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Additive TreeSHAP attribution and feature weight contribution for{' '}
            <strong className="text-slate-700">{decomposition.userName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
            <span className="text-slate-500">Base Prior: </span>
            <span className="font-bold text-slate-800">{decomposition.baseScore} pts</span>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs">
            <span className="text-indigo-600">Total Computed Risk: </span>
            <span className="font-black text-indigo-900">{decomposition.totalScore} / 100</span>
          </div>
        </div>
      </div>

      {/* 10-Factor Decomposition Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-2.5 px-3">Behavioral Factor</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Observed Telemetry Value</th>
              <th className="py-2.5 px-3 text-center">Model Weight</th>
              <th className="py-2.5 px-3 text-center">SHAP Value (&phi;)</th>
              <th className="py-2.5 px-3 text-center">Score Delta</th>
              <th className="py-2.5 px-3">Attribution Impact Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {decomposition.factors.map((factor) => {
              const isIncrease = factor.direction === 'INCREASES_RISK'
              const isDecrease = factor.direction === 'DECREASES_RISK'

              return (
                <tr key={factor.name} className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {factor.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {factor.category}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                    {factor.rawValue}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                    {(factor.weight * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold whitespace-nowrap">
                    <span
                      className={
                        factor.shapValue > 0
                          ? 'text-red-600'
                          : factor.shapValue < 0
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                      }
                    >
                      {factor.shapValue > 0 ? `+${factor.shapValue}` : factor.shapValue}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                        isIncrease
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isDecrease
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isIncrease ? (
                        <ArrowUpIcon className="h-3 w-3" />
                      ) : isDecrease ? (
                        <ArrowDownIcon className="h-3 w-3" />
                      ) : (
                        <MinusIcon className="h-3 w-3" />
                      )}
                      {factor.points > 0 ? `+${factor.points}` : factor.points} pts
                    </span>
                  </td>
                  <td className="py-2.5 px-3 max-w-sm text-slate-600 text-[11px] leading-relaxed">
                    {factor.description}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Synthesis Box */}
      <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
        <div className="flex items-start gap-2.5">
          <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
          <div className="text-xs">
            <span className="font-bold text-indigo-950">Natural Language Decomposition Synthesis: </span>
            <span className="text-indigo-900/90">{decomposition.summaryExplanation}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
