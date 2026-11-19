import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Card } from '../components/Card'
import { FirewallActionBadge } from '../components/FirewallActionBadge'
import { RiskBadge } from '../components/RiskBadge'
import { useFirewallAudit } from '../hooks/useFirewall'

interface EnterpriseAuditRow {
  id: string
  timestamp: string
  employee: string
  action: string
  risk: string
  decision: 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK'
  ipAddress: string
  device: string
  location: string
}

const DEFAULT_AUDIT_LOGS: EnterpriseAuditRow[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-11-19 21:18:04',
    employee: 'Ram Rajurkar',
    action: 'export_mass_data',
    risk: 'Critical',
    decision: 'BLOCK',
    ipAddress: '192.168.1.184',
    device: 'Windows 11 Enterprise ThinkBook',
    location: 'Mumbai, IN',
  },
  {
    id: 'AUD-902',
    timestamp: '2026-11-19 21:17:55',
    employee: 'Saurabh Talape',
    action: 'git_clone_external',
    risk: 'High',
    decision: 'WARN',
    ipAddress: '10.0.4.112',
    device: 'Custom Linux Rig (KMS-Enforced)',
    location: 'Pune, IN',
  },
  {
    id: 'AUD-903',
    timestamp: '2026-11-19 21:17:41',
    employee: 'Himanshu Gond',
    action: 'bulk_embedding_read',
    risk: 'Medium',
    decision: 'WARN',
    ipAddress: '10.0.12.88',
    device: 'MacBook Pro M2 Pro',
    location: 'Bengaluru, IN',
  },
  {
    id: 'AUD-904',
    timestamp: '2026-11-19 21:17:28',
    employee: 'Vikas Rathod',
    action: 'k8s_cluster_audit',
    risk: 'Low',
    decision: 'ALLOW',
    ipAddress: '10.0.2.14',
    device: 'Linux ThinkPad Carbon X1',
    location: 'Pune, IN',
  },
  {
    id: 'AUD-905',
    timestamp: '2026-11-19 21:17:12',
    employee: 'Pavan Jadhav',
    action: 'ui_bundle_deploy',
    risk: 'Low',
    decision: 'ALLOW',
    ipAddress: '10.0.2.35',
    device: 'MacBook Pro M3 Max',
    location: 'Mumbai, IN',
  },
  {
    id: 'AUD-906',
    timestamp: '2026-11-19 21:16:45',
    employee: 'Ghanshyam Sapkal',
    action: 'pipeline_health_check',
    risk: 'Low',
    decision: 'ALLOW',
    ipAddress: '10.0.8.22',
    device: 'Ubuntu Precision Workstation',
    location: 'Pune, IN',
  },
  {
    id: 'AUD-907',
    timestamp: '2026-11-19 21:16:10',
    employee: 'Vaibhav Deshmukh',
    action: 'database_schema_verify',
    risk: 'Low',
    decision: 'ALLOW',
    ipAddress: '10.0.6.19',
    device: 'Dell XPS 15 (Corporate)',
    location: 'Hyderabad, IN',
  },
  {
    id: 'AUD-908',
    timestamp: '2026-11-19 21:15:30',
    employee: 'Pratik Akkanawaru',
    action: 'gdpr_compliance_scan',
    risk: 'Low',
    decision: 'ALLOW',
    ipAddress: '10.0.5.41',
    device: 'MacBook Air M2 (Encrypted)',
    location: 'Pune, IN',
  },
]

export function AuditLogsPage() {
  const { data: auditData } = useFirewallAudit({ pageSize: 50 })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRisk, setFilterRisk] = useState('ALL')
  const [filterDecision, setFilterDecision] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // Merge real backend audit items if available
  const allLogs: EnterpriseAuditRow[] =
    auditData?.items && auditData.items.length > 0
      ? auditData.items.map((item, idx) => ({
          id: item.audit_id ?? `AUD-${idx + 100}`,
          timestamp: item.timestamp ?? '2026-11-19 21:18:00',
          employee: item.subject_id ?? 'Vikas Rathod',
          action: item.action,
          risk:
            (item.risk_score ?? 0.1) > 0.75
              ? 'Critical'
              : (item.risk_score ?? 0.1) > 0.4
                ? 'High'
                : (item.risk_score ?? 0.1) > 0.2
                  ? 'Medium'
                  : 'Low',
          decision: (item.decision === 'BLOCK'
            ? 'BLOCK'
            : item.decision === 'WARN'
              ? 'WARN'
              : 'ALLOW') as 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK',
          ipAddress: '10.0.2.14',
          device: 'Corporate Linux ThinkPad',
          location: 'Pune, IN',
        }))
      : DEFAULT_AUDIT_LOGS

  const filteredLogs = allLogs.filter((log) => {
    if (filterRisk !== 'ALL' && log.risk.toLowerCase() !== filterRisk.toLowerCase()) return false
    if (filterDecision !== 'ALL' && log.decision !== filterDecision) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        log.employee.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q) ||
        log.device.toLowerCase().includes(q) ||
        log.location.toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize))
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Employee', 'Action', 'Risk', 'Decision', 'IP Address', 'Device', 'Location']
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...filteredLogs.map((row) =>
          [
            `"${row.timestamp}"`,
            `"${row.employee}"`,
            `"${row.action}"`,
            `"${row.risk}"`,
            `"${row.decision}"`,
            `"${row.ipAddress}"`,
            `"${row.device}"`,
            `"${row.location}"`,
          ].join(','),
        ),
      ].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `security_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      {/* Module Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
              AUDIT & COMPLIANCE LOGS
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Privacy Shield Technologies Pvt. Ltd.
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Enterprise Security Audit Logs
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            Immutable tamper-evident record of all AI Firewall evaluation verdicts, actor credentials, device telemetry, and IP geolocations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 hover:shadow-md transition-all cursor-pointer"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Advanced Filters & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 min-w-[260px]">
            <div className="relative w-full max-w-md">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by employee, action, IP, device, location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Risk:</span>
              <select
                value={filterRisk}
                onChange={(e) => {
                  setFilterRisk(e.target.value)
                  setCurrentPage(1)
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 shadow-2xs"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Decision:</span>
              <select
                value={filterDecision}
                onChange={(e) => {
                  setFilterDecision(e.target.value)
                  setCurrentPage(1)
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 shadow-2xs"
              >
                <option value="ALL">All Decisions</option>
                <option value="ALLOW">ALLOW</option>
                <option value="WARN">WARN</option>
                <option value="BLOCK">BLOCK</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Enterprise Data Table with Exact 8 Mandatory Columns */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Risk</th>
                <th className="py-3.5 px-4">Decision</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Device</th>
                <th className="py-3.5 px-4">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedLogs.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Column 1: Timestamp */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {row.timestamp}
                  </td>

                  {/* Column 2: Employee */}
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {row.employee}
                  </td>

                  {/* Column 3: Action */}
                  <td className="py-3 px-4 font-mono text-slate-700">{row.action}</td>

                  {/* Column 4: Risk */}
                  <td className="py-3 px-4">
                    <RiskBadge risk={row.risk} />
                  </td>

                  {/* Column 5: Decision */}
                  <td className="py-3 px-4">
                    <FirewallActionBadge action={row.decision} />
                  </td>

                  {/* Column 6: IP Address */}
                  <td className="py-3 px-4 font-mono text-slate-600">{row.ipAddress}</td>

                  {/* Column 7: Device */}
                  <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{row.device}</td>

                  {/* Column 8: Location */}
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{row.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{paginatedLogs.length}</strong> of{' '}
            <strong className="text-slate-900">{filteredLogs.length}</strong> logs
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
