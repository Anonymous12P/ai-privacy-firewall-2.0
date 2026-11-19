"""Public architecture contracts for future explainable AI workflows."""

from app.explainability.base import ExplanationGenerator
from app.explainability.exceptions import (
    ExplainabilityError,
    ExplainerDependencyError,
    ExplainerNotImplementedError,
    ExplainerNotSupportedError,
    ExplainerRegistrationError,
)
from app.explainability.pipeline import ExplainabilityPipeline
from app.explainability.registry import ExplainerRegistry, ExplainerSpec
from app.explainability.report import (
    ExplainabilityArtifact,
    ExplainabilityReportResult,
)
from app.explainability.schemas import (
    ExplainabilityMetadata,
    ExplainabilityResult,
    ExplainerConfig,
    ExplainerName,
    ExplanationRequest,
    ExplanationResult,
    ExplanationValue,
    FeatureImportance,
    GlobalExplanation,
    GlobalFeatureContribution,
    LocalExplanation,
    LocalFeatureContribution,
)
from app.explainability.shap_explainer import ShapExplainer

__all__ = [
    "ExplainabilityArtifact",
    "ExplainabilityError",
    "ExplainabilityMetadata",
    "ExplainabilityPipeline",
    "ExplainabilityReportResult",
    "ExplainabilityResult",
    "ExplainerConfig",
    "ExplainerDependencyError",
    "ExplainerName",
    "ExplainerNotImplementedError",
    "ExplainerNotSupportedError",
    "ExplainerRegistrationError",
    "ExplainerRegistry",
    "ExplainerSpec",
    "ExplanationGenerator",
    "ExplanationRequest",
    "ExplanationResult",
    "ExplanationValue",
    "FeatureImportance",
    "GlobalExplanation",
    "GlobalFeatureContribution",
    "LocalExplanation",
    "LocalFeatureContribution",
    "ShapExplainer",
]
