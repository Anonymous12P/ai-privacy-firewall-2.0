"""Typed configuration, request, and result schemas for explainability."""

from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Literal

from app.ml.schemas import MLDataset, MLLabel
from app.models.base import Model

type ExplainerName = Literal["SHAP", "LIME"]
type ExplanationValue = float | int | str | bool | None


@dataclass(frozen=True, slots=True)
class ExplainerConfig:
    """Declare explainer selection and future implementation options."""

    explainer: ExplainerName = "SHAP"
    random_seed: int = 42
    options: Mapping[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class GlobalFeatureContribution:
    """Represent a feature's aggregate contribution in a global explanation."""

    feature_name: str
    mean_absolute_contribution: float


@dataclass(frozen=True, slots=True)
class FeatureImportance:
    """Contain global SHAP statistics for one ranked feature."""

    rank: int
    feature_name: str
    mean_absolute_shap_value: float
    mean_shap_value: float
    standard_deviation: float
    percentage_contribution: float
    positive_contribution_count: int
    negative_contribution_count: int


@dataclass(frozen=True, slots=True)
class LocalFeatureContribution:
    """Represent one feature's contribution for a single explained record."""

    feature_name: str
    contribution: float
    feature_value: ExplanationValue = None
    rank: int = 0


@dataclass(frozen=True, slots=True)
class GlobalExplanation:
    """Describe aggregate explanation output without prescribing its calculation."""

    model_name: str
    explainer: ExplainerName
    feature_contributions: tuple[GlobalFeatureContribution, ...]
    explained_row_count: int
    metadata: Mapping[str, object] = field(default_factory=dict)
    feature_importance: tuple[FeatureImportance, ...] = ()


@dataclass(frozen=True, slots=True)
class LocalExplanation:
    """Describe a single-row explanation and its model output."""

    model_name: str
    explainer: ExplainerName
    subject_id: str
    prediction: MLLabel | None
    baseline_value: float | None
    feature_contributions: tuple[LocalFeatureContribution, ...]
    metadata: Mapping[str, object] = field(default_factory=dict)
    sample_index: int | None = None
    prediction_probability: float | None = None


@dataclass(frozen=True, slots=True)
class ExplanationRequest:
    """Provide model, dataset, configuration, and optional row for explanation."""

    model: Model
    dataset: MLDataset
    config: ExplainerConfig = field(default_factory=ExplainerConfig)
    subject_id: str | None = None


@dataclass(frozen=True, slots=True)
class ExplanationResult:
    """Collect requested global and local explanation outputs."""

    global_explanation: GlobalExplanation | None = None
    local_explanation: LocalExplanation | None = None


@dataclass(frozen=True, slots=True)
class ExplainabilityMetadata:
    """Record the SHAP implementation and execution context."""

    explainer_type: str
    shap_version: str
    model_type: str
    feature_count: int
    sample_count: int
    execution_time_seconds: float
    timestamp: str


@dataclass(frozen=True, slots=True)
class ExplainabilityResult:
    """Contain SHAP values aligned as sample, feature, and output dimensions."""

    shap_values: tuple[tuple[tuple[float, ...], ...], ...]
    expected_values: tuple[float, ...]
    feature_names: tuple[str, ...]
    metadata: ExplainabilityMetadata
