import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { FirewallAction } from '../types/api'
import type {
  AdaptivePolicy,
  PolicyCondition,
  SimulatorRequest,
  SimulatorResult,
} from '../types/policy'

const STORAGE_KEY = 'ai_privacy_firewall_adaptive_policies'

export const INITIAL_ADAPTIVE_POLICIES: AdaptivePolicy[] = [
  {
    id: 'pol-exfiltration-01',
    name: 'Strict Mass Exfiltration Prevention Policy',
    description: 'Terminates and blocks session immediately if removable USB media or massive download transfer is detected on sensitive databases.',
    priority: 1,
    departmentScope: 'All',
    category: 'Exfiltration',
    conditions: [
      { id: 'c1', field: 'usb', operator: 'EQUALS', value: true },
      { id: 'c2', field: 'riskScore', operator: 'GREATER_THAN_OR_EQUAL', value: 75 },
    ],
    action: 'BLOCK',
    riskLevel: 'Critical',
    enforcementMode: 'ENFORCING',
    enabled: true,
    notificationChannel: 'SOC Alert',
    customMessage: 'Session terminated. Removable USB hardware detected concurrent with elevated threat score.',
    version: '2.1',
    versionHistory: [
      {
        version: '2.1',
        timestamp: '2026-11-14 14:20',
        author: 'Robert (Security Administrator)',
        changeSummary: 'Lowered threat threshold from 80 to 75 to catch early staging.',
        snapshot: {
          name: 'Strict Mass Exfiltration Prevention Policy',
          description: 'Terminates session on USB',
          action: 'BLOCK',
          riskLevel: 'Critical',
          conditionsCount: 2,
        },
      },
      {
        version: '1.0',
        timestamp: '2026-11-01 09:00',
        author: 'Robert (Security Administrator)',
        changeSummary: 'Initial policy baseline deployment.',
        snapshot: {
          name: 'Strict Mass Exfiltration Prevention Policy',
          description: 'Initial deployment',
          action: 'BLOCK',
          riskLevel: 'Critical',
          conditionsCount: 1,
        },
      },
    ],
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-14T14:20:00Z',
    matchedCount: 28,
  },
  {
    id: 'pol-hipaa-02',
    name: 'Healthcare HIPAA Clinical Records Guard',
    description: 'Enforces data masking, step-up MFA challenge, and bandwidth rate-limiting on Medical Records queries.',
    priority: 2,
    departmentScope: 'Healthcare',
    category: 'Compliance',
    conditions: [
      { id: 'c3', field: 'resource', operator: 'CONTAINS', value: 'Medical Records' },
      { id: 'c4', field: 'threatScore', operator: 'GREATER_THAN_OR_EQUAL', value: 50 },
    ],
    action: 'RESTRICT',
    riskLevel: 'High',
    enforcementMode: 'ENFORCING',
    enabled: true,
    notificationChannel: 'Slack SecOps',
    customMessage: 'Access restricted under HIPAA Title II. Data masked and session watermarked.',
    version: '1.4',
    versionHistory: [
      {
        version: '1.4',
        timestamp: '2026-11-10 11:30',
        author: 'Sara (Medical Researcher)',
        changeSummary: 'Added automated watermarking verification requirement.',
        snapshot: {
          name: 'Healthcare HIPAA Clinical Records Guard',
          description: 'HIPAA rule',
          action: 'RESTRICT',
          riskLevel: 'High',
          conditionsCount: 2,
        },
      },
    ],
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-10T11:30:00Z',
    matchedCount: 14,
  },
  {
    id: 'pol-byod-03',
    name: 'Unmanaged BYOD Perimeter Observation Rule',
    description: 'Issues security warning and logs telemetry when unverified personal hardware connects to enterprise services.',
    priority: 3,
    departmentScope: 'All',
    category: 'Access Control',
    conditions: [
      { id: 'c5', field: 'byod', operator: 'EQUALS', value: true },
      { id: 'c6', field: 'riskScore', operator: 'GREATER_THAN', value: 25 },
    ],
    action: 'WARN',
    riskLevel: 'Medium',
    enforcementMode: 'ENFORCING',
    enabled: true,
    notificationChannel: 'Email Lead',
    customMessage: 'Unverified BYOD hardware detected. Telemetry forwarded to SOC auditor.',
    version: '1.2',
    versionHistory: [
      {
        version: '1.2',
        timestamp: '2026-11-08 16:45',
        author: 'Mike (Infrastructure Engineer)',
        changeSummary: 'Scoped rule to verify missing MDM certificates.',
        snapshot: {
          name: 'Unmanaged BYOD Perimeter Observation Rule',
          description: 'BYOD Rule',
          action: 'WARN',
          riskLevel: 'Medium',
          conditionsCount: 2,
        },
      },
    ],
    createdAt: '2026-11-03T11:00:00Z',
    updatedAt: '2026-11-08T16:45:00Z',
    matchedCount: 42,
  },
  {
    id: 'pol-offhours-04',
    name: 'Off-Hours High-Velocity API Burst Advisory',
    description: 'Detects high-frequency REST API burst requests during non-business hours and triggers security alerts.',
    priority: 4,
    departmentScope: 'Finance',
    category: 'Threat Defense',
    conditions: [
      { id: 'c7', field: 'afterHours', operator: 'EQUALS', value: true },
      { id: 'c8', field: 'httpBurst', operator: 'EQUALS', value: true },
    ],
    action: 'WARN',
    riskLevel: 'Medium',
    enforcementMode: 'ENFORCING',
    enabled: true,
    notificationChannel: 'Slack SecOps',
    customMessage: 'Elevated REST burst rate detected outside business hours.',
    version: '1.0',
    versionHistory: [
      {
        version: '1.0',
        timestamp: '2026-11-04 12:00',
        author: 'John (Finance Analyst)',
        changeSummary: 'Created rule for finance ledger gateway monitoring.',
        snapshot: {
          name: 'Off-Hours High-Velocity API Burst Advisory',
          description: 'Burst rule',
          action: 'WARN',
          riskLevel: 'Medium',
          conditionsCount: 2,
        },
      },
    ],
    createdAt: '2026-11-04T12:00:00Z',
    updatedAt: '2026-11-04T12:00:00Z',
    matchedCount: 19,
  },
  {
    id: 'pol-source-code-05',
    name: 'Proprietary Source Code Repository Integrity Policy',
    description: 'Enforces cryptographically signed commits and restricts write/modify operations to authorized engineering staff.',
    priority: 5,
    departmentScope: 'Engineering',
    category: 'Access Control',
    conditions: [
      { id: 'c9', field: 'resource', operator: 'CONTAINS', value: 'Source Code Repository' },
      { id: 'c10', field: 'department', operator: 'NOT_EQUALS', value: 'Engineering' },
    ],
    action: 'BLOCK',
    riskLevel: 'Critical',
    enforcementMode: 'ENFORCING',
    enabled: true,
    notificationChannel: 'SOC Alert',
    customMessage: 'Access denied. Source Code Repository modifications restricted exclusively to Engineering.',
    version: '2.0',
    versionHistory: [
      {
        version: '2.0',
        timestamp: '2026-11-12 15:30',
        author: 'Pavan (Senior Software Engineer)',
        changeSummary: 'Upgraded rule to enforce strict non-engineering isolation.',
        snapshot: {
          name: 'Proprietary Source Code Repository Integrity Policy',
          description: 'Code integrity',
          action: 'BLOCK',
          riskLevel: 'Critical',
          conditionsCount: 2,
        },
      },
    ],
    createdAt: '2026-11-05T09:30:00Z',
    updatedAt: '2026-11-12T15:30:00Z',
    matchedCount: 6,
  },
  {
    id: 'pol-rbac-baseline-06',
    name: 'Standard Enterprise Role-Based Access Baseline',
    description: 'Permits routine authorized operations when subject identity, device posture, and risk scores are within baseline.',
    priority: 99,
    departmentScope: 'All',
    category: 'Baseline',
    conditions: [
      { id: 'c11', field: 'riskScore', operator: 'LESS_THAN', value: 25 },
      { id: 'c12', field: 'vpn', operator: 'EQUALS', value: true },
    ],
    action: 'ALLOW',
    riskLevel: 'Low',
    enforcementMode: 'ENFORCING',
    enabled: true,
    notificationChannel: 'None',
    customMessage: 'Routine operation permitted under RBAC baseline.',
    version: '1.0',
    versionHistory: [
      {
        version: '1.0',
        timestamp: '2026-11-01 08:00',
        author: 'Robert (Security Administrator)',
        changeSummary: 'Default fallback policy created.',
        snapshot: {
          name: 'Standard Enterprise Role-Based Access Baseline',
          description: 'Baseline allow',
          action: 'ALLOW',
          riskLevel: 'Low',
          conditionsCount: 2,
        },
      },
    ],
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
    matchedCount: 1380,
  },
]

