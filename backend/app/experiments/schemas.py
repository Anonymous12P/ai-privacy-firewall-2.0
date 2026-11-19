"""Immutable data contracts shared by experimental evaluation stages."""

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Literal

from app.experiments.config import ExperimentConfig
from app.explainability.report import ExplainabilityReportResult
from app.explainability.schemas import (
    ExplainabilityResult,
    ExplainerConfig,
    GlobalExplanation,
    LocalExplanation,
)
from app.features.schemas import (
    CERTGroundTruth,
    FeatureEngineeringRunResult,
    ValidatedCSVRows,
)
from app.ml.schemas import MLPipelineResult
from app.models.comparison import EvaluationPartition, ModelComparisonResult
from app.models.ranking import RankingMetric
from app.models.schemas import ModelPipelineResult, ModelTrainingConfig

type ExperimentFeatureEngineeringResult = FeatureEngineeringRunResult
type ExperimentMLPipelineResult = MLPipelineResult
type ExperimentModelPipelineResult = ModelPipelineResult
type ExperimentModelComparisonResult = ModelComparisonResult
type ExperimentRankingMetric = RankingMetric
type ExperimentEvaluationPartition = EvaluationPartition
type ExperimentSHAPConfig = ExplainerConfig
type ExperimentSHAPResult = ExplainabilityResult
type ExperimentGlobalExplanation = GlobalExplanation
type ExperimentLocalExplanation = LocalExplanation
type ExperimentExplainabilityReportResult = ExplainabilityReportResult
type ExperimentModelName = Literal[
    "LogisticRegression",
    "DecisionTree",
    "RandomForest",
    "XGBoost",
]
type ExperimentModelTrainingConfig = ModelTrainingConfig


@dataclass(frozen=True, slots=True)
class ExperimentMetadata:
    """Describe reproducibility inputs for one experiment."""

    experiment_name: str
    dataset_path: Path
    random_seed: int
    selected_models: tuple[str, ...]
    generated_at: datetime
    environment: tuple[tuple[str, str], ...] = ()


@dataclass(frozen=True, slots=True)
class ExperimentDatasetLoadMetadata:
    """Capture the source snapshot and row counts for one dataset load."""

    dataset_path: Path
    dataset_sha256: str
    file_count: int
    row_counts: tuple[tuple[str, int], ...]
    loaded_at: datetime


@dataclass(frozen=True, slots=True)
class ExperimentDatasetLoadResult:
    """Collect validated feature rows and metadata from a dataset load."""

    datasets: tuple[ValidatedCSVRows, ...]
    metadata: ExperimentDatasetLoadMetadata
    ground_truth: CERTGroundTruth | None = None


@dataclass(frozen=True, slots=True)
class ExperimentArtifact:
    """Identify one artifact that a future experiment may produce."""

    name: str
    path: Path
    sha256: str | None = None


@dataclass(frozen=True, slots=True)
class ExperimentArtifacts:
    """Collect artifact references associated with an experiment."""

    items: tuple[ExperimentArtifact, ...] = ()


@dataclass(frozen=True, slots=True)
class ExperimentResult:
    """Collect the configuration and contracts associated with an experiment."""

    config: ExperimentConfig
    metadata: ExperimentMetadata
    artifacts: ExperimentArtifacts


@dataclass(frozen=True, slots=True)
class ExperimentExplainabilityResult:
    """Collect unchanged explainability outputs for one trained model."""

    model_name: str
    shap: ExplainabilityResult
    global_explanation: GlobalExplanation
    local_explanation: LocalExplanation | None
    report: ExplainabilityReportResult


@dataclass(frozen=True, slots=True)
class ExperimentRunResult(ExperimentResult):
    """Collect unchanged outputs from every stage of a completed experiment."""

    dataset: ExperimentDatasetLoadResult
    feature_engineering: FeatureEngineeringRunResult
    machine_learning: MLPipelineResult
    model_training: ModelPipelineResult | tuple[ModelPipelineResult, ...]
    comparison: ModelComparisonResult
    explainability: (
        ExperimentExplainabilityResult | tuple[ExperimentExplainabilityResult, ...]
    )
    execution_duration_seconds: float

    @property
    def execution_metadata(self) -> ExperimentMetadata:
        """Return the common metadata contract as run execution metadata."""
        return self.metadata
