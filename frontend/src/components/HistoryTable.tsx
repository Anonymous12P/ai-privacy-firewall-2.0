import { HistoryCard } from './HistoryCard'
import { HistoryRow } from './HistoryRow'
import type { ScanResponse } from '../types/api'

export function HistoryTable({ scans, onView, onDelete }: { scans: ScanResponse[]; onView: (scan: ScanResponse) => void; onDelete: (scan: ScanResponse) => void }) {
  return <><div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block"><table className="w-full min-w-[1000px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['Scan ID', 'URL', 'Prediction', 'Confidence', 'Risk', 'Model', 'Status', 'Created', 'Actions'].map((header) => <th className="px-4 py-3 font-semibold" key={header}>{header}</th>)}</tr></thead><tbody>{scans.map((scan) => <HistoryRow key={scan.scan_id} scan={scan} onView={() => onView(scan)} onDelete={() => onDelete(scan)} />)}</tbody></table></div><div className="grid gap-3 md:hidden">{scans.map((scan) => <HistoryCard key={scan.scan_id} scan={scan} onView={() => onView(scan)} onDelete={() => onDelete(scan)} />)}</div></>
}
