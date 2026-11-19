import { Card } from './Card'
import { ConfidenceBar } from './ConfidenceBar'
import { PredictionBadge } from './PredictionBadge'
import { RiskBadge } from './RiskBadge'
import { StatusIndicator } from './StatusIndicator'
import type { ScanResponse } from '../types/api'

type FirewallAction = 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK'

const actionStyles: Record<FirewallAction, { badge: string; banner: string; message: string }> = {
  ALLOW: {
    badge: 'bg-emerald-100 text-emerald-700',
    banner: 'bg-emerald-50 text-emerald-700',
    message: 'Access allowed by AI Privacy Firewall',
  },
  WARN: {
    badge: 'bg-yellow-100 text-yellow-800',
    banner: 'bg-yellow-50 text-yellow-800',
    message: 'Warning: AI Privacy Firewall detected elevated risk',
  },
  RESTRICT: {
    badge: 'bg-orange-100 text-orange-800',
    banner: 'bg-orange-50 text-orange-800',
    message: 'Access restricted by AI Privacy Firewall',
  },
  BLOCK: {
    badge: 'bg-rose-100 text-rose-700',
    banner: 'bg-rose-50 text-rose-700',
    message: 'Access Blocked by AI Privacy Firewall',
  },
}

function isFirewallAction(action: string | null): action is FirewallAction {
  return action !== null && action in actionStyles
}

export function ScanResultCard({ scan }: { scan: ScanResponse }) {
  const action = isFirewallAction(scan.firewall_action) ? scan.firewall_action : null
  return <Card className="grid gap-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Scan ID</p><p className="mt-1 break-all font-mono text-sm text-slate-700">{scan.scan_id}</p></div><StatusIndicator status={scan.status} /></div>
    {scan.status === 'FAILED' && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{scan.error ?? 'The scan could not be completed.'}</div>}
    {scan.status === 'COMPLETED' && <><div className="grid gap-4 sm:grid-cols-2"><div><p className="mb-2 text-sm text-slate-500">Prediction</p><PredictionBadge prediction={scan.prediction} /></div><div><p className="mb-2 text-sm text-slate-500">Risk level</p><RiskBadge risk={scan.risk_level} /></div></div><ConfidenceBar confidence={scan.confidence} /><div><p className="text-sm text-slate-500">Explanation summary</p><p className="mt-1 text-sm leading-6 text-slate-700">{scan.explanation_summary ?? 'No explanation summary was returned.'}</p></div>{action && <section className="grid gap-4 border-t border-slate-100 pt-5" aria-labelledby="privacy-firewall-heading"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="privacy-firewall-heading" className="text-lg font-semibold text-slate-900">Privacy Firewall Decision</h2><span className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${actionStyles[action].badge}`}>{action}</span></div><div className={`rounded-lg px-4 py-3 text-sm font-medium ${actionStyles[action].banner}`} role="status">{actionStyles[action].message}</div><div className="grid gap-3 text-sm"><div><p className="text-slate-500">Policy name</p><p className="mt-1 font-medium text-slate-700">{scan.policy_name ?? 'No policy name was returned.'}</p></div><div><p className="text-slate-500">Reasons</p>{scan.reasons.length > 0 ? <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">{scan.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : <p className="mt-1 text-slate-500">No specific reasons were returned.</p>}</div></div></section>}</>}
    <p className="text-xs text-slate-400">Created {new Date(scan.created_at).toLocaleString()}</p>
  </Card>
}
