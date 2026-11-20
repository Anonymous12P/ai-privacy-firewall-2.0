import {
  ClockIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { RiskBadge } from '../components/RiskBadge'
import { EMPLOYEES } from '../data/organizationData'
import type { EmployeeProfile, OrgDepartment } from '../types/organization'
import {
  formatThreatScore,
  getThreatBadgeClasses,
  getThreatLevel,
} from '../utils/threatScore'

const DEPARTMENTS: (OrgDepartment | 'ALL')[] = [
  'ALL',
  'Engineering',
  'Security',
  'SOC',
  'Threat Intelligence',
  'Compliance',
  'DevOps',
  'Cloud',
  'Infrastructure',
  'AI Research',
  'HR',
  'Finance',
  'Legal',
  'Marketing',
]

export function EmployeesPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null)
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const counts = useMemo(() => {
    return {
      total: EMPLOYEES.length,
      active: EMPLOYEES.filter((e) => e.status === 'Active').length,
      watch: EMPLOYEES.filter((e) => e.status === 'Under Watch').length,
      investigating: EMPLOYEES.filter((e) => e.status === 'Investigating').length,
      suspended: EMPLOYEES.filter((e) => e.status === 'Suspended').length,
    }
  }, [])

  const filteredEmployees = useMemo(() => {
    return EMPLOYEES.filter((emp) => {
      if (filterDepartment !== 'ALL' && emp.department !== filterDepartment) return false
      if (statusFilter !== 'ALL' && emp.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = emp.name.toLowerCase().includes(query)
        const matchesRole = emp.role.toLowerCase().includes(query)
        const matchesDept = emp.department.toLowerCase().includes(query)
        const matchesId = emp.id.toLowerCase().includes(query)
        const matchesEmail = emp.email.toLowerCase().includes(query)
        if (!matchesName && !matchesRole && !matchesDept && !matchesId && !matchesEmail) {
          return false
        }
      }
      return true
    })
  }, [filterDepartment, statusFilter, searchQuery])

  return (
    <div className="space-y-6">
      {/* Module Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
              IDENTITY & BEHAVIOR ANALYTICS
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Enterprise Digital Twin Directory
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Personnel Directory & Security Profiles
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            {EMPLOYEES.length} monitored personnel across 13 departments with hardware trust attestations, continuous UBA behavior baselines, and real-time AI threat scores.
          </p>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition cursor-pointer border ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All: <strong className="font-mono">{counts.total}</strong>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Active' ? 'ALL' : 'Active')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition cursor-pointer border ${
              statusFilter === 'Active'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Active (Normal): <strong className="font-mono">{counts.active}</strong>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Under Watch' ? 'ALL' : 'Under Watch')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition cursor-pointer border ${
              statusFilter === 'Under Watch'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            Watch: <strong className="font-mono">{counts.watch}</strong>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Investigating' ? 'ALL' : 'Investigating')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition cursor-pointer border ${
              statusFilter === 'Investigating'
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
            }`}
          >
            High Risk: <strong className="font-mono">{counts.investigating}</strong>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Suspended' ? 'ALL' : 'Suspended')}
            className={`rounded-xl px-3 py-1.5 font-semibold transition cursor-pointer border ${
              statusFilter === 'Suspended'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            Suspended (Critical): <strong className="font-mono">{counts.suspended}</strong>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, email, ID..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Department Filter Tabs */}
        <div className="flex w-full md:w-auto items-center gap-1.5 overflow-x-auto pb-1">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setFilterDepartment(dept)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap shadow-2xs ${
                filterDepartment === dept
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Showing <strong className="text-slate-800 font-mono">{filteredEmployees.length}</strong> of {EMPLOYEES.length} personnel</span>
      </div>

      {/* Grid of Employee Profile Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filteredEmployees.map((emp) => {
          const badgeStyles = getThreatBadgeClasses(emp.riskScore)
          const threatLevel = getThreatLevel(emp.riskScore)

          return (
            <Card
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className="cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-slate-200 shadow-xs"
                      onError={(e) => {
                        // Fallback to initials avatar if image network blocked
                        const target = e.currentTarget
                        target.style.display = 'none'
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = 'flex'
                        }
                      }}
                    />
                    <div
                      style={{ display: 'none' }}
                      className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold text-sm border border-indigo-100 shadow-2xs"
                    >
                      {emp.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                  </div>
                  <RiskBadge risk={threatLevel} />
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-extrabold text-slate-900">{emp.name}</h3>
                  <p className="text-xs font-medium text-slate-500 line-clamp-1">{emp.designation}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-indigo-600 font-semibold">
                    <UserGroupIcon className="h-3.5 w-3.5" />
                    <span>{emp.department}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.location}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 truncate">
                    <EnvelopeIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Behavior</span>
                  <span className="font-bold text-slate-900">{emp.behaviorScore}/100</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-sans">Threat Score</span>
                  <span className={`font-bold ${badgeStyles.text}`}>
                    {formatThreatScore(emp.riskScore)}
                  </span>
                </div>
              </div>
            </Card>
          )
        })}
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
                <div className="flex items-center gap-3">
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      PERSONNEL SECURITY DOSSIER
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {selectedEmployee.name}
                    </h2>
                  </div>
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
                  <span className="font-mono text-indigo-600">{selectedEmployee.email}</span>
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
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    selectedEmployee.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : selectedEmployee.status === 'Under Watch'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : selectedEmployee.status === 'Investigating'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {selectedEmployee.status}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Threat Score:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatThreatScore(selectedEmployee.riskScore)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-slate-500">Behavior Score:</span>
                  <span className="font-mono font-bold text-indigo-600">
                    {selectedEmployee.behaviorScore}/100
                  </span>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <ClockIcon className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Behavior Timeline
                  </span>
                </div>

                <div className="space-y-3 pl-3 border-l-2 border-slate-200 text-xs">
                  {selectedEmployee.behaviorTimeline.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="font-bold text-slate-900">{item.event}</p>
                      <p className="text-[11px] text-slate-500">{item.time} • Type: {item.type} ({item.severity})</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Firewall Decisions */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block mb-2">
                  Firewall Decisions
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="block font-bold text-emerald-700 font-mono">{selectedEmployee.firewallDecisions.allowed}</span>
                    <span className="text-[10px] text-emerald-800">Allowed</span>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                    <span className="block font-bold text-yellow-800 font-mono">{selectedEmployee.firewallDecisions.warned}</span>
                    <span className="text-[10px] text-yellow-850">Warned</span>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">
                    <span className="block font-bold text-orange-700 font-mono">{selectedEmployee.firewallDecisions.restricted}</span>
                    <span className="text-[10px] text-orange-800">Restricted</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                    <span className="block font-bold text-rose-700 font-mono">{selectedEmployee.firewallDecisions.blocked}</span>
                    <span className="text-[10px] text-rose-800">Blocked</span>
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
