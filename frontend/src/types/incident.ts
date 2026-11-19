export type IncidentSeverity = 'Critical' | 'High' | 'Medium' | 'Low'
export type IncidentStatus = 'Open' | 'Investigating' | 'Contained' | 'Resolved' | 'Closed'
export type IncidentPriority = 'P1-Critical' | 'P2-High' | 'P3-Medium' | 'P4-Low'
export type FirewallDecision = 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK'

export interface TimelineEntry {
  id: string
  timestamp: string
  title: string
  description: string
  type: 'auth' | 'behavior' | 'firewall' | 'policy' | 'containment' | 'investigation'
  status: 'info' | 'warning' | 'alert' | 'success'
  actor: string
}

export interface EvidenceCard {
  id: string
  category: string
  title: string
  details: Record<string, string | number | boolean>
  riskScore: number
  flagged: boolean
}

export interface MitreTechnique {
  tactic:
    | 'Credential Access'
    | 'Persistence'
    | 'Privilege Escalation'
    | 'Defense Evasion'
    | 'Discovery'
    | 'Lateral Movement'
    | 'Collection'
    | 'Exfiltration'
    | 'Impact'
  techniqueId: string
  techniqueName: string
  detected: boolean
  confidence: number
  matchedIndicator: string
}

export interface AttackGraphNode {
  id: string
  label: string
  sublabel: string
  type: 'user' | 'endpoint' | 'application' | 'firewall' | 'identity' | 'database' | 'sensitive_files'
  status: 'compromised' | 'suspicious' | 'blocked' | 'protected'
  details: string
}

export interface BehaviorTimelineStep {
  indicator: string
  detected: boolean
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Benign'
  time: string
  description: string
}

export interface RecommendedAction {
  id: string
  action: string
  priority: 'Critical' | 'High' | 'Medium'
  reason: string
  estimatedImpact: string
  executed: boolean
}

export interface Incident {
  id: string
  title: string
  summary: string
  severity: IncidentSeverity
  status: IncidentStatus
  priority: IncidentPriority
  department: string
  affectedUser: string
  role: string
  targetResource: string
  operation: string
  device: string
  sourceIp: string
  country: string
  riskScore: number
  threatScore: number
  aiConfidence: number
  modelUsed: string
  firewallDecision: FirewallDecision
  detectionRule: string
  triggeredPolicy: string
  createdTime: string
  closedTime?: string
  assignedAnalyst: string
  investigationNotes: string[]
  tags: string[]
  behaviorIndicators: string[]
  timeline: TimelineEntry[]
  evidence: EvidenceCard[]
  mitreMatrix: MitreTechnique[]
  attackGraph: AttackGraphNode[]
  behaviorTimeline: BehaviorTimelineStep[]
  recommendations: RecommendedAction[]
  aiSummary: string
  evidenceScore: number
}

export interface IncidentKPIs {
  criticalIncidents: number
  highIncidents: number
  openCases: number
  investigating: number
  resolved: number
  mttd: string
  mttr: string
  containmentSuccessRate: number
}

export interface IncidentFilters {
  search: string
  severity: string
  status: string
  department: string
  decision: string
}
