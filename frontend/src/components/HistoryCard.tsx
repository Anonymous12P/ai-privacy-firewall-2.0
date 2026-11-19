import { Button } from './Button'
import { RiskBadge } from './RiskBadge'
import { StatusIndicator } from './StatusIndicator'
import type { ScanResponse } from '../types/api'

export function HistoryCard({ scan, onView, onDelete }: { scan: ScanResponse; onView: () => void; onDelete: () => void }) {
  return <article className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><span className="break-all font-mono text-xs text-slate-500">{scan.scan_id}</span><StatusIndicator status={scan.status} /></div><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-slate-400">Prediction</p><p className="mt-1 font-semibold">{scan.prediction === null ? '—' : String(scan.prediction)}</p></div><div><p className="text-xs text-slate-400">Risk</p><div className="mt-1"><RiskBadge risk={scan.risk_level} /></div></div><div><p className="text-xs text-slate-400">Confidence</p><p className="mt-1">{scan.confidence === null ? '—' : `${Math.round(scan.confidence * 100)}%`}</p></div><div><p className="text-xs text-slate-400">Model</p><p className="mt-1">{scan.model_name ?? '—'}</p></div></div><p className="text-xs text-slate-400">{new Date(scan.created_at).toLocaleString()}</p><div className="flex gap-2"><Button className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={onView}>View details</Button><Button className="bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={onDelete}>Delete</Button></div></article>
}
