import {
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Card } from '../components/Card'
import { RiskBadge } from '../components/RiskBadge'
import { EMPLOYEES } from '../data/organizationData'
import type { EmployeeProfile } from '../types/organization'

export function EmployeesPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null)
  const [filterDepartment, setFilterDepartment] = useState('ALL')

  const filteredEmployees = EMPLOYEES.filter((emp) => {
    if (filterDepartment !== 'ALL' && emp.department !== filterDepartment) return false
    return true
  })

  return (
    <div className="space-y-8">
      {/* Module Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
              IDENTITY & ACCESS MANAGEMENT
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Privacy Shield Technologies Pvt. Ltd.
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Personnel Directory & Security Profiles
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            8 monitored enterprise personnel with assigned hardware endpoints, UBA behavior scores, and real-time risk ratings.
          </p>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'Engineering', 'Operations', 'Data Science', 'Compliance', 'Finance'].map(
            (dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setFilterDepartment(dept)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  filterDepartment === dept
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {dept}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Grid of 8 Employee Profile Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {filteredEmployees.map((emp) => (
          <Card
            key={emp.id}
            onClick={() => setSelectedEmployee(emp)}
            className="cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-blue-300 transition-all duration-300 p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-sm border border-blue-100 shadow-2xs">
                  {emp.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <RiskBadge
                  risk={
                    emp.riskScore > 0.75
                      ? 'Critical'
                      : emp.riskScore > 0.4
                        ? 'High'
                        : emp.riskScore > 0.2
                          ? 'Medium'
                          : 'Low'
                  }
                />
              </div>

              <div className="mt-4">
                <h3 className="text-base font-extrabold text-slate-900">{emp.name}</h3>
                <p className="text-xs font-medium text-slate-500">{emp.designation}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-600 font-semibold">
                  <UserGroupIcon className="h-3.5 w-3.5" />
                  <span>{emp.department}</span>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{emp.location}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 truncate">
                  <EnvelopeIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Behavior</span>
                <span className="font-bold text-slate-900">{emp.behaviorScore}/100</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-sans">Threat Score</span>
                <span
                  className={`font-bold ${
                    emp.riskScore > 0.75
                      ? 'text-rose-600'
                      : emp.riskScore > 0.4
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                  }`}
                >
                  {(emp.riskScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Employee Detail Drawer */}
      {selectedEmployee && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    PERSONNEL SECURITY DOSSIER
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {selectedEmployee.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Attributes List */}
              <div className="mt-6 space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Employee ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedEmployee.id}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Department:</span>
                  <span className="font-bold text-slate-900">{selectedEmployee.department}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Designation:</span>
                  <span className="font-medium text-slate-900">{selectedEmployee.designation}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Email:</span>
                  <span className="font-mono text-blue-600">{selectedEmployee.email}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-800">{selectedEmployee.phone}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Assigned Device:</span>
                  <span className="font-medium text-slate-900">{selectedEmployee.device}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Physical Location:</span>
                  <span className="font-medium text-slate-900">{selectedEmployee.location}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-700">{selectedEmployee.status}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Risk Score:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {(selectedEmployee.riskScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-slate-500">Behavior Score:</span>
                  <span className="font-mono font-bold text-blue-600">
                    {selectedEmployee.behaviorScore}/100
                  </span>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Recent Activity Timeline
                  </span>
                </div>

                <div className="space-y-3 pl-3 border-l-2 border-slate-200 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">MFA SSO Session Verified</p>
                    <p className="text-[11px] text-slate-500">Today at 10:14 AM • IP 10.0.2.14</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Corporate WireGuard Tunnel Engaged</p>
                    <p className="text-[11px] text-slate-500">Today at 09:30 AM • Latency 14ms</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Zero Trust Policy Check Succeeded</p>
                    <p className="text-[11px] text-slate-500">Today at 09:31 AM • RULE-DEFAULT-ALLOW-04</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
