import {
  BellAlertIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
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
import { formatThreatScore, getThreatLevel } from '../utils/threatScore'

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
    threatScore: 86,
    decision: 'BLOCK',
    timestamp: 'Just now',
  },
  {
    id: 'EVT-502',
    subject: 'Himanshu Gond',
    resource: 'gitlab.internal/core/auth-service.git',
    action: 'git_clone_external',
    threatScore: 54,
    decision: 'WARN',
    timestamp: '2 min ago',
  },
  {
    id: 'EVT-503',
    subject: 'Vaibhav Deshmukh',
    resource: 'compliance.internal/audit_ledger',
    action: 'bulk_query',
    threatScore: 26,
    decision: 'ALLOW',
    timestamp: '4 min ago',
  },
  {
    id: 'EVT-504',
    subject: 'Pavan Jadhav',
    resource: 'models.internal:5000/weights/shap',
    action: 'read_model',
    threatScore: 18,
    decision: 'ALLOW',
    timestamp: '6 min ago',
  },
  {
    id: 'EVT-505',
    subject: 'Vikas Rathod',
    resource: 'k8s.internal:6443/namespaces/prod',
    action: 'audit_policy_check',
    threatScore: 14,
    decision: 'ALLOW',
    timestamp: '7 min ago',
  },
]

const THREAT_TREND_DATA = [
  { hour: '00:00', normal: 120, threats: 1, baseline: 110 },
  { hour: '04:00', normal: 85, threats: 0, baseline: 90 },
  { hour: '08:00', normal: 340, threats: 3, baseline: 320 },
  { hour: '12:00', normal: 520, threats: 8, baseline: 490 },
  { hour: '16:00', normal: 480, threats: 10, baseline: 450 },
  { hour: '20:00', normal: 260, threats: 14, baseline: 220 },
  { hour: '23:00', normal: 140, threats: 7, baseline: 130 },
]

const POLICY_DECISION_DISTRIBUTION = [
  { name: 'Allow (Normal)', value: 80, color: '#22c55e' },
  { name: 'Warn (Challenge)', value: 14, color: '#eab308' },
  { name: 'Block (Interception)', value: 6, color: '#ef4444' },
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
    title: 'Off-hours Wire Transfer Export',
    employee: 'Kavita Rao',
    risk: 'Critical',
    time: '20:45:12',
    description: 'Off-hours bulk transaction export initiated from unverified proxy endpoint.',
  },
  {
    id: 'ALT-103',
    title: 'Malware Sandbox Detonation Vector',
    employee: 'Himanshu Gond',
    risk: 'High',
    time: '19:30:22',
    description: 'IOC dynamic execution within isolated analysis container with abnormal outbound ping.',
  },
]

