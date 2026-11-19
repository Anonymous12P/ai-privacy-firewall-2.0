import type { FirewallAction, FirewallRiskLevel } from './api'

export type PolicyConditionField =
  | 'department'
  | 'role'
  | 'resource'
  | 'country'
  | 'device'
  | 'vpn'
  | 'usb'
  | 'byod'
  | 'email'
  | 'httpBurst'
  | 'afterHours'
  | 'failedLogins'
  | 'riskScore'
  | 'threatScore'

export type PolicyOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL'
  | 'CONTAINS'
  | 'IN'

export interface PolicyCondition {
  id: string
  field: PolicyConditionField
  operator: PolicyOperator
  value: string | number | boolean
}

export interface PolicyVersion {
  version: string
  timestamp: string
  author: string
  changeSummary: string
  snapshot: {
    name: string
    description: string
    action: FirewallAction
    riskLevel: FirewallRiskLevel
    conditionsCount: number
  }
}

export interface AdaptivePolicy {
  id: string
  name: string
  description: string
  priority: number // 1 = highest evaluation precedence
  departmentScope: string // 'All' or specific department
  category: 'Exfiltration' | 'Compliance' | 'Access Control' | 'Threat Defense' | 'Baseline'
  conditions: PolicyCondition[]
  action: FirewallAction
  riskLevel: FirewallRiskLevel
  enforcementMode: 'ENFORCING' | 'MONITOR_ONLY' | 'QUARANTINE'
  enabled: boolean
  notificationChannel: 'SOC Alert' | 'Slack SecOps' | 'Email Lead' | 'None'
  customMessage?: string
  version: string
  versionHistory: PolicyVersion[]
  createdAt: string
  updatedAt: string
  matchedCount: number
}

export interface SimulatorRequest {
  employee: string
  department: string
  role: string
  resource: string
  device: string
  country: string
  usb: boolean
  afterHours: boolean
  failedLogins: number
  httpBurst: boolean
  email: boolean
  massDownload: boolean
  vpn: boolean
  byod: boolean
  impossibleTravel: boolean
  riskScore: number
  threatScore: number
}

export interface SimulatorResult {
  matchedPolicy: AdaptivePolicy | null
  decision: FirewallAction
  evaluationTimeMs: number
  matchedConditions: string[]
  explanation: string
  ruleOrderEvaluated: number
}
