import {
  CheckCircleIcon,
  PlayIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import type { AdaptivePolicy, SimulatorRequest, SimulatorResult } from '../../types/policy'
import { Card } from '../Card'
import { FirewallActionBadge } from '../FirewallActionBadge'
import { simulatePolicyEvaluation } from '../../services/policyService'

interface PolicySimulatorProps {
  policies: AdaptivePolicy[]
}

export function PolicySimulator({ policies }: PolicySimulatorProps) {
  // Input request attributes
  const [employee, setEmployee] = useState('Pavan')
  const [department, setDepartment] = useState('Engineering')
  const [role, setRole] = useState('Senior Software Engineer')
  const [resource, setResource] = useState('Source Code Repository')
  const [device, setDevice] = useState('Corporate Managed Laptop')
  const [country, setCountry] = useState('US')

  // Telemetry toggles
  const [usb, setUsb] = useState(false)
  const [afterHours, setAfterHours] = useState(false)
  const [vpn, setVpn] = useState(true)
  const [byod, setByod] = useState(false)
  const [httpBurst, setHttpBurst] = useState(false)
  const [email, setEmail] = useState(false)
  const [failedLogins, setFailedLogins] = useState(0)
  const [riskScore, setRiskScore] = useState(15)
  const [threatScore, setThreatScore] = useState(12)

  // Simulation outcome
  const [result, setResult] = useState<SimulatorResult | null>(null)

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault()

    const request: SimulatorRequest = {
      employee,
      department,
      role,
      resource,
      device,
      country,
      usb,
      afterHours,
      failedLogins,
      httpBurst,
      email,
      massDownload: false,
      vpn,
      byod,
      impossibleTravel: false,
      riskScore,
      threatScore,
    }

    const simResult = simulatePolicyEvaluation(request, policies)
    setResult(simResult)
  }

  const loadPreset = (preset: 'exfiltration' | 'hipaa' | 'routine') => {
    if (preset === 'exfiltration') {
      setEmployee('Emma')
      setDepartment('Engineering')
      setRole('Data Scientist')
      setResource('Customer Database')
      setDevice('BYOD Personal Laptop')
      setCountry('US')
      setUsb(true)
      setByod(true)
      setAfterHours(true)
      setEmail(true)
      setFailedLogins(3)
      setRiskScore(88)
      setThreatScore(94)
      setVpn(false)
    } else if (preset === 'hipaa') {
      setEmployee('Sara')
      setDepartment('Healthcare')
      setRole('Medical Researcher')
      setResource('Medical Records')
      setDevice('Secured Linux Workstation')
      setCountry('US')
      setUsb(false)
      setByod(false)
      setAfterHours(true)
      setEmail(false)
      setFailedLogins(0)
      setRiskScore(58)
      setThreatScore(65)
      setVpn(true)
    } else {
      setEmployee('Pavan')
      setDepartment('Engineering')
      setRole('Senior Software Engineer')
      setResource('Source Code Repository')
      setDevice('Corporate Managed Laptop')
      setCountry('US')
      setUsb(false)
      setByod(false)
      setAfterHours(false)
      setEmail(false)
      setFailedLogins(0)
      setRiskScore(12)
      setThreatScore(10)
      setVpn(true)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Form: Attribute Injection (7 cols) */}
      <div className="lg:col-span-7">
        <Card className="p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Policy Evaluation Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Test request telemetry against the live adaptive policy chain.
              </p>
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
              <button
                type="button"
                onClick={() => loadPreset('exfiltration')}
                className="rounded px-2 py-0.5 font-semibold text-rose-700 bg-rose-50 border border-rose-200 text-[11px] hover:bg-rose-100"
              >
                Exfiltration
              </button>
              <button
                type="button"
                onClick={() => loadPreset('hipaa')}
                className="rounded px-2 py-0.5 font-semibold text-amber-700 bg-amber-50 border border-amber-200 text-[11px] hover:bg-amber-100"
              >
                HIPAA PII
              </button>
              <button
                type="button"
                onClick={() => loadPreset('routine')}
                className="rounded px-2 py-0.5 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px] hover:bg-emerald-100"
              >
                Routine
              </button>
            </div>
          </div>

          <form onSubmit={handleSimulate} className="mt-4 space-y-4">
            {/* Subject Context Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Subject Name</label>
                <input
                  type="text"
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 shadow-2xs font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 shadow-2xs"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Security Operations">Security Operations</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Assigned Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 shadow-2xs font-semibold"
                />
              </div>
            </div>

            {/* Target & Device Context Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Target Resource</label>
                <select
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 shadow-2xs font-mono"
                >
                  <option value="Customer Database">Customer Database</option>
                  <option value="Finance Database">Finance Database</option>
                  <option value="Medical Records">Medical Records</option>
                  <option value="Payroll Records">Payroll Records</option>
                  <option value="Employee Records">Employee Records</option>
                  <option value="Source Code Repository">Source Code Repository</option>
                  <option value="GitLab">GitLab</option>
                  <option value="Analytics Warehouse">Analytics Warehouse</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Device Posture</label>
                <input
                  type="text"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Origin Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 shadow-2xs font-mono"
                >
                  <option value="US">US (United States)</option>
                  <option value="GB">GB (United Kingdom)</option>
                  <option value="DE">DE (Germany)</option>
                  <option value="IN">IN (India)</option>
                  <option value="SG">SG (Singapore)</option>
                  <option value="CN">CN (China)</option>
                  <option value="RU">RU (Russia)</option>
                </select>
              </div>
            </div>

            {/* Telemetry Checkboxes */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">
                Simulated Telemetry Indicators
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 cursor-pointer shadow-2xs">
                  <input
                    type="checkbox"
                    checked={usb}
                    onChange={(e) => setUsb(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>USB Storage</span>
                </label>

                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 cursor-pointer shadow-2xs">
                  <input
                    type="checkbox"
                    checked={afterHours}
                    onChange={(e) => setAfterHours(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Off-Hours</span>
                </label>

                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 cursor-pointer shadow-2xs">
                  <input
                    type="checkbox"
                    checked={byod}
                    onChange={(e) => setByod(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>BYOD Device</span>
                </label>

                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 cursor-pointer shadow-2xs">
                  <input
                    type="checkbox"
                    checked={httpBurst}
                    onChange={(e) => setHttpBurst(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>HTTP Burst</span>
                </label>

                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 cursor-pointer shadow-2xs">
                  <input
                    type="checkbox"
                    checked={email}
                    onChange={(e) => setEmail(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Outbound Email</span>
                </label>

                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 cursor-pointer shadow-2xs">
                  <input
                    type="checkbox"
                    checked={vpn}
                    onChange={(e) => setVpn(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Corporate VPN</span>
                </label>
              </div>
            </div>

            {/* Sliders for Risk and Threat */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <label className="block font-semibold text-slate-700">Failed Logins</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={failedLogins}
                  onChange={(e) => setFailedLogins(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-2 py-1 shadow-2xs font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700">Risk Score</span>
                  <span className="font-mono text-indigo-600 font-bold">{riskScore} / 100</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={riskScore}
                  onChange={(e) => setRiskScore(Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700">AI Threat</span>
                  <span className="font-mono text-indigo-600 font-bold">{threatScore} / 100</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={threatScore}
                  onChange={(e) => setThreatScore(Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition"
            >
              <PlayIcon className="h-4 w-4" />
              <span>Simulate Policy Chain Evaluation</span>
            </button>
          </form>
        </Card>
      </div>

      {/* Right Output: Simulator Outcome (5 cols) */}
      <div className="lg:col-span-5">
        {result ? (
          <Card className="p-5 shadow-md border-indigo-100 bg-linear-to-b from-white to-slate-50/60 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Simulation Outcome
                </span>
                <FirewallActionBadge action={result.decision} />
              </div>

              {/* Matched Policy Banner */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-indigo-700">
                    {result.matchedPolicy ? `Priority #${result.matchedPolicy.priority}` : 'Fallback'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Latency: {result.evaluationTimeMs} ms
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {result.matchedPolicy ? result.matchedPolicy.name : 'Zero-Trust Default Fallback'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Matched Condition Criteria */}
              <div className="mt-4 space-y-2 text-xs">
                <span className="block font-bold text-slate-700 uppercase text-[10px]">
                  Evaluated Conditions ({result.matchedConditions.length}):
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {result.matchedConditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white p-2"
                    >
                      <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{cond}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Rules Evaluated: {result.ruleOrderEvaluated}</span>
              <span className="font-semibold text-emerald-600">Deterministic Match</span>
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center p-8 text-center h-full border-dashed border-2">
            <SparklesIcon className="h-10 w-10 text-slate-300" />
            <h4 className="mt-3 text-sm font-bold text-slate-800">
              Awaiting Simulation Input
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-xs">
              Select an employee persona, toggle behavioral telemetry indicators, and click &quot;Simulate Policy Chain Evaluation&quot; to test.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