// In-Memory Fallback if localStorage unavailable
let memoryPolicies: AdaptivePolicy[] = [...INITIAL_ADAPTIVE_POLICIES]

function getStoredPolicies(): AdaptivePolicy[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADAPTIVE_POLICIES))
      return INITIAL_ADAPTIVE_POLICIES
    }
    const parsed = JSON.parse(raw) as AdaptivePolicy[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ADAPTIVE_POLICIES
  } catch {
    return memoryPolicies
  }
}

function persistPolicies(policies: AdaptivePolicy[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(policies))
  } catch {
    // fallback
  }
  memoryPolicies = [...policies]
}

export async function fetchAdaptivePolicies(): Promise<AdaptivePolicy[]> {
  return getStoredPolicies()
}

export async function saveAdaptivePolicy(
  policy: Omit<AdaptivePolicy, 'id' | 'createdAt' | 'updatedAt' | 'matchedCount' | 'versionHistory' | 'version'>,
): Promise<AdaptivePolicy> {
  const policies = getStoredPolicies()
  const now = new Date().toISOString()
  const id = `pol-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`

  const newPolicy: AdaptivePolicy = {
    ...policy,
    id,
    version: '1.0',
    createdAt: now,
    updatedAt: now,
    matchedCount: 0,
    versionHistory: [
      {
        version: '1.0',
        timestamp: now.replace('T', ' ').slice(0, 16),
        author: 'Administrator',
        changeSummary: 'Initial policy creation via Policy Wizard.',
        snapshot: {
          name: policy.name,
          description: policy.description,
          action: policy.action,
          riskLevel: policy.riskLevel,
          conditionsCount: policy.conditions.length,
        },
      },
    ],
  }

  const updated = [...policies, newPolicy].sort((a, b) => a.priority - b.priority)
  persistPolicies(updated)
  return newPolicy
}

