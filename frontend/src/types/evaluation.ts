/**
 * Type definitions for Sprint 15: Research Evaluation & Paper-Ready Results
 * Explainable Adaptive AI Privacy Firewall
 */

export interface BenchmarkOverview {
  datasetName: string
  userCount: number
  rawEventCount: number
  processedRecordCount: number
  trainSplit: string
  valSplit: string
  testSplit: string
  totalFeatures: number
  evaluationDate: string
  modelFamiliesTested: string[]
  imbalanceRatio: string
}

export interface ModelBenchmarkRow {
  modelName: string
  displayName: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  rocAuc: number
  prAuc: number
  latencyMs: number
  explainabilityScore: number
  isChampion: boolean
  color: string
}

export interface AblationRow {
  featureRemoved: string
  category: string
  baselineF1: number
  ablatedF1: number
  deltaF1: number
  baselineAuc: number
  ablatedAuc: number
  deltaAuc: number
  interpretation: string
  criticality: 'CRITICAL' | 'HIGH' | 'MODERATE'
}

export interface ConfusionMatrixData {
  modelName: string
  tp: number
  tn: number
  fp: number
  fn: number
  total: number
  accuracy: number
  precision: number
  recall: number
  specificity: number
  balancedAccuracy: number
  f1Score: number
}

export interface CurvePoint {
  x: number
  y: number
}

export interface ModelCurves {
  modelName: string
  displayName: string
  rocPoints: CurvePoint[]
  prPoints: CurvePoint[]
  rocAuc: number
  prAuc: number
  color: string
}

export interface ShapQualityMetrics {
  explanationFidelity: number
  localStability: number
  globalConsistency: number
  treeShapLatencyMs: number
  kernelShapLatencyMs: number
  speedupFactor: number
  interpretabilityScore: number
  interpretabilityTier: string
  sampleExplanation: string
}

export interface LatencyThroughputMetrics {
  meanLatencyMs: number
  p95LatencyMs: number
  p99LatencyMs: number
  requestsPerSecond: number
  batchProcessingSpeed: number
  loggingOverheadMs: number
  hardwareSpecs: string
  latencyDeciles: Array<{ percentile: string; latency: number }>
}

export interface DriftScenario {
  scenarioName: string
  driftType: string
  staticModelF1: number
  adaptiveFirewallF1: number
  resilienceDelta: number
  description: string
}

export interface FprFnrAnalysis {
  preTuningFpr: number
  postTuningFpr: number
  fprReductionPct: number
  preTuningFnr: number
  postTuningFnr: number
  fnrReductionPct: number
  alarmsPreventedMonthly: number
  analystHoursSavedMonthly: number
  missedThreatsPrevented: number
  coverageScore: number
}

export interface PrivacyImpactMetrics {
  preventedExfiltrationAttempts: number
  unauthorizedAccessReductionPct: number
  riskyDownloadsBlockedGb: number
  complianceRatePct: number
  analystWorkloadReductionPct: number
  protectedAssetsCount: number
  zeroDayContainmentRate: number
}

export interface ReproducibilityMetadata {
  datasetVersion: string
  modelVersion: string
  simulationSeed: number
  runId: string
  evaluationTimestamp: string
  featureSetVersion: string
  policyVersion: string
  environment: string
  bibtexCitation: string
}

export interface PublicationSummary {
  bestModel: string
  strongestFeatures: string[]
  keyFindings: string[]
  practicalImpact: string
  limitations: string[]
  futureWork: string[]
  abstractText: string
}

export interface EvaluationSnapshot {
  timestamp: string
  benchmark: BenchmarkOverview
  models: ModelBenchmarkRow[]
  ablation: AblationRow[]
  confusionMatrices: Record<string, ConfusionMatrixData>
  curves: ModelCurves[]
  shapQuality: ShapQualityMetrics
  latency: LatencyThroughputMetrics
  driftRobustness: DriftScenario[]
  fprFnr: FprFnrAnalysis
  privacyImpact: PrivacyImpactMetrics
  metadata: ReproducibilityMetadata
  publication: PublicationSummary
}
