export function PredictionBadge({ prediction }: { prediction: string | number | boolean | null }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
      {prediction === null ? 'Unavailable' : String(prediction)}
    </span>
  )
}