export async function updateAdaptivePolicy(
  id: string,
  updates: Partial<AdaptivePolicy>,
  changeSummary = 'Updated policy rules and settings.',
  author = 'Administrator',
): Promise<AdaptivePolicy> {
  const policies = getStoredPolicies()
  const existing = policies.find((p) => p.id === id)
  if (!existing) {
    throw new Error(`Policy not found: ${id}`)
  }

  const now = new Date().toISOString()
  const currentVer = parseFloat(existing.version || '1.0')
  const nextVer = (currentVer + 0.1).toFixed(1)

  const updatedPolicy: AdaptivePolicy = {
    ...existing,
    ...updates,
    updatedAt: now,
    version: nextVer,
    versionHistory: [
      {
        version: nextVer,
        timestamp: now.replace('T', ' ').slice(0, 16),
        author,
        changeSummary,
        snapshot: {
          name: updates.name ?? existing.name,
          description: updates.description ?? existing.description,
          action: updates.action ?? existing.action,
          riskLevel: updates.riskLevel ?? existing.riskLevel,
          conditionsCount: (updates.conditions ?? existing.conditions).length,
        },
      },
      ...existing.versionHistory,
    ],
  }

  const newPolicies = policies
    .map((p) => (p.id === id ? updatedPolicy : p))
    .sort((a, b) => a.priority - b.priority)

  persistPolicies(newPolicies)
  return updatedPolicy
}

export async function deleteAdaptivePolicy(id: string): Promise<boolean> {
  const policies = getStoredPolicies()
  const filtered = policies.filter((p) => p.id !== id)
  persistPolicies(filtered)
  return true
}

