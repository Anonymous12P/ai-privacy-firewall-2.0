import { LoadingSpinner } from './LoadingSpinner'

export function LoadingOverlay({ label = 'Processing scan…' }: { label?: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700"><LoadingSpinner />{label}</div>
}
