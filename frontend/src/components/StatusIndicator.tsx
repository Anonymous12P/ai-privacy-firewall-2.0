import type { ScanStatus } from '../types/api'

const labels: Record<ScanStatus, string> = {
  PENDING: 'Queued',
  RUNNING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
}

export function StatusIndicator({ status }: { status: ScanStatus }) {
  const active = status === 'PENDING' || status === 'RUNNING'
  return <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><span className={`h-2.5 w-2.5 rounded-full ${active ? 'animate-pulse bg-indigo-500' : status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-rose-500'}`} />{labels[status]}</span>
}