export function DashboardPage() {
  const { data: auditData } = useFirewallAudit({ pageSize: 10 })
  const [feed, setFeed] = useState<LiveFeedItem[]>(INITIAL_FEED)
  const [activeUsersCount, setActiveUsersCount] = useState(74)
  const [threatsTodayCount, setThreatsTodayCount] = useState(8)
  const [totalDecisionsCount, setTotalDecisionsCount] = useState(14820)
  const [auditLogsCount, setAuditLogsCount] = useState(2840)

  // Map real backend audit logs into live feed if present
  useEffect(() => {
    if (auditData?.items && auditData.items.length > 0) {
      const mapped = auditData.items.slice(0, 6).map((item) => ({
        id: item.audit_id,
        subject: item.subject_id ?? 'Unknown Subject',
        resource: item.resource ?? 'Protected Resource',
        action: item.action,
        threatScore: Math.round(item.risk_score && item.risk_score <= 1.0 ? item.risk_score * 100 : item.risk_score ?? 15),
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

  // Realistic dynamic simulation ticking every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      // Small realistic fluctuations
      setActiveUsersCount((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1
        return Math.max(68, Math.min(84, prev + delta))
      })
      setTotalDecisionsCount((prev) => prev + Math.floor(1 + Math.random() * 3))
      setAuditLogsCount((prev) => prev + 1)

      // Randomly inject new live feed items with realistic probability:
      // ~80% Allow (Normal), ~14% Warn, ~5% Restrict, ~1% Block
      const rand = Math.random()
      let subject = 'Pavan Jadhav'
      let resource = 'api-gateway.internal:443/graphql'
      let action = 'read'
      let threatScore = Math.floor(8 + Math.random() * 12)
      let decision: 'ALLOW' | 'WARN' | 'BLOCK' = 'ALLOW'

      if (rand < 0.02) {
        // Critical event (~2%)
        const critUsers = ['Ram Rajurkar', 'Kavita Rao', 'Devendra Joshi']
        subject = critUsers[Math.floor(Math.random() * critUsers.length)]!
        resource = 's3://secure-vault/corporate_secrets.enc'
        action = 'bulk_export'
        threatScore = Math.floor(84 + Math.random() * 12)
        decision = 'BLOCK'
        setThreatsTodayCount((t) => t + 1)
      } else if (rand < 0.16) {
        // Warning event (~14%)
        const warnUsers = ['Himanshu Gond', 'Vaibhav Deshmukh', 'Arjun Verma']
        subject = warnUsers[Math.floor(Math.random() * warnUsers.length)]!
        resource = 'postgresql://audit.firewall.internal:5432/audit_trail'
        action = 'query_high_volume'
        threatScore = Math.floor(28 + Math.random() * 26)
        decision = 'WARN'
      } else {
        // Normal event (~84%)
        const normUsers = ['Vikas Rathod', 'Pavan Jadhav', 'Ghanshyam Sapkal', 'Pratik Akkanawaru', 'Saurabh Talape']
        subject = normUsers[Math.floor(Math.random() * normUsers.length)]!
        resource = `${subject.split(' ')[0]?.toLowerCase()}-workstation.internal/auth`
        action = 'session_ping'
        threatScore = Math.floor(4 + Math.random() * 16)
        decision = 'ALLOW'
      }

      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

      const newEvent: LiveFeedItem = {
        id: `EVT-${Math.floor(500 + Math.random() * 500)}`,
        subject,
        resource,
        action,
        threatScore,
        decision,
        timestamp: timeStr,
      }

      setFeed((prev) => [newEvent, ...prev.slice(0, 5)])
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  // Top watched employees (mix of core and notable statuses)
  const watchedEmployees = EMPLOYEES.slice(0, 8)

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-indigo-700 uppercase font-sans">
              AI PRIVACY FIREWALL COMMAND CENTER
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Enterprise Digital Twin Monitor
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Security Operations Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time User Behavior Analytics (UBA), Zero Trust policy arbitration, and machine learning telemetry overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <RadioIcon className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span>Live Stream: Active</span>
          </div>
        </div>
      </div>

      {/* TOP 6 KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {/* 1. Protected Employees */}
        <MetricCard
          label="Total Personnel"
          value={`${EMPLOYEES.length} Employees`}
          detail="13 Enterprise Departments"
          icon={<UserGroupIcon className="h-5 w-5 text-indigo-600" />}
        />

        {/* 2. Active Sessions */}
        <MetricCard
          label="Active Users"
          value={`${activeUsersCount} Online`}
          detail="Zero-Trust Enrolled"
          icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
        />

        {/* 3. Threats Today */}
        <MetricCard
          label="Threats Today"
          value={`${threatsTodayCount} Flagged`}
          detail="Autonomous ML Interceptions"
          icon={<ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />}
        />

        {/* 4. Critical Alerts */}
        <MetricCard
          label="Critical Alerts"
          value="5 Suspended"
          detail="Score &gt;= 81/100"
          icon={<ShieldCheckIcon className="h-5 w-5 text-rose-600" />}
        />

        {/* 5. Firewall Decisions */}
        <MetricCard
          label="Firewall Decisions"
          value={totalDecisionsCount.toLocaleString()}
          detail="Continuous ML Inference"
          icon={<SparklesIcon className="h-5 w-5 text-blue-600" />}
        />

        {/* 6. Current Threat Level */}
        <MetricCard
          label="Overall Threat Level"
          value="Normal"
          detail="System Defenses Optimal"
          icon={<BoltIcon className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      {/* Threat Trend & Policy Decisions Distribution Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Threat Trend */}
        <div className="lg:col-span-8">
          <Card className="p-6 h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  TEMPORAL SURVEILLANCE
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  24-Hour Threat Trend & Baseline Activity
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
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
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="threatWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#normalWave)"
                    name="Normal Requests"
                  />
                  <Area
                    type="monotone"
                    dataKey="threats"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#threatWave)"
                    name="Threat Incidents"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Policy Decision Distribution Pie */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  ARBITRATION ENGINE
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Firewall Decision Ratio
                </h2>
              </div>
              <div className="mt-4 h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={POLICY_DECISION_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {POLICY_DECISION_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-2 space-y-2 text-xs">
              {POLICY_DECISION_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  PERSONNEL RISK POSTURE
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Key Monitored Personnel ({EMPLOYEES.length} Total)
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">Live UBA Baselines</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {watchedEmployees.map((emp) => {
                const threatLevel = getThreatLevel(emp.riskScore)

                return (
                  <div
                    key={emp.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{emp.name}</p>
                          <p className="text-[10px] text-slate-500">{emp.department}</p>
                        </div>
                      </div>
                      <RiskBadge risk={threatLevel} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-600 border-t border-slate-100 pt-1.5">
                      <span>Threat: <strong>{formatThreatScore(emp.riskScore)}</strong></span>
                      <span>Behavior: <strong>{emp.behaviorScore}/100</strong></span>
                    </div>
                  </div>
                )
              })}
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
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1 hover:bg-slate-50 transition-colors"
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  TELEMETRY EVENTS STREAM
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
                      {formatThreatScore(item.threatScore)}
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
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
                <span className="font-mono font-bold text-indigo-600">1.2 ms</span>
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
                  Audit Trail & Feature Store
                </span>
                <span className="font-bold text-emerald-600">HEALTHY ({auditLogsCount.toLocaleString()} logs)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  Autonomous Zero Trust Enforcement
                </span>
                <span className="font-bold text-indigo-600">ACTIVE</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
