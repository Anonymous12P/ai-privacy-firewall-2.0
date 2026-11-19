import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button } from './Button'
import { RiskBadge } from './RiskBadge'
import { StatusIndicator } from './StatusIndicator'
import type { ScanResponse } from '../types/api'

export function HistoryRow({ scan, onView, onDelete }: { scan: ScanResponse; onView: () => void; onDelete: () => void }) {
  return <tr className="border-t border-slate-100 text-sm"><td className="max-w-40 truncate px-4 py-4 font-mono text-xs">{scan.scan_id}</td><td className="max-w-44 truncate px-4 py-4">{scan.url ?? '—'}</td><td className="px-4 py-4">{scan.prediction === null ? '—' : String(scan.prediction)}</td><td className="px-4 py-4">{scan.confidence === null ? '—' : `${Math.round(scan.confidence * 100)}%`}</td><td className="px-4 py-4"><RiskBadge risk={scan.risk_level} /></td><td className="px-4 py-4">{scan.model_name ?? '—'}</td><td className="px-4 py-4"><StatusIndicator status={scan.status} /></td><td className="whitespace-nowrap px-4 py-4">{new Date(scan.created_at).toLocaleString()}</td><td className="px-4 py-4"><div className="flex gap-1"><Button className="bg-slate-100 p-2 text-slate-700 hover:bg-slate-200" aria-label="View details" onClick={onView}><EyeIcon className="h-4 w-4" /></Button><Button className="bg-rose-50 p-2 text-rose-700 hover:bg-rose-100" aria-label="Delete scan" onClick={onDelete}><TrashIcon className="h-4 w-4" /></Button></div></td></tr>
}
