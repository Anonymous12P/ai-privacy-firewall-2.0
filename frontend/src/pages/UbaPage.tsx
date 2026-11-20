import {
  ClockIcon,
  ExclamationTriangleIcon,
  FingerPrintIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../components/Card'
import { MetricCard } from '../components/MetricCard'
import { RiskBadge } from '../components/RiskBadge'
import { EMPLOYEES } from '../data/organizationData'
import type { EmployeeProfile } from '../types/organization'
import { formatThreatScore } from '../utils/threatScore'

const FEATURE_IMPORTANCE_DATA = [
  { feature: 'removable_usb_attached', importance: 32, category: 'Hardware' },
  { feature: 'download_velocity_bytes', importance: 26, category: 'Network' },
  { feature: 'off_hours_access_flag', importance: 18, category: 'Temporal' },
  { feature: 'http_request_frequency', importance: 14, category: 'API' },
  { feature: 'vpn_split_tunnel', importance: 10, category: 'Network' },
]

const PEER_COMPARISON_DATA = [
  { metric: 'Download Vol (MB/s)', employee: 48.2, peerAverage: 2.4 },
  { metric: 'API Queries (req/m)', employee: 840, peerAverage: 65 },
  { metric: 'Off-Hours Sessions', employee: 14, peerAverage: 1.2 },
  { metric: 'Sensitive DB Access', employee: 38, peerAverage: 4 },
]

const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HEATMAP_SLOTS = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24']
const HEATMAP_DATA: Record<string, number[]> = {
  Mon: [5, 10, 45, 60, 40, 15],
  Tue: [4, 8, 50, 65, 45, 18],
  Wed: [8, 12, 55, 70, 52, 28],
  Thu: [10, 15, 60, 75, 60, 35],
  Fri: [12, 18, 65, 80, 70, 65],
  Sat: [45, 30, 20, 25, 40, 85],
  Sun: [60, 40, 15, 20, 55, 92],
}

export function UbaPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile>(EMPLOYEES[7]!) // Ram Rajurkar default for interesting demo

  // Dynamic risk timeline based on selected employee
  const riskTimelineData = [
    { time: '08:00', baselineScore: 0.1, actualScore: Number((selectedEmployee.riskScore * 0.3).toFixed(2)) },
    { time: '11:00', baselineScore: 0.12, actualScore: Number((selectedEmployee.riskScore * 0.5).toFixed(2)) },
    { time: '14:00', baselineScore: 0.14, actualScore: Number((selectedEmployee.riskScore * 0.7).toFixed(2)) },
    { time: '17:00', baselineScore: 0.12, actualScore: Number((selectedEmployee.riskScore * 0.85).toFixed(2)) },
    { time: '20:00', baselineScore: 0.08, actualScore: selectedEmployee.riskScore },
    { time: '23:00', baselineScore: 0.05, actualScore: Number((selectedEmployee.riskScore * 0.95).toFixed(2)) },
  ]

  return (
    <div className="space-y-8">
      {/* Module Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
              BEHAVIORAL AI SURVEILLANCE
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Privacy Shield Technologies Pvt. Ltd.
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            User Behavior Analytics (UBA)
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            Continuous baseline modeling and anomaly detection analyzing multi-dimensional user actions against role cohorts.
          </p>
        </div>

        {/* Employee Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Subject Profile:</label>
          <select
            value={selectedEmployee.id}
            onChange={(e) => {
              const found = EMPLOYEES.find((emp) => emp.id === e.target.value)
              if (found) setSelectedEmployee(found)
            }}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 shadow-2xs"
          >
            {EMPLOYEES.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.department} - Threat: {formatThreatScore(emp.riskScore)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Behavioral Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Behavior Score */}
        <MetricCard
          label="Behavior Score"
          value={`${selectedEmployee.behaviorScore}/100`}
          detail={
            selectedEmployee.behaviorScore < 60
              ? 'Significant behavioral divergence'
              : 'Conforms to baseline cohort'
          }
          icon={<FingerPrintIcon className="h-5 w-5 text-blue-600" />}
        />

        {/* 2. Risk Score */}
        <MetricCard
          label="Threat Score"
          value={formatThreatScore(selectedEmployee.riskScore)}
          detail={
            selectedEmployee.riskScore > 80
              ? 'Immediate containment advised'
              : selectedEmployee.riskScore > 40
                ? 'Elevated anomaly monitoring'
                : 'Low probability of exfiltration'
          }
          icon={
            selectedEmployee.riskScore > 60 ? (
              <ShieldExclamationIcon className="h-5 w-5 text-rose-600" />
            ) : (
              <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
            )
          }
        />

        {/* 3. Subject Identity */}
        <MetricCard
          label="Monitored Subject"
          value={selectedEmployee.name}
          detail={`${selectedEmployee.designation} (${selectedEmployee.department})`}
          icon={<UserIcon className="h-5 w-5 text-blue-600" />}
        />

        {/* 4. Active Device */}
        <MetricCard
          label="Registered Hardware"
          value={selectedEmployee.device}
          detail={`Location: ${selectedEmployee.location}`}
          icon={<ClockIcon className="h-5 w-5 text-slate-500" />}
        />
      </div>

      {/* Risk Timeline & Behavior Comparison Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Risk Timeline */}
        <div className="lg:col-span-7">
          <Card className="p-6 h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  TEMPORAL DRIFT
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Risk Timeline (Observed vs. Baseline)
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  Cohort Baseline
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Observed Risk
                </span>
              </div>
            </div>

            <div className="mt-6 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baselineScore"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    name="Cohort Baseline"
                  />
                  <Line
                    type="monotone"
                    dataKey="actualScore"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#ef4444' }}
                    name="Observed Risk"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Behavior Comparison */}
        <div className="lg:col-span-5">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                COHORT BENCHMARK
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Behavior Comparison vs. Peer Baseline
              </h2>
            </div>

            <div className="mt-4 space-y-4">
              {PEER_COMPARISON_DATA.map((item) => (
                <div key={item.metric} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.metric}</span>
                    <span className="font-mono text-slate-500">
                      Target: <strong className="text-rose-600">{item.employee}</strong> | Peer: {item.peerAverage}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-blue-400 h-2"
                      style={{ width: `${Math.min((item.peerAverage / item.employee) * 100, 40)}%` }}
                    />
                    <div
                      className="bg-rose-500 h-2"
                      style={{ width: `${Math.max(100 - (item.peerAverage / item.employee) * 100, 60)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-slate-400 pt-3 border-t border-slate-100">
              * Compares subject telemetry against statistical 30-day moving window of the {selectedEmployee.department} department.
            </p>
          </Card>
        </div>
      </div>

      {/* Heatmaps & Feature Importance Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Heatmaps */}
        <div className="lg:col-span-7">
          <Card className="p-6 h-full">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                TEMPORAL DENSITY
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Activity Heatmap (Day of Week vs. Time Slots)
              </h2>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Day</th>
                    {HEATMAP_SLOTS.map((slot) => (
                      <th key={slot} className="py-2.5 px-3 text-center">
                        {slot}h
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {HEATMAP_DAYS.map((day) => {
                    const rowScores = HEATMAP_DATA[day] ?? [10, 20, 30, 40, 50, 60]
                    return (
                      <tr key={day} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-900">{day}</td>
                        {rowScores.map((score, idx) => {
                          const bgStyle =
                            score > 75
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : score > 45
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : score > 20
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-100'

                          return (
                            <td key={idx} className="py-2 px-2 text-center">
                              <span
                                className={`inline-block w-11 py-1 rounded-md text-[11px] font-mono font-bold border ${bgStyle}`}
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
          </Card>
        </div>

        {/* Feature Importance (SHAP) */}
        <div className="lg:col-span-5">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                XAI ATTRIBUTION
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Feature Importance (SHAP Weights)
              </h2>
            </div>

            <div className="h-56 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FEATURE_IMPORTANCE_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} unit="%" />
                  <YAxis
                    dataKey="feature"
                    type="category"
                    stroke="#64748b"
                    fontSize={10}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="importance" fill="#2563eb" radius={[0, 6, 6, 0]}>
                    {FEATURE_IMPORTANCE_DATA.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#2563eb'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">
              * SHAP values indicate the relative weight of each behavioral vector in driving the threat score.
            </p>
          </Card>
        </div>
      </div>

      {/* Activity Timeline & Anomaly Detection Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Activity Timeline */}
        <div className="lg:col-span-7">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  EVENT LOG
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Activity Timeline ({selectedEmployee.name})
                </h2>
              </div>
              <ClockIcon className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3 border-l-2 border-rose-500 pl-4 py-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      Off-Hours Bulk Export Attempted
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">21:18:04</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Triggered query against payroll database with destination set to external removable drive.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-l-2 border-amber-500 pl-4 py-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      Removable USB Device Plugged In
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">21:15:30</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    SanDisk Ultra 64GB USB storage connected to endpoint {selectedEmployee.device}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-l-2 border-blue-500 pl-4 py-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      Corporate VPN SSO Session Established
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">20:45:10</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    MFA verified via Okta Verify from IP 192.168.1.184 ({selectedEmployee.location}).
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Anomaly Detection List */}
        <div className="lg:col-span-5">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  FLAGGED SIGNALS
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Anomaly Detection Radar
                </h2>
              </div>
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900">Temporal Anomaly</span>
                  <RiskBadge risk="Critical" />
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Activity at 21:18 is 4.8 standard deviations outside standard finance working hours.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Volume Velocity Surge</span>
                  <RiskBadge risk="High" />
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Outbound data volume 48.2 MB/s exceeds 99th percentile of peer group.
                </p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">Endpoint Peripheral Risk</span>
                  <RiskBadge risk="Medium" />
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Removable storage disabled by policy; attempts to access mount point logged.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