export async function duplicateAdaptivePolicy(id: string): Promise<AdaptivePolicy> {
  const policies = getStoredPolicies()
  const original = policies.find((p) => p.id === id)
  if (!original) {
    throw new Error(`Policy not found: ${id}`)
  }

  const now = new Date().toISOString()
  const cloneId = `pol-${Date.now().toString(36)}-clone`
  const clone: AdaptivePolicy = {
    ...original,
    id: cloneId,
    name: `${original.name} (Copy)`,
    priority: original.priority + 1,
    version: '1.0',
    createdAt: now,
    updatedAt: now,
    matchedCount: 0,
    versionHistory: [
      {
        version: '1.0',
        timestamp: now.replace('T', ' ').slice(0, 16),
        author: 'Administrator',
        changeSummary: `Duplicated from ${original.name}`,
        snapshot: {
          name: `${original.name} (Copy)`,
          description: original.description,
          action: original.action,
          riskLevel: original.riskLevel,
          conditionsCount: original.conditions.length,
        },
      },
    ],
  }

  const updated = [...policies, clone].sort((a, b) => a.priority - b.priority)
  persistPolicies(updated)
  return clone
}

export async function toggleAdaptivePolicyStatus(id: string): Promise<AdaptivePolicy> {
  const policies = getStoredPolicies()
  const policy = policies.find((p) => p.id === id)
  if (!policy) {
    throw new Error(`Policy not found: ${id}`)
  }
  return updateAdaptivePolicy(
    id,
    { enabled: !policy.enabled },
    `Toggled policy status to ${!policy.enabled ? 'Enabled' : 'Disabled'}`,
  )
}

/**
 * Condition evaluation logic
 */
export function evaluateCondition(
  req: SimulatorRequest,
  cond: PolicyCondition,
): boolean {
  let reqValue: unknown

  switch (cond.field) {
    case 'department':
      reqValue = req.department
      break
    case 'role':
      reqValue = req.role
      break
    case 'resource':
      reqValue = req.resource
      break
    case 'country':
      reqValue = req.country
      break
    case 'device':
      reqValue = req.device
      break
    case 'vpn':
      reqValue = req.vpn
      break
    case 'usb':
      reqValue = req.usb
      break
    case 'byod':
      reqValue = req.byod
      break
    case 'email':
      reqValue = req.email
      break
    case 'httpBurst':
      reqValue = req.httpBurst
      break
    case 'afterHours':
      reqValue = req.afterHours
      break
    case 'failedLogins':
      reqValue = req.failedLogins
      break
    case 'riskScore':
      reqValue = req.riskScore
      break
    case 'threatScore':
      reqValue = req.threatScore
      break
    default:
      return false
  }

  const targetValue = cond.value

  switch (cond.operator) {
    case 'EQUALS':
      return String(reqValue).toLowerCase() === String(targetValue).toLowerCase()
    case 'NOT_EQUALS':
      return String(reqValue).toLowerCase() !== String(targetValue).toLowerCase()
    case 'GREATER_THAN':
      return Number(reqValue) > Number(targetValue)
    case 'GREATER_THAN_OR_EQUAL':
      return Number(reqValue) >= Number(targetValue)
    case 'LESS_THAN':
      return Number(reqValue) < Number(targetValue)
    case 'LESS_THAN_OR_EQUAL':
      return Number(reqValue) <= Number(targetValue)
    case 'CONTAINS':
      return String(reqValue).toLowerCase().includes(String(targetValue).toLowerCase())
    case 'IN': {
      const items = String(targetValue)
        .split(',')
        .map((s) => s.trim().toLowerCase())
      return items.includes(String(reqValue).toLowerCase())
    }
    default:
      return false
  }
}

/**
 * Evaluates a simulation request against all loaded policies in priority order.
 */
