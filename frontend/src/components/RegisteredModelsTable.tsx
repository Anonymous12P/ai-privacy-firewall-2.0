import type { AdminModel } from '../types/api'
import { Card } from './Card'

export function RegisteredModelsTable({ models }: { models: AdminModel[] }) {
  return <Card><h2 className="font-semibold text-slate-900">Registered models</h2>{models.length === 0 ? <p className="mt-5 text-sm text-slate-500">No models registered.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="text-xs uppercase tracking-wide text-slate-400"><tr><th className="py-3">Name</th><th className="py-3">Availability</th><th className="py-3">Persisted</th><th className="py-3">Metadata</th></tr></thead><tbody>{models.map((model) => <tr className="border-t border-slate-100" key={model.name}><td className="py-3 font-medium">{model.name}</td><td className="py-3"><StatusPill active={model.available} /></td><td className="py-3"><StatusPill active={model.persisted} /></td><td className="max-w-56 truncate py-3 text-xs text-slate-500">{model.metadata ? JSON.stringify(model.metadata) : '—'}</td></tr>)}</tbody></table></div>}</Card>
}

function StatusPill({ active }: { active: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{active ? 'Yes' : 'No'}</span>
}
