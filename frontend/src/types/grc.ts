export type RiskCategory =
  | 'Data Privacy'
  | 'Cloud Infrastructure'
  | 'Identity & Access'
  | 'Insider Threat'
  | 'Third-Party Vendor'
  | 'Regulatory & Compliance'
  | 'AI Governance'
  | 'Network Security'

export type RiskLikelihood = 1 | 2 | 3 | 4 | 5
export type RiskImpact = 1 | 2 | 3 | 4 | 5
export type RiskSeverity = 'Critical' | 'High' | 'Medium' | 'Low'
export type RiskStatus = 'Open' | 'Mitigated' | 'Accepted' | 'In Review'
export type RiskStrategy = 'Mitigate' | 'Transfer' | 'Avoid' | 'Accept'

export interface RiskItem {
  id: string
  name: string
  businessUnit: string
  owner: string
  category: RiskCategory
  likelihood: RiskLikelihood
  impact: RiskImpact
  riskScore: number // likelihood * impact (1 to 25)
  severity: RiskSeverity
  status: RiskStatus
  treatmentStrategy: RiskStrategy
  dueDate: string
  description: string
  mitigationPlan: string
  affectedAssets: string[]
}

export interface HeatmapCell {
  likelihood: RiskLikelihood
  impact: RiskImpact
  severity: RiskSeverity
  count: number
  riskIds: string[]
}

export type FrameworkName =
  | 'ISO 27001'
  | 'NIST CSF'
  | 'SOC 2'
  | 'GDPR'
  | 'HIPAA'
  | 'PCI-DSS'

export interface ComplianceFramework {
  name: FrameworkName
  version: string
  description: string
  overallScore: number // 0-100%
  controlsPassed: number
  controlsFailed: number
  controlsPending: number
  totalControls: number
  lastAssessment: string
  nextAudit: string
  status: 'Compliant' | 'Substantial' | 'Remediation Needed'
  categories: Array<{
    name: string
    score: number
  }>
}

export interface SecurityControl {
  id: string
  framework: FrameworkName
  category: string
  description: string
  owner: string
  status: 'Implemented' | 'Partially Implemented' | 'Testing' | 'Failed'
  evidence: string
  lastTested: string
  automatedVerification: boolean
}

export interface AuditFindingSummary {
  high: number
  medium: number
  low: number
}

export interface AuditItem {
  id: string
  name: string
  auditor: string
  framework: FrameworkName
  startDate: string
  endDate: string
  findings: AuditFindingSummary
  status: 'Planning' | 'In Progress' | 'Fieldwork Complete' | 'Reporting' | 'Closed'
  progress: number // 0-100
  scope: string
}

export interface ComplianceGapItem {
  id: string
  framework: FrameworkName
  controlId: string
  controlName: string
  implementedAspects: string
  missingAspects: string
  riskLevel: RiskSeverity
  recommendedAction: string
  remediationOwner: string
  estimatedEffortDays: number
  progress: number
}

export type BusinessProcessCriticality =
  | 'Tier 0 - Mission Critical'
  | 'Tier 1 - Business Critical'
  | 'Tier 2 - Operational'

export interface BusinessImpactItem {
  id: string
  businessProcess: string
  businessUnit: string
  criticality: BusinessProcessCriticality
  rto: string // Recovery Time Objective
  rpo: string // Recovery Point Objective
  financialImpact: string
  operationalImpact: string
  riskOwner: string
  dependantSystems: string[]
}

export interface RiskTreatmentTask {
  id: string
  task: string
  completed: boolean
}

export interface RiskTreatmentPlan {
  id: string
  riskId: string
  riskName: string
  owner: string
  strategy: RiskStrategy
  tasks: RiskTreatmentTask[]
  status: 'In Progress' | 'On Track' | 'Delayed' | 'Under Review'
  completionPct: number
  dueDate: string
  budgetAllocated: string
}

export type VendorRiskRating = 'Critical' | 'High' | 'Medium' | 'Low'
export type VendorComplianceStatus = 'Compliant' | 'Under Assessment' | 'Action Required'
export type DataClassification = 'Confidential' | 'Restricted' | 'Internal' | 'Public'

export interface VendorItem {
  id: string
  name: string
  service: string
  riskRating: VendorRiskRating
  complianceStatus: VendorComplianceStatus
  lastAssessment: string
  contracts: string[]
  dataClassification: DataClassification
  securityScore: number // 0-100
  soc2Status: string
  dpaSigned: boolean
}

export interface PolicyComplianceItem {
  id: string
  name: string
  compliancePct: number
  violationsCount: number
  departments: string[]
  trend: 'Improving' | 'Stable' | 'Declining'
  lastUpdated: string
  mandatoryReviewDate: string
}

export interface ExecutiveRiskSummary {
  generatedAt: string
  currentRiskPosture: string
  highestRisks: string[]
  complianceIssues: string[]
  auditReadiness: string
  businessImpact: string
  recommendations: string[]
}

export interface RemediationTaskItem {
  id: string
  task: string
  riskId: string
  owner: string
  priority: RiskSeverity
  status: 'Not Started' | 'In Progress' | 'Verification' | 'Completed'
  progress: number
  estimatedCompletion: string
}

export type TimelineEventType = 'Audit' | 'Incident' | 'Milestone' | 'Control' | 'Policy'

export interface ComplianceTimelineEvent {
  id: string
  monthIndex: number // 0 to 23 (24 months)
  monthLabel: string
  year: number
  type: TimelineEventType
  title: string
  description: string
  status: 'Completed' | 'Upcoming' | 'In Progress'
  framework?: string
}

export interface ExecutiveGrcKPIs {
  enterpriseRiskScore: number // 0-100 (lower is better, e.g. 24)
  complianceScore: number // 0-100% (e.g. 94.6%)
  openRisks: number
  criticalRisks: number
  activeAudits: number
  controlsImplemented: number
  totalControls: number
  complianceFrameworks: number
  openFindings: number
  remediationTasks: number
  overallSecurityRating: string // e.g. "A+ (96.4)"
  trend: {
    risk: number
    compliance: number
    audits: number
    remediation: number
  }
}

export interface GRCSnapshot {
  timestamp: string
  kpis: ExecutiveGrcKPIs
  risks: RiskItem[]
  heatmap: HeatmapCell[]
  frameworks: ComplianceFramework[]
  controls: SecurityControl[]
  audits: AuditItem[]
  gaps: ComplianceGapItem[]
  businessImpacts: BusinessImpactItem[]
  treatmentPlans: RiskTreatmentPlan[]
  vendors: VendorItem[]
  policies: PolicyComplianceItem[]
  summary: ExecutiveRiskSummary
  remediations: RemediationTaskItem[]
  timeline: ComplianceTimelineEvent[]
}
