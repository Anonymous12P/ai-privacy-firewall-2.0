import {
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ModelBenchmarkMetrics } from '../../types/experiments'

interface ModelBenchmarkTableProps {
  benchmarks: ModelBenchmarkMetrics[]
}

export function ModelBenchmarkTable({ benchmarks }: ModelBenchmarkTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Production Candidate':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Challenger':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Model Benchmark & Comparative Evaluation Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Empirical evaluation across 4 candidate classifiers on the held-out test partition (37,500 records).
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          Rank 1: XGBoost (96.2% F1)
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3.5 py-3">Rank</th>
              <th className="px-3.5 py-3">Model Architecture</th>
              <th className="px-3.5 py-3">Accuracy</th>
              <th className="px-3.5 py-3">Precision</th>
              <th className="px-3.5 py-3">Recall</th>
              <th className="px-3.5 py-3">F1-Score</th>
              <th className="px-3.5 py-3">ROC-AUC</th>
              <th className="px-3.5 py-3">PR-AUC</th>
              <th className="px-3.5 py-3">Latency</th>
              <th className="px-3.5 py-3">Explainability</th>
              <th className="px-3.5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {benchmarks.map((m) => (
              <tr
                key={m.modelName}
                className={`transition hover:bg-slate-50/80 ${
                  m.rank === 1 ? 'bg-indigo-50/20 font-medium' : ''
                }`}
              >
                <td className="px-3.5 py-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                      m.rank === 1
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    #{m.rank}
                  </span>
                </td>
                <td className="px-3.5 py-3">
                  <div className="font-bold text-slate-900">{m.displayName}</div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {m.modelName}
                  </span>
                </td>
                <td className="px-3.5 py-3 font-mono">{m.accuracy}%</td>
                <td className="px-3.5 py-3 font-mono">{m.precision}%</td>
                <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                  {m.recall}%
                </td>
                <td className="px-3.5 py-3 font-mono font-black text-indigo-700 text-sm">
                  {m.f1Score}%
                </td>
                <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                  {m.rocAuc}%
                </td>
                <td className="px-3.5 py-3 font-mono">{m.prAuc}%</td>
                <td className="px-3.5 py-3 font-mono text-slate-600">
                  {m.inferenceTimeMs} ms
                </td>
                <td className="px-3.5 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800">
                      {m.explainabilityScore}/100
                    </span>
                  </div>
                </td>
                <td className="px-3.5 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
                      m.status,
                    )}`}
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
