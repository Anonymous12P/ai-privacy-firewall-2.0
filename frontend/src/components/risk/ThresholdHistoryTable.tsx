import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ThresholdChangeRecord } from '../../types/riskTuning'

interface ThresholdHistoryTableProps {
  history: ThresholdChangeRecord[]
}

function getStatusBadge(status: ThresholdChangeRecord['status']) {
  switch (status) {
    case 'APPLIED':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircleIcon,
      }
    case 'EVALUATING':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: ClockIcon,
      }
    case 'REVERTED':
    default:
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: ExclamationCircleIcon,
      }
  }
}

function getStanceBadge(stance: ThresholdChangeRecord['stanceChange']) {
  switch (stance) {
    case 'TIGHTENED':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'RELAXED':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'BALANCED':
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

export function ThresholdHistoryTable({ history }: ThresholdHistoryTableProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Threshold Audit Trail & Change History
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Immutable log of automated Bayesian adaptations and human-in-the-loop analyst threshold overrides.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          {history.length} Configuration Events Recorded
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-3">Event ID</th>
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3">Delta Thresholds (Allow / Warn / Restrict / Block)</th>
              <th className="py-3 px-3">Posture</th>
              <th className="py-3 px-3">Department Scope</th>
              <th className="py-3 px-3">Reason & Analyst Feedback</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((record) => {
              const statusBadge = getStatusBadge(record.status)
              const StatusIcon = statusBadge.icon
              const prev = record.previousThresholds
              const next = record.newThresholds

              return (
                <tr key={record.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                    {record.id}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {record.timestamp}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 line-through">
                        {prev.allow} / {prev.warn} / {prev.restrict} / {prev.block}
                      </span>
                      <span className="font-bold text-slate-900">
                        &rarr; {next.allow} / {next.warn} / {next.restrict} / {next.block}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${getStanceBadge(
                        record.stanceChange,
                      )}`}
                    >
                      {record.stanceChange}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                    {record.departmentImpact}
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <p className="font-semibold text-slate-800">{record.reason}</p>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                      {record.analystFeedback}
                    </p>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusBadge.bg}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {record.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
