/**
 * Type definitions for Sprint 14: Adaptive Policy Learning & Feedback Optimization
 * Explainable Adaptive AI Privacy Firewall
 */

export interface FeedbackSummary {
  confirmedTruePositives: number
  markedFalsePositives: number
  confirmedFalseNegatives: number
  policyAdjustmentsApplied: number
  policiesImproved: number
  pendingReviewItems: number
  totalFeedbackEvents: number
  analystAccuracy: number
}

export interface PolicyEvolutionVersion {
  version: string
  timestamp: string
  activeRules: number
  averageConfidence: number
  falsePositiveRate: number
  falseNegativeRate: number
  thresholdModifications: number
  rulesAdded: number
  rulesRemoved: number
}

export interface FpReductionMetrics {
  previousFpr: number
  currentFpr: number
  reductionPercentage: number
  falseAlarmsPreventedMonthly: number
  analystHoursSavedMonthly: number
  historicalFprData: Array<{ version: string; fpr: number; benchmark: number }>
}

export interface FnReductionMetrics {
  previousFnr: number
  currentFnr: number
  reductionPercentage: number
  missedThreatsPrevented: number
  coveragePercentage: number
  historicalFnrData: Array<{ version: string; fnr: number; benchmark: number }>
}

export interface LearnedThreshold {
  department: string
  baselineThreshold: number
  learnedThreshold: number
  delta: number
  direction: 'TIGHTENED' | 'RELAXED' | 'NEUTRAL'
  confidence: number
  reason: string
  appliedRuleCount: number
  lastCalibrated: string
}

export interface PolicyRecommendation {
  id: string
  title: string
  category: 'PERIPHERAL' | 'AUTHENTICATION' | 'DATA_ACCESS' | 'TEMPORAL' | 'DEPARTMENT_OVERRIDE'
  description: string
  reason: string
  expectedImpact: string
  confidence: number
  status: 'ACCEPTED' | 'PENDING' | 'REJECTED'
  suggestedBy: string
  departmentTarget: string
}

export interface PolicyBeforeAfter {
  id: string
  policyName: string
  department: string
  oldPolicy: {
    condition: string
    action: string
    threshold: number
    fpRate: number
  }
  newPolicy: {
    condition: string
    action: string
    threshold: number
    fpRate: number
  }
  changeReason: string
  expectedRiskImpact: string
  expectedDecisionShift: string
  approvalStatus: 'DEPLOYED' | 'STAGED'
}

export interface FeedbackLoopStage {
  id: string
  name: string
  description: string
  status: 'ACTIVE' | 'OPTIMIZING' | 'STEADY'
  throughput: string
  latency: string
  activeItems: number
}

export interface PolicyConfidenceMetrics {
  beforeCalibrationConfidence: number
  afterCalibrationConfidence: number
  confidenceGain: number
  consistencyGain: number
  brierImprovement: number
  confidenceDeciles: Array<{ decile: string; before: number; after: number }>
}

export interface TimelineEvent {
  id: string
  day: string
  timestamp: string
  category: 'POLICY_UPDATE' | 'FEEDBACK_EVENT' | 'THRESHOLD_CHANGE' | 'FP_DROP' | 'RISK_HARDENING'
  title: string
  description: string
  analyst: string
  impact: string
}

export interface DepartmentAdaptation {
  department: string
  stance: 'STRICTER' | 'PERMISSIVE' | 'SENSITIVE' | 'STABLE_LOCKDOWN'
  adaptationSummary: string
  rationale: string
  fpReduction: number
  fnReduction: number
  sensitivityShift: string
  activeRuleHighlights: string[]
}

export interface PolicyLearningSummaryData {
  mostImprovedPolicy: string
  topFpReductionDept: string
  mostTunedDept: string
  overallFirewallStance: string
  analystFeedbackImpactSummary: string
  executiveNarrative: string
  keyAchievements: string[]
  recommendedNextActions: string[]
}

export interface PolicyLearningSnapshot {
  timestamp: string
  feedbackSummary: FeedbackSummary
  evolution: PolicyEvolutionVersion[]
  fpReduction: FpReductionMetrics
  fnReduction: FnReductionMetrics
  learnedThresholds: LearnedThreshold[]
  recommendations: PolicyRecommendation[]
  beforeAfterComparisons: PolicyBeforeAfter[]
  feedbackLoopStages: FeedbackLoopStage[]
  confidenceMetrics: PolicyConfidenceMetrics
  timeline: TimelineEvent[]
  departmentAdaptations: DepartmentAdaptation[]
  summary: PolicyLearningSummaryData
}
