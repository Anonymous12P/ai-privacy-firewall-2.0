import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { IocRecord, IocType } from '../../types/threatIntel'

interface IocSearchPanelProps {
  iocs: IocRecord[]
}

const IOC_TYPES: Array<IocType | 'All'> = [
  'All',
  'IP Address',
  'Domain',
  'URL',
  'Email',
  'SHA256',
  'MD5',
  'File Name',
  'Registry Key',
  'Process Name',
  'Certificate',
]

const REPUTATION_BADGES: Record<IocRecord['reputation'], string> = {
  Malicious: 'bg-rose-100 text-rose-800 border-rose-200',
  'High Risk': 'bg-orange-100 text-orange-800 border-orange-200',
  Suspicious: 'bg-amber-100 text-amber-800 border-amber-200',
  Unknown: 'bg-slate-100 text-slate-700 border-slate-200',
  Clean: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

export function IocSearchPanel({ iocs }: IocSearchPanelProps) {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<IocType | 'All'>('All')

  const filtered = iocs.filter((ioc) => {
    const matchesSearch =
      search === '' ||
      ioc.value.toLowerCase().includes(search.toLowerCase()) ||
      ioc.malwareFamily.toLowerCase().includes(search.toLowerCase()) ||
      ioc.associatedCampaign.toLowerCase().includes(search.toLowerCase()) ||
      ioc.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))

    const matchesType = selectedType === 'All' || ioc.type === selectedType

    return matchesSearch && matchesType
  })

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Indicators of Compromise (IOC) Intelligence Vault
          </h3>
          <p className="text-xs text-slate-500">
            Search, correlate, and verify malicious IPs, domains, hashes, and behavioral indicators against active firewall matches.
          </p>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search IP, domain, hash, registry key..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* IOC Type Filter Pills */}
      <div className="mt-4 flex flex-wrap gap-1.5 overflow-x-auto pb-1 text-xs">
        {IOC_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
              selectedType === type
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Results Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2.5 font-semibold">Indicator Value</th>
              <th className="py-2.5 font-semibold">Type</th>
              <th className="py-2.5 font-semibold">Reputation</th>
              <th className="py-2.5 font-semibold text-right">Risk Score</th>
              <th className="py-2.5 font-semibold text-right">Detections</th>
              <th className="py-2.5 font-semibold">Malware Family</th>
              <th className="py-2.5 font-semibold">Campaign</th>
              <th className="py-2.5 font-semibold text-right">Firewall Blocks</th>
              <th className="py-2.5 font-semibold text-right">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((ioc) => (
              <tr key={ioc.id} className="transition hover:bg-slate-50/70">
                <td className="py-3 font-mono font-bold text-slate-900 max-w-xs truncate">
                  <span className="text-indigo-700">{ioc.value}</span>
                </td>
                <td className="py-3">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                    {ioc.type}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                      REPUTATION_BADGES[ioc.reputation]
                    }`}
                  >
                    {ioc.reputation}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span
                    className={`font-mono font-bold ${
                      ioc.riskScore >= 90
                        ? 'text-rose-600'
                        : ioc.riskScore >= 70
                        ? 'text-amber-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {ioc.riskScore}/100
                  </span>
                </td>
                <td className="py-3 text-right font-mono font-medium text-slate-800">
                  {ioc.detectionCount}
                </td>
                <td className="py-3 font-medium text-slate-900">
                  {ioc.malwareFamily}
                </td>
                <td className="py-3 text-slate-600 max-w-[150px] truncate">
                  {ioc.associatedCampaign}
                </td>
                <td className="py-3 text-right">
                  <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 font-mono text-[11px] font-bold text-red-700">
                    {ioc.firewallMatches} Drops
                  </span>
                </td>
                <td className="py-3 text-right font-mono text-slate-400 text-[11px]">
                  {ioc.lastSeen}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
