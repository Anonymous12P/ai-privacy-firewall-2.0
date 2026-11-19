import {
  ClockIcon,
  GlobeAmericasIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Card } from '../components/Card'
import { MetricCard } from '../components/MetricCard'
import { RiskBadge } from '../components/RiskBadge'
import { DigitalTwinNetwork3D } from '../components/twin/DigitalTwinNetwork3D'
import { EMPLOYEES } from '../data/organizationData'
import type { EmployeeProfile } from '../types/organization'

export function DigitalTwinPage() {
  const [selectedTwin, setSelectedTwin] = useState<EmployeeProfile>(EMPLOYEES[7]!) // Ram Rajurkar by default for active demo

  const riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
    selectedTwin.riskScore > 0.75
      ? 'CRITICAL'
      : selectedTwin.riskScore > 0.4
        ? 'HIGH'
        : selectedTwin.riskScore > 0.2
          ? 'MEDIUM'
          : 'LOW'

  return (
    <div className="space-y-8">
      {/* Module Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
              BEHAVIORAL DIGITAL PERSONA
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Privacy Shield Technologies Pvt. Ltd.
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Employee Digital Twin Center
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            Simulated digital proxy reflecting real-time behavioral vectors, peripheral hardware, sessions, and multi-cloud network telemetry.
          </p>
        </div>

        {/* Digital Twin Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Select Digital Twin:</label>
          <select
            value={selectedTwin.id}
            onChange={(e) => {
              const found = EMPLOYEES.find((emp) => emp.id === e.target.value)
              if (found) setSelectedTwin(found)
            }}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 shadow-2xs"
          >
            {EMPLOYEES.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.department} - {emp.designation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Core Digital Twin Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Current State / Digital Employee */}
        <MetricCard
          label="Digital Employee State"
          value={selectedTwin.status}
          detail={`ID: ${selectedTwin.id} • ${selectedTwin.department}`}
          icon={<UserIcon className="h-5 w-5 text-blue-600" />}
        />

        {/* Current Threat */}
        <MetricCard
          label="Current Threat Score"
          value={`${(selectedTwin.riskScore * 100).toFixed(0)}%`}
          detail={`Risk Level: ${riskCategory}`}
          icon={
            selectedTwin.riskScore > 0.5 ? (
              <ShieldExclamationIcon className="h-5 w-5 text-rose-600" />
            ) : (
              <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
            )
          }
        />

        {/* Current Behavior */}
        <MetricCard
          label="Current Behavior Score"
          value={`${selectedTwin.behaviorScore}/100`}
          detail={
            selectedTwin.behaviorScore < 60
              ? 'Significant baseline deviation'
              : 'Conforms to baseline standard'
          }
          icon={<ClockIcon className="h-5 w-5 text-blue-600" />}
        />

        {/* Current Location & Session */}
        <MetricCard
          label="Current Location"
          value={selectedTwin.location}
          detail="Active Session: WireGuard VPN"
          icon={<MapPinIcon className="h-5 w-5 text-blue-600" />}
        />
      </div>

      {/* 3D Network Activity & Digital Profile Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: 3D Network Activity Graph */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  NETWORK TOPOLOGY
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Network Activity & Connected Endpoints
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <GlobeAmericasIcon className="h-4 w-4 text-blue-600" />
                <span>Active Tunnel</span>
              </div>
            </div>

            <div className="mt-4">
              <DigitalTwinNetwork3D
                employeeName={selectedTwin.name}
                threatScore={selectedTwin.riskScore}
                riskLevel={riskCategory}
                department={selectedTwin.department}
              />
            </div>
          </Card>
        </div>

        {/* Right: Detailed Profile & Current Session State */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    IDENTITY RECORD
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Employee Profile ({selectedTwin.name})
                  </h2>
                </div>
                <RiskBadge risk={riskCategory} />
              </div>

              <div className="mt-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Personnel ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTwin.id}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Department:</span>
                  <span className="font-bold text-slate-900">{selectedTwin.department}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Designation:</span>
                  <span className="font-medium text-slate-900">{selectedTwin.designation}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Email:</span>
                  <span className="font-mono text-blue-600">{selectedTwin.email}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Current Device:</span>
                  <span className="font-medium text-slate-900">{selectedTwin.device}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Current Session:</span>
                  <span className="font-mono text-emerald-600 font-bold">MFA-Active (2h 14m)</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-semibold text-slate-500">Primary Subnet:</span>
                  <span className="font-mono text-slate-700">192.168.1.0/24</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Digital Twin Sync: Real-Time</span>
              <span className="font-semibold text-emerald-700">Ensemble Connected</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Historical Activities & Timeline */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              AUDIT TRAIL
            </span>
            <h2 className="text-base font-extrabold text-slate-900">
              Historical Activities & Timeline
            </h2>
          </div>
          <ClockIcon className="h-5 w-5 text-slate-400" />
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-start gap-3 border-l-2 border-rose-500 pl-4 py-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">
                  Sensitive Table Bulk Query Executed
                </span>
                <span className="text-[10px] font-mono text-slate-500">Today, 21:18:04</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Target: <code className="text-rose-700">s3://fin-ledger/q4_salary_sheets.csv</code> • Outbound Volume: 48.2 MB/s
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-l-2 border-amber-500 pl-4 py-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">
                  Peripheral USB Storage Attached
                </span>
                <span className="text-[10px] font-mono text-slate-500">Today, 21:15:30</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Hardware SanDisk Ultra 64GB detected on port 2. Autonomous kernel mount blocked.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-l-2 border-emerald-500 pl-4 py-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">
                  Corporate WireGuard VPN Established
                </span>
                <span className="text-[10px] font-mono text-slate-500">Today, 20:45:10</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Endpoint authenticated with certificate hash 9f82...102a from {selectedTwin.location}.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
