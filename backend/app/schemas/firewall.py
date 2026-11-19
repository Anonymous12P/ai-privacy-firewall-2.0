"""Pydantic contracts for firewall requests, responses, policies, and audits."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

FirewallAction = Literal["ALLOW", "WARN", "RESTRICT", "BLOCK"]
FirewallRiskLevel = Literal["Low", "Medium", "High", "Critical"]
FirewallModelName = Literal[
    "LogisticRegression", "DecisionTree", "RandomForest", "XGBoost"
]
FirewallSystemStatus = Literal["HEALTHY", "DEGRADED", "INITIALIZING"]
FirewallMode = Literal["ENFORCING", "MONITOR_ONLY"]


class FirewallEvaluationRequest(BaseModel):
    """Validated input representing a subject's access attempt or behavioral activity."""

    features: dict[str, float] = Field(
        ...,
        min_length=1,
        description="Behavioral indicator feature vector extracted for the access event.",
    )
    subject_id: str | None = Field(
        default=None,
        min_length=1,
        max_length=128,
        description="Identifier of the subject or user attempting access.",
    )
    resource: str | None = Field(
        default=None,
        max_length=2048,
        description="Target resource, data collection, or service endpoint being accessed.",
    )
    action: str = Field(
        default="read",
        min_length=1,
        max_length=64,
        description="Action attempted on the resource (e.g., read, export, modify, query).",
    )
    model_name: FirewallModelName = Field(
        default="LogisticRegression",
        description="Classifier architecture used for privacy threat evaluation.",
    )
    context: dict[str, Any] = Field(
        default_factory=dict,
        description="Contextual metadata such as IP address, session, client, or location.",
    )
    url: str | None = Field(
        default=None,
        max_length=2048,
        description="URL target preserved for backward-compatible scanner clients.",
    )


class FirewallEnforceRequest(FirewallEvaluationRequest):
    """Enforcement request extending evaluation parameters with policy controls."""

    enforce: bool | None = Field(
        default=None,
        description="Optional override to force enforcement or evaluate in monitor mode.",
    )


class BehaviorAssessmentSchema(BaseModel):
    """Structured assessment produced by the BehaviorService."""

    anomaly_score: float = Field(
        ge=0.0,
        le=1.0,
        description="Aggregated behavioral risk indicator score between 0.0 and 1.0.",
    )
    anomalous_indicators: list[str] = Field(
        default_factory=list,
        description="Names of behavioral indicators exceeding standard baselines.",
    )
    risk_factors: list[str] = Field(
        default_factory=list,
        description="Human-readable summaries of detected behavioral risk factors.",
    )
    indicators_present: dict[str, bool] = Field(
        default_factory=dict,
        description="Mapping of core indicator channels active in this access event.",
    )


class FirewallExplanationSchema(BaseModel):
    """Explainability outcome detailing reasons and feature contributions."""

    summary: str = Field(
        description="Summary explanation of the firewall evaluation outcome."
    )
    reasons: list[str] = Field(
        default_factory=list,
        description="Human-interpretable decision reasons.",
    )
    contributing_factors: dict[str, float] = Field(
        default_factory=dict,
        description="Feature contribution weights towards risk determination.",
    )
    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence score produced by the AI threat detection engine.",
    )
    model_name: str = Field(
        description="Name of the machine learning model producing the assessment."
    )


class FirewallEvaluationResponse(BaseModel):
    """Complete response returned by the firewall evaluation endpoint."""

    evaluation_id: str = Field(
        description="Unique identifier for this firewall evaluation."
    )
    subject_id: str | None = Field(
        default=None,
        description="Subject identifier associated with this evaluation.",
    )
    resource: str | None = Field(
        default=None,
        description="Target resource evaluated by the firewall.",
    )
    action: str = Field(
        description="Evaluated access action."
    )
    decision: FirewallAction = Field(
        description="Firewall policy decision (ALLOW, WARN, RESTRICT, BLOCK)."
    )
    risk_level: FirewallRiskLevel = Field(
        description="Assigned risk tier (Low, Medium, High, Critical)."
    )
    risk_score: float = Field(
        ge=0.0,
        le=1.0,
        description="Calibrated threat score between 0.0 and 1.0.",
    )
    policy_name: str = Field(
        description="Name of the matching firewall policy rule."
    )
    reasons: list[str] = Field(
        default_factory=list,
        description="Explanatory reasons justifying the decision.",
    )
    explanation: FirewallExplanationSchema = Field(
        description="Detailed explainability breakdown."
    )
    behavior: BehaviorAssessmentSchema = Field(
        description="Behavioral analysis insights."
    )
    warning: str | None = Field(
        default=None,
        description="Warning advisory text when decision is WARN.",
    )
    restriction_notice: str | None = Field(
        default=None,
        description="Restriction advisory text when decision is RESTRICT.",
    )
    timestamp: datetime = Field(
        description="Timestamp when the evaluation was executed."
    )


