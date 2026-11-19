import {
  AdjustmentsHorizontalIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  PauseIcon,
  PlayIcon,
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
import { AiFirewallCore3D } from '../components/engine/AiFirewallCore3D'
import { FirewallActionBadge } from '../components/FirewallActionBadge'
import { MetricCard } from '../components/MetricCard'
import { RiskBadge } from '../components/RiskBadge'
import { EMPLOYEES } from '../data/organizationData'
import { useFirewallStatus } from '../hooks/useFirewall'

interface LiveRequestPacket {
  id: string
  timestamp: string
  subject: string
  department: string
  resource: string
  threatScore: number
  decision: 'ALLOW' | 'WARN' | 'BLOCK'
  policyMatched: string
  confidence: number
  ipAddress: string
}

const INITIAL_REQUESTS: LiveRequestPacket[] = [
  {
    id: 'PKT-9401',
    timestamp: '21:18:04',
    subject: 'Ram Rajurkar',
    department: 'Finance',
    resource: 's3://fin-ledger/q4_salary_sheets.csv',
    threatScore: 0.88,
    decision: 'BLOCK',
    policyMatched: 'RULE-USB-EXFILTRATION-BLOCK-01',
    confidence: 0.98,
    ipAddress: '192.168.1.184',
  },
  {
    id: 'PKT-9402',
    timestamp: '21:17:55',
    subject: 'Saurabh Talape',
    department: 'Engineering',
    resource: 'gitlab.internal/core/auth-service.git',
    threatScore: 0.45,
    decision: 'WARN',
    policyMatched: 'RULE-ELEVATED-UBA-WARN-02',
    confidence: 0.94,
    ipAddress: '10.0.4.112',
  },
  {
    id: 'PKT-9403',
    timestamp: '21:17:41',
    subject: 'Himanshu Gond',
    department: 'Data Science',
    resource: 'postgresql://feature-store.internal:5432/embeddings',
    threatScore: 0.38,
    decision: 'ALLOW',
    policyMatched: 'RULE-DATA-ANALYTICS-ALLOW-03',
    confidence: 0.96,
    ipAddress: '10.0.12.88',
  },
  {
    id: 'PKT-9404',
    timestamp: '21:17:28',
    subject: 'Vikas Rathod',
    department: 'Engineering',
    resource: 'k8s-apiserver:6443/api/v1/namespaces/prod',
    threatScore: 0.08,
    decision: 'ALLOW',
    policyMatched: 'RULE-DEFAULT-ALLOW-04',
    confidence: 0.99,
    ipAddress: '10.0.2.14',
  },
  {
    id: 'PKT-9405',
    timestamp: '21:17:12',
    subject: 'Pavan Jadhav',
    department: 'Engineering',
    resource: 'npm.internal/registry/ai-firewall-frontend',
    threatScore: 0.12,
    decision: 'ALLOW',
    policyMatched: 'RULE-DEFAULT-ALLOW-04',
    confidence: 0.97,
    ipAddress: '10.0.2.35',
  },
]

const ATTACK_TIMELINE_DATA = [
  { time: '16:00', normalVolume: 420, threatVolume: 4, averageThreat: 0.12 },
  { time: '17:00', normalVolume: 510, threatVolume: 6, averageThreat: 0.14 },
  { time: '18:00', normalVolume: 480, threatVolume: 8, averageThreat: 0.18 },
  { time: '19:00', normalVolume: 320, threatVolume: 12, averageThreat: 0.24 },
  { time: '20:00', normalVolume: 210, threatVolume: 28, averageThreat: 0.48 },
  { time: '21:00', normalVolume: 140, threatVolume: 42, averageThreat: 0.65 },
  { time: '22:00', normalVolume: 90, threatVolume: 55, averageThreat: 0.78 },
]

const RISK_DISTRIBUTION_DATA = [
  { name: 'Allow (Normal)', count: 3240, percentage: 76.5, color: '#22c55e' },
  { name: 'Warn (Elevated)', count: 680, percentage: 16.1, color: '#f59e0b' },
  { name: 'Block (High/Critical)', count: 315, percentage: 7.4, color: '#ef4444' },
]

const MODEL_CONFIDENCE_DATA = [
  { model: 'XGBoost (Active Production)', accuracy: 97.8, confidence: 98.4, latency: '1.2ms' },
  { model: 'Random Forest', accuracy: 96.5, confidence: 95.8, latency: '1.8ms' },
  { model: 'Decision Tree', accuracy: 92.1, confidence: 91.2, latency: '0.6ms' },
  { model: 'Logistic Regression', accuracy: 88.4, confidence: 87.5, latency: '0.4ms' },
]

const HEATMAP_DEPARTMENTS = ['Finance', 'Engineering', 'Operations', 'Data Science', 'Compliance']
const HEATMAP_HOURS = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00']

const HEATMAP_MATRIX: Record<string, number[]> = {
  Finance: [22, 35, 68, 88, 72, 45],
  Engineering: [15, 20, 38, 45, 32, 18],
  Operations: [10, 14, 18, 22, 28, 20],
  'Data Science': [25, 28, 35, 38, 30, 22],
  Compliance: [8, 10, 12, 14, 11, 9],
}

export function FirewallEnginePage() {
  const { data: statusData } = useFirewallStatus()
  const [activeMonitoring, setActiveMonitoring] = useState(true)
  const [requests, setRequests] = useState<LiveRequestPacket[]>(INITIAL_REQUESTS)
  const [packetCount, setPacketCount] = useState(4235)
  const [currentThreatScore, setCurrentThreatScore] = useState(0.82)
  const [decisionThreshold, setDecisionThreshold] = useState(0.75)

  // Dynamic simulation pulse every 2.5 seconds
  useEffect(() => {
    if (!activeMonitoring) return

    const interval = setInterval(() => {
      setPacketCount((c) => c + Math.floor(Math.random() * 3) + 1)

      const randEmp = EMPLOYEES[Math.floor(Math.random() * EMPLOYEES.length)]!
      const isHighRisk = randEmp.name === 'Ram Rajurkar'
      const isMediumRisk = randEmp.name === 'Saurabh Talape' || randEmp.name === 'Himanshu Gond'

      const generatedScore = isHighRisk
        ? Number((0.78 + Math.random() * 0.18).toFixed(2))
        : isMediumRisk
          ? Number((0.36 + Math.random() * 0.25).toFixed(2))
          : Number((0.05 + Math.random() * 0.18).toFixed(2))

      const decision: 'ALLOW' | 'WARN' | 'BLOCK' =
        generatedScore >= decisionThreshold
          ? 'BLOCK'
          : generatedScore >= 0.4
            ? 'WARN'
            : 'ALLOW'

      const policyMatched =
        decision === 'BLOCK'
          ? 'RULE-USB-EXFILTRATION-BLOCK-01'
          : decision === 'WARN'
            ? 'RULE-ELEVATED-UBA-WARN-02'
            : 'RULE-DEFAULT-ALLOW-04'

      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

      const newPacket: LiveRequestPacket = {
        id: `PKT-${Math.floor(9400 + Math.random() * 600)}`,
        timestamp: timeStr,
        subject: randEmp.name,
        department: randEmp.department,
        resource:
          randEmp.department === 'Finance'
            ? 's3://fin-ledger/q4_salary_sheets.csv'
            : randEmp.department === 'Engineering'
              ? 'gitlab.internal/core/auth-service.git'
              : 'postgresql://analytics-prod:5432/pii_tables',
        threatScore: generatedScore,
        decision,
        policyMatched,
        confidence: Number((0.92 + Math.random() * 0.07).toFixed(2)),
        ipAddress: `192.168.${Math.floor(Math.random() * 5) + 1}.${Math.floor(
          Math.random() * 200,
        ) + 10}`,
      }

      setRequests((prev) => [newPacket, ...prev.slice(0, 7)])
      setCurrentThreatScore(generatedScore)
    }, 2500)

    return () => clearInterval(interval)
  }, [activeMonitoring, decisionThreshold])

  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
    currentThreatScore >= 0.75
      ? 'CRITICAL'
      : currentThreatScore >= 0.5
        ? 'HIGH'
        : currentThreatScore >= 0.25
          ? 'MEDIUM'
          : 'LOW'

  return (
    <div className="space-y-8">
      {/* Module Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
              CORE ZERO TRUST ARBITRATION
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Privacy Shield Technologies Pvt. Ltd.
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            AI Firewall Engine
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            Autonomous decision engine synthesizing continuous User Behavior Analytics (UBA), ensemble ML inference, and deterministic Zero Trust policy arbitration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveMonitoring((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              activeMonitoring
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {activeMonitoring ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span>Pause Live Engine</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 text-emerald-600" />
                <span>Resume Live Engine</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Real-Time KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Real-Time Threat Score"
          value={`${(currentThreatScore * 100).toFixed(0)}%`}
          detail={
            riskLevel === 'CRITICAL'
              ? 'Critical threshold breached'
              : riskLevel === 'HIGH'
                ? 'High anomaly elevation'
                : 'Within standard baseline'
          }
          icon={<BoltIcon className="h-5 w-5 text-blue-600" />}
        />

        <MetricCard
          label="Current Risk Level"
          value={riskLevel}
          detail="Continuous ML classification"
          icon={<ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />}
        />

        <MetricCard
          label="AI Model Confidence"
          value="98.4%"
          detail="XGBoost Ensemble Consensus"
          icon={<SparklesIcon className="h-5 w-5 text-blue-600" />}
        />

        <MetricCard
          label="Active Monitoring"
          value={activeMonitoring ? 'ACTIVE' : 'PAUSED'}
          detail="3-sec streaming telemetry"
          icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
        />

        <MetricCard
          label="System Status"
          value={statusData?.status ?? 'ONLINE'}
          detail="Zero Trust Pipeline 1.2ms"
          icon={<CpuChipIcon className="h-5 w-5 text-blue-600" />}
        />
      </div>

      {/* 3D Visualizer & Interactive Decision Engine Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: 3D AI Firewall Core Visualizer */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  3D TELEMETRY FLOW CORE
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Interactive AI Firewall Core & Threat Flow
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span>60 FPS Spatial WebGL/Canvas</span>
              </div>
            </div>

            <div className="mt-4">
              <AiFirewallCore3D
                threatScore={currentThreatScore}
                riskLevel={riskLevel}
                activeMonitoring={activeMonitoring}
                packetCount={packetCount}
              />
            </div>
          </Card>
        </div>

        {/* Right: Decision Engine & Policy Matching Panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    ZERO TRUST ARBITRATION
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Decision Engine & Policy Matching
                  </h2>
                </div>
                <FirewallActionBadge
                  action={
                    currentThreatScore >= decisionThreshold
                      ? 'BLOCK'
                      : currentThreatScore >= 0.4
                        ? 'WARN'
                        : 'ALLOW'
                  }
                />
              </div>

              {/* Threshold Slider */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Enforcement Block Threshold:</span>
                  <span className="font-mono text-blue-600 font-bold">
                    {(decisionThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={decisionThreshold}
                  onChange={(e) => setDecisionThreshold(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Requests with AI Threat Score &gt;= {(decisionThreshold * 100).toFixed(0)}% trigger autonomous execution block.
                </p>
              </div>

              {/* Matched Policy Rule Breakdown */}
              <div className="mt-5 space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Active Policy Trigger Assessment
                </p>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Matched Rule:</span>
                    <span className="font-bold text-slate-900">
                      {currentThreatScore >= decisionThreshold
                        ? 'RULE-USB-EXFILTRATION-BLOCK-01'
                        : currentThreatScore >= 0.4
                          ? 'RULE-ELEVATED-UBA-WARN-02'
                          : 'RULE-DEFAULT-ALLOW-04'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Arbitration Action:</span>
                    <span
                      className={`font-bold ${
                        currentThreatScore >= decisionThreshold
                          ? 'text-rose-600'
                          : currentThreatScore >= 0.4
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                      }`}
                    >
                      {currentThreatScore >= decisionThreshold
                        ? 'IMMEDIATE TLS TCP RST / BLOCK'
                        : currentThreatScore >= 0.4
                          ? 'STEP-UP MFA CHALLENGE / WARN'
                          : 'AUTHENTICATED ZERO TRUST ALLOW'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">AI Ensemble Confidence:</span>
                    <span className="text-blue-600 font-bold">98.4%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <AdjustmentsHorizontalIcon className="h-4 w-4 text-blue-600" />
                Deterministic Rule Enforcement
              </span>
              <span className="font-semibold text-emerald-700">10 Policies Active</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Threat Timeline & Attack Timeline */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              TEMPORAL INCIDENT ANALYSIS
            </span>
            <h2 className="text-base font-extrabold text-slate-900">
              Threat Timeline & Attack Volume Progression
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Standard Requests
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Flagged Attacks
            </span>
          </div>
        </div>

        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ATTACK_TIMELINE_DATA}>
              <defs>
                <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="normalVolume"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#normalGrad)"
                name="Normal Requests"
              />
              <Area
                type="monotone"
                dataKey="threatVolume"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#threatGrad)"
                name="Attacks Intercepted"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Threat Heatmap & Risk Distribution Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Threat Heatmap */}
        <div className="lg:col-span-8">
          <Card className="p-6 h-full">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                INTENSITY MATRIX
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Threat Heatmap (Department vs. Hourly Timeline)
              </h2>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Department</th>
                    {HEATMAP_HOURS.map((hr) => (
                      <th key={hr} className="py-2.5 px-3 text-center">
                        {hr}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {HEATMAP_DEPARTMENTS.map((dept) => {
                    const scores = HEATMAP_MATRIX[dept] ?? [10, 15, 20, 25, 30, 20]
                    return (
                      <tr key={dept} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{dept}</td>
                        {scores.map((score, idx) => {
                          const bgStyle =
                            score > 70
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : score > 40
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : score > 25
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-100'

                          return (
                            <td key={idx} className="py-2.5 px-2 text-center">
                              <span
                                className={`inline-block w-12 py-1 rounded-md text-[11px] font-mono font-bold border ${bgStyle}`}
                              >
                                {score}%
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] text-slate-400">
              * Cell value represents peak aggregate UBA behavioral threat score detected across active endpoints.
            </p>
          </Card>
        </div>

        {/* Risk Distribution Pie */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                AGGREGATE CLASSIFICATION
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Risk Distribution
              </h2>
            </div>

            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={RISK_DISTRIBUTION_DATA}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {RISK_DISTRIBUTION_DATA.map((entry, index) => (
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

            <div className="space-y-2 pt-2 border-t border-slate-100">
              {RISK_DISTRIBUTION_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {item.percentage}% ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Model Decision & AI Confidence Breakdown */}
      <Card className="p-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            ENSEMBLE MACHINE LEARNING
          </span>
          <h2 className="text-base font-extrabold text-slate-900">
            Model Decision & Confidence Across Pipeline
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODEL_CONFIDENCE_DATA.map((m) => (
            <div
              key={m.model}
              className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{m.model}</span>
                <span className="text-[11px] font-mono text-slate-500">{m.latency}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-blue-600 font-mono">
                  {m.accuracy}%
                </span>
                <span className="text-xs font-medium text-slate-600">
                  Confidence: {m.confidence}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${m.confidence}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Threats & Suspicious Employees Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Suspicious Employees */}
        <div className="lg:col-span-6">
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  PERSONNEL MONITORING
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Suspicious Employees Under UBA Flag
                </h2>
              </div>
              <UserGroupIcon className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-4 space-y-3">
              {EMPLOYEES.filter((e) => e.riskScore > 0.2).map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                      {emp.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{emp.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {emp.department} • {emp.designation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-extrabold font-mono text-slate-900">
                        Score: {(emp.riskScore * 100).toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-slate-400">Behavior: {emp.behaviorScore}/100</p>
                    </div>
                    <RiskBadge
                      risk={
                        emp.riskScore > 0.75
                          ? 'Critical'
                          : emp.riskScore > 0.4
                            ? 'High'
                            : 'Medium'
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Threats */}
        <div className="lg:col-span-6">
          <Card className="p-6 h-full">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                ACTIVE VECTORS
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Top Threats & Attack Vectors
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900">
                    Removable USB Storage Data Exfiltration
                  </span>
                  <span className="rounded-full bg-rose-200/80 px-2 py-0.5 text-[10px] font-extrabold text-rose-800">
                    CRITICAL (Score: 0.94)
                  </span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Off-hours mass database backup copy detected to unauthorized SanDisk USB endpoint.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">
                    Split Tunnel VPN & Geolocation Anomaly
                  </span>
                  <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                    HIGH (Score: 0.72)
                  </span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Concurrent session asserted from disparate geographic subnet outside standard travel profile.
                </p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">
                    Elevated HTTP Request Velocity Spike
                  </span>
                  <span className="rounded-full bg-blue-200/80 px-2 py-0.5 text-[10px] font-extrabold text-blue-800">
                    MEDIUM (Score: 0.48)
                  </span>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  API query volume exceeding baseline role threshold by 340% on customer billing microservice.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Live Requests & Recent Decisions Stream Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              REAL-TIME STREAM
            </span>
            <h2 className="text-base font-extrabold text-slate-900">
              Live Requests & Recent Autonomous Decisions
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <ClockIcon className="h-4 w-4 text-blue-600" />
            <span>Updated: {requests[0]?.timestamp ?? 'Just now'}</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Packet ID</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Target Resource</th>
                <th className="py-3 px-3">Threat Score</th>
                <th className="py-3 px-3">Policy Trigger</th>
                <th className="py-3 px-3">Decision</th>
                <th className="py-3 px-3">AI Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">{req.id}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{req.timestamp}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900">{req.subject}</span>
                    <span className="block text-[10px] text-slate-400">{req.department}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                    {req.resource}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-mono font-bold ${
                        req.threatScore >= 0.75
                          ? 'text-rose-600'
                          : req.threatScore >= 0.4
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                      }`}
                    >
                      {(req.threatScore * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                    {req.policyMatched}
                  </td>
                  <td className="py-3 px-3">
                    <FirewallActionBadge action={req.decision} />
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 font-bold">
                    {(req.confidence * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
