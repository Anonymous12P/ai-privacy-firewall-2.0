import { useState } from 'react'
import {
  CheckCircleIcon,
  ClockIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { RemediationTaskItem, RiskSeverity } from '../../types/grc'

interface RemediationTrackerProps {
  remediations: RemediationTaskItem[]
}

export function RemediationTracker({ remediations }: RemediationTrackerProps) {
  const [tasks, setTasks] = useState<RemediationTaskItem[]>(remediations)
  const [filterPriority, setFilterPriority] = useState<string>('ALL')

  const filteredTasks = tasks.filter(
    (t) => filterPriority === 'ALL' || t.priority === filterPriority,
  )

  const handleUpdateProgress = (id: string, newProgress: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        let newStatus = t.status
        if (newProgress === 100) newStatus = 'Completed'
        else if (newProgress > 80) newStatus = 'Verification'
        else if (newProgress > 0) newStatus = 'In Progress'
        else newStatus = 'Not Started'

        return { ...t, progress: newProgress, status: newStatus }
      }),
    )
  }

  const getPriorityBadge = (priority: RiskSeverity) => {
    switch (priority) {
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
            <WrenchIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Enterprise Remediation Task Tracker
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Assigned corrective actions, target completion dates, owner responsibility, and live resolution sliders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3.5 py-3">Task ID</th>
              <th className="px-3.5 py-3">Remediation Action & Risk</th>
              <th className="px-3.5 py-3">Owner</th>
              <th className="px-3.5 py-3">Priority</th>
              <th className="px-3.5 py-3">Status</th>
              <th className="px-3.5 py-3 w-48">Progress</th>
              <th className="px-3.5 py-3">Target Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTasks.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/60 transition">
                <td className="px-3.5 py-3 font-mono font-bold text-indigo-700">
                  {t.id}
                </td>
                <td className="px-3.5 py-3 max-w-md">
                  <p className="font-bold text-slate-900">{t.task}</p>
                  <span className="font-mono text-[10px] text-slate-400">
                    Linked Risk: {t.riskId}
                  </span>
                </td>
                <td className="px-3.5 py-3 font-medium text-slate-800">
                  {t.owner}
                </td>
                <td className="px-3.5 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getPriorityBadge(
                      t.priority,
                    )}`}
                  >
                    {t.priority}
                  </span>
                </td>
                <td className="px-3.5 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      t.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'Verification'
                          ? 'bg-purple-100 text-purple-800'
                          : t.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {t.status === 'Completed' ? (
                      <CheckCircleIcon className="h-3 w-3" />
                    ) : (
                      <ClockIcon className="h-3 w-3" />
                    )}
                    {t.status}
                  </span>
                </td>
                <td className="px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={t.progress}
                      onChange={(e) =>
                        handleUpdateProgress(t.id, Number(e.target.value))
                      }
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
                    />
                    <span className="w-8 font-mono font-bold text-slate-700 text-right">
                      {t.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-3.5 py-3 font-mono text-[11px] text-slate-600">
                  {t.estimatedCompletion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