export function simulatePolicyEvaluation(
  req: SimulatorRequest,
  policies: AdaptivePolicy[],
): SimulatorResult {
  const startTime = performance.now()
  const enabledPolicies = policies
    .filter((p) => p.enabled)
    .sort((a, b) => a.priority - b.priority)

  let matchedPolicy: AdaptivePolicy | null = null
  let matchedConditions: string[] = []
  let ruleOrderEvaluated = 0

  for (let i = 0; i < enabledPolicies.length; i++) {
    const policy = enabledPolicies[i]!
    ruleOrderEvaluated += 1

    // Department Scope Check
    if (
      policy.departmentScope !== 'All' &&
      policy.departmentScope.toLowerCase() !== req.department.toLowerCase()
    ) {
      continue
    }

    // Check all conditions (AND semantics)
    const passedConditions: string[] = []
    let allPassed = true

    for (const cond of policy.conditions) {
      if (evaluateCondition(req, cond)) {
        passedConditions.push(`${cond.field} ${cond.operator} ${cond.value}`)
      } else {
        allPassed = false
        break
      }
    }

    if (allPassed && policy.conditions.length > 0) {
      matchedPolicy = policy
      matchedConditions = passedConditions
      break
    }
  }

  const endTime = performance.now()
  const evaluationTimeMs = Number((endTime - startTime).toFixed(3))

  if (matchedPolicy) {
    const explanation = `Access request matched Policy '${matchedPolicy.name}' (Priority ${matchedPolicy.priority}). All ${matchedConditions.length} conditional criteria satisfied.`
    return {
      matchedPolicy,
      decision: matchedPolicy.action,
      evaluationTimeMs,
      matchedConditions,
      explanation,
      ruleOrderEvaluated,
    }
  }

  // Fallback decision
  const fallbackDecision: FirewallAction = req.riskScore >= 75 ? 'BLOCK' : req.riskScore >= 50 ? 'RESTRICT' : 'ALLOW'
  return {
    matchedPolicy: null,
    decision: fallbackDecision,
    evaluationTimeMs,
    matchedConditions: ['No custom rule matched; default security fallback applied'],
    explanation: 'No specific policy matched the subject and telemetry context. System defaulted to perimeter fallback.',
    ruleOrderEvaluated,
  }
}

/**
 * Export helpers for JSON, YAML, CSV, PDF
 */
function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportPoliciesToJSON(policies: AdaptivePolicy[]) {
  const json = JSON.stringify(policies, null, 2)
  downloadBlob(json, `firewall-policies-${Date.now()}.json`, 'application/json')
}

export function exportPoliciesToYAML(policies: AdaptivePolicy[]) {
  const lines: string[] = ['# AI Privacy Firewall - Adaptive Policy Specification', 'policies:']
  policies.forEach((p) => {
    lines.push(`  - id: "${p.id}"`)
    lines.push(`    name: "${p.name}"`)
    lines.push(`    description: "${p.description}"`)
    lines.push(`    priority: ${p.priority}`)
    lines.push(`    scope: "${p.departmentScope}"`)
    lines.push(`    action: "${p.action}"`)
    lines.push(`    risk_level: "${p.riskLevel}"`)
    lines.push(`    enabled: ${p.enabled}`)
    lines.push('    conditions:')
    p.conditions.forEach((c) => {
      lines.push(`      - field: "${c.field}"`)
      lines.push(`        operator: "${c.operator}"`)
      lines.push(`        value: ${typeof c.value === 'string' ? `"${c.value}"` : c.value}`)
    })
  })
  downloadBlob(lines.join('\n'), `firewall-policies-${Date.now()}.yaml`, 'text/yaml')
}

export function exportPoliciesToCSV(policies: AdaptivePolicy[]) {
  const headers = ['ID', 'Priority', 'Name', 'Action', 'Risk Level', 'Scope', 'Enabled', 'Version', 'Conditions Count']
  const rows = policies.map((p) => [
    `"${p.id}"`,
    p.priority,
    `"${p.name.replace(/"/g, '""')}"`,
    p.action,
    p.riskLevel,
    `"${p.departmentScope}"`,
    p.enabled ? 'TRUE' : 'FALSE',
    p.version,
    p.conditions.length,
  ])
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadBlob(csvContent, `firewall-policies-${Date.now()}.csv`, 'text/csv')
}

