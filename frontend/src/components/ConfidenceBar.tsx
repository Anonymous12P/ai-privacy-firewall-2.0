export function ConfidenceBar({ confidence }: { confidence: number | null }) {
  const percentage = confidence === null ? 0 : Math.round(confidence * 100)
  return <div className="grid gap-2"><div className="flex justify-between text-sm"><span className="text-slate-500">Confidence</span><span className="font-semibold text-slate-700">{confidence === null ? '—' : `${percentage}%`}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${percentage}%` }} /></div></div>
}
