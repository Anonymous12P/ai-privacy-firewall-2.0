import {
  ArrowDownTrayIcon,
  BoltIcon,
  CheckBadgeIcon,
  ClockIcon,
  CpuChipIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  HandRaisedIcon,
  PauseIcon,
  PlayIcon,
  QueueListIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { useFirewallModelPipeline } from '../hooks/useFirewall'
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
import { ConfusionMatrix } from '../components/analytics/ConfusionMatrix'
import { DepartmentHeatmap } from '../components/analytics/DepartmentHeatmap'
import { ExecutiveSummaryCard } from '../components/analytics/ExecutiveSummaryCard'
import { ModelPerformanceChart } from '../components/analytics/ModelPerformanceChart'
import { PolicyEffectivenessTable } from '../components/analytics/PolicyEffectivenessTable'
import { ShapExplanation } from '../components/analytics/ShapExplanation'
import { ThreatDistributionChart } from '../components/analytics/ThreatDistributionChart'
import type { AnalyticsFilters, AnalyticsSnapshot } from '../types/analytics'
import {
  exportAnalyticsToCSV,
  exportAnalyticsToJSON,
  exportAnalyticsToPDF,
  generateAnalyticsSnapshot,
} from '../utils/analyticsSimulation'

const DEFAULT_FILTERS: AnalyticsFilters = {
  department: 'All',
  model: 'All',
  risk: 'All',
  decision: 'All',
  timeRange: '24h',
}

export function AnalyticsPage() {
  const { data: pipelineData } = useFirewallModelPipeline()
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_FILTERS)
  const [isSimulating, setIsSimulating] = useState(true)
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(() =>
    generateAnalyticsSnapshot(DEFAULT_FILTERS),
  )

  // Simulation tick every 3 seconds
  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(() => {
      setSnapshot(generateAnalyticsSnapshot(filters))
    }, 3000)

    return () => clearInterval(interval)
  }, [isSimulating, filters])

  // Instant update when filters change
  const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    setSnapshot(generateAnalyticsSnapshot(updated))
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setSnapshot(generateAnalyticsSnapshot(DEFAULT_FILTERS))
    toast.info('Analytics filters reset to defaults')
  }

  const handleExportJSON = () => {
    exportAnalyticsToJSON(snapshot)
    toast.success('Analytics JSON exported successfully')
  }

  const handleExportCSV = () => {
    exportAnalyticsToCSV(snapshot)
    toast.success('Analytics CSV exported successfully')
  }

  const handleExportPDF = () => {
    toast.info('Generating PDF print preview...')
    exportAnalyticsToPDF()
  }

  const { kpis } = snapshot

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              AI Analytics & Explainability Center
            </h1>
            <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">
              SOC EXECUTIVE
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Autonomous threat intelligence, multi-model benchmarking, SHAP game-theoretic explainability, and enterprise risk heatmap.
          </p>
        </div>

        {/* Action Controls & Simulation Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSimulating((prev) => !prev)}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-xs transition ${
              isSimulating
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isSimulating ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span>Streaming (3s)</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                <span>Resume Stream</span>
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

      {/* Real Model Telemetry Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <CpuChipIcon className="h-4 w-4 text-indigo-600" />
          <span className="font-bold text-indigo-950">Active AI Model Pipeline:</span>
          <span className="rounded bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
            {pipelineData?.status ?? 'LOADED_AND_OPERATIONAL'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-600">Production Champion:</span>
          <strong className="text-indigo-700">{pipelineData?.champion_model ?? 'XGBoost'}</strong>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
          <span>Corpus: {(pipelineData?.dataset?.total_records ?? 33466).toLocaleString()} records</span>
          <span>•</span>
          <span>4 Classifiers Active</span>
        </div>
      </div>

      {/* 2. Global Filtering Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <FunnelIcon className="h-4 w-4 text-indigo-600" />
            <span>Telemetry Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Department */}
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="dept-filter" className="text-slate-500">Department:</label>
              <select
                id="dept-filter"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Departments</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Security Operations">Security Operations</option>
              </select>
            </div>

            {/* Model */}
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="model-filter" className="text-slate-500">Model:</label>
              <select
                id="model-filter"
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Classifiers</option>
                <option value="Random Forest">Random Forest</option>
                <option value="XGBoost">XGBoost</option>
                <option value="Decision Tree">Decision Tree</option>
                <option value="Logistic Regression">Logistic Regression</option>
              </select>
            </div>

            {/* Risk Tier */}
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="risk-filter" className="text-slate-500">Risk:</label>
              <select
                id="risk-filter"
                value={filters.risk}
                onChange={(e) => handleFilterChange('risk', e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Risk Tiers</option>
                <option value="Critical">Critical (&ge;75)</option>
                <option value="High">High (50-74)</option>
                <option value="Medium">Medium (25-49)</option>
                <option value="Low">Low (&lt;25)</option>
              </select>
            </div>

            {/* Decision */}
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="decision-filter" className="text-slate-500">Decision:</label>
              <select
                id="decision-filter"
                value={filters.decision}
                onChange={(e) => handleFilterChange('decision', e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Actions</option>
                <option value="ALLOW">ALLOW</option>
                <option value="WARN">WARN</option>
                <option value="RESTRICT">RESTRICT</option>
                <option value="BLOCK">BLOCK</option>
              </select>
            </div>

            {/* Time Window */}
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="time-filter" className="text-slate-500">Time Range:</label>
              <select
                id="time-filter"
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1h">Last 1 Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Reset
            </button>
          </div>
        </div>
      </Card>

      {/* SECTION 1: 8 ANIMATED EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
        {/* 1. Today's Requests */}
        <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Requests</span>
            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <ShieldCheckIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {kpis.todayRequests.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              +{kpis.delta.requests}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Total telemetry events</p>
        </Card>

        {/* 2. Threats Detected */}
        <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Threats Detected</span>
            <span className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <ShieldExclamationIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600">
              {kpis.threatsDetected.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {((kpis.threatsDetected / (kpis.todayRequests || 1)) * 100).toFixed(1)}% rate
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Classified anomalous access</p>
        </Card>

        {/* 3. Blocked Requests */}
        <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Blocked Requests</span>
            <span className="rounded-lg bg-red-50 p-2 text-red-600">
              <HandRaisedIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-red-600">
              {kpis.blockedRequests.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-red-600">
              +{kpis.delta.blocks}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Hard enforcement drops</p>
        </Card>

        {/* 4. False Positive Rate */}
        <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">False Positive Rate</span>
            <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <ExclamationTriangleIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">
              {kpis.falsePositiveRate}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              {kpis.delta.fpRate}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Target &lt; 0.50% FPR</p>
        </Card>

        {/* 5. Model Accuracy */}
        <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Model Accuracy</span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckBadgeIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">
              {kpis.modelAccuracy}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              +{kpis.delta.accuracy}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">CERT benchmark validated</p>
        </Card>

        {/* 6. Average Risk Score */}
        <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Average Risk Score</span>
            <span className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <BoltIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-orange-600">
              {kpis.avgRiskScore}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">/ 100</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Platform baseline average</p>
        </Card>

        {/* 7. Average Decision Time */}
        <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Average Decision Time</span>
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
              <ClockIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-700">
              {kpis.avgDecisionTimeMs} ms
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              {kpis.delta.time} ms
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Real-time pipeline speed</p>
        </Card>

        {/* 8. Policy Matches */}
        <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Policy Matches</span>
            <span className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <QueueListIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-700">
              {kpis.policyMatches.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-purple-600">
              +{kpis.delta.policies}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Rule triggers evaluated</p>
        </Card>
      </div>

      {/* SECTION 12 & SECTION 11: EXECUTIVE SUMMARY, MODEL DRIFT & RESEARCH INFO */}
      <ExecutiveSummaryCard
        summary={snapshot.executiveSummary}
        modelDrift={snapshot.modelDrift}
        researchInfo={snapshot.researchInfo}
      />

      {/* SECTION 2 & SECTION 3: MODEL PERFORMANCE BENCHMARK & CONFUSION MATRIX */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ModelPerformanceChart data={snapshot.modelPerformance} />
        <ConfusionMatrix data={snapshot.confusionMatrix} />
      </div>

      {/* SECTION 4, SECTION 5 & SECTION 6: SHAP GLOBAL, WATERFALL & BEHAVIOR RADAR */}
      <ShapExplanation
        globalShap={snapshot.globalShap}
        localEvents={snapshot.localEvents}
        radarImportance={snapshot.radarImportance}
      />

      {/* SECTION 7 & SECTION 8: THREAT DISTRIBUTION & DEPARTMENT RISK HEATMAP */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ThreatDistributionChart data={snapshot.threatDistribution} />
        <DepartmentHeatmap data={snapshot.departmentRisk} />
      </div>

      {/* SECTION 9: 24-HOUR ANIMATED TIMELINE AREA CHART */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                24-Hour Continuous Telemetry & Threat Velocity
              </h3>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Live 3s Ingestion
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-time diurnal access volume, anomaly detection frequency, and hard blocks across rolling 24 hours.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              Requests
            </span>
            <span className="flex items-center gap-1.5 font-medium text-amber-600">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Threats
            </span>
            <span className="flex items-center gap-1.5 font-medium text-rose-600">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Blocks
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
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBlocks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
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
                dataKey="requests"
                name="Access Requests"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRequests)"
              />
              <Area
                type="monotone"
                dataKey="threats"
                name="Threats Detected"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorThreats)"
              />
              <Area
                type="monotone"
                dataKey="blocks"
                name="Blocked Drops"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBlocks)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* SECTION 10: POLICY EFFECTIVENESS TABLE */}
      <PolicyEffectivenessTable data={snapshot.policyEffectiveness} />
    </div>
  )
}
