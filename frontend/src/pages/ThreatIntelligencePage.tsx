import {
  ArrowDownTrayIcon,
  BellAlertIcon,
  BoltIcon,
  CheckBadgeIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  FireIcon,
  GlobeAltIcon,
  MagnifyingGlassCircleIcon,
  PauseIcon,
  PlayIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { Card } from '../components/Card'
import { CampaignIntelligence } from '../components/threat/CampaignIntelligence'
import { GlobalAttackMap } from '../components/threat/GlobalAttackMap'
import { IocRelationshipGraph } from '../components/threat/IocRelationshipGraph'
import { IocSearchPanel } from '../components/threat/IocSearchPanel'
import { MalwareWorkbench } from '../components/threat/MalwareWorkbench'
import { MitreCoverageMatrix } from '../components/threat/MitreCoverageMatrix'
import { ThreatFeed } from '../components/threat/ThreatFeed'
import { ThreatHuntingWorkspace } from '../components/threat/ThreatHuntingWorkspace'
import { ThreatIntelSources } from '../components/threat/ThreatIntelSources'
import { ThreatPredictionCard } from '../components/threat/ThreatPredictionCard'
import type { ThreatIntelligenceSnapshot } from '../types/threatIntel'
import {
  exportThreatIntelToCSV,
  exportThreatIntelToJSON,
  exportThreatIntelToPDF,
  generateThreatIntelligenceSnapshot,
} from '../utils/threatSimulation'

export function ThreatIntelligencePage() {
  const [snapshot, setSnapshot] = useState<ThreatIntelligenceSnapshot>(() =>
    generateThreatIntelligenceSnapshot(),
  )
  const [isStreaming, setIsStreaming] = useState(true)

  // Simulation loop updating every 5 seconds
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      setSnapshot(generateThreatIntelligenceSnapshot())
    }, 5000)

    return () => clearInterval(interval)
  }, [isStreaming])

  const handleExportJSON = () => {
    exportThreatIntelToJSON(snapshot)
    toast.success('Threat Intelligence snapshot exported to JSON')
  }

  const handleExportCSV = () => {
    exportThreatIntelToCSV(snapshot)
    toast.success('Threat Intelligence IOCs exported to CSV')
  }

  const handleExportPDF = () => {
    toast.info('Generating Threat Intelligence PDF preview...')
    exportThreatIntelToPDF()
  }

  const { kpis } = snapshot

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              AI Threat Intelligence & Threat Hunting Center
            </h1>
            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
              TIP ENTERPRISE
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Adversary intelligence correlation, IOC hunting, malware disassembly, multi-hop provenance graphs, and predictive forecasting.
          </p>
        </div>

        {/* Action Controls & Simulation Stream */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStreaming((prev) => !prev)}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-xs transition ${
              isStreaming
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isStreaming ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span>Live Feed (5s)</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4 text-slate-500" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 text-slate-500" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: 10 ANIMATED EXECUTIVE THREAT INTELLIGENCE KPIS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* 1. Known Threats */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Known Threats</span>
            <ShieldExclamationIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {kpis.knownThreats.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600">
              +{kpis.trend.threats}%
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">Total cataloged signatures</p>
        </Card>

        {/* 2. New Threats Today */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">New Threats Today</span>
            <FireIcon className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600">
              {kpis.newThreatsToday}
            </span>
            <span className="text-[10px] font-bold text-rose-600">LIVE</span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">Ingested in rolling 24h</p>
        </Card>

        {/* 3. Active Campaigns */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Active Campaigns</span>
            <GlobeAltIcon className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-700">
              {kpis.activeCampaigns}
            </span>
            <span className="text-[10px] font-semibold text-purple-600">
              +{kpis.trend.campaigns}%
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">Targeted operations</p>
        </Card>

        {/* 4. Blocked Campaigns */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Blocked Campaigns</span>
            <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">
              {kpis.blockedCampaigns}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600">
              +{kpis.trend.blocks}%
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">Disrupted by AI firewall</p>
        </Card>

        {/* 5. High Severity Threats */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">High / Critical</span>
            <BellAlertIcon className="h-4 w-4 text-orange-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-orange-600">
              {kpis.highSeverityThreats}
            </span>
            <span className="text-[10px] font-semibold text-slate-500">P1 Tier</span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">Requires SOC mitigation</p>
        </Card>

        {/* 6. Threat Intel Sources */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Intel Sources</span>
            <CheckBadgeIcon className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-700">
              {kpis.threatIntelSources}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600">100% Up</span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">OTX, CISA, VT, NVD feeds</p>
        </Card>

        {/* 7. Average Confidence Score */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Avg Confidence</span>
            <BoltIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">
              {kpis.avgConfidenceScore}%
            </span>
            <span className="text-[10px] font-semibold text-emerald-600">
              +{kpis.trend.confidence}%
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">Bayesian correlation model</p>
        </Card>

        {/* 8. Active Hunting Sessions */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Hunting Sessions</span>
            <MagnifyingGlassCircleIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-700">
              {kpis.activeHuntingSessions}
            </span>
            <span className="text-[10px] font-semibold text-indigo-600">Active</span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">Prebuilt hunting queries</p>
        </Card>

        {/* 9. Average IOC Match Rate */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">IOC Match Rate</span>
            <EyeIcon className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">
              {kpis.avgIocMatchRate}%
            </span>
            <span className="text-[10px] text-slate-400">Per Session</span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">Edge telemetry hits</p>
        </Card>

        {/* 10. Global Threat Index */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Threat Index</span>
            <FireIcon className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600">
              {kpis.globalThreatIndex}
            </span>
            <span className="text-[10px] text-slate-500">/ 100</span>
          </div>
          <p className="mt-0.5 text-[10px] text-rose-600 font-semibold">Elevated Cyber Risk</p>
        </Card>
      </div>

      {/* SECTION 11 & SECTION 12: PREDICTIONS & EXECUTIVE NARRATIVE */}
      <ThreatPredictionCard
        prediction={snapshot.prediction}
        summary={snapshot.summary}
      />

      {/* SECTION 10: 24-HOUR THREAT TIMELINE */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                24-Hour Continuous Threat Velocity & Ingestion Trajectory
              </h3>
              <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                Live 5s Refresh
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Time-series tracking of incoming threat vectors, automatic drops, investigation workload, and IOC correlations.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              New Threats
            </span>
            <span className="flex items-center gap-1.5 font-medium text-rose-600">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Blocked
            </span>
            <span className="flex items-center gap-1.5 font-medium text-purple-600">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              IOC Matches
            </span>
          </div>
        </div>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={snapshot.timeline}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorNewThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBlockedThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorIocMatches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="newThreats"
                name="New Threats"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNewThreats)"
              />
              <Area
                type="monotone"
                dataKey="blockedThreats"
                name="Firewall Blocked"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBlockedThreats)"
              />
              <Area
                type="monotone"
                dataKey="iocMatches"
                name="IOC Hits"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIocMatches)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* SECTION 2: GLOBAL THREAT FEED */}
      <ThreatFeed feed={snapshot.threatFeed} />

      {/* SECTION 8 & SECTION 7: GLOBAL ATTACK MAP & IOC RELATIONSHIP GRAPH */}
      <GlobalAttackMap attackPoints={snapshot.attackMap} />
      <IocRelationshipGraph nodes={snapshot.relationshipNodes} />

      {/* SECTION 3: IOC INTELLIGENCE SEARCH */}
      <IocSearchPanel iocs={snapshot.iocs} />

      {/* SECTION 4 & SECTION 5: MALWARE WORKBENCH & THREAT HUNTING */}
      <div className="grid gap-6">
        <MalwareWorkbench malwareList={snapshot.malwareList} />
        <ThreatHuntingWorkspace queries={snapshot.huntingQueries} />
      </div>

      {/* SECTION 6 & SECTION 9: CAMPAIGN INTELLIGENCE & MITRE COVERAGE */}
      <CampaignIntelligence campaigns={snapshot.campaigns} />
      <MitreCoverageMatrix coverage={snapshot.mitreCoverage} />

      {/* SECTION 13: THREAT INTELLIGENCE SOURCES */}
      <ThreatIntelSources sources={snapshot.sources} />
    </div>
  )
}
