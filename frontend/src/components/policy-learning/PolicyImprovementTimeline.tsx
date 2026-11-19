import {
  ArrowPathRoundedSquareIcon,
  CheckBadgeIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { TimelineEvent } from '../../types/policyLearning'

interface PolicyImprovementTimelineProps {
  timeline: TimelineEvent[]
}

function getCategoryBadge(cat: TimelineEvent['category']) {
  switch (cat) {
    case 'POLICY_UPDATE':
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: ArrowPathRoundedSquareIcon,
      }
    case 'FEEDBACK_EVENT':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckBadgeIcon,
      }
    case 'THRESHOLD_CHANGE':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: SparklesIcon,
      }
    case 'FP_DROP':
      return {
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: CheckBadgeIcon,
      }
    case 'RISK_HARDENING':
    default:
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: ShieldCheckIcon,
      }
  }
}

export function PolicyImprovementTimeline({ timeline }: PolicyImprovementTimelineProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              30-Day Policy Optimization Chronology & Milestones
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Audit history of behavioral adaptation triggers, analyst triage validations, and threshold migrations.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          {timeline.length} Major Epoch Milestones
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {timeline.map((evt, idx) => {
          const badge = getCategoryBadge(evt.category)
          const Icon = badge.icon

          return (
            <div key={evt.id} className="relative flex items-start gap-4">
              {/* Connecting line */}
              {idx < timeline.length - 1 && (
                <span
                  className="absolute left-4 top-8 -bottom-4 w-0.5 bg-slate-200"
                  aria-hidden="true"
                />
              )}

              {/* Node Icon */}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-2xs ${badge.bg}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content box */}
              <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700">{evt.day}</span>
                    <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                  </div>
                  <span className="text-[11px] text-slate-400">{evt.timestamp}</span>
                </div>

                <p className="mt-1 text-xs text-slate-600">{evt.description}</p>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px]">
                  <span className="text-slate-500">
                    Validated by: <strong className="text-slate-700">{evt.analyst}</strong>
                  </span>
                  <span className="font-semibold text-emerald-700">Impact: {evt.impact}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
