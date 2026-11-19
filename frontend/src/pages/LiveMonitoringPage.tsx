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
    department: 'Finance',
    threatScore: 0.88,
    loginStatus: 'Off-Hours SSO',
    usbStatus: 'Blocked',
    vpnStatus: 'Split Tunnel',
    downloadVelocity: '48.2 MB/s',
    httpRequestRate: '840 req/min',
    geoLocation: 'Mumbai, IN',
    status: 'BLOCK',
    timestamp: '10:15:22 AM',
  },
  {
    id: 'TEL-802',
    employee: 'Saurabh Talape',
    department: 'Engineering',
    threatScore: 0.45,
    loginStatus: 'Standard',
    usbStatus: 'None',
    vpnStatus: 'Direct IP',
    downloadVelocity: '12.4 MB/s',
    httpRequestRate: '210 req/min',
    geoLocation: 'Pune, IN',
    status: 'WARN',
    timestamp: '10:15:19 AM',
  },
  {
    id: 'TEL-803',
    employee: 'Himanshu Gond',
    department: 'Data Science',
    threatScore: 0.38,
    loginStatus: 'MFA Verified',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '4.8 MB/s',
    httpRequestRate: '145 req/min',
    geoLocation: 'Bengaluru, IN',
    status: 'WARN',
    timestamp: '10:15:12 AM',
  },
  {
    id: 'TEL-804',
    employee: 'Vikas Rathod',
    department: 'Engineering',
    threatScore: 0.08,
    loginStatus: 'MFA Verified',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '0.4 MB/s',
    httpRequestRate: '28 req/min',
    geoLocation: 'Pune, IN',
    status: 'ALLOW',
    timestamp: '10:15:05 AM',
  },
  {
    id: 'TEL-805',
    employee: 'Pavan Jadhav',
    department: 'Engineering',
    threatScore: 0.12,
    loginStatus: 'MFA Verified',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '1.2 MB/s',
    httpRequestRate: '42 req/min',
    geoLocation: 'Mumbai, IN',
    status: 'ALLOW',
    timestamp: '10:14:58 AM',
  },
  {
    id: 'TEL-806',
    employee: 'Ghanshyam Sapkal',
    department: 'Operations',
    threatScore: 0.19,
    loginStatus: 'MFA Verified',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '2.1 MB/s',
    httpRequestRate: '68 req/min',
    geoLocation: 'Pune, IN',
    status: 'ALLOW',
    timestamp: '10:14:50 AM',
  },
  {
    id: 'TEL-807',
    employee: 'Vaibhav Deshmukh',
    department: 'Product',
    threatScore: 0.14,
    loginStatus: 'Standard',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '0.8 MB/s',
    httpRequestRate: '34 req/min',
    geoLocation: 'Hyderabad, IN',
    status: 'ALLOW',
    timestamp: '10:14:42 AM',
  },
  {
    id: 'TEL-808',
    employee: 'Pratik Akkanawaru',
    department: 'Compliance',
    threatScore: 0.05,
    loginStatus: 'MFA Verified',
    usbStatus: 'None',
    vpnStatus: 'Corporate WireGuard',
    downloadVelocity: '0.1 MB/s',
    httpRequestRate: '19 req/min',
    geoLocation: 'Pune, IN',
    status: 'ALLOW',
    timestamp: '10:14:35 AM',
  },
]

