import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { Card } from './Card'

export function SystemHealthCard({ apiOnline, authenticationEnabled, routes }: { apiOnline: boolean; authenticationEnabled: boolean; routes: number }) {
  return <Card><h2 className="font-semibold text-slate-900">System health</h2><div className="mt-5 grid gap-4 text-sm"><div className="flex items-center justify-between"><span>API status</span><span className={apiOnline ? 'text-emerald-600' : 'text-rose-600'}>{apiOnline ? 'Operational' : 'Unavailable'}</span></div><div className="flex items-center justify-between"><span>Authentication</span><span className="flex items-center gap-1 text-emerald-600">{authenticationEnabled && <CheckCircleIcon className="h-4 w-4" />} {authenticationEnabled ? 'Enabled' : 'Disabled'}</span></div><div className="flex items-center justify-between"><span>Registered routes</span><strong>{routes}</strong></div></div></Card>
}
