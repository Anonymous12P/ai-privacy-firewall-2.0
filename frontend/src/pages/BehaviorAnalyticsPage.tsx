import {
  ClockIcon,
  DevicePhoneMobileIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  FingerPrintIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../components/Card'
import { MetricCard } from '../components/MetricCard'
import { RiskBadge } from '../components/RiskBadge'
import { useAnalytics } from '../hooks/useAnalytics'

const SAMPLE_RISK_USERS = [
  { id: 'EMP-9021', name: 'Alice Vance', department: 'Finance & Accounting', riskScore: '96.5%', anomalyCount: 4, primaryFlag: 'USB Media + Off-Hours Download' },
  { id: 'EMP-4412', name: 'David Miller', department: 'Clinical Research', riskScore: '82.0%', anomalyCount: 3, primaryFlag: 'High File Read Velocity' },
  { id: 'EMP-3108', name: 'Elena Rostova', department: 'Customer Success', riskScore: '54.0%', anomalyCount: 2, primaryFlag: 'HTTP Rate Anomaly' },
  { id: 'EMP-7719', name: 'Kevin Zhang', department: 'Infrastructure Engineering', riskScore: '48.5%', anomalyCount: 1, primaryFlag: 'Off-Hours Authentication' },
  { id: 'EMP-6003', name: 'Sophia Patel', department: 'Human Resources', riskScore: '39.0%', anomalyCount: 1, primaryFlag: 'Unusual Bulk Export' },
]

export function BehaviorAnalyticsPage() {
  const { data: analytics } = useAnalytics()

  const riskyUsers = analytics?.top_risky_users && analytics.top_risky_users.length > 0
    ? analytics.top_risky_users.map((username, index) => ({
        id: `EMP-${1000 + index}`,
        name: username,
        department: 'Corporate Systems',
        riskScore: '85.0%',
        anomalyCount: 2,
        primaryFlag: 'Behavioral Anomaly Observed',
      }))
    : SAMPLE_RISK_USERS

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          User Behavior Analytics (UBA)
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Continuous anomaly detection and baseline deviation tracking for internal subjects.
        </p>
      </div>

      {/* Indicator Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="USB & Peripheral Events"
          value="42"
          detail="Active removable storage alerts"
          icon={<DevicePhoneMobileIcon className="h-5 w-5 text-indigo-600" />}
        />
        <MetricCard
          label="Mass File Access"
          value="118"
          detail="Bulk read / download thresholds"
          icon={<DocumentDuplicateIcon className="h-5 w-5 text-indigo-600" />}
        />
        <MetricCard
          label="Off-Hours Logins"
          value="29"
          detail="Outside business hours window"
          icon={<ClockIcon className="h-5 w-5 text-amber-600" />}
        />
        <MetricCard
          label="Outbound Exfiltration"
          value="14"
          detail="Email / external channel spikes"
          icon={<EnvelopeIcon className="h-5 w-5 text-rose-600" />}
        />
        <MetricCard
          label="HTTP Spikes"
          value="87"
          detail="Anomalous web request frequency"
          icon={<GlobeAltIcon className="h-5 w-5 text-indigo-600" />}
        />
      </div>

      {/* Top Behavioral Risk Profiles */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                High Behavioral Anomaly Subjects
              </h2>
              <p className="text-xs text-slate-500 sm:text-sm">
                Ranked by cumulative heuristic anomaly scores and baseline deviations.
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <FingerPrintIcon className="h-3.5 w-3.5" />
              UBA Engine Active
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Anomaly Score</th>
                <th className="px-6 py-3.5">Risk Rating</th>
                <th className="px-6 py-3.5">Anomalies Detected</th>
                <th className="px-6 py-3.5">Primary Behavioral Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {riskyUsers.map((user) => (
                <tr key={user.id} className="transition hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{user.name}</div>
                    <div className="font-mono text-xs text-slate-400">{user.id}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">{user.department}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{user.riskScore}</td>
                  <td className="px-6 py-4">
                    <RiskBadge
                      risk={
                        parseFloat(user.riskScore) >= 80
                          ? 'Critical'
                          : parseFloat(user.riskScore) >= 50
                            ? 'High'
                            : 'Medium'
                      }
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      {user.anomalyCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">
                    {user.primaryFlag}
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