class FirewallEnforceResponse(FirewallEvaluationResponse):
    """Response returned when an access request is evaluated and enforced."""

    enforced: bool = Field(
        description="Whether the firewall decision was actively enforced."
    )
    enforcement_action: FirewallAction = Field(
        description="Enforced action executed against the access request."
    )


class PolicyRuleSchema(BaseModel):
    """Configuration contract for a discrete firewall policy rule."""

    policy_id: str = Field(description="Unique policy identifier.")
    name: str = Field(description="Descriptive policy name.")
    description: str = Field(description="Detailed explanation of the policy intent.")
    action: FirewallAction = Field(description="Action triggered upon policy match.")
    risk_level: FirewallRiskLevel = Field(description="Associated risk severity.")
    threshold: float | None = Field(
        default=None,
        description="Numerical confidence threshold triggering this policy rule.",
    )
    enabled: bool = Field(default=True, description="Whether this rule is active.")
    conditions: list[str] = Field(
        default_factory=list,
        description="List of behavioral or environmental preconditions.",
    )


class FirewallPoliciesResponse(BaseModel):
    """List of active policies returned by the policies endpoint."""

    policies: list[PolicyRuleSchema] = Field(
        description="Currently loaded firewall policies."
    )
    default_action: FirewallAction = Field(
        default="ALLOW",
        description="Fallback action when no specific rule matches.",
    )
    total_count: int = Field(description="Total count of registered policies.")


class FirewallAuditRecord(BaseModel):
    """Structured audit trail log entry for firewall decisions."""

    audit_id: str = Field(description="Unique audit record identifier.")
    evaluation_id: str = Field(description="Correlated evaluation identifier.")
    timestamp: datetime = Field(description="Timestamp when event was audited.")
    subject_id: str | None = Field(default=None, description="Requesting subject.")
    resource: str | None = Field(default=None, description="Resource accessed.")
    action: str = Field(description="Access action attempted.")
    decision: FirewallAction = Field(description="Firewall policy decision.")
    risk_level: FirewallRiskLevel = Field(description="Risk severity tier.")
    risk_score: float = Field(description="Assessed risk score.")
    policy_name: str = Field(description="Matched policy identifier.")
    enforced: bool = Field(description="Whether the decision was actively enforced.")
    reasons: list[str] = Field(default_factory=list, description="Decision reasons.")
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional context, timing, or system metadata.",
    )


class FirewallAuditResponse(BaseModel):
    """Paginated collection of firewall audit events."""

    items: list[FirewallAuditRecord] = Field(description="Audit records for the page.")
    total_count: int = Field(description="Total number of matching audit records.")
    page: int = Field(ge=1, description="Current page number.")
    page_size: int = Field(ge=1, le=100, description="Items per page.")
    total_pages: int = Field(description="Total available pages.")


class FirewallStatusResponse(BaseModel):
    """Operational health and metric status of the Privacy Firewall platform."""

    status: FirewallSystemStatus = Field(
        description="Current health status of the firewall platform."
    )
    mode: FirewallMode = Field(
        description="Active operating mode: ENFORCING or MONITOR_ONLY."
    )
    version: str = Field(description="Firewall service version.")
    uptime_seconds: float = Field(description="Service uptime in seconds.")
    models_available: list[str] = Field(
        description="Supported AI classifier models ready for threat evaluation."
    )
    active_policies_count: int = Field(
        description="Number of active privacy firewall policies."
    )
    total_evaluations: int = Field(
        description="Cumulative access requests evaluated."
    )
    total_blocks: int = Field(
        description="Cumulative access requests blocked."
    )
    total_warnings: int = Field(
        description="Cumulative access requests warned."
    )
    total_restrictions: int = Field(
        description="Cumulative access requests restricted."
    )
    services: dict[str, str] = Field(
        description="Health states of underlying modular engine services."
    )


