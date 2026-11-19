import {
  AdjustmentsHorizontalIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../components/Card'
import { useFirewallStatus } from '../hooks/useFirewall'
import { useSettings } from '../hooks/useSettings'
import type { RefreshInterval } from '../store/SettingsContext'

export function SettingsPage() {
  const {
    refreshInterval,
    setRefreshInterval,
  } = useSettings()

  const { data: statusData } = useFirewallStatus()
  const isEnforcing = statusData?.mode !== 'MONITOR_ONLY'

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Module Header Banner */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
            SYSTEM PREFERENCES
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Privacy Shield Technologies Pvt. Ltd.
          </span>
        </div>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Firewall Platform & SOC Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Configure real-time enforcement postures, automated telemetry polling rates, model endpoints, and session security.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Operating Posture */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Firewall Enforcement Posture
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div>
              <span className="font-bold text-sm text-slate-900">
                {isEnforcing ? 'Active Enforcement (Standard Production)' : 'Audit / Monitor Mode Only'}
              </span>
              <p className="mt-1 text-xs text-slate-500 max-w-xl">
                {isEnforcing
                  ? 'High-confidence insider threats (>75% risk) are actively intercepted and blocked with HTTP 403 Forbidden.'
                  : 'Threats are logged into the immutable audit trail without dropping user connections.'}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-mono font-bold uppercase ${
                isEnforcing
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isEnforcing ? 'ENFORCING' : 'MONITOR'}
            </span>
          </div>
        </Card>

        {/* Polling Interval */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Telemetry Polling & Live Refresh Interval
            </h2>
          </div>

          <p className="text-xs text-slate-500">
            Define background query frequency for live risk feeds and UBA audit telemetry.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: '10 Seconds', value: 10000 },
              { label: '30 Seconds', value: 30000 },
              { label: '60 Seconds', value: 60000 },
              { label: 'Manual Only', value: 0 },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRefreshInterval(option.value as RefreshInterval)}
                className={`rounded-xl border p-3.5 text-center text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  refreshInterval === option.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Organization Identity */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Enterprise Tenant Identity & Scope
            </h2>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Tenant Legal Entity:</span>
              <span className="font-bold text-slate-900">Privacy Shield Technologies Pvt. Ltd.</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Research Division:</span>
              <span className="font-medium text-slate-900">AI Privacy Firewall Research Lab</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Primary Monitored Personnel:</span>
              <span className="font-mono font-bold text-blue-600">8 Employees (Active Roster)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Zero Trust Framework:</span>
              <span className="font-bold text-emerald-700">NIST SP 800-207 Aligned</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="font-semibold text-slate-500">Backend API Gateway:</span>
              <span className="font-mono text-slate-700">http://127.0.0.1:8000/api/v1</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
