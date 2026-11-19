import { XMarkIcon } from '@heroicons/react/24/outline'
import { ConfidenceBar } from './ConfidenceBar'
import { RiskBadge } from './RiskBadge'
import { StatusIndicator } from './StatusIndicator'
import type { ScanResponse } from '../types/api'

export function HistoryDetailsDrawer({ scan, onClose }: { scan: ScanResponse | null; onClose: () => void }) {
  if (!scan) return null
  return <div className="fixed inset-0 z-40 bg-slate-950/30" onClick={onClose}><aside className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Scan details</h2><button aria-label="Close details" onClick={onClose}><XMarkIcon className="h-6 w-6" /></button></div><div className="mt-8 grid gap-6"><div className="flex items-center justify-between"><StatusIndicator status={scan.status} /><RiskBadge risk={scan.risk_level} /></div><dl className="grid gap-4 text-sm"><div><dt className="text-slate-400">Scan ID</dt><dd className="mt-1 break-all font-mono">{scan.scan_id}</dd></div><div><dt className="text-slate-400">Prediction</dt><dd className="mt-1 font-semibold">{scan.prediction === null ? '—' : String(scan.prediction)}</dd></div><div><dt className="text-slate-400">Model</dt><dd className="mt-1">{scan.model_name ?? '—'}</dd></div><div><dt className="text-slate-400">Timestamp</dt><dd className="mt-1">{new Date(scan.created_at).toLocaleString()}</dd></div></dl><ConfidenceBar confidence={scan.confidence} /><div><p className="text-sm text-slate-400">Explanation</p><p className="mt-1 text-sm leading-6 text-slate-700">{scan.explanation_summary ?? 'No explanation summary was returned.'}</p></div></div></aside></div>
}
