import { useState } from 'react'
import { Card } from '../Card'
import type { PolicyEffectivenessRecord } from '../../types/analytics'

interface PolicyEffectivenessTableProps {
  data: PolicyEffectivenessRecord[]
}

type SortField = 'effectivenessRate' | 'matches' | 'blocks' | 'falsePositives' | 'executionTimeMs'

export function PolicyEffectivenessTable({ data }: PolicyEffectivenessTableProps) {
  const [sortField, setSortField] = useState<SortField>('effectivenessRate')
  const [sortAsc, setSortAsc] = useState<boolean>(false)

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortField]
    const valB = b[sortField]
    return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1
  })

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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Policy Enforcement & Mitigation Effectiveness
          </h3>
          <p className="text-xs text-slate-500">
            Evaluation of rule matches, true blocks, false alarms, and sub-millisecond evaluation latency.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          Click column headers to sort
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2.5 font-semibold">Policy Name</th>
              <th
                onClick={() => handleSort('matches')}
                className="cursor-pointer py-2.5 font-semibold text-right hover:text-indigo-600"
              >
                Matches {sortField === 'matches' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('blocks')}
                className="cursor-pointer py-2.5 font-semibold text-right hover:text-indigo-600"
              >
                Blocks {sortField === 'blocks' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('falsePositives')}
                className="cursor-pointer py-2.5 font-semibold text-right hover:text-indigo-600"
              >
                False Positives {sortField === 'falsePositives' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('executionTimeMs')}
                className="cursor-pointer py-2.5 font-semibold text-right hover:text-indigo-600"
              >
                Execution Time {sortField === 'executionTimeMs' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('effectivenessRate')}
                className="cursor-pointer py-2.5 font-semibold text-right hover:text-indigo-600"
              >
                Effectiveness {sortField === 'effectivenessRate' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((policy) => {
              const isHigh = policy.effectivenessRate >= 90
              const isMedium = policy.effectivenessRate >= 60

              return (
                <tr
                  key={policy.id}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="py-3 font-semibold text-slate-900 max-w-xs">
                    <div>
                      <p className="truncate">{policy.name}</p>
                      <span className="text-[10px] font-normal text-slate-400">
                        {policy.category} • {policy.id}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono font-medium text-slate-800">
                    {policy.matches}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-rose-600">
                    {policy.blocks}
                  </td>
                  <td className="py-3 text-right font-mono font-medium text-amber-600">
                    {policy.falsePositives}
                  </td>
                  <td className="py-3 text-right font-mono text-slate-600">
                    {policy.executionTimeMs.toFixed(1)} ms
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                        isHigh
                          ? 'bg-emerald-100 text-emerald-800'
                          : isMedium
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {policy.effectivenessRate}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
