export type DriftCategory =
  | 'Normal'
  | 'Suspicious'
  | 'Sudden Spike'
  | 'Stabilized'

export type PrivacySeverity = 'Low' | 'Medium' | 'High' | 'Critical'

export type FirewallDecision = 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK'

export interface UserMetricBaseline {
  baseline: string | number
  current: string | number
  deviationPct: number
  unit?: string
}

export interface UserBaselineProfile {
  userId: string
  userName: string
  department: string
  role: string
  avatar: string
  baselineStrength: number // 0-100%
  confidence: number // 0.0-1.0
  sampleWindowDays: number
  driftCategory: DriftCategory
  currentThreatScore: number
  baselineThreatScore: number
  metrics: {
    loginTime: UserMetricBaseline
    usbUsage: UserMetricBaseline
    fileAccessVolume: UserMetricBaseline
    emailActivity: UserMetricBaseline
    httpActivity: UserMetricBaseline
    sessionDuration: UserMetricBaseline
    failedLogins: UserMetricBaseline
    deviceTrust: UserMetricBaseline
    geoConsistency: UserMetricBaseline
    riskHistory: {
      meanScore: number
      peakScore: number
      trend: 'Declining' | 'Stable' | 'Elevating'
    }
  }
}

export interface DriftTrendDataPoint {
  timeIndex: number
  timestamp: string
  label: string
  normalDrift: number
  suspiciousDrift: number
  currentRiskScore: number
  baselineThreshold: number
  adaptedThreshold: number
}

export interface PrivacyRiskScore {
  userId: string
  userName: string
  department: string
  score: number // 0-100
  tier: PrivacySeverity
  piiAccessRate: number // events/hr
  crossDeptAccessFreq: number // accesses/wk
  bulkEgressVelocityMb: number // MB/session
  consentCompliancePct: number // %
  explanation: string
}

export interface AdaptiveThresholdItem {
  id: string
  ruleName: string
  department: string
  previousThreshold: number
  updatedThreshold: number
  direction: 'Tightened' | 'Relaxed'
  trigger:
    | 'Analyst Feedback'
    | 'Repeated False Positives'
    | 'Repeated True Positives'
    | 'Department Shift'
  delta: number
  adaptedAt: string
  reason: string
}

export interface FeedbackLoopEvent {
  id: string
  timestamp: string
  analyst: string
  alertId: string
  user: string
  feedbackType:
    | 'Confirmed True Positive'
    | 'Marked False Positive'
    | 'Benign Workload Drift'
    | 'Privilege Creep Detected'
  policyAction:
    | 'Policy Tightened'
    | 'Policy Relaxed'
    | 'Model Confidence Adjusted'
    | 'Baseline Updated'
  modelWeightShift: string
  status: 'Committed' | 'Pending Review'
}

export interface BehaviorBeforeAfter {
  metric: string
  oldBehavior: string
  currentBehavior: string
  expectedBaseline: string
  varianceDelta: string
  decisionBefore: FirewallDecision
  decisionAfter: FirewallDecision
  driverFeature: string
}

export interface AnomalyTrendItem {
  id: string
  user: string
  department: string
  anomalyType: string
  score: number
  trend: 'Increasing' | 'Spiking' | 'Decaying' | 'Stabilizing'
  decision: FirewallDecision
  timestamp: string
}

export interface AdaptiveSummary {
  generatedAt: string
  userRiskTrends: string
  deptBaselineShift: string
  usbNormalizationInsight: string
  policyFeedbackTuning: string
  conceptDriftMetric: string
}

export interface BaselineTimelineStage {
  phase: string
  timeframe: string
  status: 'Established' | 'Evolving' | 'Active Adaptation'
  observedPattern: string
  baselineImpact: string
  thresholdDelta: string
}

export interface AdaptiveLearningSnapshot {
  timestamp: string
  selectedUserId: string
  users: UserBaselineProfile[]
  activeUser: UserBaselineProfile
  driftTrends: DriftTrendDataPoint[]
  privacyScores: PrivacyRiskScore[]
  thresholds: AdaptiveThresholdItem[]
  feedbackEvents: FeedbackLoopEvent[]
  comparison: BehaviorBeforeAfter[]
  anomalies: AnomalyTrendItem[]
  summary: AdaptiveSummary
  timelineStages: BaselineTimelineStage[]
}
