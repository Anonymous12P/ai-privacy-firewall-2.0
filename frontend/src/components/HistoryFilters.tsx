import type { RiskLevel, ScanStatus } from '../types/api'

export interface HistoryFilterValues {
  status: ScanStatus | 'all'
  risk: RiskLevel | 'all'
  model: string
  search: string
}

export function HistoryFilters({ values, onChange }: { values: HistoryFilterValues; onChange: (values: HistoryFilterValues) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Search URL" value={values.search} onChange={(event) => onChange({ ...values, search: event.target.value })} />
    <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={values.status} onChange={(event) => onChange({ ...values, status: event.target.value as HistoryFilterValues['status'] })}><option value="all">All statuses</option><option value="PENDING">Queued</option><option value="RUNNING">Processing</option><option value="COMPLETED">Completed</option><option value="FAILED">Failed</option></select>
    <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={values.risk} onChange={(event) => onChange({ ...values, risk: event.target.value as HistoryFilterValues['risk'] })}><option value="all">All risk levels</option><option value="low">Low risk</option><option value="medium">Medium risk</option><option value="high">High risk</option></select>
    <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Model (when available)" value={values.model} onChange={(event) => onChange({ ...values, model: event.target.value })} />
  </div>
}