export function exportPoliciesToPDF(policies: AdaptivePolicy[]) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to export the PDF compliance report.')
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Adaptive Policy Compliance Audit Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #0f172a; }
          h1 { color: #1e1b4b; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
          .meta { font-size: 12px; color: #64748b; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          td { border: 1px solid #e2e8f0; padding: 8px; }
          .badge { padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
          .block { background: #fee2e2; color: #991b1b; }
          .allow { background: #dcfce7; color: #166534; }
          .warn { background: #fef9c3; color: #854d0e; }
          .restrict { background: #fef3c7; color: #92400e; }
        </style>
      </head>
      <body>
        <h1>OpenAI Research Labs — Adaptive Firewall Policy Registry</h1>
        <div class="meta">
          Generated on: ${new Date().toLocaleString()} | Total Active Policies: ${policies.length} | Protected Enterprise Entity: OpenAI Research Labs
        </div>
        <table>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Policy Name</th>
              <th>Action</th>
              <th>Risk Level</th>
              <th>Scope</th>
              <th>Version</th>
              <th>Conditions</th>
            </tr>
          </thead>
          <tbody>
            ${policies
              .map(
                (p) => `
              <tr>
                <td><strong>#${p.priority}</strong></td>
                <td><strong>${p.name}</strong><br><small style="color: #64748b">${p.description}</small></td>
                <td><span class="badge ${p.action.toLowerCase()}">${p.action}</span></td>
                <td>${p.riskLevel}</td>
                <td>${p.departmentScope}</td>
                <td>v${p.version}</td>
                <td>${p.conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join('; ')}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `
  printWindow.document.write(html)
  printWindow.document.close()
}

export async function importPoliciesFromText(
  content: string,
  format: 'json' | 'yaml',
): Promise<AdaptivePolicy[]> {
  const current = getStoredPolicies()
  let imported: Partial<AdaptivePolicy>[] = []

  if (format === 'json') {
    const parsed = JSON.parse(content)
    imported = Array.isArray(parsed) ? parsed : [parsed]
  } else {
    // Simple YAML line parser for key-values
    const lines = content.split('\n')
    let currentItem: Partial<AdaptivePolicy> | null = null
    const list: Partial<AdaptivePolicy>[] = []

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (line.startsWith('- id:') || line.startsWith('id:')) {
        if (currentItem) list.push(currentItem)
        currentItem = {
          id: line.split(':')[1]?.replace(/["']/g, '').trim(),
          conditions: [],
        }
      } else if (currentItem) {
        if (line.startsWith('name:')) {
          currentItem.name = line.split(':')[1]?.replace(/["']/g, '').trim()
        } else if (line.startsWith('description:')) {
          currentItem.description = line.split(':')[1]?.replace(/["']/g, '').trim()
        } else if (line.startsWith('priority:')) {
          currentItem.priority = parseInt(line.split(':')[1]?.trim() || '5', 10)
        } else if (line.startsWith('action:')) {
          currentItem.action = line.split(':')[1]?.replace(/["']/g, '').trim() as FirewallAction
        }
      }
    }
    if (currentItem) list.push(currentItem)
    imported = list
  }

  // Merge into registry
  const merged: AdaptivePolicy[] = [...current]
  for (const item of imported) {
    if (item.name) {
      const fullItem: AdaptivePolicy = {
        id: item.id || `pol-imp-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        name: item.name,
        description: item.description || 'Imported enterprise policy',
        priority: item.priority || 10,
        departmentScope: item.departmentScope || 'All',
        category: item.category || 'Access Control',
        conditions: item.conditions || [],
        action: item.action || 'WARN',
        riskLevel: item.riskLevel || 'Medium',
        enforcementMode: item.enforcementMode || 'ENFORCING',
        enabled: item.enabled !== undefined ? item.enabled : true,
        notificationChannel: item.notificationChannel || 'SOC Alert',
        version: '1.0',
        versionHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        matchedCount: 0,
      }
      merged.push(fullItem)
    }
  }

  persistPolicies(merged)
  return merged
}

/**
 * React Query Hooks
 */
export function useAdaptivePolicies() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['adaptive-policies'],
    queryFn: fetchAdaptivePolicies,
    staleTime: 5000,
  })

  const saveMutation = useMutation({
    mutationFn: saveAdaptivePolicy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adaptive-policies'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
      changeSummary,
    }: {
      id: string
      updates: Partial<AdaptivePolicy>
      changeSummary?: string
    }) => updateAdaptivePolicy(id, updates, changeSummary),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adaptive-policies'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdaptivePolicy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adaptive-policies'] }),
  })

  const duplicateMutation = useMutation({
    mutationFn: duplicateAdaptivePolicy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adaptive-policies'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: toggleAdaptivePolicyStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adaptive-policies'] }),
  })

  return {
    ...query,
    policies: query.data ?? INITIAL_ADAPTIVE_POLICIES,
    savePolicy: saveMutation.mutateAsync,
    updatePolicy: updateMutation.mutateAsync,
    deletePolicy: deleteMutation.mutateAsync,
    duplicatePolicy: duplicateMutation.mutateAsync,
    toggleStatus: toggleMutation.mutateAsync,
  }
}