class ModelBenchmarkMetricsSchema(BaseModel):
    """Benchmark performance metrics for an evaluated machine learning classifier."""

    model_name: FirewallModelName = Field(description="Name of the model architecture.")
    accuracy: float = Field(ge=0.0, le=1.0, description="Overall test classification accuracy.")
    f1_score: float = Field(ge=0.0, le=1.0, description="Balanced harmonic mean of precision and recall.")
    precision: float = Field(ge=0.0, le=1.0, description="Precision score on threat class.")
    recall: float = Field(ge=0.0, le=1.0, description="Recall sensitivity on threat class.")
    roc_auc: float = Field(ge=0.0, le=1.0, description="Receiver Operating Characteristic Area Under Curve.")
    pr_auc: float = Field(ge=0.0, le=1.0, description="Precision-Recall Area Under Curve.")
    log_loss: float = Field(ge=0.0, description="Cross-entropy / log loss metric.")
    parameter_count: int = Field(ge=0, description="Total learnable parameters / tree nodes.")
    model_size_bytes: int = Field(ge=0, description="Serialized artifact size in bytes.")
    training_time_seconds: float = Field(ge=0.0, description="Seconds taken to train the model.")
    prediction_time_seconds: float = Field(ge=0.0, description="Seconds taken to evaluate test partition.")
    rank: int = Field(ge=1, description="Comparative performance rank.")
    configuration: dict[str, Any] = Field(default_factory=dict, description="Hyperparameter settings.")


class GlobalFeatureImportanceSchema(BaseModel):
    """Global SHAP feature attribution metadata."""

    feature_name: str = Field(description="Raw indicator or encoded feature name.")
    display_name: str = Field(description="Human-readable feature label.")
    mean_absolute_shap_value: float = Field(ge=0.0, description="Mean absolute SHAP impact |SHAP|.")
    percentage_contribution: float = Field(ge=0.0, le=100.0, description="Percentage of global attribution.")
    rank: int = Field(ge=1, description="Importance rank.")
    positive_contribution_count: int = Field(default=0, description="Instances where feature raised risk.")
    negative_contribution_count: int = Field(default=0, description="Instances where feature lowered risk.")


class DatasetSummarySchema(BaseModel):
    """Metadata regarding the training and evaluation corpus."""

    dataset_name: str = Field(description="Name of benchmark dataset.")
    dataset_version: str = Field(description="Dataset release version.")
    total_records: int = Field(ge=0, description="Total engineered records in feature matrix.")
    feature_dimensions: int = Field(ge=1, description="Number of feature dimensions.")
    source_record_counts: dict[str, int] = Field(default_factory=dict, description="Raw event source counts.")
    target_column: str = Field(default="insider", description="Target classification label.")


class ThresholdBandSchema(BaseModel):
    """Threshold range mapping risk probability to firewall policy actions."""

    action: FirewallAction = Field(description="Firewall policy decision.")
    risk_level: FirewallRiskLevel = Field(description="Risk severity tier.")
    min_score: float = Field(ge=0.0, le=1.0, description="Lower risk score boundary.")
    max_score: float = Field(ge=0.0, le=1.0, description="Upper risk score boundary.")
    description: str = Field(description="Operational intent of this threshold tier.")


class FirewallModelPipelineResponse(BaseModel):
    """Comprehensive metadata and benchmark state of the real AI model pipeline."""

    status: str = Field(description="Operational health of the model pipeline.")
    champion_model: FirewallModelName = Field(description="Default production champion model.")
    primary_metric: str = Field(default="f1_score", description="Optimization selection metric.")
    models: list[ModelBenchmarkMetricsSchema] = Field(description="Trained model benchmark metrics.")
    global_features: list[GlobalFeatureImportanceSchema] = Field(description="Top global SHAP feature importances.")
    dataset: DatasetSummarySchema = Field(description="Training dataset metadata.")
    threshold_bands: list[ThresholdBandSchema] = Field(description="Firewall decision calibration bands.")
    active_features: list[str] = Field(description="Feature names exposed by the champion model.")

