import { describe, expect, it } from 'vitest'
import App from './App'
import { AccessRequestsPage } from './pages/AccessRequestsPage'
import { AdaptiveLearningPage } from './pages/AdaptiveLearningPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { BehaviorAnalyticsPage } from './pages/BehaviorAnalyticsPage'
import { DashboardPage } from './pages/DashboardPage'
import { DemoCenterPage } from './pages/DemoCenterPage'
import { EvaluationPage } from './pages/EvaluationPage'
import { ExperimentCenterPage } from './pages/ExperimentCenterPage'
import { FirewallEnginePage } from './pages/FirewallEnginePage'
import { FirewallMonitorPage } from './pages/FirewallMonitorPage'
import { IncidentCenterPage } from './pages/IncidentCenterPage'
import { GRCPage } from './pages/GRCPage'
import { LoginPage } from './pages/LoginPage'
import { OrganizationPage } from './pages/OrganizationPage'
import { PolicyBuilderPage } from './pages/PolicyBuilderPage'
import { PoliciesPage } from './pages/PoliciesPage'
import { PolicyLearningPage } from './pages/PolicyLearningPage'
import { ProjectDocumentationPage } from './pages/ProjectDocumentationPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResearchSummaryPage } from './pages/ResearchSummaryPage'
import { RiskTuningPage } from './pages/RiskTuningPage'
import { SettingsPage } from './pages/SettingsPage'
import { ThreatDetectionPage } from './pages/ThreatDetectionPage'
import { ThreatIntelligencePage } from './pages/ThreatIntelligencePage'
import { ArchitectureVisualizer } from './components/demo/ArchitectureVisualizer'
import { DemoScenarioPicker } from './components/demo/DemoScenarioPicker'
import { DemoWalkthroughCard } from './components/demo/DemoWalkthroughCard'
import { ScreenshotModeControls } from './components/demo/ScreenshotModeControls'
import { ExportReportModal } from './components/demo/ExportReportModal'
import { InstallationGuideSection } from './components/documentation/InstallationGuideSection'
import { ApiReferenceSection } from './components/documentation/ApiReferenceSection'
import { ReproducibilityCard } from './components/documentation/ReproducibilityCard'
import { Sidebar } from './components/Sidebar'
import { Navbar } from './components/Navbar'
import { FirewallEventCard } from './components/FirewallEventCard'
import { AnimatedShield } from './components/engine/AnimatedShield'
import { EvaluationPipeline } from './components/engine/EvaluationPipeline'
import { PolicyWizardModal } from './components/policy/PolicyWizardModal'
import { RuleFlowDiagram } from './components/policy/RuleFlowDiagram'
import { PolicySimulator } from './components/policy/PolicySimulator'
import { ModelPerformanceChart } from './components/analytics/ModelPerformanceChart'
import { ConfusionMatrix } from './components/analytics/ConfusionMatrix'
import { ShapExplanation } from './components/analytics/ShapExplanation'
import { DepartmentHeatmap } from './components/analytics/DepartmentHeatmap'
import { ThreatDistributionChart } from './components/analytics/ThreatDistributionChart'
import { PolicyEffectivenessTable } from './components/analytics/PolicyEffectivenessTable'
import { ExecutiveSummaryCard } from './components/analytics/ExecutiveSummaryCard'
import { IncidentQueue } from './components/incidents/IncidentQueue'
import { IncidentDetailsModal } from './components/incidents/IncidentDetailsModal'
import { InvestigationTimeline } from './components/incidents/InvestigationTimeline'
import { EvidencePanel } from './components/incidents/EvidencePanel'
import { MitreAttackMatrix } from './components/incidents/MitreAttackMatrix'
import { AttackGraph } from './components/incidents/AttackGraph'
import { BehaviorTimeline } from './components/incidents/BehaviorTimeline'
import { AIInvestigationSummary } from './components/incidents/AIInvestigationSummary'
import { ResponseRecommendations } from './components/incidents/ResponseRecommendations'
import { ContainmentSimulator } from './components/incidents/ContainmentSimulator'
import { CaseManagementPanel } from './components/incidents/CaseManagementPanel'
import { ThreatFeed } from './components/threat/ThreatFeed'
import { IocSearchPanel } from './components/threat/IocSearchPanel'
import { MalwareWorkbench } from './components/threat/MalwareWorkbench'
import { ThreatHuntingWorkspace } from './components/threat/ThreatHuntingWorkspace'
import { CampaignIntelligence } from './components/threat/CampaignIntelligence'
import { IocRelationshipGraph } from './components/threat/IocRelationshipGraph'
import { GlobalAttackMap } from './components/threat/GlobalAttackMap'
import { MitreCoverageMatrix } from './components/threat/MitreCoverageMatrix'
import { ThreatPredictionCard } from './components/threat/ThreatPredictionCard'
import { ThreatIntelSources } from './components/threat/ThreatIntelSources'
import { ExecutiveGrcKpis } from './components/grc/ExecutiveGrcKpis'
import { RiskHeatmap } from './components/grc/RiskHeatmap'
import { RiskRegisterTable } from './components/grc/RiskRegisterTable'
import { ComplianceDashboard } from './components/grc/ComplianceDashboard'
import { ControlsLibrary } from './components/grc/ControlsLibrary'
import { AuditManagement } from './components/grc/AuditManagement'
import { ComplianceGapAnalysis } from './components/grc/ComplianceGapAnalysis'
import { BusinessImpactAnalysis } from './components/grc/BusinessImpactAnalysis'
import { RiskTreatmentPlans } from './components/grc/RiskTreatmentPlans'
import { VendorRiskManagement } from './components/grc/VendorRiskManagement'
import { PolicyComplianceGrid } from './components/grc/PolicyComplianceGrid'
import { ExecutiveRiskSummaryCard } from './components/grc/ExecutiveRiskSummaryCard'
import { RemediationTracker } from './components/grc/RemediationTracker'
import { ComplianceTimeline } from './components/grc/ComplianceTimeline'
import { BehaviorBaselineCard } from './components/adaptive/BehaviorBaselineCard'
import { DriftTrendChart } from './components/adaptive/DriftTrendChart'
import { PrivacyRiskScoreCard } from './components/adaptive/PrivacyRiskScoreCard'
import { ThresholdAdaptationCard } from './components/adaptive/ThresholdAdaptationCard'
import { FeedbackLoopPanel } from './components/adaptive/FeedbackLoopPanel'
import { UserBaselineComparison } from './components/adaptive/UserBaselineComparison'
import { AnomalyTrendTable } from './components/adaptive/AnomalyTrendTable'
import { AdaptiveLearningSummary } from './components/adaptive/AdaptiveLearningSummary'
import { BaselineTimeline } from './components/adaptive/BaselineTimeline'
import { DatasetOverviewCard } from './components/experiments/DatasetOverviewCard'
import { FeatureEngineeringCard } from './components/experiments/FeatureEngineeringCard'
import { SplitSummaryCard } from './components/experiments/SplitSummaryCard'
import { ModelBenchmarkTable } from './components/experiments/ModelBenchmarkTable'
import { ModelComparisonChart } from './components/experiments/ModelComparisonChart'
import { ConfusionMatrixPanel } from './components/experiments/ConfusionMatrixPanel'
import { RocCurveChart } from './components/experiments/RocCurveChart'
import { PrCurveChart } from './components/experiments/PrCurveChart'
import { FeatureImportancePanel } from './components/experiments/FeatureImportancePanel'
import { ExperimentRunHistory } from './components/experiments/ExperimentRunHistory'
import { ExplainabilityExperimentCard } from './components/experiments/ExplainabilityExperimentCard'
import { TrainingMetricsCard } from './components/experiments/TrainingMetricsCard'
import { ExperimentSummaryCard } from './components/experiments/ExperimentSummaryCard'
import { PrivacyRiskScoreCard as RiskTuningScoreCard } from './components/risk/PrivacyRiskScoreCard'
import { ThresholdSliderCard } from './components/risk/ThresholdSliderCard'
import { DecisionBoundaryChart } from './components/risk/DecisionBoundaryChart'
import { SensitivityAnalysisCard } from './components/risk/SensitivityAnalysisCard'
import { CalibrationMetricsCard } from './components/risk/CalibrationMetricsCard'
import { ThresholdHistoryTable } from './components/risk/ThresholdHistoryTable'
import { RiskTrendChart } from './components/risk/RiskTrendChart'
import { DepartmentThresholdOverrides } from './components/risk/DepartmentThresholdOverrides'
import { ScoreDecompositionPanel } from './components/risk/ScoreDecompositionPanel'
import { RiskTuningSummary } from './components/risk/RiskTuningSummary'
import { FeedbackSummaryCard } from './components/policy-learning/FeedbackSummaryCard'
import { PolicyEvolutionChart } from './components/policy-learning/PolicyEvolutionChart'
import { FalsePositiveReductionCard } from './components/policy-learning/FalsePositiveReductionCard'
import { FalseNegativeReductionCard } from './components/policy-learning/FalseNegativeReductionCard'
import { LearnedThresholdsTable } from './components/policy-learning/LearnedThresholdsTable'
import { PolicyRecommendationPanel } from './components/policy-learning/PolicyRecommendationPanel'
import { PolicyComparisonChart } from './components/policy-learning/PolicyComparisonChart'
import { FeedbackLoopDiagram } from './components/policy-learning/FeedbackLoopDiagram'
import { PolicyConfidenceCard } from './components/policy-learning/PolicyConfidenceCard'
import { PolicyImprovementTimeline } from './components/policy-learning/PolicyImprovementTimeline'
import { DepartmentPolicyAdaptationCard } from './components/policy-learning/DepartmentPolicyAdaptationCard'
import { PolicyLearningSummary } from './components/policy-learning/PolicyLearningSummary'
import { BenchmarkSummaryCard } from './components/evaluation/BenchmarkSummaryCard'
import { ModelComparisonMatrix } from './components/evaluation/ModelComparisonMatrix'
import { AblationStudyTable } from './components/evaluation/AblationStudyTable'
import { ConfusionMatrixCard } from './components/evaluation/ConfusionMatrixCard'
import { RocPrCurvePanel } from './components/evaluation/RocPrCurvePanel'
import { ShapQualityCard } from './components/evaluation/ShapQualityCard'
import { LatencyThroughputCard } from './components/evaluation/LatencyThroughputCard'
import { DriftRobustnessCard } from './components/evaluation/DriftRobustnessCard'
import { FalsePositiveFalseNegativeCard } from './components/evaluation/FalsePositiveFalseNegativeCard'
import { PrivacyImpactCard } from './components/evaluation/PrivacyImpactCard'
import { ReproducibilityMetadataCard } from './components/evaluation/ReproducibilityMetadataCard'
import { PublicationSummaryCard } from './components/evaluation/PublicationSummaryCard'

