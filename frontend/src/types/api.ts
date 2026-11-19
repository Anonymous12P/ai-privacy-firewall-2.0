export type ScanStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface TokenResponse { access_token: string; token_type: string }
export interface UserResponse { username: string }
export interface ScanRequest {
  features: Record<string, number>
  model_name?: 'LogisticRegression' | 'DecisionTree' | 'RandomForest' | 'XGBoost'
  subject_id?: string
  url?: string
}
export interface ScanResponse {
  scan_id: string
  status: ScanStatus
  prediction: string | number | boolean | null
  confidence: number | null
  risk_level: RiskLevel | null
  firewall_action: string | null
  policy_name: string | null
  reasons: string[]
  timestamp: string
  created_at: string
  explanation_summary: string | null
  completed_at: string | null
  error: string | null
  url?: string | null
  model_name?: string | null
}
export interface HistoryResponse {
  items: ScanResponse[]
  total: number
  page: number
  page_size: number
  sort_order: 'asc' | 'desc'
}
export interface AnalyticsSummary {
  total_scans: number
  total_high_risk_predictions: number
  average_confidence: number
  daily_scan_counts: Record<string, number>
  top_risky_users: string[]
}
export interface RiskAnalytics {
  risk_level_distribution: Record<string, number>
  prediction_distribution: Record<string, number>
}
export interface ModelAnalytics {
  model_usage: Record<string, number>
}
export interface SystemAdmin {
  app_name: string
  version: string
  environment: string
  python_version: string
  database_mode: string
  total_scans: number
  registered_api_routes: number
  authentication_enabled: boolean
  uptime_seconds: number | null
}
export interface AdminModel {
  name: string
  available: boolean
  persisted: boolean
  metadata: Record<string, unknown> | null
}
export interface AdminModels {
  models: AdminModel[]
}
export interface AdminUser {
  username: string
  scan_count: number
  last_activity: string | null
}
export interface AdminUsers {
  total_users: number
  users: AdminUser[]
}
export interface AdminExperiment {
  experiment_name: string
  dataset_path: string
  selected_models: string[]
  feature_count: number | null
  explainability_enabled: boolean
  output_directory: string
  generated_artifact_count: number
}
export interface AdminExperiments {
  experiments: AdminExperiment[]
}

export type FirewallAction = 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK'
export type FirewallRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'
export type FirewallModelName =
  | 'LogisticRegression'
  | 'DecisionTree'
  | 'RandomForest'
  | 'XGBoost'

export interface FirewallPolicyRule {
  policy_id: string
  name: string
  description: string
  action: FirewallAction
  risk_level: FirewallRiskLevel
  threshold?: number | null
  enabled: boolean
  conditions: string[]
}

export interface FirewallPoliciesResponse {
  policies: FirewallPolicyRule[]
  default_action: FirewallAction
  total_count: number
}

export interface FirewallEvaluationResponse {
  evaluation_id: string
  subject_id: string | null
  resource: string | null
  action: string
  decision: FirewallAction
  risk_level: FirewallRiskLevel
  risk_score: number
  policy_name: string
  reasons: string[]
  explanation: {
    summary: string
    reasons: string[]
    contributing_factors: Record<string, number>
    confidence: number
    model_name: string
  }
  behavior: {
    anomaly_score: number
    anomalous_indicators: string[]
    risk_factors: string[]
    indicators_present: Record<string, boolean>
  }
  warning?: string | null
  restriction_notice?: string | null
  timestamp: string
}

export interface FirewallAuditRecord {
  audit_id: string
  evaluation_id: string
  timestamp: string
  subject_id: string | null
  resource: string | null
  action: string
  decision: FirewallAction
  risk_level: FirewallRiskLevel
  risk_score: number
  policy_name: string
  enforced: boolean
  reasons: string[]
  metadata: Record<string, unknown>
}

export interface FirewallAuditResponse {
  items: FirewallAuditRecord[]
  total_count: number
  page: number
  page_size: number
  total_pages: number
}

