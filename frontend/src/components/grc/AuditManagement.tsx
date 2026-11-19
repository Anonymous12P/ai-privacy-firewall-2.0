import {
  CalendarIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { AuditItem } from '../../types/grc'

interface AuditManagementProps {
  audits: AuditItem[]
}

export function AuditManagement({ audits }: AuditManagementProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Audit Engagement & Regulatory Examination Management
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Active independent auditor examinations, fieldwork timelines, control sampling progress, and finding trackers.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
          Zero Material Deficiencies Recorded
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {audits.map((audit) => {
          const totalFindings =
            audit.findings.high + audit.findings.medium + audit.findings.low

          return (
            <div
              key={audit.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-indigo-700">
                      {audit.id}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-[10px] text-slate-700">
                      {audit.framework}
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-slate-900">
                    {audit.name}
                  </h4>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    audit.status === 'Fieldwork Complete'
                      ? 'bg-purple-100 text-purple-800'
                      : audit.status === 'In Progress'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {audit.status}
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Independent Auditor:</span>{' '}
                <span className="font-bold text-slate-900">{audit.auditor}</span>
              </div>

              <p className="mt-2 text-[11px] text-slate-500 line-clamp-2">
                Scope: {audit.scope}
              </p>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">
                    Audit Evidence Sampling Progress
                  </span>
                  <span className="font-black text-indigo-700">{audit.progress}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      audit.progress >= 90
                        ? 'bg-emerald-500'
                        : audit.progress >= 50
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                    }`}
                    style={{ width: `${audit.progress}%` }}
                  />
                </div>
              </div>

              {/* Findings & Dates */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Findings:
                  </span>
                  {totalFindings === 0 ? (
                    <span className="text-[11px] font-bold text-emerald-600">
                      Clean (0)
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                      {audit.findings.high > 0 && (
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-rose-800">
                          {audit.findings.high} High
                        </span>
                      )}
                      {audit.findings.medium > 0 && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                          {audit.findings.medium} Med
                        </span>
                      )}
                      {audit.findings.low > 0 && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                          {audit.findings.low} Low
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {audit.startDate} → {audit.endDate}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
