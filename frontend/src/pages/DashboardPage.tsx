import {
  BellAlertIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  RadioIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../components/Card'
import { FirewallActionBadge } from '../components/FirewallActionBadge'
import { MetricCard } from '../components/MetricCard'
import { RiskBadge } from '../components/RiskBadge'
import { EMPLOYEES } from '../data/organizationData'
import { useFirewallAudit } from '../hooks/useFirewall'

interface LiveFeedItem {
  id: string
  subject: string
  resource: string
  action: string
  threatScore: number
  decision: 'ALLOW' | 'WARN' | 'BLOCK'
  timestamp: string
}

const INITIAL_FEED: LiveFeedItem[] = [
  {
    id: 'EVT-501',
    subject: 'Ram Rajurkar',
    resource: 's3://secure-vault/finance_q3.csv',
    action: 'export_mass_data',
    threatScore: 0.88,
    decision: 'BLOCK',
    timestamp: 'Just now',
  },
  {
    id: 'EVT-502',
    subject: 'Saurabh Talape',
    resource: 'gitlab.corp/auth/keycloak-realm.json',
    action: 'git_clone_external',
    threatScore: 0.45,
    decision: 'WARN',
    timestamp: '2 min ago',
  },
  {
    id: 'EVT-503',
    subject: 'Himanshu Gond',
    resource: 'feature-store.internal/embeddings',
    action: 'bulk_query',
    threatScore: 0.38,
    decision: 'ALLOW',
    timestamp: '4 min ago',
  },
  {
    id: 'EVT-504',
    subject: 'Vikas Rathod',
    resource: 'k8s-api:6443/namespaces/prod',
    action: 'audit_policy_check',
    threatScore: 0.08,
    decision: 'ALLOW',
    timestamp: '7 min ago',
  },
]

const THREAT_TREND_DATA = [
  { hour: '00:00', normal: 120, threats: 1, baseline: 110 },
  { hour: '04:00', normal: 85, threats: 0, baseline: 90 },
  { hour: '08:00', normal: 340, threats: 3, baseline: 320 },
  { hour: '12:00', normal: 520, threats: 8, baseline: 490 },
  { hour: '16:00', normal: 480, threats: 12, baseline: 450 },
  { hour: '20:00', normal: 260, threats: 24, baseline: 220 },
  { hour: '23:00', normal: 140, threats: 18, baseline: 130 },
]

const POLICY_DECISION_DISTRIBUTION = [
  { name: 'Allow (Normal)', value: 78, color: '#22c55e' },
  { name: 'Warn (Challenge)', value: 14, color: '#f59e0b' },
  { name: 'Block (Interception)', value: 8, color: '#ef4444' },
]

const RECENT_ALERTS = [
  {
    id: 'ALT-101',
    title: 'Removable Storage Mass Exfiltration',
    employee: 'Ram Rajurkar',
    risk: 'Critical',
    time: '21:18:04',
    description: 'Off-hours USB device attached with attempt to transfer 4.2 GB of payroll records.',
  },
  {
    id: 'ALT-102',
    title: 'Anomalous Geo-IP Split Tunnel',
    employee: 'Saurabh Talape',
    risk: 'High',
    time: '20:45:12',
    description: 'Direct IP connection asserted during active WireGuard corporate tunnel.',
  },
  {
    id: 'ALT-103',
    title: 'High Velocity API Query Spike',
    employee: 'Himanshu Gond',
    risk: 'Medium',
    time: '19:30:22',
    description: 'Query rate exceeded role profile by 220% on sensitive embedding tables.',
  },
]

export function DashboardPage() {
  const { data: auditData } = useFirewallAudit({ pageSize: 10 })
  const [feed, setFeed] = useState<LiveFeedItem[]>(INITIAL_FEED)

  // Map real backend audit logs into live feed if present
  useEffect(() => {
    if (auditData?.items && auditData.items.length > 0) {
      const mapped = auditData.items.slice(0, 6).map((item) => ({
        id: item.audit_id,
        subject: item.subject_id ?? 'Unknown Subject',
        resource: item.resource ?? 'Protected Resource',
        action: item.action,
        threatScore: item.risk_score ?? 0.15,
        decision: (item.decision === 'BLOCK'
          ? 'BLOCK'
          : item.decision === 'WARN'
            ? 'WARN'
            : 'ALLOW') as 'ALLOW' | 'WARN' | 'BLOCK',
        timestamp: 'Real-time',
      }))
      setFeed(mapped)
    }
  }, [auditData])

  return (
    <div className="space-y-8">
      {/* Enterprise Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-blue-700 uppercase font-sans">
              ENTERPRISE SOC CONSOLE
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Privacy Shield Technologies Pvt. Ltd.
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Security Operations Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time User Behavior Analytics (UBA), Zero Trust policy arbitration, and machine learning telemetry overview.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
          <RadioIcon className="h-4 w-4 text-emerald-500 animate-pulse" />
          <span>Real-time Stream: Active</span>
        </div>
      </div>

      {/* TOP 6 KPI CARDS (Mandatory Requirements) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {/* 1. Protected Employees */}
        <MetricCard
          label="Protected Employees"
          value="8 Personnel"
          detail="100% Endpoints Verified"
          icon={<UserGroupIcon className="h-5 w-5 text-blue-600" />}
        />

        {/* 2. Threats Today */}
        <MetricCard
          label="Threats Today"
          value="38 Flagged"
          detail="+12% from 24h baseline"
          icon={<ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />}
        />

        {/* 3. Blocked Attacks */}
        <MetricCard
          label="Blocked Attacks"
          value="14 Intercepted"
          detail="Autonomous TCP Reset"
          icon={<NoSymbolIcon className="h-5 w-5 text-rose-600" />}
        />

        {/* 4. High Risk Users */}
        <MetricCard
          label="High Risk Users"
          value="1 Subject"
          detail="Ram Rajurkar (Score 0.88)"
          icon={<ShieldCheckIcon className="h-5 w-5 text-rose-600" />}
        />

        {/* 5. Model Accuracy */}
        <MetricCard
          label="Model Accuracy"
          value="97.8%"
          detail="XGBoost Ensemble"
          icon={<SparklesIcon className="h-5 w-5 text-blue-600" />}
        />

        {/* 6. Current Threat Level */}
        <MetricCard
          label="Current Threat Level"
          value="Elevated"
          detail="UBA Anomaly detected"
          icon={<BoltIcon className="h-5 w-5 text-amber-600" />}
        />
      </div>

      {/* Threat Trend & Policy Decisions Distribution Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Threat Trend */}
        <div className="lg:col-span-8">
          <Card className="p-6 h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  TEMPORAL SURVEILLANCE
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  24-Hour Threat Trend & Baseline Activity
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  Baseline Queries
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Threat Spikes
                </span>
              </div>
            </div>

            <div className="mt-6 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={THREAT_TREND_DATA}>
                  <defs>
                    <linearGradient id="normalWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="threatWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="normal"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#normalWave)"
                    name="Normal Operations"
                  />
                  <Area
                    type="monotone"
                    dataKey="threats"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#threatWave)"
                    name="Threat Events"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Policy Decisions Breakdown */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                GOVERNANCE ARBITRATION
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Policy Decisions
              </h2>
            </div>

            <div className="h-44 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={POLICY_DECISION_DISTRIBUTION}
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {POLICY_DECISION_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              {POLICY_DECISION_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Employee Risk Summary & Recent Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Employee Risk Summary */}
        <div className="lg:col-span-6">
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  PERSONNEL RISK POSTURE
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Employee Risk Summary (8 Personnel)
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">Live UBA Baselines</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {EMPLOYEES.map((emp) => (
                <div
                  key={emp.id}
                  className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{emp.name}</p>
                      <p className="text-[10px] text-slate-500">{emp.department}</p>
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
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-600 border-t border-slate-100 pt-1.5">
                    <span>Threat: {(emp.riskScore * 100).toFixed(0)}%</span>
                    <span>Behavior: {emp.behaviorScore}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Alerts */}
        <div className="lg:col-span-6">
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  INCIDENT FEED
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Recent Alerts & Anomalies
                </h2>
              </div>
              <BellAlertIcon className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-4 space-y-3">
              {RECENT_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-1 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">{alert.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="font-semibold text-slate-700">Subject: {alert.employee}</span>
                    <RiskBadge risk={alert.risk} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Live Feed & AI Prediction Summary Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Live Feed */}
        <div className="lg:col-span-7">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  TELEMETRY EVENTS
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Live Feed (Streaming Interceptions)
                </h2>
              </div>
              <ClockIcon className="h-4 w-4 text-slate-400" />
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {feed.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.subject}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({item.id})</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 truncate max-w-sm">
                      {item.resource}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {(item.threatScore * 100).toFixed(0)}%
                    </span>
                    <FirewallActionBadge action={item.decision} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Prediction Summary & System Health */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Prediction Summary */}
          <Card className="p-6">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                MODEL CONSENSUS
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                AI Prediction Summary
              </h2>
            </div>
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Primary Classifier:</span>
                <span className="font-bold text-slate-900">XGBoost (97.8% Accuracy)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Ensemble Verification:</span>
                <span className="font-bold text-slate-900">Random Forest (96.5%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Inference Response Time:</span>
                <span className="font-mono font-bold text-blue-600">1.2 ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">False Positive Rate:</span>
                <span className="font-mono font-bold text-emerald-600">1.7%</span>
              </div>
            </div>
          </Card>

          {/* System Health */}
          <Card className="p-6">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                INFRASTRUCTURE HEALTH
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                System Health & Connectivity
              </h2>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  FastAPI UBA Backend Service
                </span>
                <span className="font-bold text-emerald-600">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  PostgreSQL / SQLite Database
                </span>
                <span className="font-bold text-emerald-600">HEALTHY</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  Autonomous Zero Trust Enforcement
                </span>
                <span className="font-bold text-blue-600">ACTIVE</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
