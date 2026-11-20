import {
  BuildingOffice2Icon,
  CircleStackIcon,
  ComputerDesktopIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Card } from '../components/Card'
import { EmployeeDetailModal } from '../components/organization/EmployeeDetailModal'
import { ResourceDetailModal } from '../components/organization/ResourceDetailModal'
import { TopologyDiagram } from '../components/organization/TopologyDiagram'
import { TopologyNodeModal } from '../components/organization/TopologyNodeModal'
import { RiskBadge } from '../components/RiskBadge'
import {
  APPLICATIONS,
  DEPARTMENTS,
  EMPLOYEES,
  ENTERPRISE_OVERVIEW,
  INFRASTRUCTURE,
  SENSITIVE_ASSETS,
  TOPOLOGY_NODES,
} from '../data/organizationData'
import type {
  EmployeeProfile,
  ResourceProfile,
  TopologyNode,
} from '../types/organization'

type ActiveTab = 'topology' | 'employees' | 'databases' | 'applications' | 'infrastructure'

export function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('topology')

  // Selected state for modals
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null)
  const [selectedResource, setSelectedResource] = useState<ResourceProfile | null>(null)
  const [empSearch, setEmpSearch] = useState('')
  const [empDeptFilter, setEmpDeptFilter] = useState('ALL')

  const displayedEmployees = EMPLOYEES.filter((emp) => {
    if (empDeptFilter !== 'ALL' && emp.department !== empDeptFilter) return false
    if (empSearch.trim()) {
      const q = empSearch.toLowerCase()
      if (
        !emp.name.toLowerCase().includes(q) &&
        !emp.role.toLowerCase().includes(q) &&
        !emp.department.toLowerCase().includes(q) &&
        !emp.id.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    return true
  })

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <BuildingOffice2Icon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {ENTERPRISE_OVERVIEW.companyName}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {ENTERPRISE_OVERVIEW.securityStatus}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Enterprise Digital Twin architecture, organizational personas, infrastructure nodes, and sensitive data topology.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ENTERPRISE_OVERVIEW.complianceStandards.map((std, idx) => (
            <span
              key={idx}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs font-mono"
            >
              {std}
            </span>
          ))}
        </div>
      </div>

      {/* Enterprise Overview Metric Cards (The 7 requested metrics) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {/* Metric 1: Company */}
        <Card className="p-4 bg-linear-to-br from-indigo-50/60 to-white border-indigo-100 shadow-2xs">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Company Name
          </span>
          <div className="mt-2 text-sm font-bold text-slate-900 leading-tight">
            {ENTERPRISE_OVERVIEW.companyName}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Digital Twin Scope</p>
        </Card>

        {/* Metric 2: Employees */}
        <Card className="p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Employees
            </span>
            <UserGroupIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {ENTERPRISE_OVERVIEW.employeeCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Across 6 units</p>
        </Card>

        {/* Metric 3: Departments */}
        <Card className="p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Departments
            </span>
            <Squares2X2Icon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {ENTERPRISE_OVERVIEW.departmentCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">RBAC Segments</p>
        </Card>

        {/* Metric 4: Applications */}
        <Card className="p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Applications
            </span>
            <ComputerDesktopIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {ENTERPRISE_OVERVIEW.applicationCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Services in Mesh</p>
        </Card>

        {/* Metric 5: Servers */}
        <Card className="p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Servers
            </span>
            <ServerStackIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {ENTERPRISE_OVERVIEW.serverCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Clusters & Nodes</p>
        </Card>

        {/* Metric 6: Sensitive Databases */}
        <Card className="p-4 border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              Sensitive DBs
            </span>
            <CircleStackIcon className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-amber-700">
            {ENTERPRISE_OVERVIEW.databaseCount}
          </div>
          <p className="mt-1 text-[11px] text-amber-800/80">PII & IP Vaults</p>
        </Card>

        {/* Metric 7: Security Status */}
        <Card className="p-4 border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
              Firewall Status
            </span>
            <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-emerald-700">
            {ENTERPRISE_OVERVIEW.securityStatus}
          </div>
          <p className="mt-1 text-[11px] text-emerald-700">Continuous AI Guard</p>
        </Card>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {[
          { key: 'topology', label: 'Architecture Topology', count: TOPOLOGY_NODES.length },
          { key: 'employees', label: 'Users & Personnel', count: EMPLOYEES.length },
          { key: 'databases', label: 'Sensitive Databases', count: SENSITIVE_ASSETS.length },
          { key: 'applications', label: 'Enterprise Applications', count: APPLICATIONS.length },
          { key: 'infrastructure', label: 'Infrastructure & Servers', count: INFRASTRUCTURE.length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as ActiveTab)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                activeTab === tab.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: Interactive Architecture Topology */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          <TopologyDiagram
            nodes={TOPOLOGY_NODES}
            onSelectNode={(node) => setSelectedNode(node)}
          />

          {/* Department Breakdown Mini-Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Protected Organizational Departments ({DEPARTMENTS.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEPARTMENTS.map((dept) => (
                <Card key={dept.name} className="p-4 shadow-2xs hover:border-indigo-300 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{dept.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                    <span>
                      Headcount: <strong className="text-slate-800">{dept.headcount}</strong>
                    </span>
                    <span>
                      Unit Lead: <strong className="text-indigo-600">{dept.lead}</strong>
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Employees & Personnel */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Key Enterprise Personas & Personnel ({displayedEmployees.length} of {EMPLOYEES.length})
              </h2>
              <p className="text-xs text-slate-500">
                Click any employee to view their zero-trust profile, risk score, behavior timeline, and firewall decisions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                placeholder="Search personnel..."
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <select
                value={empDeptFilter}
                onChange={(e) => setEmpDeptFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.headcount})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedEmployees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition">
                          {emp.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{emp.role}</p>
                      <span className="inline-block mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {emp.department}
                      </span>
                    </div>
                  </div>
                  <RiskBadge risk={emp.riskLevel} />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Risk Index:</span>
                    <span className="font-mono font-bold text-slate-900">{emp.riskScore} / 100</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full ${
                        emp.riskScore >= 75
                          ? 'bg-rose-500'
                          : emp.riskScore >= 50
                            ? 'bg-amber-500'
                            : emp.riskScore >= 25
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(emp.riskScore, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[180px]">{emp.currentDevice}</span>
                    <span className="font-mono text-indigo-600 font-semibold">Inspect →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Sensitive Databases */}
      {activeTab === 'databases' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Sensitive Databases & Data Stores (8)</h2>
            <p className="text-xs text-slate-500">
              High-security databases holding customer records, financial ledgers, HIPAA clinical trials, and proprietary code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SENSITIVE_ASSETS.map((db) => (
              <div
                key={db.id}
                onClick={() => setSelectedResource(db)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-lg cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200 group-hover:scale-105 transition">
                    <CircleStackIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                    {db.confidentiality}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {db.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 font-mono truncate">{db.endpoint}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{db.department}</span>
                  <span className="font-mono text-rose-600 font-bold">{db.blockedRequestsCount} blocked</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Enterprise Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Enterprise Applications & Services</h2>
            <p className="text-xs text-slate-500">
              Internal web portals, CI/CD code hosts, analytics platforms, and payroll engines protected by the firewall.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {APPLICATIONS.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedResource(app)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 group-hover:scale-105 transition">
                    <ComputerDesktopIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 font-mono">
                    {app.currentSessions} active
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {app.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 truncate">{app.owner}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{app.department}</span>
                  <span className="font-mono text-indigo-600 font-semibold">Inspect →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Infrastructure & Servers */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Infrastructure Clusters & Servers</h2>
            <p className="text-xs text-slate-500">
              Identity providers, edge gateways, Kubernetes control planes, Redis cache, and storage clusters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INFRASTRUCTURE.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedResource(srv)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200 group-hover:scale-105 transition">
                    <ServerStackIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                    ONLINE
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {srv.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 font-mono truncate">{srv.endpoint}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{srv.owner}</span>
                  <span className="font-mono text-rose-600 font-bold">{srv.blockedRequestsCount} blk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <TopologyNodeModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      <EmployeeDetailModal
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
      />
    </div>
  )
}
