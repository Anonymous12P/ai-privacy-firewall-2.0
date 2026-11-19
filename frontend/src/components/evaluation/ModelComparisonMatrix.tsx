import {
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ModelBenchmarkRow } from '../../types/evaluation'

interface ModelComparisonMatrixProps {
  models: ModelBenchmarkRow[]
}

export function ModelComparisonMatrix({ models }: ModelComparisonMatrixProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Multi-Model Performance Benchmark Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Comparative evaluation across linear, single-tree, bagging, and gradient boosted ensemble algorithms.
          </p>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          <TrophyIcon className="h-4 w-4 text-amber-500" />
          Champion: XGBoost Ensemble
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-3">Model Architecture</th>
              <th className="py-3 px-3 text-center">Accuracy (%)</th>
              <th className="py-3 px-3 text-center">Precision (%)</th>
              <th className="py-3 px-3 text-center">Recall (%)</th>
              <th className="py-3 px-3 text-center">F1 Score (%)</th>
              <th className="py-3 px-3 text-center">ROC AUC</th>
              <th className="py-3 px-3 text-center">PR AUC</th>
              <th className="py-3 px-3 text-center">Inference Latency</th>
              <th className="py-3 px-3 text-right">Explainability Quality</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {models.map((m) => (
              <tr
                key={m.modelName}
                className={`transition ${
                  m.isChampion
                    ? 'bg-indigo-50/30 font-semibold hover:bg-indigo-50/50'
                    : 'hover:bg-slate-50/60'
                }`}
              >
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="font-bold text-slate-900">{m.displayName}</span>
                    {m.isChampion && (
                      <span className="rounded bg-amber-100 border border-amber-300 px-1.5 py-0.2 text-[9px] font-bold text-amber-900">
                        BEST
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                  {m.accuracy}%
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-800">
                  {m.precision}%
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-800">
                  {m.recall}%
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700">
                  {m.f1Score}%
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-slate-900">
                  {m.rocAuc}
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-slate-900">
                  {m.prAuc}
                </td>
                <td className="py-3 px-3 text-center font-mono text-emerald-700 font-semibold whitespace-nowrap">
                  {m.latencyMs} ms
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-800">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                    {m.explainabilityScore} / 100
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-indigo-900 flex items-center gap-2">
        <SparklesIcon className="h-4 w-4 shrink-0 text-indigo-600" />
        <span>
          <strong>Empirical Finding:</strong> XGBoost achieves the highest discriminative performance on imbalanced insider privacy threats (0.984 ROC-AUC, 0.965 PR-AUC) with only 1.2 ms mean packet processing latency, satisfying production live-wire firewall throughput requirements.
        </span>
      </div>
    </Card>
  )
}
