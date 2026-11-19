import {
  ClockIcon,
  ComputerDesktopIcon,
  FingerPrintIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import type { EmployeeProfile } from '../../types/organization'
import { FirewallActionBadge } from '../FirewallActionBadge'
import { RiskBadge } from '../RiskBadge'

interface EmployeeDetailModalProps {
  employee: EmployeeProfile | null
  onClose: () => void
}

export function EmployeeDetailModal({ employee, onClose }: EmployeeDetailModalProps) {
  if (!employee) return null

  const totalDecisions =
    employee.firewallDecisions.allowed +
    employee.firewallDecisions.warned +
    employee.firewallDecisions.restricted +
    employee.firewallDecisions.blocked

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Profile Banner */}
        <div className="border-b border-slate-100 bg-linear-to-r from-indigo-50/70 via-white to-slate-50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-indigo-600/20 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{employee.name}</h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                  {employee.department}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600">{employee.role}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{employee.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                Risk Classification
              </span>
              <div className="mt-1 flex justify-end">
                <RiskBadge risk={employee.riskLevel} />
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="max-h-[72vh] overflow-y-auto p-6 space-y-6">
          {/* Key Employee Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
                <ComputerDesktopIcon className="h-4 w-4 text-indigo-600" />
                <span>Current Device</span>
              </div>
              <div className="mt-1 text-xs font-bold text-slate-900">
                {employee.currentDevice}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
                <ClockIcon className="h-4 w-4 text-indigo-600" />
                <span>Last Authenticated</span>
              </div>
              <div className="mt-1 text-xs font-mono font-bold text-slate-900">
                {employee.lastLogin}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
                <FingerPrintIcon className="h-4 w-4 text-indigo-600" />
                <span>MFA Status</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Hardware FIDO2 Enforced
              </div>
            </div>
          </div>

          {/* Risk Score Progress Meter */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Behavioral Risk Index</span>
              <span className="font-mono text-slate-900">{employee.riskScore} / 100</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full transition-all duration-500 ${
                  employee.riskScore >= 75
                    ? 'bg-rose-500'
                    : employee.riskScore >= 50
                      ? 'bg-amber-500'
                      : employee.riskScore >= 25
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(employee.riskScore, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Assessed via AI classifier against organizational role baseline and historical exfiltration models.
            </p>
          </div>

          {/* Firewall Decisions Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Cumulative Firewall Decisions ({totalDecisions} requests)
            </span>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                <span className="block font-mono text-lg font-bold text-emerald-700">
                  {employee.firewallDecisions.allowed}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Allowed</span>
              </div>
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-2">
                <span className="block font-mono text-lg font-bold text-yellow-800">
                  {employee.firewallDecisions.warned}
                </span>
                <span className="text-[10px] font-bold text-yellow-850 uppercase">Warned</span>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                <span className="block font-mono text-lg font-bold text-amber-700">
                  {employee.firewallDecisions.restricted}
                </span>
                <span className="text-[10px] font-bold text-amber-800 uppercase">Restricted</span>
              </div>
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2">
                <span className="block font-mono text-lg font-bold text-rose-700">
                  {employee.firewallDecisions.blocked}
                </span>
                <span className="text-[10px] font-bold text-rose-800 uppercase">Blocked</span>
              </div>
            </div>
          </div>

          {/* Recent Requests Table */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Recent Access Requests
            </span>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Resource</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Decision</th>
                    <th className="px-3 py-2">Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {employee.recentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80">
                      <td className="px-3 py-2 font-mono text-slate-500">{req.timestamp}</td>
                      <td className="px-3 py-2 font-bold text-slate-900">{req.resource}</td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono">
                          {req.action}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <FirewallActionBadge action={req.decision} />
                      </td>
                      <td className="px-3 py-2 text-slate-500">{req.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Behavior Timeline */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Behavioral Activity Timeline
            </span>
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
              {employee.behaviorTimeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <span className="font-mono text-slate-400 shrink-0 mt-0.5">{item.time}</span>
                  <div
                    className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                      item.severity === 'alert'
                        ? 'bg-rose-500'
                        : item.severity === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800">{item.event}</span>
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase font-mono text-slate-500">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex justify-between items-center text-xs text-slate-400">
          <span>Employee Profile ID: {employee.id}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
