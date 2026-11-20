import {
  ClockIcon,
  GlobeAmericasIcon,
  PauseIcon,
  PlayIcon,
  RadioIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { FirewallActionBadge } from '../components/FirewallActionBadge'
import { MetricCard } from '../components/MetricCard'
import { EMPLOYEES } from '../data/organizationData'
import { formatThreatScore, getThreatBadgeClasses } from '../utils/threatScore'

interface LiveTelemetryRow {
  id: string
  employee: string
  department: string
  threatScore: number
  loginStatus: 'MFA Verified' | 'Off-Hours SSO' | 'Failed Attempt' | 'Standard'
  usbStatus: 'Connected' | 'None' | 'Blocked'
  vpnStatus: 'Corporate WireGuard' | 'Direct IP' | 'Split Tunnel' | 'None'
  downloadVelocity: string
  httpRequestRate: string
  geoLocation: string
  status: 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK'
  timestamp: string
}

const INITIAL_ROWS: LiveTelemetryRow[] = [
  {
    id: 'TEL-801',
    employee: 'Ram Rajurkar',
    department: 'Engineering',
    threatScore: 86,
    loginStatus: 'Off-Hours SSO',
    usbStatus: 'Blocked',
    vpnStatus: 'Split Tunnel',
    downloadVelocity: '48.2 MB/s',
    httpRequestRate: '840 req/min',
    geoLocation: 'Mumbai Tech Hub',
    status: 'BLOCK',
    timestamp: '10:15:22 AM',
  },
  {
    id: 'TEL-802',
    employee: 'Himanshu Gond',
    department: 'Threat Intelligence',
    threatScore: 54,
    loginStatus: 'Standard',
    usbStatus: 'None',
    vpnStatus: 'Direct IP',
    downloadVelocity: '12.4 MB/s',
    httpRequestRate: '210 req/min',
    geoLocation: 'Pune HQ',
    status: 'RESTRICT',
    timestamp: '10:15:19 AM',
  },
  {
    id: 'TEL-803',
    employee: 'Vaibhav Deshmukh',
    department: 'Compliance',
    threatScore: 26,
    loginStatus: 'MFA Verified',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '4.8 MB/s',
    httpRequestRate: '145 req/min',
    geoLocation: 'Bangalore Center',
    status: 'WARN',
    timestamp: '10:15:12 AM',
  },
  {
    id: 'TEL-804',
    employee: 'Vikas Rathod',
    department: 'SOC',
    threatScore: 14,
    loginStatus: 'MFA Verified',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '0.4 MB/s',
    httpRequestRate: '28 req/min',
    geoLocation: 'Pune HQ',
    status: 'ALLOW',
    timestamp: '10:15:05 AM',
  },
  {
    id: 'TEL-805',
    employee: 'Pavan Jadhav',
    department: 'Engineering',
    threatScore: 18,
    loginStatus: 'MFA Verified',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '1.2 MB/s',
    httpRequestRate: '42 req/min',
    geoLocation: 'Pune HQ',
    status: 'ALLOW',
    timestamp: '10:14:58 AM',
  },
  {
    id: 'TEL-806',
    employee: 'Ghanshyam Sapkal',
    department: 'DevOps',
    threatScore: 16,
    loginStatus: 'MFA Verified',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '2.1 MB/s',
    httpRequestRate: '68 req/min',
    geoLocation: 'Pune HQ',
    status: 'ALLOW',
    timestamp: '10:14:50 AM',
  },
  {
    id: 'TEL-807',
    employee: 'Pratik Akkanawaru',
    department: 'Cloud',
    threatScore: 12,
    loginStatus: 'MFA Verified',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '0.8 MB/s',
    httpRequestRate: '34 req/min',
    geoLocation: 'Hyderabad Campus',
    status: 'ALLOW',
    timestamp: '10:14:42 AM',
  },
  {
    id: 'TEL-808',
    employee: 'Saurabh Talape',
    department: 'Security',
    threatScore: 15,
    loginStatus: 'MFA Verified',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '0.5 MB/s',
    httpRequestRate: '30 req/min',
    geoLocation: 'Pune HQ',
    status: 'ALLOW',
    timestamp: '10:14:35 AM',
  },
]

export function LiveMonitoringPage() {
  const [rows, setRows] = useState<LiveTelemetryRow[]>(INITIAL_ROWS)
  const [isStreaming, setIsStreaming] = useState(true)
  const [filterDepartment, setFilterDepartment] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchEmployee, setSearchEmployee] = useState('')

  // Real-time telemetry generator tick every 2.8 seconds
  // Realistic probabilities: ~80% Allow, ~14% Warn, ~5% Restrict, ~1% Block
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      const rand = Math.random()
      let randomEmp = EMPLOYEES[Math.floor(Math.random() * EMPLOYEES.length)]!
      let threatScore = Math.floor(4 + Math.random() * 16)
      let status: 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK' = 'ALLOW'
      let loginStatus: LiveTelemetryRow['loginStatus'] = 'MFA Verified'
      let usbStatus: LiveTelemetryRow['usbStatus'] = 'None'
      let vpnStatus: LiveTelemetryRow['vpnStatus'] = 'Corporate WireGuard'
      let dlSpeed = `${(0.2 + Math.random() * 2.5).toFixed(1)} MB/s`
      let reqRate = `${Math.floor(15 + Math.random() * 70)} req/min`

      if (rand < 0.01) {
        // ~1% Rare Critical Event
        const critList = EMPLOYEES.filter((e) => e.status === 'Suspended')
        randomEmp = critList.length > 0 ? critList[Math.floor(Math.random() * critList.length)]! : randomEmp
        threatScore = Math.floor(82 + Math.random() * 14)
        status = 'BLOCK'
        loginStatus = 'Off-Hours SSO'
        usbStatus = 'Blocked'
        vpnStatus = 'Split Tunnel'
        dlSpeed = `${(35 + Math.random() * 45).toFixed(1)} MB/s`
        reqRate = `${Math.floor(650 + Math.random() * 350)} req/min`
      } else if (rand < 0.06) {
        // ~5% Restrict Event
        const highList = EMPLOYEES.filter((e) => e.status === 'Investigating')
        randomEmp = highList.length > 0 ? highList[Math.floor(Math.random() * highList.length)]! : randomEmp
        threatScore = Math.floor(48 + Math.random() * 28)
        status = 'RESTRICT'
        loginStatus = 'Standard'
        usbStatus = 'Connected'
        vpnStatus = 'Direct IP'
        dlSpeed = `${(15 + Math.random() * 20).toFixed(1)} MB/s`
        reqRate = `${Math.floor(250 + Math.random() * 200)} req/min`
      } else if (rand < 0.20) {
        // ~14% Warning Event
        const warnList = EMPLOYEES.filter((e) => e.status === 'Under Watch')
        randomEmp = warnList.length > 0 ? warnList[Math.floor(Math.random() * warnList.length)]! : randomEmp
        threatScore = Math.floor(22 + Math.random() * 18)
        status = 'WARN'
        loginStatus = Math.random() > 0.4 ? 'MFA Verified' : 'Standard'
        usbStatus = 'None'
        vpnStatus = Math.random() > 0.5 ? 'Corporate WireGuard' : 'Direct IP'
        dlSpeed = `${(4 + Math.random() * 8).toFixed(1)} MB/s`
        reqRate = `${Math.floor(90 + Math.random() * 110)} req/min`
      } else {
        // ~80% Normal Event
        const normalList = EMPLOYEES.filter((e) => e.status === 'Active')
        randomEmp = normalList.length > 0 ? normalList[Math.floor(Math.random() * normalList.length)]! : randomEmp
        threatScore = Math.floor(4 + Math.random() * 16)
        status = 'ALLOW'
        loginStatus = Math.random() > 0.15 ? 'MFA Verified' : 'Standard'
        usbStatus = 'None'
        vpnStatus = 'Corporate WireGuard'
      }

      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const newRow: LiveTelemetryRow = {
        id: `TEL-${Math.floor(800 + Math.random() * 900)}`,
        employee: randomEmp.name,
        department: randomEmp.department,
        threatScore,
        loginStatus,
        usbStatus,
        vpnStatus,
        downloadVelocity: dlSpeed,
        httpRequestRate: reqRate,
        geoLocation: randomEmp.location.split(' - ')[0] || randomEmp.location,
        status,
        timestamp: timeStr,
      }

      setRows((prev) => [newRow, ...prev.slice(0, 24)])
    }, 2800)

    return () => clearInterval(interval)
  }, [isStreaming])

  const filteredRows = rows.filter((r) => {
    if (filterDepartment !== 'ALL' && r.department !== filterDepartment) return false
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false
    if (searchEmployee.trim()) {
      const q = searchEmployee.toLowerCase()
      if (!r.employee.toLowerCase().includes(q) && !r.department.toLowerCase().includes(q)) {
        return false
      }
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Module Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
              UBA REAL-TIME TELEMETRY STREAM
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Zero Trust Behavior Interceptor
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Live Telemetry & Access Stream
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time packet inspection streaming live behavioral telemetry across 100 enterprise employees and 13 departments.
          </p>
        </div>

        {/* Stream Status Control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <RadioIcon
              className={`h-4 w-4 ${isStreaming ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`}
            />
            <span>{isStreaming ? 'Streaming: 2.8s Interval' : 'Streaming: Paused'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer shadow-2xs ${
              isStreaming
                ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                : 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {isStreaming ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                <span>Resume Stream</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Stream Velocity"
          value="24.8 evt/s"
          detail="In-memory Pipeline"
          icon={<RadioIcon className="h-5 w-5 text-indigo-600" />}
        />
        <MetricCard
          label="Normal Rate"
          value="82.4%"
          detail="Within Role Baseline"
          icon={<ClockIcon className="h-5 w-5 text-emerald-600" />}
        />
        <MetricCard
          label="MFA Challenges"
          value="14.2%"
          detail="Step-up Authentication"
          icon={<UserIcon className="h-5 w-5 text-amber-600" />}
        />
        <MetricCard
          label="Active Blocks"
          value="1.2%"
          detail="TCP Reset Intercepted"
          icon={<GlobeAmericasIcon className="h-5 w-5 text-rose-600" />}
        />
        <MetricCard
          label="Avg Threat Score"
          value="16/100"
          detail="Low Risk Baseline"
          icon={<RadioIcon className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      {/* Telemetry Stream Table */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              CONTINUOUS INGESTION
            </span>
            <h2 className="text-base font-extrabold text-slate-900">
              Live Employee Telemetry Logs ({filteredRows.length} events)
            </h2>
          </div>

          {/* Filtering Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchEmployee}
              onChange={(e) => setSearchEmployee(e.target.value)}
              placeholder="Search employee or dept..."
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Security">Security</option>
              <option value="SOC">SOC</option>
              <option value="Threat Intelligence">Threat Intelligence</option>
              <option value="Compliance">Compliance</option>
              <option value="DevOps">DevOps</option>
              <option value="Cloud">Cloud</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="AI Research">AI Research</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Legal">Legal</option>
              <option value="Marketing">Marketing</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Decisions</option>
              <option value="ALLOW">ALLOW</option>
              <option value="WARN">WARN</option>
              <option value="RESTRICT">RESTRICT</option>
              <option value="BLOCK">BLOCK</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Threat Score</th>
                <th className="py-3 px-4">Login Status</th>
                <th className="py-3 px-4">USB Status</th>
                <th className="py-3 px-4">VPN Routing</th>
                <th className="py-3 px-4">Downloads</th>
                <th className="py-3 px-4">HTTP Rate</th>
                <th className="py-3 px-4">Geo Location</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRows.map((row) => {
                const badgeStyles = getThreatBadgeClasses(row.threatScore)

                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Column 1: Live employee activity */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.employee}</div>
                      <div className="text-[10px] text-slate-500">{row.department}</div>
                    </td>

                    {/* Column 2: Threat score */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded-md ${badgeStyles.badge}`}>
                        {formatThreatScore(row.threatScore)}
                      </span>
                    </td>

                    {/* Column 3: Login */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.loginStatus === 'Off-Hours SSO'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : row.loginStatus === 'MFA Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {row.loginStatus}
                      </span>
                    </td>

                    {/* Column 4: USB */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.usbStatus === 'Blocked'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : row.usbStatus === 'Connected'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {row.usbStatus}
                      </span>
                    </td>

                    {/* Column 5: VPN */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      <span
                        className={
                          row.vpnStatus === 'Split Tunnel'
                            ? 'text-rose-600 font-bold'
                            : row.vpnStatus === 'Direct IP'
                              ? 'text-amber-600 font-bold'
                              : 'text-slate-700'
                        }
                      >
                        {row.vpnStatus}
                      </span>
                    </td>

                    {/* Column 6: Downloads */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">{row.downloadVelocity}</td>

                    {/* Column 7: HTTP Requests */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">{row.httpRequestRate}</td>

                    {/* Column 8: Geo Location */}
                    <td className="py-3.5 px-4 text-slate-700">{row.geoLocation}</td>

                    {/* Column 9: Decision */}
                    <td className="py-3.5 px-4">
                      <FirewallActionBadge action={row.status} />
                    </td>

                    {/* Column 10: Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{row.timestamp}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
