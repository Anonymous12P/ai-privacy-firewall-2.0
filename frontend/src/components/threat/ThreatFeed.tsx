import { useState } from 'react'
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { GlobalThreatFeedItem, ThreatSeverity } from '../../types/threatIntel'

interface ThreatFeedProps {
  feed: GlobalThreatFeedItem[]
}

const SEVERITY_BADGES: Record<ThreatSeverity, string> = {
  Critical: 'bg-rose-100 text-rose-800 border-rose-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const STATUS_BADGES: Record<GlobalThreatFeedItem['status'], string> = {
  Active: 'bg-rose-50 text-rose-700 border-rose-200',
  Blocked: 'bg-red-100 text-red-800 border-red-200',
  Mitigated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Monitoring: 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

export function ThreatFeed({ feed }: ThreatFeedProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filtered = feed.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.threatActor.toLowerCase().includes(search.toLowerCase()) ||
      item.country.toLowerCase().includes(search.toLowerCase()) ||
      item.targetIndustry.toLowerCase().includes(search.toLowerCase())

    const matchesCat =
      selectedCategory === 'All' || item.category === selectedCategory

    return matchesSearch && matchesCat
  })

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Live Global Cyber Threat Intelligence Feed
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              Real-time Ingestion
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Real-time adversary feeds correlated across global telemetry, AlienVault OTX, VirusTotal, and internal firewall logs.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-60">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threat, actor, CVE..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Threat Types</option>
            <option value="APT Activity">APT Activity</option>
            <option value="Ransomware">Ransomware</option>
            <option value="Data Exfiltration">Data Exfiltration</option>
            <option value="Phishing">Phishing</option>
            <option value="Supply Chain Attack">Supply Chain</option>
          </select>
        </div>
      </div>

      {/* Threat Cards Grid */}
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4.5 transition hover:border-indigo-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                    SEVERITY_BADGES[item.severity]
                  }`}
                >
                  {item.severity}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                      STATUS_BADGES[item.status]
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {item.timestamp}
                  </span>
                </div>
              </div>

              <h4 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                {item.name}
              </h4>

              <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Threat Actor:</span>
                <span className="font-semibold text-slate-900">{item.threatActor}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Target Industry:</span>
                <span className="font-medium text-slate-800 truncate max-w-[170px]">{item.targetIndustry}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">MITRE Tactic:</span>
                <span className="font-mono font-semibold text-indigo-700">
                  {item.mitreTechniqueId} ({item.mitreTactic})
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pt-1">
                <span className="flex items-center gap-1 text-slate-500">
                  <GlobeAltIcon className="h-3.5 w-3.5" />
                  {item.country} ({item.countryCode})
                </span>
                <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-700">
                  {item.confidence}% Conf.
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
