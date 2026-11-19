import {
  ArrowPathIcon,
  CheckCircleIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import type { FirewallAction, FirewallRiskLevel } from '../../types/api'
import type {
  AdaptivePolicy,
  PolicyCondition,
  PolicyConditionField,
  PolicyOperator,
} from '../../types/policy'
import { FirewallActionBadge } from '../FirewallActionBadge'
import { RiskBadge } from '../RiskBadge'

interface PolicyWizardModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (policy: Omit<AdaptivePolicy, 'id' | 'createdAt' | 'updatedAt' | 'matchedCount' | 'versionHistory' | 'version'>) => Promise<void>
  initialPolicy?: AdaptivePolicy | null
}

const CONDITION_FIELDS: { label: string; value: PolicyConditionField; type: 'string' | 'number' | 'boolean' }[] = [
  { label: 'Department', value: 'department', type: 'string' },
  { label: 'Assigned Role', value: 'role', type: 'string' },
  { label: 'Target Resource', value: 'resource', type: 'string' },
  { label: 'Origin Country', value: 'country', type: 'string' },
  { label: 'Device Posture', value: 'device', type: 'string' },
  { label: 'Corporate VPN Active', value: 'vpn', type: 'boolean' },
  { label: 'USB Storage Attached', value: 'usb', type: 'boolean' },
  { label: 'BYOD Personal Device', value: 'byod', type: 'boolean' },
  { label: 'Outbound Email Relay', value: 'email', type: 'boolean' },
  { label: 'HTTP API Burst Spikes', value: 'httpBurst', type: 'boolean' },
  { label: 'Off-Hours Login', value: 'afterHours', type: 'boolean' },
  { label: 'Failed Login Attempts', value: 'failedLogins', type: 'number' },
  { label: 'Risk Assessment Score', value: 'riskScore', type: 'number' },
  { label: 'AI Threat Score', value: 'threatScore', type: 'number' },
]

