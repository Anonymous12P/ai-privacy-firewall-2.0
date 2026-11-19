import type {
  FirewallAction,
  MonitorDepartment,
  MonitorEmployee,
  MonitorOperation,
  MonitorResource,
} from './api'

export interface ModelPrediction {
  name: 'LogisticRegression' | 'DecisionTree' | 'RandomForest' | 'XGBoost'
  prediction: 'ALLOW' | 'THREAT'
  confidence: number
  riskScore: number
}

export interface BehavioralIndicatorState {
  id: string
  name: string
  active: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  weight: number
  description: string
}

export interface FeatureContribution {
  feature: string
  label: string
  weight: number // e.g. -0.2 to +0.8
  impact: 'positive' | 'negative'
}

export interface LiveEngineEvaluation {
  id: string
  timestamp: string
  isoTimestamp: string

  // Subject & Target
  employee: MonitorEmployee
  department: MonitorDepartment
  resource: MonitorResource
  operation: MonitorOperation
  device: string
  ipAddress: string

  // Behavioral Indicators (9 indicators)
  indicators: {
    usb: boolean
    offHours: boolean
    failedLogins: boolean
    httpBurst: boolean
    emailAttachment: boolean
    massDownload: boolean
    vpn: boolean
    byod: boolean
    impossibleTravel: boolean
  }
  indicatorStates: BehavioralIndicatorState[]
  anomalyScore: number

  // Multi-model Predictions
  models: {
    logisticRegression: ModelPrediction
    decisionTree: ModelPrediction
    randomForest: ModelPrediction
    xgboost: ModelPrediction
  }
  aggregatedThreatScore: number
  ensembleConfidence: number

  // Explainable AI
  featureContributions: FeatureContribution[]
  explanationSummary: string
  reasons: string[]

  // Decision & Policy
  decision: FirewallAction
  policyName: string
  enforcementAction: string
  quarantineRequired: boolean
}

export type PipelineStage =
  | 'request'
  | 'behavior'
  | 'models'
  | 'explainability'
  | 'policy'
  | 'decision'
  | 'audit'
