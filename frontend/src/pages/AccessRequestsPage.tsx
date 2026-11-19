import {
  ArrowPathIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  ComputerDesktopIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LockClosedIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FirewallActionBadge } from '../components/FirewallActionBadge'
import { RiskBadge } from '../components/RiskBadge'
import { evaluateAccess } from '../services/firewallService'
import type {
  FirewallEvaluationResponse,
  FirewallModelName,
} from '../types/api'

// Preset test scenarios for rapid SecOps evaluation
interface PresetScenario {
  label: string
  description: string
  employeeName: string
  department: string
  role: string
  resource: string
  action: string
  device: string
  loginTime: string
  downloadCount: number
  failedLoginAttempts: number
  usbAttached: boolean
  outboundEmail: boolean
  httpSpikes: boolean
  offHoursAccess: boolean
  modelName: FirewallModelName
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    label: 'High-Threat Insider Exfiltration',
    description: 'Off-hours bulk export with removable USB media attached and failed logins.',
    employeeName: 'Alice Vance',
    department: 'Finance & Accounting',
    role: 'Senior Financial Analyst',
    resource: 's3://secure-vault/corporate-financials.parquet',
    action: 'bulk_download',
    device: 'Unrecognized Personal Laptop (BYOD)',
    loginTime: '23:45',
    downloadCount: 180,
    failedLoginAttempts: 4,
    usbAttached: true,
    outboundEmail: true,
    httpSpikes: false,
    offHoursAccess: true,
    modelName: 'LogisticRegression',
  },
  {
    label: 'Conditional Restricted Access',
    description: 'Clinical PII query outside normal hours with elevated download volume.',
    employeeName: 'David Miller',
    department: 'Healthcare & Clinical Systems',
    role: 'Clinical Data Lead',
    resource: '/api/v1/patient-pii/medical-records',
    action: 'query',
    device: 'Corporate Managed Laptop (Encrypted)',
    loginTime: '19:30',
    downloadCount: 45,
    failedLoginAttempts: 1,
    usbAttached: false,
    outboundEmail: false,
    httpSpikes: false,
    offHoursAccess: true,
    modelName: 'RandomForest',
  },
  {
    label: 'Advisory Warning Access',
    description: 'Billing read operation with abnormal HTTP request burst activity.',
    employeeName: 'Elena Rostova',
    department: 'Customer Operations',
    role: 'Support Specialist',
    resource: '/api/v1/customer-billing/data',
    action: 'read',
    device: 'Corporate Managed Laptop (Encrypted)',
    loginTime: '14:15',
    downloadCount: 15,
    failedLoginAttempts: 0,
    usbAttached: false,
    outboundEmail: false,
    httpSpikes: true,
    offHoursAccess: false,
    modelName: 'DecisionTree',
  },
  {
    label: 'Routine Permitted Access',
    description: 'Standard authorized developer repository read during business hours.',
    employeeName: 'Marcus Chen',
    department: 'Engineering & R&D',
    role: 'Systems Architect',
    resource: 'git://internal-code/firewall-core',
    action: 'read',
    device: 'Corporate Managed Laptop (Encrypted)',
    loginTime: '10:30',
    downloadCount: 2,
    failedLoginAttempts: 0,
    usbAttached: false,
    outboundEmail: false,
    httpSpikes: false,
    offHoursAccess: false,
    modelName: 'LogisticRegression',
  },
]

