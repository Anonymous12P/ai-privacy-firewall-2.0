export interface ModelBenchmarkMetric {
  model: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  rocAuc: number
}

export interface ConfusionMatrixData {
  tp: number
  tn: number
  fp: number
  fn: number
  total: number
  accuracy: number
  precision: number
  recall: number
  f1Score: number
}

export interface ShapFeatureGlobal {
  feature: string
  key: string
  shapValue: number
  percentage: number
  direction: 'positive' | 'negative'
  color: string
}

export interface WaterfallStep {
  name: string
  impact: number
  runningTotal: number
  type: 'base' | 'positive' | 'negative' | 'result'
}

export interface LocalExplanationEvent {
  id: string
  timestamp: string
  employee: string
  department: string
  resource: string
  decision: 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK'
  riskScore: number
  threatScore: number
  baseValue: number
  finalScore: number
  waterfallSteps: WaterfallStep[]
  topPositive: Array<{ feature: string; contribution: number; percentage: number }>
  topNegative: Array<{ feature: string; contribution: number; percentage: number }>
}

export interface RadarFeatureImportance {
  indicator: string
  importance: number
  fullMark: number
}

export interface ThreatDistribution {
  level: 'Critical' | 'High' | 'Medium' | 'Low'
  count: number
  percentage: number
  color: string
}

export interface DepartmentRiskRecord {
  department: string
  avgRisk: number
  blocked: number
  warnings: number
  incidents: number
  riskCategory: 'Critical' | 'High' | 'Medium' | 'Low'
}

export interface TimelinePoint {
  time: string
  requests: number
  threats: number
  blocks: number
}

export interface PolicyEffectivenessRecord {
  id: string
  name: string
  category: string
  matches: number
  blocks: number
  falsePositives: number
  executionTimeMs: number
  effectivenessRate: number
}

export interface ModelDriftData {
  yesterdayAccuracy: number
  todayAccuracy: number
  difference: number
  status: 'Stable' | 'Slight Drift' | 'Retraining Needed'
  driftMetric: string
  lastDriftCheck: string
}

export interface ExecutiveKPIs {
  todayRequests: number
  threatsDetected: number
  blockedRequests: number
  falsePositiveRate: number
  modelAccuracy: number
  avgRiskScore: number
  avgDecisionTimeMs: number
  policyMatches: number
  delta: {
    requests: number
    threats: number
    blocks: number
    fpRate: number
    accuracy: number
    riskScore: number
    time: number
    policies: number
  }
}

export interface AIResearchInfo {
  currentModel: string
  trainingDataset: string
  trainingSamples: number
  validationSamples: number
  inferenceTime: string
  lastRetrained: string
}

export interface AnalyticsFilters {
  department: string
  model: string
  risk: string
  decision: string
  timeRange: string
}

export interface AnalyticsSnapshot {
  timestamp: string
  kpis: ExecutiveKPIs
  modelPerformance: ModelBenchmarkMetric[]
  confusionMatrix: ConfusionMatrixData
  globalShap: ShapFeatureGlobal[]
  localEvents: LocalExplanationEvent[]
  radarImportance: RadarFeatureImportance[]
  threatDistribution: ThreatDistribution[]
  departmentRisk: DepartmentRiskRecord[]
  timeline: TimelinePoint[]
  policyEffectiveness: PolicyEffectivenessRecord[]
  modelDrift: ModelDriftData
  executiveSummary: string
  researchInfo: AIResearchInfo
}
