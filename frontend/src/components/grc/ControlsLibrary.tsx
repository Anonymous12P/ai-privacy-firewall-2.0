import { useMemo, useState } from 'react'
import {
  CheckBadgeIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { SecurityControl } from '../../types/grc'

interface ControlsLibraryProps {
  controls: SecurityControl[]
}

export function ControlsLibrary({ controls }: ControlsLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const filteredControls = useMemo(() => {
    return controls.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFramework =
        selectedFramework === 'ALL' || c.framework === selectedFramework
      const matchesStatus =
        statusFilter === 'ALL' || c.status === statusFilter

      return matchesSearch && matchesFramework && matchesStatus
    })
  }, [controls, searchTerm, selectedFramework, statusFilter])

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Security Controls Library & Evidence Catalog
            </h3>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              {filteredControls.length} Controls Active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Automated verification checks, auditor evidence artifacts, and control ownership tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search controls, evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Frameworks</option>
            <option value="ISO 27001">ISO 27001</option>
            <option value="NIST CSF">NIST CSF</option>
            <option value="SOC 2">SOC 2</option>
            <option value="GDPR">GDPR</option>
            <option value="HIPAA">HIPAA</option>
            <option value="PCI-DSS">PCI-DSS</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Implemented">Implemented</option>
            <option value="Partially Implemented">Partially Implemented</option>
            <option value="Testing">Testing</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3.5 py-3">Control ID</th>
              <th className="px-3.5 py-3">Framework</th>
              <th className="px-3.5 py-3">Category</th>
              <th className="px-3.5 py-3">Description & Evidence</th>
              <th className="px-3.5 py-3">Owner</th>
              <th className="px-3.5 py-3">Status</th>
              <th className="px-3.5 py-3">Automated</th>
              <th className="px-3.5 py-3">Last Tested</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredControls.map((ctrl) => (
              <tr key={ctrl.id} className="hover:bg-slate-50/60 transition">
                <td className="px-3.5 py-3 font-mono font-bold text-indigo-700">
                  {ctrl.id}
                </td>
                <td className="px-3.5 py-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-[10px] text-slate-800">
                    {ctrl.framework}
                  </span>
                </td>
                <td className="px-3.5 py-3 font-medium text-slate-800">
                  {ctrl.category}
                </td>
                <td className="px-3.5 py-3 max-w-md">
                  <p className="font-semibold text-slate-900">{ctrl.description}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 font-mono italic">
                    Evidence: {ctrl.evidence}
                  </p>
                </td>
                <td className="px-3.5 py-3 font-medium text-slate-800">
                  {ctrl.owner}
                </td>
                <td className="px-3.5 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      ctrl.status === 'Implemented'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ctrl.status === 'Partially Implemented'
                          ? 'bg-amber-100 text-amber-800'
                          : ctrl.status === 'Testing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {ctrl.status === 'Implemented' ? (
                      <CheckCircleIcon className="h-3 w-3" />
                    ) : (
                      <ClockIcon className="h-3 w-3" />
                    )}
                    {ctrl.status}
                  </span>
                </td>
                <td className="px-3.5 py-3">
                  {ctrl.automatedVerification ? (
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                      TELEMETRY AUTO
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                      MANUAL AUDIT
                    </span>
                  )}
                </td>
                <td className="px-3.5 py-3 font-mono text-[11px] text-slate-600">
                  {ctrl.lastTested}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
