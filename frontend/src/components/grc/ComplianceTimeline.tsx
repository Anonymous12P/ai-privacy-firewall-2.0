import { useState } from 'react'
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ComplianceTimelineEvent, TimelineEventType } from '../../types/grc'

interface ComplianceTimelineProps {
  timeline: ComplianceTimelineEvent[]
}

export function ComplianceTimeline({ timeline }: ComplianceTimelineProps) {
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')

  const filteredEvents = timeline.filter((e) => {
    const matchesType = selectedType === 'ALL' || e.type === selectedType
    const matchesStatus = selectedStatus === 'ALL' || e.status === selectedStatus
    return matchesType && matchesStatus
  })

  const getTypeBadge = (type: TimelineEventType) => {
    switch (type) {
      case 'Audit':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Incident':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'Control':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Policy':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Milestone':
        return 'bg-amber-100 text-amber-800 border-amber-200'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              24-Month Rolling Compliance & Regulatory Milestone Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Historical audit completions, active examinations, incident simulations, and projected 2027 compliance roadmaps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Event Types</option>
            <option value="Audit">Audits</option>
            <option value="Control">Control Upgrades</option>
            <option value="Policy">Policy Revisions</option>
            <option value="Incident">Incident Exercises</option>
            <option value="Milestone">Milestones</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Completed">Completed (Past 12M)</option>
            <option value="In Progress">In Progress (Current)</option>
            <option value="Upcoming">Upcoming (Future 12M)</option>
          </select>
        </div>
      </div>

      {/* Timeline track */}
      <div className="mt-6 space-y-3 max-h-[520px] overflow-y-auto pr-2">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className={`flex items-start gap-4 rounded-xl border p-4 transition ${
              event.status === 'In Progress'
                ? 'border-indigo-400 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-300'
                : event.status === 'Completed'
                  ? 'border-slate-200 bg-white hover:bg-slate-50'
                  : 'border-dashed border-slate-200 bg-slate-50/40 text-slate-500'
            }`}
          >
            {/* Left month badge */}
            <div className="w-24 shrink-0 text-center">
              <span
                className={`block rounded-lg px-2 py-1 font-mono text-xs font-bold ${
                  event.status === 'In Progress'
                    ? 'bg-indigo-600 text-white'
                    : event.status === 'Completed'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-slate-200/60 text-slate-500'
                }`}
              >
                {event.monthLabel}
              </span>
              <span className="mt-1 block text-[10px] font-semibold text-slate-400">
                {event.year}
              </span>
            </div>

            {/* Middle details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${getTypeBadge(
                    event.type,
                  )}`}
                >
                  {event.type}
                </span>

                {event.framework && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-700">
                    {event.framework}
                  </span>
                )}

                <h4 className="text-xs font-bold text-slate-900">
                  {event.title}
                </h4>
              </div>

              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Right Status */}
            <div className="shrink-0 text-right">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  event.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : event.status === 'In Progress'
                      ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {event.status === 'Completed' ? (
                  <CheckCircleIcon className="h-3 w-3" />
                ) : event.status === 'In Progress' ? (
                  <SparklesIcon className="h-3 w-3" />
                ) : (
                  <ClockIcon className="h-3 w-3" />
                )}
                {event.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
