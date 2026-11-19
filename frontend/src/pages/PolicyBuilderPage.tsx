import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PencilSquareIcon,
  PlayIcon,
  PlusIcon,
  QueueListIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Card } from '../components/Card'
import { PolicySimulator } from '../components/policy/PolicySimulator'
import { PolicyVersionModal } from '../components/policy/PolicyVersionModal'
import { PolicyWizardModal } from '../components/policy/PolicyWizardModal'
import { RuleFlowDiagram } from '../components/policy/RuleFlowDiagram'
import { FirewallActionBadge } from '../components/FirewallActionBadge'
import { RiskBadge } from '../components/RiskBadge'
import {
  exportPoliciesToCSV,
  exportPoliciesToJSON,
  exportPoliciesToPDF,
  exportPoliciesToYAML,
  importPoliciesFromText,
  useAdaptivePolicies,
} from '../services/policyService'
import type { AdaptivePolicy } from '../types/policy'

type TabType = 'registry' | 'flow' | 'simulator'

export function PolicyBuilderPage() {
  const {
    policies,
    savePolicy,
    updatePolicy,
    deletePolicy,
    duplicatePolicy,
    toggleStatus,
  } = useAdaptivePolicies()

  // Tab View
  const [activeTab, setActiveTab] = useState<TabType>('registry')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedScope, setSelectedScope] = useState('All')
  const [selectedAction, setSelectedAction] = useState('All')
  const [sortField, setSortField] = useState<'priority' | 'name' | 'action' | 'date'>('priority')
  const [sortAsc, setSortAsc] = useState(true)

  // Modals
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<AdaptivePolicy | null>(null)
  const [inspectingVersionPolicy, setInspectingVersionPolicy] = useState<AdaptivePolicy | null>(null)
  const [viewingPolicy, setViewingPolicy] = useState<AdaptivePolicy | null>(null)

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Metrics calculations
  const totalPolicies = policies.length
  const enabledPolicies = policies.filter((p) => p.enabled).length
  const disabledPolicies = totalPolicies - enabledPolicies
  const criticalPolicies = policies.filter((p) => p.riskLevel === 'Critical' || p.action === 'BLOCK').length
  const avgEvaluationTime = '1.8 ms'

  // Filtered & Sorted Policies
  const filteredPolicies = useMemo(() => {
    return policies
      .filter((p) => {
        if (selectedScope !== 'All' && p.departmentScope !== selectedScope) return false
        if (selectedAction !== 'All' && p.action !== selectedAction) return false
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchesName = p.name.toLowerCase().includes(q)
          const matchesDesc = p.description.toLowerCase().includes(q)
          const matchesCond = p.conditions.some((c) =>
            `${c.field} ${c.operator} ${c.value}`.toLowerCase().includes(q),
          )
          if (!matchesName && !matchesDesc && !matchesCond) return false
        }
        return true
      })
      .sort((a, b) => {
        let diff = 0
        if (sortField === 'priority') diff = a.priority - b.priority
        else if (sortField === 'name') diff = a.name.localeCompare(b.name)
        else if (sortField === 'action') diff = a.action.localeCompare(b.action)
        else if (sortField === 'date') diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        return sortAsc ? diff : -diff
      })
  }, [policies, selectedScope, selectedAction, searchQuery, sortField, sortAsc])

  // CRUD Actions
  const handleCreateNew = () => {
    setEditingPolicy(null)
    setIsWizardOpen(true)
  }

  const handleEdit = (policy: AdaptivePolicy) => {
    setEditingPolicy(policy)
    setIsWizardOpen(true)
  }

  const handleDuplicate = async (id: string) => {
    try {
      await duplicatePolicy(id)
      toast.success('Policy duplicated successfully.')
    } catch {
      toast.error('Failed to duplicate policy.')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete policy '${name}'?`)) {
      try {
        await deletePolicy(id)
        toast.success(`Policy '${name}' deleted.`)
      } catch {
        toast.error('Failed to delete policy.')
      }
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleStatus(id)
      toast.success('Policy status updated.')
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const handleSaveWizard = async (
    policyData: Omit<AdaptivePolicy, 'id' | 'createdAt' | 'updatedAt' | 'matchedCount' | 'versionHistory' | 'version'>,
  ) => {
    if (editingPolicy) {
      await updatePolicy({
        id: editingPolicy.id,
        updates: policyData,
        changeSummary: 'Modified policy rules via Policy Wizard.',
      })
      toast.success('Policy changes deployed successfully.')
    } else {
      await savePolicy(policyData)
      toast.success('New adaptive policy deployed to firewall.')
    }
    setIsWizardOpen(false)
    setEditingPolicy(null)
  }

  // Export handlers
  const handleExport = (format: 'json' | 'yaml' | 'csv' | 'pdf') => {
    if (format === 'json') exportPoliciesToJSON(policies)
    else if (format === 'yaml') exportPoliciesToYAML(policies)
    else if (format === 'csv') exportPoliciesToCSV(policies)
    else if (format === 'pdf') exportPoliciesToPDF(policies)
    toast.success(`Policies exported as ${format.toUpperCase()}.`)
  }

  // Import handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const format = file.name.endsWith('.yaml') || file.name.endsWith('.yml') ? 'yaml' : 'json'
    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      try {
        await importPoliciesFromText(content, format)
        toast.success(`Imported policies from ${file.name}.`)
      } catch {
        toast.error('Failed to parse policy specification file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <AdjustmentsHorizontalIcon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Adaptive Policy Management System
              </h1>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                v2.4 Policy Engine
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Deterministic rule authoring, multi-condition operators, visual evaluation precedence, and live policy simulator.
            </p>
          </div>
        </div>

        {/* Action Buttons: Wizard, Import, Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Policy</span>
          </button>

          {/* Import Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <ArrowUpTrayIcon className="h-4 w-4 text-slate-500" />
            <span>Import</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,.yaml,.yml"
            className="hidden"
          />

          {/* Export Dropdown Group */}
          <div className="flex items-center rounded-xl border border-slate-300 bg-white p-0.5 shadow-2xs text-xs font-semibold text-slate-700">
            <span className="px-2 py-1 text-slate-400">Export:</span>
            <button
              type="button"
              onClick={() => handleExport('json')}
              className="px-2 py-1 hover:bg-slate-100 rounded"
              title="Export as JSON"
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => handleExport('yaml')}
              className="px-2 py-1 hover:bg-slate-100 rounded"
              title="Export as YAML"
            >
              YAML
            </button>
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="px-2 py-1 hover:bg-slate-100 rounded"
              title="Export as CSV"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              className="px-2 py-1 hover:bg-slate-100 rounded text-rose-700"
              title="Export printable compliance audit PDF"
            >
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Enterprise Policy Metrics (5 Cards) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card className="p-4 shadow-2xs">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Total Policies
          </span>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {totalPolicies}
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Registered in chain</p>
        </Card>

        <Card className="p-4 border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
            Enabled Active
          </span>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-700">
            {enabledPolicies}
          </div>
          <p className="mt-1 text-[10px] text-emerald-600">Actively enforced</p>
        </Card>

        <Card className="p-4 border-slate-200 bg-slate-50/60 shadow-2xs">
          <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
            Disabled / Draft
          </span>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-700">
            {disabledPolicies}
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Temporarily inactive</p>
        </Card>

        <Card className="p-4 border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="block text-[11px] font-bold text-rose-800 uppercase tracking-wide">
            Critical Blocks
          </span>
          <div className="mt-2 font-mono text-2xl font-bold text-rose-700">
            {criticalPolicies}
          </div>
          <p className="mt-1 text-[10px] text-rose-600">Zero-tolerance perimeter</p>
        </Card>

        <Card className="p-4 border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide">
              Evaluation Time
            </span>
            <ClockIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-indigo-700">
            {avgEvaluationTime}
          </div>
          <p className="mt-1 text-[10px] text-indigo-600">Sub-millisecond chain</p>
        </Card>
      </div>

      {/* Navigation Tabs (Registry, Flow, Simulator) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {[
          { key: 'registry', label: 'Policy Registry Table', icon: QueueListIcon, count: totalPolicies },
          { key: 'flow', label: 'Precedence Rule Flow', icon: ArrowPathIcon },
          { key: 'simulator', label: 'Evaluation Simulator', icon: PlayIcon },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB 1: Searchable, Sortable Policy Table with CRUD Actions */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <Card className="p-4 shadow-2xs">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Search policy name, conditions, intent…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-72 rounded-lg border border-slate-300 px-3 py-1.5 text-xs shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-slate-500">Scope:</span>
                  <select
                    value={selectedScope}
                    onChange={(e) => setSelectedScope(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs shadow-2xs"
                  >
                    <option value="All">All Scopes</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-slate-500">Action:</span>
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs shadow-2xs"
                  >
                    <option value="All">All Actions</option>
                    <option value="BLOCK">BLOCK</option>
                    <option value="RESTRICT">RESTRICT</option>
                    <option value="WARN">WARN</option>
                    <option value="ALLOW">ALLOW</option>
                  </select>
                </div>
              </div>

              {/* Sort Order Toggle */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold">Sort by:</span>
                <select
                  value={sortField}
                  onChange={(e) =>
                    setSortField(e.target.value as 'priority' | 'name' | 'action' | 'date')
                  }
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs shadow-2xs"
                >
                  <option value="priority">Priority Order</option>
                  <option value="name">Policy Name</option>
                  <option value="action">Action Decision</option>
                  <option value="date">Last Modified</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortAsc(!sortAsc)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-100"
                >
                  {sortAsc ? 'Asc ↑' : 'Desc ↓'}
                </button>
              </div>
            </div>
          </Card>

          {/* Policy Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Policy Name & Intent</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">Scope</th>
                  <th className="px-4 py-3">Conditions</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPolicies.map((pol) => (
                  <tr
                    key={pol.id}
                    className={`hover:bg-slate-50/80 transition ${
                      !pol.enabled ? 'opacity-60 bg-slate-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">
                      #{pol.priority}
                    </td>

                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-bold text-slate-900">{pol.name}</div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {pol.description}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <FirewallActionBadge action={pol.action} />
                    </td>

                    <td className="px-4 py-3">
                      <RiskBadge risk={pol.riskLevel} />
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {pol.departmentScope}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      <span className="font-bold text-indigo-600">{pol.conditions.length}</span> criteria
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setInspectingVersionPolicy(pol)}
                        className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-700 hover:bg-indigo-100"
                        title="View Version Timeline"
                      >
                        v{pol.version}
                      </button>
                    </td>

                    {/* Enable/Disable Toggle */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(pol.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                          pol.enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            pol.enabled ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                        />
                        {pol.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    {/* Actions Menu */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingPolicy(pol)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(pol)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                          title="Edit Policy"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(pol.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                          title="Duplicate Policy"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(pol.id, pol.name)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                          title="Delete Policy"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Visual Rule Flow Diagram */}
      {activeTab === 'flow' && (
        <RuleFlowDiagram
          policies={policies}
          onSelectPolicy={(p) => setViewingPolicy(p)}
        />
      )}

      {/* TAB 3: Policy Evaluation Simulator */}
      {activeTab === 'simulator' && (
        <PolicySimulator policies={policies} />
      )}

      {/* Modals */}
      <PolicyWizardModal
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false)
          setEditingPolicy(null)
        }}
        onSave={handleSaveWizard}
        initialPolicy={editingPolicy}
      />

      <PolicyVersionModal
        policy={inspectingVersionPolicy}
        onClose={() => setInspectingVersionPolicy(null)}
      />

      {/* View Policy Modal */}
      {viewingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-100 bg-slate-50/70 p-5 flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Priority #{viewingPolicy.priority} • v{viewingPolicy.version}
                </span>
                <h2 className="mt-1 text-lg font-bold text-slate-900">{viewingPolicy.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{viewingPolicy.description}</p>
              </div>
              <FirewallActionBadge action={viewingPolicy.action} />
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Risk Tier</span>
                  <div className="mt-1"><RiskBadge risk={viewingPolicy.riskLevel} /></div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Scope</span>
                  <div className="mt-1 font-bold">{viewingPolicy.departmentScope}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Mode</span>
                  <div className="mt-1 font-mono font-bold text-indigo-700">{viewingPolicy.enforcementMode}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Channel</span>
                  <div className="mt-1 font-semibold">{viewingPolicy.notificationChannel}</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase text-[10px]">Configured Conditions:</span>
                <div className="mt-2 space-y-1.5 font-mono text-[11px]">
                  {viewingPolicy.conditions.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{c.field} {c.operator} {String(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {viewingPolicy.customMessage && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-2.5 text-yellow-900">
                  <span className="font-bold">Advisory Message: </span>
                  <span>{viewingPolicy.customMessage}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex justify-between items-center text-xs">
              <span className="text-slate-400">Policy ID: {viewingPolicy.id}</span>
              <button
                type="button"
                onClick={() => setViewingPolicy(null)}
                className="rounded-lg bg-slate-900 px-3.5 py-1.5 font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