export function LiveMonitoringPage() {
  const [rows, setRows] = useState<LiveTelemetryRow[]>(INITIAL_ROWS)
  const [isStreaming, setIsStreaming] = useState(true)
  const [filterEmployee, setFilterEmployee] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Real-time telemetry generator tick every 3 seconds
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      const randomEmp = EMPLOYEES[Math.floor(Math.random() * EMPLOYEES.length)]!
      const isHighRisk = randomEmp.name === 'Ram Rajurkar'
      const isMediumRisk = randomEmp.name === 'Himanshu Gond' || randomEmp.name === 'Saurabh Talape'

      const threatScore = isHighRisk
        ? Number((0.75 + Math.random() * 0.22).toFixed(2))
        : isMediumRisk
          ? Number((0.35 + Math.random() * 0.25).toFixed(2))
          : Number((0.04 + Math.random() * 0.18).toFixed(2))

      const status: 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK' =
        threatScore >= 0.75
          ? 'BLOCK'
          : threatScore >= 0.5
            ? 'RESTRICT'
            : threatScore >= 0.3
              ? 'WARN'
              : 'ALLOW'

      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const newRow: LiveTelemetryRow = {
        id: `TEL-${Math.floor(800 + Math.random() * 500)}`,
        employee: randomEmp.name,
        department: randomEmp.department,
        threatScore,
        loginStatus: isHighRisk
          ? 'Off-Hours SSO'
          : Math.random() > 0.8
            ? 'Standard'
            : 'MFA Verified',
        usbStatus: isHighRisk ? 'Blocked' : 'None',
        vpnStatus: isHighRisk
          ? 'Split Tunnel'
          : isMediumRisk && Math.random() > 0.5
            ? 'Direct IP'
            : 'Corporate WireGuard',
        downloadVelocity: isHighRisk
          ? `${(30 + Math.random() * 40).toFixed(1)} MB/s`
          : `${(0.2 + Math.random() * 3).toFixed(1)} MB/s`,
        httpRequestRate: isHighRisk
          ? `${Math.floor(600 + Math.random() * 400)} req/min`
          : `${Math.floor(20 + Math.random() * 80)} req/min`,
        geoLocation: randomEmp.location,
        status,
        timestamp: timeStr,
      }

      setRows((prev) => [newRow, ...prev.slice(0, 19)])
    }, 3000)

    return () => clearInterval(interval)
  }, [isStreaming])

  const filteredRows = rows.filter((r) => {
    if (filterEmployee !== 'ALL' && r.employee !== filterEmployee) return false
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false
    return true
  })

  return (
    <div className="space-y-8">
      {/* Module Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
              REAL-TIME UBA TELEMETRY
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Privacy Shield Technologies Pvt. Ltd.
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Live Monitoring & Surveillance
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time per-employee behavior streaming across USB, VPN, downloads, HTTP velocity, and geographic vectors.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsStreaming((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              isStreaming
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isStreaming ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 text-emerald-600" />
                <span>Resume Stream</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Live Stream Status"
          value={isStreaming ? 'STREAMING' : 'PAUSED'}
          detail="3-second update interval"
          icon={<RadioIcon className="h-5 w-5 text-emerald-600 animate-pulse" />}
        />

        <MetricCard
          label="Active Monitored Personnel"
          value={`${EMPLOYEES.length} Employees`}
          detail="All endpoints emitting telemetry"
          icon={<UserIcon className="h-5 w-5 text-blue-600" />}
        />

        <MetricCard
          label="Telemetry Row Buffer"
          value={`${rows.length} Packets`}
          detail="In-memory circular buffer"
          icon={<ClockIcon className="h-5 w-5 text-blue-600" />}
        />

        <MetricCard
          label="Geographic Spread"
          value="4 Metropolitan Hubs"
          detail="Pune, Mumbai, Bengaluru, Hyderabad"
          icon={<GlobeAmericasIcon className="h-5 w-5 text-blue-600" />}
        />
      </div>

      {/* Table Filters & Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Filter Personnel:</span>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 shadow-2xs"
            >
              <option value="ALL">All 8 Personnel</option>
              {EMPLOYEES.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>

            <span className="text-xs font-semibold text-slate-700 ml-2">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 shadow-2xs"
            >
              <option value="ALL">All Decisions</option>
              <option value="ALLOW">ALLOW</option>
              <option value="WARN">WARN</option>
              <option value="RESTRICT">RESTRICT</option>
              <option value="BLOCK">BLOCK</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{filteredRows.length}</span> live events
          </div>
        </div>
      </Card>

      {/* Live Monitoring Table with Exact Mandatory Columns */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Live Employee Activity</th>
                <th className="py-3 px-4">Threat Score</th>
                <th className="py-3 px-4">Login</th>
                <th className="py-3 px-4">USB</th>
                <th className="py-3 px-4">VPN</th>
                <th className="py-3 px-4">Downloads</th>
                <th className="py-3 px-4">HTTP Requests</th>
                <th className="py-3 px-4">Geo Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Column 1: Live employee activity */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{row.employee}</div>
                    <div className="text-[10px] text-slate-500">{row.department}</div>
                  </td>

                  {/* Column 2: Threat score */}
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span
                      className={
                        row.threatScore >= 0.75
                          ? 'text-rose-600'
                          : row.threatScore >= 0.4
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                      }
                    >
                      {(row.threatScore * 100).toFixed(0)}%
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

                  {/* Column 9: Status */}
                  <td className="py-3.5 px-4">
                    <FirewallActionBadge action={row.status} />
                  </td>

                  {/* Column 10: Timestamp */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{row.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
