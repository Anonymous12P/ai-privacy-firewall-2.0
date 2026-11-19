import {
  BellAlertIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { TimelineEntry } from '../../types/incident'

interface InvestigationTimelineProps {
  timeline: TimelineEntry[]
  incidentId: string
}

function getTimelineIcon(type: TimelineEntry['type'], status: TimelineEntry['status']) {
  if (status === 'alert') {
    return <BellAlertIcon className="h-4 w-4 text-rose-600" />
  }
  if (status === 'warning') {
    return <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />
  }
  if (status === 'success') {
    return <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
  }
  if (type === 'firewall' || type === 'policy') {
    return <ShieldCheckIcon className="h-4 w-4 text-indigo-600" />
  }
  return <InformationCircleIcon className="h-4 w-4 text-slate-500" />
}

export function InvestigationTimeline({
  timeline,
  incidentId,
}: InvestigationTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-500">
        <ClockIcon className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-2 text-xs font-semibold">No timeline events logged yet for {incidentId}.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Investigation & Incident Timeline
          </h3>
          <p className="text-xs text-slate-500">
            Chronological audit of entity authentication, behavioral telemetry, AI evaluation, and containment steps.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-slate-700">
          {timeline.length} Events Logged
        </span>
      </div>

      <div className="relative mt-6 pl-4 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        <div className="space-y-6">
          {timeline.map((entry) => {
            const isAlert = entry.status === 'alert'
            const isWarning = entry.status === 'warning'
            const isSuccess = entry.status === 'success'

            return (
              <div key={entry.id} className="relative flex items-start gap-4">
                {/* Node icon pill */}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    isAlert
                      ? 'border-rose-300 bg-rose-50'
                      : isWarning
                      ? 'border-amber-300 bg-amber-50'
                      : isSuccess
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {getTimelineIcon(entry.type, entry.status)}
                </div>

                {/* Content Box */}
                <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-900">
                      {entry.title}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {entry.timestamp}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {entry.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="uppercase tracking-wider font-semibold">
                      Source: {entry.actor}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-bold uppercase ${
                        isAlert
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : isSuccess
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {entry.type}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
