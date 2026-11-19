import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { DepartmentAdaptation } from '../../types/policyLearning'

interface DepartmentPolicyAdaptationCardProps {
  adaptations: DepartmentAdaptation[]
}

function getStanceBadge(stance: DepartmentAdaptation['stance']) {
  switch (stance) {
    case 'STRICTER':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        label: 'Hardened Zero-Trust',
        icon: ShieldExclamationIcon,
      }
    case 'PERMISSIVE':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Developer Agility',
        icon: ShieldCheckIcon,
      }
    case 'SENSITIVE':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'PII Protected',
        icon: LockClosedIcon,
      }
    case 'STABLE_LOCKDOWN':
    default:
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        label: 'HIPAA Lockdown',
        icon: LockClosedIcon,
      }
  }
}

export function DepartmentPolicyAdaptationCard({
  adaptations,
}: DepartmentPolicyAdaptationCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BuildingOffice2Icon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Departmental Divergent Policy Adaptation
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Differentiated policy posturing tailored to departmental operational tempo and data liability profiles.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          Context-Aware Enforcement
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {adaptations.map((dept) => {
          const badge = getStanceBadge(dept.stance)
          const Icon = badge.icon

          return (
            <div
              key={dept.department}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-indigo-300 hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{dept.department}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {dept.sensitivityShift}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${badge.bg}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {badge.label}
                  </span>
                </div>

                <p className="mt-2.5 text-xs text-slate-700 leading-relaxed font-medium">
                  {dept.adaptationSummary}
                </p>

                <p className="mt-1 text-[11px] text-slate-500 italic">
                  Rationale: {dept.rationale}
                </p>

                {/* Efficiency metrics */}
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">FP Reduction:</span>
                    <span className="font-bold text-emerald-700">-{dept.fpReduction}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">FN Reduction:</span>
                    <span className="font-bold text-indigo-700">-{dept.fnReduction}%</span>
                  </div>
                </div>

                {/* Rule Highlights */}
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Active Specialized Rules
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {dept.activeRuleHighlights.map((r) => (
                      <li key={r} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                        <CheckCircleIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
