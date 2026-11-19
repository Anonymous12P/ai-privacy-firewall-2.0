import { useMemo, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import { FirewallActionBadge } from '../FirewallActionBadge'
import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from '../../types/incident'

interface IncidentQueueProps {
  incidents: Incident[]
  selectedIncidentId: string | null
  onSelectIncident: (incident: Incident) => void
}

type SortField = 'createdTime' | 'threatScore' | 'severity' | 'id'

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  Critical: 'bg-rose-100 text-rose-800 border-rose-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const STATUS_COLORS: Record<IncidentStatus, string> = {
  Open: 'bg-rose-50 text-rose-700 border-rose-200',
  Investigating: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Contained: 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function IncidentQueue({
  incidents,
  selectedIncidentId,
  onSelectIncident,
}: IncidentQueueProps) {
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [sortField, setSortField] = useState<SortField>('createdTime')
  const [sortAsc, setSortAsc] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // Filter & Search
  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        search === '' ||
        inc.id.toLowerCase().includes(search.toLowerCase()) ||
        inc.title.toLowerCase().includes(search.toLowerCase()) ||
        inc.affectedUser.toLowerCase().includes(search.toLowerCase()) ||
        inc.targetResource.toLowerCase().includes(search.toLowerCase()) ||
        inc.department.toLowerCase().includes(search.toLowerCase())

      const matchesSeverity =
        severityFilter === 'All' || inc.severity === severityFilter
      const matchesStatus = statusFilter === 'All' || inc.status === statusFilter
      const matchesDept =
        departmentFilter === 'All' || inc.department === departmentFilter

      return matchesSearch && matchesSeverity && matchesStatus && matchesDept
    })
  }, [incidents, search, severityFilter, statusFilter, departmentFilter])

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comp = 0
      if (sortField === 'threatScore') {
        comp = a.threatScore - b.threatScore
      } else if (sortField === 'createdTime') {
        comp = a.createdTime.localeCompare(b.createdTime)
      } else if (sortField === 'id') {
        comp = a.id.localeCompare(b.id)
      } else if (sortField === 'severity') {
        const order: Record<IncidentSeverity, number> = {
          Critical: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        }
        comp = order[a.severity] - order[b.severity]
      }
      return sortAsc ? comp : -comp
    })
  }, [filtered, sortField, sortAsc])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  return (
    <Card className="p-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            SOC Incident Queue & Investigation Triage
          </h3>
          <p className="text-xs text-slate-500">
            Real-time security events captured by Explainable Adaptive AI Privacy Firewall.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search incident, user, resource..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-600">
          <FunnelIcon className="h-3.5 w-3.5 text-indigo-600" />
          <span>Filters:</span>
        </div>

        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700 font-medium"
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700 font-medium"
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Investigating">Investigating</option>
          <option value="Contained">Contained</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700 font-medium"
        >
          <option value="All">All Departments</option>
          <option value="Finance">Finance</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Engineering">Engineering</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Human Resources">Human Resources</option>
        </select>

        <span className="ml-auto text-slate-400">
          Showing {sorted.length} {sorted.length === 1 ? 'incident' : 'incidents'}
        </span>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th
                onClick={() => handleSort('id')}
                className="cursor-pointer py-2.5 font-semibold hover:text-indigo-600"
              >
                Incident ID {sortField === 'id' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('severity')}
                className="cursor-pointer py-2.5 font-semibold hover:text-indigo-600"
              >
                Severity {sortField === 'severity' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th className="py-2.5 font-semibold">Status</th>
              <th className="py-2.5 font-semibold">Department</th>
              <th className="py-2.5 font-semibold">Affected User</th>
              <th className="py-2.5 font-semibold">Target Resource</th>
              <th
                onClick={() => handleSort('threatScore')}
                className="cursor-pointer py-2.5 font-semibold text-right hover:text-indigo-600"
              >
                Threat Score {sortField === 'threatScore' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th className="py-2.5 font-semibold text-center">Decision</th>
              <th
                onClick={() => handleSort('createdTime')}
                className="cursor-pointer py-2.5 font-semibold text-right hover:text-indigo-600"
              >
                Created Time {sortField === 'createdTime' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th className="py-2.5 font-semibold">Assigned Analyst</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map((inc) => {
              const isSelected = inc.id === selectedIncidentId

              return (
                <tr
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className={`cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-50/80 font-medium'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3 font-mono font-bold text-indigo-700">
                    {inc.id}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 font-bold ${
                        SEVERITY_COLORS[inc.severity]
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 font-semibold text-[11px] ${
                        STATUS_COLORS[inc.status]
                      }`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-slate-800">
                    {inc.department}
                  </td>
                  <td className="py-3 font-semibold text-slate-900">
                    <div>
                      <p>{inc.affectedUser}</p>
                      <span className="text-[10px] font-normal text-slate-400">
                        {inc.role}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-slate-700 max-w-xs truncate">
                    {inc.targetResource}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`font-mono font-bold ${
                        inc.threatScore >= 75
                          ? 'text-rose-600'
                          : inc.threatScore >= 50
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {inc.threatScore}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <FirewallActionBadge action={inc.firewallDecision} />
                  </td>
                  <td className="py-3 text-right font-mono text-slate-500 text-[11px]">
                    {inc.createdTime.slice(11, 19)}
                  </td>
                  <td className="py-3 text-slate-600 text-[11px]">
                    {inc.assignedAnalyst.split(' ')[0]}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="cursor-pointer rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="cursor-pointer rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
