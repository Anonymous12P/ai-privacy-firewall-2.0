/**
 * Type definitions for Sprint 13: Privacy Risk Scoring & Adaptive Threshold Tuning
 * Explainable Adaptive AI Privacy Firewall
 */

export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type FirewallDecision = 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK'

export interface UserPrivacyRisk {
  userId: string
  userName: string
  department: string
  role: string
  currentRiskScore: number
  baselineRiskScore: number
  adjustedRiskScore: number
  confidence: number
  riskTier: RiskTier
  explanation: string
  avatar: string
  lastActive: string
  activeAnomalies: string[]
}

export interface DepartmentPrivacyRisk {
  department: string
  avgRiskScore: number
  baselineRiskScore: number
  riskTier: RiskTier
  userCount: number
  activeThreats: number
  allowThreshold: number
  warnThreshold: number
  restrictThreshold: number
  blockThreshold: number
  overrideActive: boolean
  strictnessLevel: 'Standard' | 'Elevated' | 'Maximum Lockdown'
}

export interface ProjectedImpact {
  allowRate: number
  warnRate: number
  restrictRate: number
  blockRate: number
  falsePositiveRate: number
  falseNegativeRate: number
}

export interface FirewallThresholds {
  allowThreshold: number
  warnThreshold: number
  restrictThreshold: number
  blockThreshold: number
  mode: 'ADAPTIVE' | 'MANUAL' | 'CONSERVATIVE' | 'PERMISSIVE'
  learningRate: number
  sensitivityFactor: number
  projectedImpact: ProjectedImpact
}

export interface DecisionBoundaryPoint {
  riskScore: number
  density: number
  cumulative: number
  zone: FirewallDecision
}

export interface DecisionBoundarySample {
  id: string
  userName: string
  department: string
  resource: string
  riskScore: number
  decision: FirewallDecision
  time: string
}

export interface SensitivityScenario {
  id: string
  factorName: string
  category: string
  baselineValue: string
  perturbedValue: string
  riskScoreDelta: number
  initialDecision: FirewallDecision
  newDecision: FirewallDecision
  sensitivityRating: 'Low' | 'Moderate' | 'High' | 'Extreme'
  policyImpactDescription: string
}

export interface CalibrationBin {
  confidenceDecile: number
  observedAccuracy: number
  idealAccuracy: number
  sampleCount: number
}

export interface CalibrationMetrics {
  confidenceCalibration: number
  brierScore: number
  thresholdAccuracy: number
  falsePositiveRate: number
  falseNegativeRate: number
  decisionConsistency: number
  calibrationCurve: CalibrationBin[]
}

export interface ThresholdChangeRecord {
  id: string
  timestamp: string
  previousThresholds: { allow: number; warn: number; restrict: number; block: number }
  newThresholds: { allow: number; warn: number; restrict: number; block: number }
  reason: string
  analystFeedback: string
  departmentImpact: string
  status: 'APPLIED' | 'EVALUATING' | 'REVERTED'
  stanceChange: 'TIGHTENED' | 'RELAXED' | 'BALANCED'
}

export type RiskTrendState = 'STABLE' | 'RISING' | 'SPIKING' | 'STABILIZING' | 'DECLINING'

export interface RiskTrendDataPoint {
  timestamp: string
  day: string
  riskScore: number
  baseline: number
  departmentAvg: number
  blockThreshold: number
  eventMarker?: string
}

export interface UserRiskProgression {
  userId: string
  userName: string
  department: string
  trajectoryState: RiskTrendState
  currentScore: number
  historyPoints: RiskTrendDataPoint[]
  narrative: string
}

export interface DepartmentThresholdOverride {
  department: string
  baselineAllow: number
  baselineWarn: number
  baselineRestrict: number
  baselineBlock: number
  customAllow: number
  customWarn: number
  customRestrict: number
  customBlock: number
  regulatoryStandard: string
  overrideEnabled: boolean
  rationale: string
  lastModified: string
}

export interface DecompositionFactor {
  name: string
  category: string
  rawValue: string
  weight: number
  points: number
  shapValue: number
  direction: 'INCREASES_RISK' | 'DECREASES_RISK' | 'NEUTRAL'
  description: string
}

export interface ScoreDecomposition {
  userId: string
  userName: string
  baseScore: number
  totalScore: number
  factors: DecompositionFactor[]
  summaryExplanation: string
}

export interface RiskTuningSummaryData {
  highestRiskDepartment: string
  highestRiskDeptScore: number
  highestRiskUser: string
  highestRiskUserScore: number
  firewallStance: 'CONSERVATIVE' | 'BALANCED' | 'PERMISSIVE'
  thresholdTrend: 'TIGHTENED' | 'RELAXED' | 'STABLE'
  fpRateDelta: number
  blockRateDelta: number
  executiveNarrative: string
  keyFindings: string[]
  recommendation: string
}

export interface RiskTuningSnapshot {
  timestamp: string
  users: UserPrivacyRisk[]
  departments: DepartmentPrivacyRisk[]
  thresholds: FirewallThresholds
  decisionBoundaryPoints: DecisionBoundaryPoint[]
  activeRequests: DecisionBoundarySample[]
  sensitivityScenarios: SensitivityScenario[]
  calibration: CalibrationMetrics
  thresholdHistory: ThresholdChangeRecord[]
  userProgressions: Record<string, UserRiskProgression>
  departmentOverrides: DepartmentThresholdOverride[]
  scoreDecompositions: Record<string, ScoreDecomposition>
  summary: RiskTuningSummaryData
}
