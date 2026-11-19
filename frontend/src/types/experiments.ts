export type ModelName =
  | 'LogisticRegression'
  | 'DecisionTree'
  | 'RandomForest'
  | 'XGBoost'

export interface DatasetOverview {
  datasetName: string
  source: string
  version: string
  usersCount: number
  totalRawEvents: number
  benchmarkRecords: number
  featureDimensionsCount: number
  classBalance: {
    benignPercent: number
    threatPercent: number
    threatCount: number
    benignCount: number
  }
  splitRatio: {
    trainPercent: number
    valPercent: number
    testPercent: number
  }
  referenceCitation: string
}

export interface FeatureEngineeringPipelineStage {
  stageId: string
  stageName: string
  category: 'raw' | 'aggregated' | 'temporal' | 'behavioral' | 'derived'
  inputDescription: string
  outputDescription: string
  exampleFeatures: string[]
  formulaOrRule: string
}

export interface SplitSummary {
  trainRecords: number
  trainPercent: number
  valRecords: number
  valPercent: number
  testRecords: number
  testPercent: number
  stratified: boolean
  randomSeed: number
  classDistribution: {
    train: { benign: number; threat: number }
    val: { benign: number; threat: number }
    test: { benign: number; threat: number }
  }
}

export interface ModelBenchmarkMetrics {
  modelName: ModelName
  displayName: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  rocAuc: number
  prAuc: number
  inferenceTimeMs: number
  explainabilityScore: number // 0-100
  status: 'Production Candidate' | 'Baseline Reference' | 'Challenger'
  rank: number
}

export interface ConfusionMatrixData {
  modelName: ModelName
  tp: number
  tn: number
  fp: number
  fn: number
  accuracy: number
  precision: number
  recall: number
  specificity: number
  f1: number
}

export interface CurvePoint {
  x: number // FPR in ROC, Recall in PR
  y: number // TPR in ROC, Precision in PR
}

export interface ModelCurves {
  modelName: ModelName
  displayName: string
  color: string
  aucScore: number
  rocPoints: CurvePoint[]
  prPoints: CurvePoint[]
}

export interface FeatureImportanceItem {
  feature: string
  displayName: string
  category: string
  importanceWeight: number // 0.0 - 1.0 (mean |SHAP|)
  direction: 'Positive Threat Risk' | 'Negative Protective Factor'
  description: string
}

export interface ExperimentRunRecord {
  runId: string
  timestamp: string
  modelName: ModelName
  datasetVersion: string
  hyperparameters: Record<string, string | number>
  accuracy: number
  f1Score: number
  rocAuc: number
  trainingTimeSec: number
  isBest: boolean
  notes: string
}

export interface ExplainabilityExperimentItem {
  modelName: ModelName
  explainerType: string
  fidelityScore: number // 0-100%
  latencyMs: number
  interpretabilityTier: 'High' | 'Medium' | 'Complex'
  shapConsistency: number // 0-100%
  explanationExample: string
}

export interface TrainingLossPoint {
  epoch: number
  trainLoss: number
  valLoss: number
  valAccuracy: number
}

export interface TrainingMetricsSummary {
  modelName: ModelName
  epochsTotal: number
  bestEpoch: number
  convergenceStatus: 'Converged' | 'Early Stopped' | 'Optimal'
  finalTrainLoss: number
  finalValLoss: number
  finalValAccuracy: number
  lossHistory: TrainingLossPoint[]
}

export interface ExperimentSummaryNarrative {
  generatedAt: string
  bestModelName: ModelName
  bestModelF1: number
  bestModelAuc: number
  strongestFeatures: string[]
  majorFindings: string
  weaknessLimitation: string
  productionRecommendation: string
}

export interface ExperimentSnapshot {
  timestamp: string
  dataset: DatasetOverview
  featureStages: FeatureEngineeringPipelineStage[]
  split: SplitSummary
  benchmarks: ModelBenchmarkMetrics[]
  confusionMatrices: Record<ModelName, ConfusionMatrixData>
  curves: ModelCurves[]
  featureImportance: FeatureImportanceItem[]
  runs: ExperimentRunRecord[]
  explainability: ExplainabilityExperimentItem[]
  trainingMetrics: TrainingMetricsSummary
  summary: ExperimentSummaryNarrative
}
