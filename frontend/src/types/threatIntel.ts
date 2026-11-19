export type ThreatSeverity = 'Critical' | 'High' | 'Medium' | 'Low'

export type ThreatCategory =
  | 'Malware Campaign'
  | 'Ransomware'
  | 'Zero-Day'
  | 'Phishing'
  | 'Credential Leak'
  | 'Supply Chain Attack'
  | 'Insider Threat'
  | 'Botnet'
  | 'Data Exfiltration'
  | 'APT Activity'

export interface ExecutiveThreatKPIs {
  knownThreats: number
  newThreatsToday: number
  activeCampaigns: number
  blockedCampaigns: number
  highSeverityThreats: number
  threatIntelSources: number
  avgConfidenceScore: number
  activeHuntingSessions: number
  avgIocMatchRate: number
  globalThreatIndex: number
  trend: {
    threats: number
    campaigns: number
    blocks: number
    confidence: number
    index: number
  }
}

export interface GlobalThreatFeedItem {
  id: string
  name: string
  category: ThreatCategory
  severity: ThreatSeverity
  confidence: number
  source: string
  country: string
  countryCode: string
  timestamp: string
  mitreTactic: string
  mitreTechniqueId: string
  threatActor: string
  targetIndustry: string
  status: 'Active' | 'Blocked' | 'Mitigated' | 'Monitoring'
  description: string
}

export type IocType =
  | 'IP Address'
  | 'Domain'
  | 'URL'
  | 'Email'
  | 'SHA256'
  | 'MD5'
  | 'File Name'
  | 'Registry Key'
  | 'Process Name'
  | 'Certificate'

export interface IocRecord {
  id: string
  value: string
  type: IocType
  reputation: 'Malicious' | 'Suspicious' | 'High Risk' | 'Unknown' | 'Clean'
  firstSeen: string
  lastSeen: string
  detectionCount: number
  confidence: number
  malwareFamily: string
  associatedCampaign: string
  riskScore: number
  firewallMatches: number
  tags: string[]
  geo: string
}

export interface MalwareAnalysisRecord {
  id: string
  name: string
  sha256: string
  md5: string
  malwareFamily: string
  type: string
  riskScore: number
  sandboxVerdict: string
  networkActivity: string[]
  registryChanges: string[]
  persistence: string
  processesSpawned: string[]
  droppedFiles: string[]
  dnsRequests: string[]
  yaraMatches: string[]
  mitreTechniques: string[]
}

export type PrebuiltHuntCategory =
  | 'Impossible Travel'
  | 'USB Exfiltration'
  | 'DNS Tunneling'
  | 'Lateral Movement'
  | 'Credential Dumping'
  | 'PowerShell Abuse'
  | 'VPN Abuse'
  | 'Privilege Escalation'
  | 'Data Exfiltration'
  | 'Insider Threat'

export interface HuntTimelineItem {
  time: string
  event: string
  user: string
  severity: ThreatSeverity
}

export interface HuntingPrebuiltQuery {
  id: string
  name: string
  category: PrebuiltHuntCategory
  description: string
  querySyntax: string
  matchingEvents: number
  users: string[]
  devices: string[]
  resources: string[]
  timeline: HuntTimelineItem[]
  riskScore: number
  confidence: number
  status: 'Detected' | 'Clear' | 'Hunting'
}

export interface CampaignIntelligenceRecord {
  id: string
  name: string
  threatActor: string
  country: string
  industryTargets: string[]
  timeline: string
  infrastructure: string[]
  malwareUsed: string[]
  objectives: string
  mitreAttack: string[]
  confidence: number
  status: 'Active' | 'Disrupted' | 'Monitoring' | 'Dormant'
}

export interface RelationshipGraphNode {
  id: string
  label: string
  type: 'actor' | 'campaign' | 'malware' | 'domain' | 'ip' | 'endpoint' | 'firewall' | 'database'
  status: 'hostile' | 'compromised' | 'active' | 'blocked' | 'protected'
  details: string
  connectedTo: string[]
}

export interface GlobalAttackPoint {
  country: string
  countryCode: string
  lat: number
  lng: number
  attackCount: number
  campaign: string
  threatLevel: ThreatSeverity
  primaryThreatType: string
}

export interface MitreCoverageItem {
  tactic: string
  techniqueId: string
  techniqueName: string
  coverage: 'Covered' | 'Partial' | 'Not Covered'
  ruleCount: number
  detectionMechanism: string
}

export interface ThreatTimelinePoint {
  time: string
  newThreats: number
  resolvedThreats: number
  investigatedThreats: number
  blockedThreats: number
  iocMatches: number
}

export interface ThreatPrediction {
  tomorrowVolume: number
  volumeChangePercent: number
  likelyAttackType: string
  emergingMalware: string
  highestRiskDept: string
  expectedCampaign: string
  predictedRiskTrend: 'Escalating' | 'Stable' | 'De-escalating'
  confidence: number
  probability: number
  explanation: string
}

export interface ExecutiveThreatSummary {
  posture: 'Elevated' | 'Guarded' | 'Critical' | 'Secure'
  narrative: string
  topThreatActor: string
  mostTargetedAssets: string[]
  emergingRisks: string[]
  recommendedActions: string[]
  businessImpact: string
  confidenceLevel: number
}

export interface ThreatIntelSource {
  name: string
  provider: string
  type: 'Commercial' | 'Open Source' | 'Government' | 'Internal'
  status: 'Online' | 'Synchronized' | 'Updating'
  lastSync: string
  recordsIngested: number
  trustScore: number
}

export interface ThreatIntelligenceSnapshot {
  timestamp: string
  kpis: ExecutiveThreatKPIs
  threatFeed: GlobalThreatFeedItem[]
  iocs: IocRecord[]
  malwareList: MalwareAnalysisRecord[]
  huntingQueries: HuntingPrebuiltQuery[]
  campaigns: CampaignIntelligenceRecord[]
  relationshipNodes: RelationshipGraphNode[]
  attackMap: GlobalAttackPoint[]
  mitreCoverage: MitreCoverageItem[]
  timeline: ThreatTimelinePoint[]
  prediction: ThreatPrediction
  summary: ExecutiveThreatSummary
  sources: ThreatIntelSource[]
}
