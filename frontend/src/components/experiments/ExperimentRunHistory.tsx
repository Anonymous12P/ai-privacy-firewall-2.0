import {
  ClockIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ExperimentRunRecord } from '../../types/experiments'

interface ExperimentRunHistoryProps {
  runs: ExperimentRunRecord[]
}

export function ExperimentRunHistory({ runs }: ExperimentRunHistoryProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Reproducible Experiment Execution Ledger
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Immutable tracking of ML training pipelines, hyperparameters, dataset checkpoints, and artifact outputs.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {runs.length} Registered Runs
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3.5 py-3">Run ID</th>
              <th className="px-3.5 py-3">Model & Version</th>
              <th className="px-3.5 py-3">Hyperparameters</th>
              <th className="px-3.5 py-3">Accuracy</th>
              <th className="px-3.5 py-3">F1-Score</th>
              <th className="px-3.5 py-3">ROC-AUC</th>
              <th className="px-3.5 py-3">Duration</th>
              <th className="px-3.5 py-3">Notes & Observations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {runs.map((r) => (
              <tr
                key={r.runId}
                className={`transition hover:bg-slate-50/80 ${
                  r.isBest ? 'bg-indigo-50/30' : ''
                }`}
              >
                <td className="px-3.5 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-indigo-700">
                      {r.runId}
                    </span>
                    {r.isBest && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                        BEST
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {r.timestamp}
                  </span>
                </td>
                <td className="px-3.5 py-3">
                  <span className="font-bold text-slate-900 block">{r.modelName}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {r.datasetVersion}
                  </span>
                </td>
                <td className="px-3.5 py-3 max-w-xs">
                  <div className="font-mono text-[10px] text-slate-600 truncate">
                    {Object.entries(r.hyperparameters)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(', ')}
                  </div>
                </td>
                <td className="px-3.5 py-3 font-mono">{r.accuracy}%</td>
                <td className="px-3.5 py-3 font-mono font-bold text-indigo-700">
                  {r.f1Score}%
                </td>
                <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                  {r.rocAuc}%
                </td>
                <td className="px-3.5 py-3 font-mono text-slate-500">
                  {r.trainingTimeSec}s
                </td>
                <td className="px-3.5 py-3 text-slate-600 max-w-sm">
                  <p className="line-clamp-2 text-[11px]">{r.notes}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
