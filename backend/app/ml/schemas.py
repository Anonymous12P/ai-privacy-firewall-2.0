"""Typed contracts and configuration for future machine-learning workflows."""

from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

from app.ml.exceptions import MLBalancingError

type MLValue = float | int | str | bool | None
type MLLabel = str | int | float | bool


@dataclass(frozen=True, slots=True)
class DatasetConfig:
    """Describe a feature dataset and optional target/feature selection."""

    name: str
    path: Path | None = None
    feature_columns: tuple[str, ...] = ()
    label_column: str | None = None


@dataclass(frozen=True, slots=True)
class MLDataset:
    """Represent a loaded dataset and its computed inspection metadata."""

    feature_names: tuple[str, ...]
    records: tuple["MLRecord", ...]
    label_name: str | None = None
    metadata: "DatasetMetadata" = field(default_factory=lambda: DatasetMetadata())


@dataclass(frozen=True, slots=True)
class MLRecord:
    """Represent one subject-level feature row and optional target label."""

    subject_id: str
    values: tuple[MLValue, ...]
    label: MLLabel | None = None


@dataclass(frozen=True, slots=True)
class DatasetMetadata:
    """Summarize source integrity, schema, values, and target distribution."""

    source_path: Path | None = None
    file_format: str = "unknown"
    sha256: str = ""
    row_count: int = 0
    column_count: int = 0
    column_names: tuple[str, ...] = ()
    feature_names: tuple[str, ...] = ()
    numerical_columns: tuple[str, ...] = ()
    categorical_columns: tuple[str, ...] = ()
    missing_value_counts: Mapping[str, int] = field(default_factory=dict)
    class_distribution: Mapping[str, int] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class DatasetLoadConfig:
    """Configure path, format detection, and text decoding for dataset loading."""

    source: DatasetConfig
    format: Literal["auto", "csv", "parquet"] = "auto"
    encoding: str = "utf-8"


@dataclass(frozen=True, slots=True)
class SplitConfig:
    """Configure reproducible random or target-stratified data partitions."""

    train_fraction: float = 0.7
    validation_fraction: float = 0.15
    test_fraction: float = 0.15
    random_seed: int = 42
    stratify: bool | None = None
    strategy: Literal["random", "stratified"] = "stratified"


@dataclass(frozen=True, slots=True)
class BalanceConfig:
    """Configure a class-balancing strategy and deterministic sampling."""

    strategy: Literal["none", "random_over", "random_under", "smote"] = "none"
    target_fraction: float | None = None
    random_seed: int = 42

    def __post_init__(self) -> None:
        """Validate target proportion and supported strategy values."""
        import math

        if self.strategy not in {"none", "random_over", "random_under", "smote"}:
            raise MLBalancingError(
                f"Unsupported balancing strategy: {self.strategy!r}."
            )
        if self.target_fraction is not None and (
            isinstance(self.target_fraction, bool)
            or not isinstance(self.target_fraction, (int, float))
            or not math.isfinite(self.target_fraction)
            or not 0 < self.target_fraction <= 1
        ):
            raise MLBalancingError("target_fraction must be finite and in (0, 1].")
        if isinstance(self.random_seed, bool) or not isinstance(self.random_seed, int):
            raise MLBalancingError("random_seed must be an integer.")


@dataclass(frozen=True, slots=True)
class PreprocessingConfig:
    """Configure missing feature handling and optional numeric scaling."""

    missing_value_strategy: Literal["leave", "raise", "constant"] = "raise"
    missing_value_constant: float = 0.0
    scaling_strategy: Literal[
        "none",
        "standard",
        "min_max",
        "robust",
    ] = "none"
    preserve_feature_names: bool = True

    def __post_init__(self) -> None:
        """Validate supported strategies and finite missing-value constant."""
        import math

        from app.ml.exceptions import MLPreprocessingError

        if self.missing_value_strategy not in {"leave", "raise", "constant"}:
            raise MLPreprocessingError(
                f"Unsupported missing-value strategy: {self.missing_value_strategy!r}."
            )
        if self.scaling_strategy not in {"none", "standard", "min_max", "robust"}:
            raise MLPreprocessingError(
                f"Unsupported scaling strategy: {self.scaling_strategy!r}."
            )
        if (
            isinstance(self.missing_value_constant, bool)
            or not isinstance(self.missing_value_constant, (int, float))
            or not math.isfinite(self.missing_value_constant)
        ):
            raise MLPreprocessingError(
                "missing_value_constant must be a finite number."
            )


@dataclass(frozen=True, slots=True)
class MLPipelineConfig:
    """Collect dataset, split, balance, and preprocessing configuration."""

    dataset: DatasetLoadConfig
    split: SplitConfig = SplitConfig()
    balance: BalanceConfig = BalanceConfig()
    preprocessing: PreprocessingConfig = PreprocessingConfig()


@dataclass(frozen=True, slots=True)
class DatasetSplit:
    """Represent train, validation, and test partitions of a dataset."""

    train: MLDataset
    validation: MLDataset
    test: MLDataset