export function AccessRequestsPage() {
  // Form State
  const [employeeName, setEmployeeName] = useState('Alice Vance')
  const [department, setDepartment] = useState('Finance & Accounting')
  const [role, setRole] = useState('Senior Financial Analyst')
  const [resource, setResource] = useState('s3://secure-vault/corporate-financials.parquet')
  const [action, setAction] = useState('bulk_download')
  const [device, setDevice] = useState('Corporate Managed Laptop (Encrypted)')
  const [loginTime, setLoginTime] = useState('23:45')
  const [downloadCount, setDownloadCount] = useState<number>(180)
  const [failedLoginAttempts, setFailedLoginAttempts] = useState<number>(4)

  // Additional Behavioral Indicators
  const [usbAttached, setUsbAttached] = useState(true)
  const [outboundEmail, setOutboundEmail] = useState(true)
  const [httpSpikes, setHttpSpikes] = useState(false)
  const [offHoursAccess, setOffHoursAccess] = useState(true)

  // AI Model Selection
  const [modelName, setModelName] = useState<FirewallModelName>('LogisticRegression')

  // UI / Request State
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [result, setResult] = useState<FirewallEvaluationResponse | null>(null)

  const applyPreset = (preset: PresetScenario) => {
    setEmployeeName(preset.employeeName)
    setDepartment(preset.department)
    setRole(preset.role)
    setResource(preset.resource)
    setAction(preset.action)
    setDevice(preset.device)
    setLoginTime(preset.loginTime)
    setDownloadCount(preset.downloadCount)
    setFailedLoginAttempts(preset.failedLoginAttempts)
    setUsbAttached(preset.usbAttached)
    setOutboundEmail(preset.outboundEmail)
    setHttpSpikes(preset.httpSpikes)
    setOffHoursAccess(preset.offHoursAccess)
    setModelName(preset.modelName)
    setErrorMsg(null)
  }

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    // Form Validations
    if (!employeeName.trim()) {
      setErrorMsg('Employee Name is required.')
      return
    }
    if (!resource.trim()) {
      setErrorMsg('Target Resource URI is required.')
      return
    }
    if (downloadCount < 0) {
      setErrorMsg('Download count cannot be negative.')
      return
    }
    if (failedLoginAttempts < 0) {
      setErrorMsg('Failed login attempts cannot be negative.')
      return
    }

    setLoading(true)

    // Feature Vector Assembly:
    // Normalize user form inputs into machine learning and heuristic indicator values
    const hour = parseInt(loginTime.split(':')[0] || '12', 10)
    const isLateNight = hour < 8 || hour >= 18 || offHoursAccess

    const fileScore =
      downloadCount > 100 ? 5.0 : downloadCount > 25 ? 2.5 : downloadCount > 0 ? 1.0 : 0.0

    const loginScore =
      (failedLoginAttempts > 0 ? failedLoginAttempts * 0.5 : 0.0) + (isLateNight ? 1.0 : 0.0)

    const features: Record<string, number> = {
      'indicator.usb': usbAttached ? 1.0 : 0.0,
      'indicator.file': fileScore,
      'indicator.email': outboundEmail ? 1.0 : 0.0,
      'indicator.login': loginScore,
      'indicator.http': httpSpikes ? 1.0 : 0.0,
    }

    try {
      const response = await evaluateAccess({
        features,
        subject_id: `${employeeName} (${role})`,
        resource,
        action,
        model_name: modelName,
        context: {
          employee_name: employeeName,
          department,
          role,
          device,
          login_time: loginTime,
          off_hours: isLateNight,
          download_count: downloadCount,
          failed_login_attempts: failedLoginAttempts,
        },
      })

      setResult(response)
      if (response.decision === 'BLOCK') {
        toast.error('Access Request BLOCKED by Privacy Firewall Policy!')
      } else if (response.decision === 'RESTRICT') {
        toast.warning('Access Request Granted with Restrictions.')
      } else if (response.decision === 'WARN') {
        toast.warning('Access Request Allowed with Warning Advisory.')
      } else {
        toast.success('Access Request Evaluated and ALLOWED.')
      }
    } catch (err: unknown) {
      const errText =
        err instanceof Error ? err.message : 'Unable to connect to firewall evaluation service.'
      setErrorMsg(errText)
      toast.error('Evaluation request failed. Check system logs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Access Request Evaluation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Submit subject access context to the Explainable AI Privacy Firewall for zero-trust authorization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <SparklesIcon className="h-4 w-4" />
            AI Policy Engine Online
          </span>
        </div>
      </div>

      {/* Quick Scenario Fill Bar */}
      <Card className="p-4 bg-slate-50/80 border-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BoltIcon className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Quick Test Scenarios:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_SCENARIOS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Access Request Form */}
        <div className="lg:col-span-7">
          <Card>
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Access Request Parameters
              </h2>
              <p className="text-xs text-slate-500">
                Define the subject context, target data resource, device posture, and behavioral telemetry.
              </p>
            </div>

            {errorMsg && (
              <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEvaluate} className="mt-6 space-y-6">
              {/* Section 1: Subject Identity */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <UserIcon className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    1. Subject Identity & Organization
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      required
                      placeholder="e.g. Alice Vance"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Department *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Finance & Accounting">Finance & Accounting</option>
                      <option value="Healthcare & Clinical Systems">Healthcare & Clinical Systems</option>
                      <option value="Engineering & R&D">Engineering & R&D</option>
                      <option value="Infrastructure & Security">Infrastructure & Security</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Legal & Compliance">Legal & Compliance</option>
                      <option value="Customer Operations">Customer Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Assigned Role *
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      placeholder="e.g. Senior Financial Analyst"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Resource & Action */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <ServerStackIcon className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    2. Target Resource & Operation
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Target Resource URI *
                    </label>
                    <input
                      type="text"
                      value={resource}
                      onChange={(e) => setResource(e.target.value)}
                      required
                      placeholder="e.g. s3://secure-vault/corporate-financials.parquet"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Action / Operation *
                    </label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="read">Read (Single Object)</option>
                      <option value="bulk_download">Bulk Download / Mass Read</option>
                      <option value="query">Database Query</option>
                      <option value="export">Data Export</option>
                      <option value="modify">Modify / Update</option>
                      <option value="delete">Delete Record</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Device & Timing Context */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <ComputerDesktopIcon className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    3. Device Posture & Authentication Timing
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Originating Device Posture *
                    </label>
                    <select
                      value={device}
                      onChange={(e) => setDevice(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Corporate Managed Laptop (Encrypted)">
                        Corporate Managed Laptop (Encrypted)
                      </option>
                      <option value="Personal Device (BYOD)">Personal Device (BYOD)</option>
                      <option value="Unrecognized Personal Laptop (BYOD)">
                        Unrecognized Personal Laptop (BYOD)
                      </option>
                      <option value="Privileged Jumpbox / Bastion">
                        Privileged Jumpbox / Bastion
                      </option>
                      <option value="Remote Public Network Host">
                        Remote Public Network Host
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Login Time (24h Window) *
                    </label>
                    <div className="relative mt-1.5">
                      <ClockIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="time"
                        value={loginTime}
                        onChange={(e) => setLoginTime(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 font-mono text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Quantitative Behavioral Metrics */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <BoltIcon className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    4. Quantitative Activity Volume
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Download Count (Files / Objects)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10000}
                      value={downloadCount}
                      onChange={(e) => setDownloadCount(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="mt-1 block text-[11px] text-slate-400">
                      Standard threshold is &lt; 20 files per session.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Failed Login Attempts (Prior 24h)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={failedLoginAttempts}
                      onChange={(e) => setFailedLoginAttempts(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="mt-1 block text-[11px] text-slate-400">
                      Multiple failures trigger authentication risk scores.
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 5: Behavioral Indicators */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <ShieldCheckIcon className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    5. Additional Behavioral Indicators
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usbAttached}
                      onChange={(e) => setUsbAttached(e.target.checked)}
                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Removable USB Storage</div>
                      <div className="text-[11px] text-slate-500">Thumbdrive or external drive connected</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={outboundEmail}
                      onChange={(e) => setOutboundEmail(e.target.checked)}
                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Outbound Email Channel</div>
                      <div className="text-[11px] text-slate-500">External mail transmission active</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={httpSpikes}
                      onChange={(e) => setHttpSpikes(e.target.checked)}
                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">HTTP Web Burst Spike</div>
                      <div className="text-[11px] text-slate-500">High-frequency REST requests observed</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offHoursAccess}
                      onChange={(e) => setOffHoursAccess(e.target.checked)}
                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Off-Hours Authentication</div>
                      <div className="text-[11px] text-slate-500">Access outside normal shift hours</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 6: AI Model Selection */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  AI Classifier Model Architecture
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value as FirewallModelName)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="LogisticRegression">LogisticRegression (Calibrated Probabilities)</option>
                  <option value="DecisionTree">DecisionTree (Rule Boundary Execution)</option>
                  <option value="RandomForest">RandomForest (Ensemble Voting)</option>
                  <option value="XGBoost">XGBoost (High-Gradient Sensitivity)</option>
                </select>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full justify-center py-2.5 text-sm font-semibold shadow-md shadow-indigo-200"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      Evaluating with Privacy Firewall…
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-5 w-5" />
                      Evaluate Access Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Firewall Evaluation Display */}
        <div className="lg:col-span-5">
          {result ? (
            <Card className="border-indigo-100 bg-linear-to-b from-white to-slate-50/70 p-6 shadow-md">
              {/* Header: Decision & Badge */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Evaluation Result
                  </span>
                  <h3 className="mt-0.5 text-lg font-bold text-slate-900">
                    Decision: {result.decision}
                  </h3>
                </div>
                <FirewallActionBadge action={result.decision} />
              </div>

              {/* Core Metric Grid */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    Threat Score
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-bold text-slate-900">
                      {(result.risk_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full ${
                        result.risk_score >= 0.8
                          ? 'bg-rose-500'
                          : result.risk_score >= 0.5
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(result.risk_score * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    Confidence
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-bold text-slate-900">
                      {(result.explanation.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-400 font-mono truncate">
                    Model: {result.explanation.model_name}
                  </span>
                </div>
              </div>

              {/* Policy & Risk Level Banner */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Risk Severity Level</span>
                  <RiskBadge risk={result.risk_level} />
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <span className="text-slate-500">Triggered Policy Name</span>
                  <span className="font-mono font-bold text-slate-800">
                    {result.policy_name}
                  </span>
                </div>
              </div>

              {/* Advisories if present */}
              {result.warning && (
                <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3.5 text-xs text-yellow-900">
                  <div className="flex items-center gap-2 font-bold">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-700 shrink-0" />
                    <span>Warning Advisory Issued</span>
                  </div>
                  <p className="mt-1 text-yellow-800 leading-relaxed">{result.warning}</p>
                </div>
              )}

              {result.restriction_notice && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-bold">
                    <LockClosedIcon className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>Access Restrictions Enforced</span>
                  </div>
                  <p className="mt-1 text-amber-800 leading-relaxed">{result.restriction_notice}</p>
                </div>
              )}

              {/* Explainability Section */}
              <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase">
                    <InformationCircleIcon className="h-4 w-4 text-indigo-600" />
                    <span>Explainability Summary</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {result.explanation.summary}
                  </p>
                </div>

                {result.reasons && result.reasons.length > 0 && (
                  <div>
                    <span className="block text-xs font-bold text-slate-800 uppercase">
                      Decision Rationale Reasons
                    </span>
                    <ul className="mt-2 space-y-1.5">
                      {result.reasons.map((reason, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 rounded-lg bg-white border border-slate-200/80 px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs"
                        >
                          <CheckCircleIcon className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Behavioral Indicators Detected */}
                {result.behavior && result.behavior.anomalous_indicators.length > 0 && (
                  <div>
                    <span className="block text-xs font-bold text-slate-800 uppercase">
                      Detected Behavioral Anomalies
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {result.behavior.anomalous_indicators.map((ind, idx) => (
                        <span
                          key={idx}
                          className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-rose-700"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Meta */}
              <div className="mt-6 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Evaluation ID: {result.evaluation_id.slice(0, 8)}…</span>
                <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
              </div>
            </Card>
          ) : (
            <Card className="flex h-full min-h-[460px] flex-col items-center justify-center p-8 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ShieldExclamationIcon className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Awaiting Evaluation Request
              </h3>
              <p className="mt-1.5 max-w-sm text-xs text-slate-500 leading-relaxed">
                Fill in the employee details, target resource, device posture, and behavioral telemetry on the left (or select a quick test scenario above) and click <strong>Evaluate Access Request</strong>.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Zero-Trust Policy Engine Standing By</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