export interface FirewallStatusResponse {
  status: 'HEALTHY' | 'DEGRADED' | 'INITIALIZING'
  mode: 'ENFORCING' | 'MONITOR_ONLY'
  version: string
  uptime_seconds: number
  models_available: string[]
  active_policies_count: number
  total_evaluations: number
  total_blocks: number
  total_warnings: number
  total_restrictions: number
  services: Record<string, string>
}

export type MonitorEmployee =
  | 'Vikas Rathod'
  | 'Pavan Jadhav'
  | 'Ghanshyam Sapkal'
  | 'Himanshu Gond'
  | 'Vaibhav Deshmukh'
  | 'Pratik Akkanawaru'
  | 'Saurabh Talape'
  | 'Ram Rajurkar'
  | string

export type MonitorDepartment =
  | 'Engineering'
  | 'Finance'
  | 'Human Resources'
  | 'Healthcare'
  | 'Infrastructure'
  | 'Security Operations'

export type MonitorResource =
  // Sensitive Databases
  | 'Customer Database'
  | 'Finance Database'
  | 'Medical Records'
  | 'Payroll Records'
  | 'Employee Records'
  | 'Source Code Repository'
  | 'Research Documents'
  | 'Analytics Warehouse'
  // Applications
  | 'HR Portal'
  | 'Payroll System'
  | 'Finance Dashboard'
  | 'GitLab'
  | 'Jira'
  | 'Customer CRM'
  | 'Analytics Platform'
  | 'Email Gateway'
  // Infrastructure Servers
  | 'Web Server'
  | 'API Gateway'
  | 'Identity Provider'
  | 'Database Cluster'
  | 'Storage Cluster'
  | 'Redis Cache'
  | 'Kubernetes Cluster'
  | 'Logging Server'

export type MonitorOperation =
  | 'Read'
  | 'Write'
  | 'Export'
  | 'Delete'
  | 'Modify'
  | 'Bulk Download'

export type MonitorIndicator =
  | 'USB Connected'
  | 'After Hours'
  | 'Impossible Travel'
  | 'BYOD Device'
  | 'Large Download'
  | 'Failed Logins'
  | 'HTTP Burst'
  | 'VPN'
  | 'Email Attachment'

export interface FirewallLiveEvent {
  id: string
  employeeName: MonitorEmployee
  department: MonitorDepartment
  requestedResource: MonitorResource
  operation: MonitorOperation
  deviceType: string
  riskScore: number
  threatScore: number
  aiConfidence: number
  firewallDecision: FirewallAction
  policyTriggered: string
  behaviorIndicators: MonitorIndicator[]
  reasons: string[]
  timestamp: string
}

export interface ModelBenchmarkMetrics {
  model_name: FirewallModelName
  accuracy: number
  f1_score: number
  precision: number
  recall: number
  roc_auc: number
  pr_auc: number
  log_loss: number
  parameter_count: number
  model_size_bytes: number
  training_time_seconds: number
  prediction_time_seconds: number
  rank: number
  configuration: Record<string, unknown>
}

export interface GlobalFeatureImportance {
  feature_name: string
  display_name: string
  mean_absolute_shap_value: number
  percentage_contribution: number
  rank: number
  positive_contribution_count: number
  negative_contribution_count: number
}

export interface DatasetSummary {
  dataset_name: string
  dataset_version: string
  total_records: number
  feature_dimensions: number
  source_record_counts: Record<string, number>
  target_column: string
}

export interface ThresholdBand {
  action: FirewallAction
  risk_level: FirewallRiskLevel
  min_score: number
  max_score: number
  description: string
}

export interface FirewallModelPipelineResponse {
  status: string
  champion_model: FirewallModelName
  primary_metric: string
  models: ModelBenchmarkMetrics[]
  global_features: GlobalFeatureImportance[]
  dataset: DatasetSummary
  threshold_bands: ThresholdBand[]
  active_features: string[]
}


