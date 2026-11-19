import { useState } from 'react'
import {
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { RiskTreatmentPlan } from '../../types/grc'

interface RiskTreatmentPlansProps {
  plans: RiskTreatmentPlan[]
}

export function RiskTreatmentPlans({ plans }: RiskTreatmentPlansProps) {
  const [treatmentState, setTreatmentState] = useState<RiskTreatmentPlan[]>(plans)

  const toggleTask = (planId: string, taskId: string) => {
    setTreatmentState((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan

        const updatedTasks = plan.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t,
        )
        const completedCount = updatedTasks.filter((t) => t.completed).length
        const completionPct = Math.round(
          (completedCount / (updatedTasks.length || 1)) * 100,
        )

        return {
          ...plan,
          tasks: updatedTasks,
          completionPct,
          status: completionPct === 100 ? 'On Track' : plan.status,
        }
      }),
    )
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <WrenchScrewdriverIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Risk Treatment & Corrective Action Plans
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Remediation roadmaps, budgetary allocation, multi-task milestones, and owner accountability.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          {treatmentState.length} Active Treatment Charters
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {treatmentState.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-indigo-700">
                      {plan.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({plan.riskId})
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-slate-900 line-clamp-2">
                    {plan.riskName}
                  </h4>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    plan.status === 'On Track'
                      ? 'bg-emerald-100 text-emerald-800'
                      : plan.status === 'Delayed'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {plan.status}
                </span>
              </div>

              {/* Strategy & Budget */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-[10px] text-slate-700">
                  Strategy: {plan.strategy}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-700">
                  Budget: {plan.budgetAllocated}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Completion Posture
                  </span>
                  <span className="font-black text-indigo-700">
                    {plan.completionPct}%
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      plan.completionPct >= 75
                        ? 'bg-emerald-500'
                        : plan.completionPct >= 50
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                    }`}
                    style={{ width: `${plan.completionPct}%` }}
                  />
                </div>
              </div>

              {/* Task Checklist */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Implementation Milestones
                </span>
                {plan.tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(plan.id, t.id)}
                    className="flex items-start gap-2 rounded-lg p-1.5 transition hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => {}} // handled by div click
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className={`leading-tight ${
                        t.completed
                          ? 'line-through text-slate-400 font-normal'
                          : 'text-slate-800 font-medium'
                      }`}
                    >
                      {t.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] text-slate-500">
              <span>Owner: <strong className="text-slate-800">{plan.owner}</strong></span>
              <span className="font-mono">Due: {plan.dueDate}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
