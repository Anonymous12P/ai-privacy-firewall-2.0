import {
  ArrowDownIcon,
  ArrowUpIcon,
  BuildingOffice2Icon,
  MinusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { LearnedThreshold } from '../../types/policyLearning'

interface LearnedThresholdsTableProps {
  thresholds: LearnedThreshold[]
}

export function LearnedThresholdsTable({ thresholds }: LearnedThresholdsTableProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BuildingOffice2Icon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Department-Specific Learned Decision Thresholds
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Divergent policy calibration tailored automatically through departmental empirical behavior modeling.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          6 Active Departmental Baselines
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-3">Department</th>
              <th className="py-3 px-3 text-center">Baseline Cap</th>
              <th className="py-3 px-3 text-center">Learned Cap</th>
              <th className="py-3 px-3 text-center">Delta (&Delta;)</th>
              <th className="py-3 px-3 text-center">Confidence</th>
              <th className="py-3 px-3">Automated Learning Rationale</th>
              <th className="py-3 px-3 text-center">Active Rules</th>
              <th className="py-3 px-3 text-right">Last Calibrated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {thresholds.map((row) => {
              const isTightened = row.direction === 'TIGHTENED'
              const isRelaxed = row.direction === 'RELAXED'

              return (
                <tr key={row.department} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {row.department}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-400 line-through">
                    {row.baselineThreshold}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-black text-slate-900">
                    {row.learnedThreshold}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                        isTightened
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isRelaxed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isTightened ? (
                        <ArrowDownIcon className="h-3 w-3" />
                      ) : isRelaxed ? (
                        <ArrowUpIcon className="h-3 w-3" />
                      ) : (
                        <MinusIcon className="h-3 w-3" />
                      )}
                      {row.delta > 0 ? `+${row.delta}` : row.delta} pts
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700">
                    {(row.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-3 max-w-sm text-slate-600 text-[11px] leading-relaxed">
                    {row.reason}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-700">
                    {row.appliedRuleCount}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 whitespace-nowrap text-[11px]">
                    {row.lastCalibrated}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs text-slate-600 flex items-center gap-2">
        <SparklesIcon className="h-4 w-4 shrink-0 text-indigo-600" />
        <span>
          <strong>Divergent Specialization:</strong> Finance and Healthcare auto-tightened by 8 points due to high-consequence asset exposure, whereas Engineering auto-relaxed by 9 points to eliminate CI/CD false alarms.
        </span>
      </div>
    </Card>
  )
}
