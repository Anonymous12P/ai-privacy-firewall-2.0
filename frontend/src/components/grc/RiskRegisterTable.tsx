import { useMemo, useState } from 'react'
import {
  AdjustmentsHorizontalIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { RiskCategory, RiskItem } from '../../types/grc'

interface RiskRegisterTableProps {
  risks: RiskItem[]
  selectedRiskFromHeatmap?: RiskItem | null
}

export function RiskRegisterTable({
  risks,
  selectedRiskFromHeatmap,
}: RiskRegisterTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [sortField, setSortField] = useState<'riskScore' | 'impact' | 'likelihood' | 'dueDate'>('riskScore')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activeModalRisk, setActiveModalRisk] = useState<RiskItem | null>(
    selectedRiskFromHeatmap ?? null,
  )

  const categories = useMemo(() => {
    const set = new Set<RiskCategory>()
    risks.forEach((r) => set.add(r.category))
    return Array.from(set)
  }, [risks])

  const filteredRisks = useMemo(() => {
    return risks
      .filter((r) => {
        const matchesSearch =
          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.businessUnit.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory =
          categoryFilter === 'ALL' || r.category === categoryFilter
        const matchesStatus =
          statusFilter === 'ALL' || r.status === statusFilter
        const matchesSeverity =
          severityFilter === 'ALL' || r.severity === severityFilter

        return matchesSearch && matchesCategory && matchesStatus && matchesSeverity
      })
      .sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1
        if (sortField === 'dueDate') {
          return a.dueDate.localeCompare(b.dueDate) * factor
        }
        return (a[sortField] - b[sortField]) * factor
      })
  }, [risks, searchTerm, categoryFilter, statusFilter, severityFilter, sortField, sortOrder])

  const toggleSort = (field: 'riskScore' | 'impact' | 'likelihood' | 'dueDate') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  return (
    <Card className="p-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Enterprise Risk Register
            </h3>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              {filteredRisks.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Multi-dimensional risk scoring, organizational ownership, treatment tracking, and regulatory governance.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search risk, owner, unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
            <option value="Mitigated">Mitigated</option>
            <option value="Accepted">Accepted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3.5 py-3">Risk ID</th>
              <th className="px-3.5 py-3">Risk Name & Category</th>
              <th className="px-3.5 py-3">Business Unit & Owner</th>
              <th
                className="cursor-pointer px-3.5 py-3 hover:text-indigo-600"
                onClick={() => toggleSort('likelihood')}
              >
                <div className="flex items-center gap-1">
                  <span>Likelihood</span>
                  <ChevronUpDownIcon className="h-3 w-3" />
                </div>
              </th>
              <th
                className="cursor-pointer px-3.5 py-3 hover:text-indigo-600"
                onClick={() => toggleSort('impact')}
              >
                <div className="flex items-center gap-1">
                  <span>Impact</span>
                  <ChevronUpDownIcon className="h-3 w-3" />
                </div>
              </th>
              <th
                className="cursor-pointer px-3.5 py-3 hover:text-indigo-600"
                onClick={() => toggleSort('riskScore')}
              >
                <div className="flex items-center gap-1">
                  <span>Score / Severity</span>
                  <ChevronUpDownIcon className="h-3 w-3" />
                </div>
              </th>
              <th className="px-3.5 py-3">Strategy</th>
              <th className="px-3.5 py-3">Status</th>
              <th
                className="cursor-pointer px-3.5 py-3 hover:text-indigo-600"
                onClick={() => toggleSort('dueDate')}
              >
                <div className="flex items-center gap-1">
                  <span>Due Date</span>
                  <ChevronUpDownIcon className="h-3 w-3" />
                </div>
              </th>
              <th className="px-3.5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRisks.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No enterprise risks match the current filter parameters.
                </td>
              </tr>
            ) : (
              filteredRisks.map((risk) => (
                <tr
                  key={risk.id}
                  className="transition hover:bg-slate-50/80 cursor-pointer"
                  onClick={() => setActiveModalRisk(risk)}
                >
                  <td className="px-3.5 py-3 font-mono font-bold text-indigo-700">
                    {risk.id}
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="font-bold text-slate-900 line-clamp-1">
                      {risk.name}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {risk.category}
                    </span>
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="font-semibold text-slate-800">
                      {risk.owner}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {risk.businessUnit}
                    </span>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="font-bold text-slate-800">
                      L{risk.likelihood}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ 5</span>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="font-bold text-slate-800">
                      I{risk.impact}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ 5</span>
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900">
                        {risk.riskScore}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          risk.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : risk.severity === 'High'
                              ? 'bg-orange-100 text-orange-800'
                              : risk.severity === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {risk.severity}
                      </span>
                    </div>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {risk.treatmentStrategy}
                    </span>
                  </td>
                  <td className="px-3.5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        risk.status === 'Open'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : risk.status === 'In Review'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : risk.status === 'Mitigated'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {risk.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 font-mono text-[11px] text-slate-600">
                    {risk.dueDate}
                  </td>
                  <td className="px-3.5 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveModalRisk(risk)
                      }}
                      className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Risk Details Modal */}
      {activeModalRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600">
                    {activeModalRisk.id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      activeModalRisk.severity === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : activeModalRisk.severity === 'High'
                          ? 'bg-orange-100 text-orange-800'
                          : activeModalRisk.severity === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {activeModalRisk.severity} (Score {activeModalRisk.riskScore}/25)
                  </span>
                </div>
                <h3 className="mt-1 text-base font-bold text-slate-900">
                  {activeModalRisk.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalRisk(null)}
                className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-slate-50 p-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">CATEGORY</span>
                  <span className="font-bold text-slate-800">{activeModalRisk.category}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">BUSINESS UNIT</span>
                  <span className="font-bold text-slate-800">{activeModalRisk.businessUnit}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">RISK OWNER</span>
                  <span className="font-bold text-slate-800">{activeModalRisk.owner}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">STATUS</span>
                  <span className="font-bold text-indigo-700">{activeModalRisk.status}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Risk Narrative</span>
                <p className="mt-1 leading-relaxed text-slate-700">
                  {activeModalRisk.description}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Mitigation & Treatment Action</span>
                <div className="mt-1 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-indigo-900 font-medium">
                  {activeModalRisk.mitigationPlan}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Affected Enterprise Assets</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {activeModalRisk.affectedAssets.map((asset) => (
                    <span
                      key={asset}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] text-slate-700 shadow-2xs"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setActiveModalRisk(null)}
                className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