@dataclass(frozen=True, slots=True)
class SplitMetadata:
    """Summarize partition sizes, configuration, and target distributions."""

    input_row_count: int
    train_row_count: int
    validation_row_count: int
    test_row_count: int
    train_fraction: float
    validation_fraction: float
    test_fraction: float
    random_seed: int
    strategy: Literal["random", "stratified"]
    class_distribution: Mapping[str, Mapping[str, int]] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class SplitResult:
    """Hold train, validation, and test datasets with splitting metadata."""

    train: MLDataset
    validation: MLDataset
    test: MLDataset
    metadata: SplitMetadata


@dataclass(frozen=True, slots=True)
class BalancingMetadata:
    """Report training class counts before and after the balancing stage."""

    strategy: Literal["none", "random_over", "random_under", "smote"]
    random_seed: int
    before_row_count: int
    after_row_count: int
    before_class_distribution: Mapping[str, int]
    after_class_distribution: Mapping[str, int]


@dataclass(frozen=True, slots=True)
class BalancedSplitResult:
    """Return a balanced training set with untouched validation and test sets."""

    train: MLDataset
    validation: MLDataset
    test: MLDataset
    metadata: BalancingMetadata


@dataclass(frozen=True, slots=True)
class PreprocessingMetadata:
    """Describe scaling configuration, fitted values, and execution details."""

    feature_names: tuple[str, ...]
    strategy: str
    fitted: bool
    scaling_strategy: str = "none"
    missing_value_strategy: str = "raise"
    missing_value_constant: float = 0.0
    feature_count: int = 0
    target_column: str | None = None
    scaler_parameters: Mapping[str, tuple[float, ...]] = field(default_factory=dict)
    training_row_count: int = 0
    validation_row_count: int = 0
    test_row_count: int = 0
    generated_at: str = ""


@dataclass(frozen=True, slots=True)
class PreprocessedDataset:
    """Pair a future transformed dataset with declarative preprocessing info."""

    dataset: MLDataset
    metadata: PreprocessingMetadata


@dataclass(frozen=True, slots=True)
class PreprocessedSplitResult:
    """Hold transformed splits, separated matrices, targets, and metadata."""

    train: MLDataset
    validation: MLDataset
    test: MLDataset
    metadata: PreprocessingMetadata

    @property
    def x_train(self) -> tuple[tuple[MLValue, ...], ...]:
        """Return the training feature matrix without target labels."""
        return tuple(record.values for record in self.train.records)

    @property
    def y_train(self) -> tuple[MLLabel | None, ...]:
        """Return training targets in matching row order."""
        return tuple(record.label for record in self.train.records)

    @property
    def x_validation(self) -> tuple[tuple[MLValue, ...], ...]:
        """Return the validation feature matrix without target labels."""
        return tuple(record.values for record in self.validation.records)

    @property
    def y_validation(self) -> tuple[MLLabel | None, ...]:
        """Return validation targets in matching row order."""
        return tuple(record.label for record in self.validation.records)

    @property
    def x_test(self) -> tuple[tuple[MLValue, ...], ...]:
        """Return the test feature matrix without target labels."""
        return tuple(record.values for record in self.test.records)

    @property
    def y_test(self) -> tuple[MLLabel | None, ...]:
        """Return test targets in matching row order."""
        return tuple(record.label for record in self.test.records)


@dataclass(frozen=True, slots=True)
class MLPipelineRequest:
    """Provide configuration and an optional caller-supplied dataset."""

    config: MLPipelineConfig
    dataset: MLDataset | None = None


@dataclass(frozen=True, slots=True)
class MLPipelineResult:
    """Return prepared partitions and reproducible export artifacts."""

    split: DatasetSplit
    preprocessing: PreprocessingMetadata
    run_id: str
    balancing: BalancingMetadata | None = None
    reproducibility: "MLReproducibilityMetadata | None" = None
    validation: "MLValidationResult | None" = None
    export: "MLExportResult | None" = None


@dataclass(frozen=True, slots=True)
class MLReproducibilityMetadata:
    """Describe the deterministic source, configuration, and output identity."""

    dataset_name: str
    source_sha256: str
    feature_names: tuple[str, ...]
    target_column: str | None
    split_strategy: str
    split_ratios: tuple[float, float, float]
    split_seed: int
    balancing_strategy: str
    balancing_seed: int
    balancing_target_fraction: float | None
    preprocessing_strategy: str
    missing_value_strategy: str
    missing_value_constant: float
    scaler_parameters: Mapping[str, tuple[float, ...]]
    train_row_count: int
    validation_row_count: int
    test_row_count: int
    fingerprint: str


@dataclass(frozen=True, slots=True)
class MLValidationResult:
    """Summarize final preparation integrity checks."""

    success: bool
    checked_partitions: tuple[str, ...]
    errors: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class MLExportArtifact:
    """Describe one exported artifact using its relative filename and digest."""

    filename: str
    path: Path
    sha256: str
    size_bytes: int


@dataclass(frozen=True, slots=True)
class MLExportResult:
    """Describe all generated ML artifacts and the final manifest."""

    output_directory: Path
    artifacts: tuple[MLExportArtifact, ...]
    manifest_path: Path