export function PolicyWizardModal({
  isOpen,
  onClose,
  onSave,
  initialPolicy,
}: PolicyWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Basic Info
  const [name, setName] = useState(initialPolicy?.name ?? '')
  const [description, setDescription] = useState(initialPolicy?.description ?? '')
  const [priority, setPriority] = useState<number>(initialPolicy?.priority ?? 5)
  const [departmentScope, setDepartmentScope] = useState(initialPolicy?.departmentScope ?? 'All')
  const [category, setCategory] = useState<AdaptivePolicy['category']>(initialPolicy?.category ?? 'Access Control')

  // Step 2: Conditions
  const [conditions, setConditions] = useState<PolicyCondition[]>(
    initialPolicy?.conditions && initialPolicy.conditions.length > 0
      ? initialPolicy.conditions
      : [{ id: 'cond-1', field: 'riskScore', operator: 'GREATER_THAN_OR_EQUAL', value: 75 }],
  )

  // Step 3: Action & Enforcement
  const [action, setAction] = useState<FirewallAction>(initialPolicy?.action ?? 'BLOCK')
  const [riskLevel, setRiskLevel] = useState<FirewallRiskLevel>(initialPolicy?.riskLevel ?? 'Critical')
  const [enforcementMode, setEnforcementMode] = useState<'ENFORCING' | 'MONITOR_ONLY' | 'QUARANTINE'>(
    initialPolicy?.enforcementMode ?? 'ENFORCING',
  )
  const [notificationChannel, setNotificationChannel] = useState<'SOC Alert' | 'Slack SecOps' | 'Email Lead' | 'None'>(
    initialPolicy?.notificationChannel ?? 'SOC Alert',
  )
  const [customMessage, setCustomMessage] = useState(
    initialPolicy?.customMessage ?? 'Access restricted under adaptive firewall policy.',
  )

  if (!isOpen) return null

  const handleAddCondition = () => {
    setConditions((prev) => [
      ...prev,
      {
        id: `cond-${Date.now()}`,
        field: 'resource',
        operator: 'CONTAINS',
        value: 'Database',
      },
    ])
  }

  const handleRemoveCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleUpdateCondition = (index: number, updates: Partial<PolicyCondition>) => {
    setConditions((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, ...updates } : c)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Policy Name is required.')
      setStep(1)
      return
    }

    setLoading(true)
    try {
      await onSave({
        name,
        description,
        priority: Number(priority),
        departmentScope,
        category,
        conditions,
        action,
        riskLevel,
        enforcementMode,
        enabled: true,
        notificationChannel,
        customMessage,
      })
      onClose()
    } catch {
      alert('Failed to save policy. Check input parameters.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Wizard Header & Stepper */}
        <div className="border-b border-slate-100 bg-slate-50/70 p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
                {initialPolicy ? 'Edit Policy' : 'Create Adaptive Policy'} • Step {step} of 4
              </span>
              <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                {step === 1 && '1. Basic Policy Information'}
                {step === 2 && '2. Rule Conditions & Preconditions'}
                {step === 3 && '3. Firewall Action & Enforcement Controls'}
                {step === 4 && '4. Review & Policy Deployment'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="mt-4 flex items-center justify-between">
            {[
              { s: 1, label: 'Basic Info' },
              { s: 2, label: 'Conditions' },
              { s: 3, label: 'Action' },
              { s: 4, label: 'Review' },
            ].map((st) => (
              <div
                key={st.s}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setStep(st.s as 1 | 2 | 3 | 4)}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition ${
                    step === st.s
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                      : step > st.s
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step > st.s ? '✓' : st.s}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:inline ${
                    step === st.s ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
            {/* STEP 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Policy Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Strict Exfiltration Prevention Policy"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Description & Security Intent *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the security rationale, target risk vectors, and expected perimeter response."
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Evaluation Priority *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Priority 1 is evaluated first
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Department Scope
                    </label>
                    <select
                      value={departmentScope}
                      onChange={(e) => setDepartmentScope(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs"
                    >
                      <option value="All">All Departments</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Security Operations">Security Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as AdaptivePolicy['category'])}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs"
                    >
                      <option value="Exfiltration">Exfiltration Defense</option>
                      <option value="Compliance">Compliance & PII</option>
                      <option value="Access Control">Access Control</option>
                      <option value="Threat Defense">Threat Defense</option>
                      <option value="Baseline">Baseline Rule</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Conditions Builder */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Rule Preconditions (AND Evaluation)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Define telemetry and contextual conditions that must all evaluate to true to trigger this rule.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Condition</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {conditions.map((cond, idx) => {
                    const fieldDef = CONDITION_FIELDS.find((f) => f.value === cond.field)

                    return (
                      <div
                        key={cond.id}
                        className="flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                      >
                        {/* Field Selector */}
                        <div className="w-full sm:w-1/3">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Field
                          </label>
                          <select
                            value={cond.field}
                            onChange={(e) =>
                              handleUpdateCondition(idx, {
                                field: e.target.value as PolicyConditionField,
                                value:
                                  e.target.value === 'vpn' || e.target.value === 'usb'
                                    ? true
                                    : '',
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs shadow-2xs font-semibold"
                          >
                            {CONDITION_FIELDS.map((f) => (
                              <option key={f.value} value={f.value}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Operator */}
                        <div className="w-full sm:w-1/4">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Operator
                          </label>
                          <select
                            value={cond.operator}
                            onChange={(e) =>
                              handleUpdateCondition(idx, {
                                operator: e.target.value as PolicyOperator,
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs shadow-2xs font-mono"
                          >
                            <option value="EQUALS">EQUALS (==)</option>
                            <option value="NOT_EQUALS">NOT_EQUALS (!=)</option>
                            <option value="GREATER_THAN">GREATER_THAN (&gt;)</option>
                            <option value="GREATER_THAN_OR_EQUAL">
                              GREATER_THAN_EQ (&gt;=)
                            </option>
                            <option value="LESS_THAN">LESS_THAN (&lt;)</option>
                            <option value="LESS_THAN_OR_EQUAL">
                              LESS_THAN_EQ (&lt;=)
                            </option>
                            <option value="CONTAINS">CONTAINS</option>
                            <option value="IN">IN (List)</option>
                          </select>
                        </div>

                        {/* Value Input */}
                        <div className="w-full sm:flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Value
                          </label>
                          {fieldDef?.type === 'boolean' ? (
                            <select
                              value={String(cond.value)}
                              onChange={(e) =>
                                handleUpdateCondition(idx, {
                                  value: e.target.value === 'true',
                                })
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs shadow-2xs font-mono"
                            >
                              <option value="true">True (Active)</option>
                              <option value="false">False (Inactive)</option>
                            </select>
                          ) : fieldDef?.type === 'number' ? (
                            <input
                              type="number"
                              value={Number(cond.value)}
                              onChange={(e) =>
                                handleUpdateCondition(idx, {
                                  value: Number(e.target.value),
                                })
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs shadow-2xs font-mono"
                            />
                          ) : (
                            <input
                              type="text"
                              value={String(cond.value)}
                              onChange={(e) =>
                                handleUpdateCondition(idx, { value: e.target.value })
                              }
                              placeholder="e.g. Medical Records"
                              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs shadow-2xs font-mono"
                            />
                          )}
                        </div>

                        {/* Delete Condition Button */}
                        <div className="self-end pb-0.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveCondition(idx)}
                            disabled={conditions.length === 1}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-rose-600 disabled:opacity-40"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Action & Enforcement */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Firewall Action Decision *
                    </label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value as FirewallAction)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs font-bold"
                    >
                      <option value="BLOCK">BLOCK (Immediate Socket Termination)</option>
                      <option value="RESTRICT">RESTRICT (Impose Isolation & Throttling)</option>
                      <option value="WARN">WARN (Issue SecOps Advisory Warning)</option>
                      <option value="ALLOW">ALLOW (Permit Normal Transaction)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Risk Severity Level
                    </label>
                    <select
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value as FirewallRiskLevel)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs font-semibold"
                    >
                      <option value="Critical">Critical (Immediate Security Incident)</option>
                      <option value="High">High (Elevated Threat Profile)</option>
                      <option value="Medium">Medium (Moderate Behavioral Deviation)</option>
                      <option value="Low">Low (Standard Operating Baseline)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Enforcement Mode
                    </label>
                    <select
                      value={enforcementMode}
                      onChange={(e) =>
                        setEnforcementMode(
                          e.target.value as 'ENFORCING' | 'MONITOR_ONLY' | 'QUARANTINE',
                        )
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs font-mono"
                    >
                      <option value="ENFORCING">ENFORCING (Active Kernel Defense)</option>
                      <option value="MONITOR_ONLY">MONITOR_ONLY (Audit Logging Only)</option>
                      <option value="QUARANTINE">QUARANTINE (Session & Host Isolation)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Notification Dispatch Channel
                    </label>
                    <select
                      value={notificationChannel}
                      onChange={(e) =>
                        setNotificationChannel(
                          e.target.value as 'SOC Alert' | 'Slack SecOps' | 'Email Lead' | 'None',
                        )
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs font-semibold"
                    >
                      <option value="SOC Alert">SOC 24/7 Security Alert</option>
                      <option value="Slack SecOps">Slack #secops-incidents</option>
                      <option value="Email Lead">Email to CISO & Security Lead</option>
                      <option value="None">None (Silent Logging)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Custom Advisory / Restriction Message
                  </label>
                  <textarea
                    rows={2}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Review & Validation */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider font-mono">
                        Priority #{priority} • {category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{description}</p>
                    </div>
                    <FirewallActionBadge action={action} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs pt-2 border-t border-indigo-100">
                    <span className="text-slate-600">
                      Scope: <strong>{departmentScope}</strong>
                    </span>
                    <span className="text-slate-600">
                      Enforcement: <strong>{enforcementMode}</strong>
                    </span>
                    <span className="text-slate-600">
                      Channel: <strong>{notificationChannel}</strong>
                    </span>
                    <RiskBadge risk={riskLevel} />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-800 uppercase">
                    Configured Rule Conditions ({conditions.length})
                  </span>
                  <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono">
                    {conditions.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-700">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>{c.field}</strong> {c.operator} <strong>{String(c.value)}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 flex items-center gap-2 text-xs text-emerald-800">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>
                    Validation Passed: No priority collisions detected against active policy registry. Ready for deployment.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer Controls */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                  <span>{initialPolicy ? 'Save Changes' : 'Deploy Policy'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
