"""Typed model-training configuration, request, prediction, and result schemas."""

import math
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

from app.ml.schemas import MLDataset, MLLabel, PreprocessedSplitResult
from app.models.exceptions import ModelTrainingError

type ModelName = Literal[
    "LogisticRegression",
    "DecisionTree",
    "RandomForest",
    "XGBoost",
    "LightGBM",
    "CatBoost",
]
type PredictionValue = MLLabel | None


@dataclass(frozen=True, slots=True)
class ModelConfig:
    """Describe a requested model and optional algorithm parameters."""

    name: ModelName
    hyperparameters: Mapping[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class ModelTrainingConfig:
    """Configure reproducible model training without implementing it."""

    model: ModelConfig
    random_seed: int = 42
    target_column: str | None = None
    artifact_path: Path | None = None


@dataclass(frozen=True, slots=True)
class TrainingMetadata:
    """Record the training input and declared model configuration."""

    model_name: str
    training_row_count: int
    feature_names: tuple[str, ...]
    target_column: str | None
    random_seed: int
    hyperparameters: Mapping[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class ModelTrainingResult:
    """Describe a completed training operation and optional artifact location."""

    metadata: TrainingMetadata
    artifact_path: Path | None = None
    trained_model: object | None = field(default=None, repr=False, compare=False)


@dataclass(frozen=True, slots=True)
class ModelPrediction:
    """Represent predictions aligned with their source dataset rows."""

    model_name: str
    predictions: tuple[PredictionValue, ...]
    subject_ids: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class ModelEvaluationRequest:
    """Pair a model name and dataset for a future evaluation operation."""

    model_name: str
    dataset: MLDataset


@dataclass(frozen=True, slots=True)
class EvaluationResult:
    """Contain named scalar evaluation metrics and evaluation row count."""

    model_name: str
    metrics: Mapping[str, float]
    evaluated_row_count: int


@dataclass(frozen=True, slots=True)
class ClassificationMetrics:
    """Represent classification metrics, including ordered confusion/report data."""

    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float | None
    pr_auc: float | None
    confusion_matrix: tuple[tuple[int, ...], ...]
    classification_report: Mapping[str, Mapping[str, float] | float]
    log_loss: float
    evaluated_row_count: int
    class_labels: tuple[MLLabel, ...]
    oob_score: float | None = None


@dataclass(frozen=True, slots=True)
class LogisticRegressionConfig:
    """Configure supported scikit-learn LogisticRegression parameters."""

    random_state: int | None = 42
    max_iter: int = 1000
    penalty: Literal["l1", "l2", "elasticnet"] | None = "l2"
    solver: Literal[
        "lbfgs",
        "liblinear",
        "newton-cg",
        "newton-cholesky",
        "sag",
        "saga",
    ] = "lbfgs"
    C: float = 1.0
    class_weight: Literal["balanced"] | Mapping[MLLabel, float] | None = None
    multi_class: Literal["auto", "ovr", "multinomial"] = "auto"

    def __post_init__(self) -> None:
        """Reject obviously invalid arguments before calling scikit-learn."""
        if self.random_state is not None and (
            isinstance(self.random_state, bool)
            or not isinstance(self.random_state, int)
        ):
            raise ModelTrainingError("random_state must be an integer or None.")
        if (
            isinstance(self.max_iter, bool)
            or not isinstance(self.max_iter, int)
            or self.max_iter < 1
        ):
            raise ModelTrainingError("max_iter must be a positive integer.")
        if isinstance(self.C, bool) or not isinstance(self.C, (int, float)):
            raise ModelTrainingError("C must be a positive finite number.")
        if not math.isfinite(self.C) or self.C <= 0:
            raise ModelTrainingError("C must be a positive finite number.")
        if self.multi_class not in {"auto", "ovr", "multinomial"}:
            raise ModelTrainingError(
                f"Unsupported multi_class option: {self.multi_class!r}."
            )


@dataclass(frozen=True, slots=True)
class ModelTrainingRequest:
    """Provide prepared data and model configuration to the training pipeline."""

    dataset: PreprocessedSplitResult
    config: ModelTrainingConfig


@dataclass(frozen=True, slots=True)
class ModelPipelineResult:
    """Aggregate model training and optional evaluation outputs."""

    training: ModelTrainingResult
    evaluation: EvaluationResult | None = None
    validation_metrics: ClassificationMetrics | None = None
    test_metrics: ClassificationMetrics | None = None
    metadata_path: Path | None = None
    artifact_metadata: "ModelArtifactMetadata | None" = None


@dataclass(frozen=True, slots=True)
class ModelArtifactMetadata:
    """Describe persisted model identity, reproducibility, and evaluations."""

    model_name: str
    configuration: Mapping[str, object]
    feature_count: int
    feature_names: tuple[str, ...]
    target_classes: tuple[MLLabel, ...]
    sklearn_version: str
    validation_metrics: Mapping[str, object]
    test_metrics: Mapping[str, object]
    sha256: str = ""
    model_details: Mapping[str, object] = field(default_factory=dict)
    library_version: str | None = None