describe('AI Privacy Firewall route composition', () => {
  it('exports the main route application component', () => {
    expect(typeof App).toBe('function')
  })

  it('exports all enterprise firewall pages', () => {
    expect(typeof RegisterPage).toBe('function')
    expect(typeof LoginPage).toBe('function')
    expect(typeof DashboardPage).toBe('function')
    expect(typeof FirewallEnginePage).toBe('function')
    expect(typeof FirewallMonitorPage).toBe('function')
    expect(typeof AnalyticsPage).toBe('function')
    expect(typeof ThreatIntelligencePage).toBe('function')
    expect(typeof IncidentCenterPage).toBe('function')
    expect(typeof GRCPage).toBe('function')
    expect(typeof OrganizationPage).toBe('function')
    expect(typeof PolicyBuilderPage).toBe('function')
    expect(typeof AccessRequestsPage).toBe('function')
    expect(typeof AdaptiveLearningPage).toBe('function')
    expect(typeof RiskTuningPage).toBe('function')
    expect(typeof PolicyLearningPage).toBe('function')
    expect(typeof EvaluationPage).toBe('function')
    expect(typeof ExperimentCenterPage).toBe('function')
    expect(typeof BehaviorAnalyticsPage).toBe('function')
    expect(typeof ThreatDetectionPage).toBe('function')
    expect(typeof PoliciesPage).toBe('function')
    expect(typeof AuditLogsPage).toBe('function')
    expect(typeof SettingsPage).toBe('function')
  })

  it('exports navigation and layout components', () => {
    expect(typeof Sidebar).toBe('function')
    expect(typeof Navbar).toBe('function')
    expect(typeof FirewallEventCard).toBe('function')
    expect(typeof AnimatedShield).toBe('function')
    expect(typeof EvaluationPipeline).toBe('function')
    expect(typeof PolicyWizardModal).toBe('function')
    expect(typeof RuleFlowDiagram).toBe('function')
    expect(typeof PolicySimulator).toBe('function')
    expect(typeof ModelPerformanceChart).toBe('function')
    expect(typeof ConfusionMatrix).toBe('function')
    expect(typeof ShapExplanation).toBe('function')
    expect(typeof DepartmentHeatmap).toBe('function')
    expect(typeof ThreatDistributionChart).toBe('function')
    expect(typeof PolicyEffectivenessTable).toBe('function')
    expect(typeof ExecutiveSummaryCard).toBe('function')
    expect(typeof IncidentQueue).toBe('function')
    expect(typeof IncidentDetailsModal).toBe('function')
    expect(typeof InvestigationTimeline).toBe('function')
    expect(typeof EvidencePanel).toBe('function')
    expect(typeof MitreAttackMatrix).toBe('function')
    expect(typeof AttackGraph).toBe('function')
    expect(typeof BehaviorTimeline).toBe('function')
    expect(typeof AIInvestigationSummary).toBe('function')
    expect(typeof ResponseRecommendations).toBe('function')
    expect(typeof ContainmentSimulator).toBe('function')
    expect(typeof CaseManagementPanel).toBe('function')
    expect(typeof ThreatFeed).toBe('function')
    expect(typeof IocSearchPanel).toBe('function')
    expect(typeof MalwareWorkbench).toBe('function')
    expect(typeof ThreatHuntingWorkspace).toBe('function')
    expect(typeof CampaignIntelligence).toBe('function')
    expect(typeof IocRelationshipGraph).toBe('function')
    expect(typeof GlobalAttackMap).toBe('function')
    expect(typeof MitreCoverageMatrix).toBe('function')
    expect(typeof ThreatPredictionCard).toBe('function')
    expect(typeof ThreatIntelSources).toBe('function')
    expect(typeof ExecutiveGrcKpis).toBe('function')
    expect(typeof RiskHeatmap).toBe('function')
    expect(typeof RiskRegisterTable).toBe('function')
    expect(typeof ComplianceDashboard).toBe('function')
    expect(typeof ControlsLibrary).toBe('function')
    expect(typeof AuditManagement).toBe('function')
    expect(typeof ComplianceGapAnalysis).toBe('function')
    expect(typeof BusinessImpactAnalysis).toBe('function')
    expect(typeof RiskTreatmentPlans).toBe('function')
    expect(typeof VendorRiskManagement).toBe('function')
    expect(typeof PolicyComplianceGrid).toBe('function')
    expect(typeof ExecutiveRiskSummaryCard).toBe('function')
    expect(typeof RemediationTracker).toBe('function')
    expect(typeof ComplianceTimeline).toBe('function')
    expect(typeof BehaviorBaselineCard).toBe('function')
    expect(typeof DriftTrendChart).toBe('function')
    expect(typeof PrivacyRiskScoreCard).toBe('function')
    expect(typeof ThresholdAdaptationCard).toBe('function')
    expect(typeof FeedbackLoopPanel).toBe('function')
    expect(typeof UserBaselineComparison).toBe('function')
    expect(typeof AnomalyTrendTable).toBe('function')
    expect(typeof AdaptiveLearningSummary).toBe('function')
    expect(typeof BaselineTimeline).toBe('function')
    expect(typeof DatasetOverviewCard).toBe('function')
    expect(typeof FeatureEngineeringCard).toBe('function')
    expect(typeof SplitSummaryCard).toBe('function')
    expect(typeof ModelBenchmarkTable).toBe('function')
    expect(typeof ModelComparisonChart).toBe('function')
    expect(typeof ConfusionMatrixPanel).toBe('function')
    expect(typeof RocCurveChart).toBe('function')
    expect(typeof PrCurveChart).toBe('function')
    expect(typeof FeatureImportancePanel).toBe('function')
    expect(typeof ExperimentRunHistory).toBe('function')
    expect(typeof ExplainabilityExperimentCard).toBe('function')
    expect(typeof TrainingMetricsCard).toBe('function')
    expect(typeof ExperimentSummaryCard).toBe('function')
    expect(typeof RiskTuningScoreCard).toBe('function')
    expect(typeof ThresholdSliderCard).toBe('function')
    expect(typeof DecisionBoundaryChart).toBe('function')
    expect(typeof SensitivityAnalysisCard).toBe('function')
    expect(typeof CalibrationMetricsCard).toBe('function')
    expect(typeof ThresholdHistoryTable).toBe('function')
    expect(typeof RiskTrendChart).toBe('function')
    expect(typeof DepartmentThresholdOverrides).toBe('function')
    expect(typeof ScoreDecompositionPanel).toBe('function')
    expect(typeof RiskTuningSummary).toBe('function')
    expect(typeof FeedbackSummaryCard).toBe('function')
    expect(typeof PolicyEvolutionChart).toBe('function')
    expect(typeof FalsePositiveReductionCard).toBe('function')
    expect(typeof FalseNegativeReductionCard).toBe('function')
    expect(typeof LearnedThresholdsTable).toBe('function')
    expect(typeof PolicyRecommendationPanel).toBe('function')
    expect(typeof PolicyComparisonChart).toBe('function')
    expect(typeof FeedbackLoopDiagram).toBe('function')
    expect(typeof PolicyConfidenceCard).toBe('function')
    expect(typeof PolicyImprovementTimeline).toBe('function')
    expect(typeof DepartmentPolicyAdaptationCard).toBe('function')
    expect(typeof PolicyLearningSummary).toBe('function')
    expect(typeof BenchmarkSummaryCard).toBe('function')
    expect(typeof ModelComparisonMatrix).toBe('function')
    expect(typeof AblationStudyTable).toBe('function')
    expect(typeof ConfusionMatrixCard).toBe('function')
    expect(typeof RocPrCurvePanel).toBe('function')
    expect(typeof ShapQualityCard).toBe('function')
    expect(typeof LatencyThroughputCard).toBe('function')
    expect(typeof DriftRobustnessCard).toBe('function')
    expect(typeof FalsePositiveFalseNegativeCard).toBe('function')
    expect(typeof PrivacyImpactCard).toBe('function')
    expect(typeof ReproducibilityMetadataCard).toBe('function')
    expect(typeof PublicationSummaryCard).toBe('function')
    expect(typeof DemoCenterPage).toBe('function')
    expect(typeof ProjectDocumentationPage).toBe('function')
    expect(typeof ResearchSummaryPage).toBe('function')
    expect(typeof ArchitectureVisualizer).toBe('function')
    expect(typeof DemoScenarioPicker).toBe('function')
    expect(typeof DemoWalkthroughCard).toBe('function')
    expect(typeof ScreenshotModeControls).toBe('function')
    expect(typeof ExportReportModal).toBe('function')
    expect(typeof InstallationGuideSection).toBe('function')
    expect(typeof ApiReferenceSection).toBe('function')
    expect(typeof ReproducibilityCard).toBe('function')
  })
})
