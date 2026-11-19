"""Fit numeric preprocessing on training data and reuse it for held-out splits."""

from abc import ABC, abstractmethod
from collections.abc import Mapping
from datetime import UTC, datetime
from math import isfinite, isnan

import numpy as np
from numpy.typing import NDArray
from sklearn.preprocessing import (  # type: ignore[import-untyped]
    MinMaxScaler,
    RobustScaler,
    StandardScaler,
)

from app.ml.exceptions import MLPreprocessingError
from app.ml.schemas import (
    BalancedSplitResult,
    MLDataset,
    MLRecord,
    PreprocessedDataset,
    PreprocessedSplitResult,
    PreprocessingConfig,
    PreprocessingMetadata,
    SplitResult,
)

type Scaler = StandardScaler | MinMaxScaler | RobustScaler
type MLPartition = SplitResult | BalancedSplitResult


class DatasetPreprocessor(ABC):
    """Define train-fit and held-out transform boundaries."""

    @abstractmethod
    def fit_transform(
        self,
        training_dataset: MLDataset,
        config: PreprocessingConfig,
    ) -> PreprocessedDataset:
        """Fit state on training rows and return their transformed values."""
        raise NotImplementedError

    @abstractmethod
    def transform(
        self,
        dataset: MLDataset,
        metadata: PreprocessingMetadata,
    ) -> PreprocessedDataset:
        """Apply previously fitted state to a validation or test partition."""
        raise NotImplementedError

    @abstractmethod
    def preprocess(
        self,
        split: MLPartition,
        config: PreprocessingConfig,
    ) -> PreprocessedSplitResult:
        """Fit on training data and transform all partitions consistently."""
        raise NotImplementedError


class ScalerDatasetPreprocessor(DatasetPreprocessor):
    """Apply configured missing-value handling and numeric feature scaling."""

    def __init__(self) -> None:
        """Create a preprocessor with no fitted scaler."""
        self._scaler: Scaler | None = None
        self._fitted_metadata: PreprocessingMetadata | None = None

    def fit_transform(
        self,
        training_dataset: MLDataset,
        config: PreprocessingConfig,
    ) -> PreprocessedDataset:
        """Fit scaling parameters only from the provided training records."""
        self._validate_dataset(training_dataset)
        matrix = self._prepare_matrix(training_dataset, config)
        self._scaler = self._make_scaler(config.scaling_strategy)
        transformed = (
            self._scaler.fit_transform(matrix) if self._scaler is not None else matrix
        )
        metadata = self._metadata(
            training_dataset,
            config,
            scaler_parameters=self._scaler_parameters(self._scaler),
            training_row_count=len(training_dataset.records),
        )
        self._fitted_metadata = metadata
        return PreprocessedDataset(
            dataset=self._with_values(training_dataset, transformed),
            metadata=metadata,
        )

    def transform(
        self,
        dataset: MLDataset,
        metadata: PreprocessingMetadata,
    ) -> PreprocessedDataset:
        """Transform held-out rows using the already fitted training scaler."""
        if self._fitted_metadata != metadata:
            raise MLPreprocessingError(
                "Preprocessing metadata does not match the fitted training state."
            )
        self._validate_dataset(dataset)
        if dataset.feature_names != metadata.feature_names:
            raise MLPreprocessingError(
                "Feature names and order must match the fitted training schema."
            )
        config = PreprocessingConfig(
            missing_value_strategy=metadata.missing_value_strategy,  # type: ignore[arg-type]
            missing_value_constant=metadata.missing_value_constant,
            scaling_strategy=metadata.scaling_strategy,  # type: ignore[arg-type]
        )
        matrix = self._prepare_matrix(dataset, config)
        transformed = (
            self._scaler.transform(matrix) if self._scaler is not None else matrix
        )
        return PreprocessedDataset(
            dataset=self._with_values(dataset, transformed),
            metadata=metadata,
        )

    def preprocess(
        self,
        split: MLPartition,
        config: PreprocessingConfig,
    ) -> PreprocessedSplitResult:
        """Fit with training features, then transform validation and test rows."""
        self._validate_schemas(split.train, split.validation, split.test)
        training = self.fit_transform(split.train, config)
        validation = self.transform(split.validation, training.metadata)
        test = self.transform(split.test, training.metadata)
        metadata = self._metadata(
            split.train,
            config,
            scaler_parameters=training.metadata.scaler_parameters,
            training_row_count=len(split.train.records),
            validation_row_count=len(split.validation.records),
            test_row_count=len(split.test.records),
        )
        self._fitted_metadata = metadata
        return PreprocessedSplitResult(
            train=training.dataset,
            validation=validation.dataset,
            test=test.dataset,
            metadata=metadata,
        )

    @staticmethod
    def _validate_schemas(*datasets: MLDataset) -> None:
        """Require identical ordered features and the same configured target."""
        if not datasets:
            raise MLPreprocessingError("At least one dataset partition is required.")
        expected_features = datasets[0].feature_names
        expected_target = datasets[0].label_name
        if not expected_features:
            raise MLPreprocessingError("At least one feature column is required.")
        for index, dataset in enumerate(datasets):
            if dataset.feature_names != expected_features:
                raise MLPreprocessingError(
                    f"Feature schema mismatch in partition {index}: "
                    "feature names and order must match training."
                )
            if dataset.label_name != expected_target:
                raise MLPreprocessingError(
                    f"Target column mismatch in partition {index}."
                )
            if not dataset.records:
                raise MLPreprocessingError(
                    f"Preprocessing does not accept an empty partition ({index})."
                )
            ScalerDatasetPreprocessor._validate_dataset(dataset)

    @staticmethod
    def _validate_dataset(dataset: MLDataset) -> None:
        """Check each record has the declared number of numeric features."""
        feature_count = len(dataset.feature_names)
        if not feature_count:
            raise MLPreprocessingError("At least one feature column is required.")
        for row_number, record in enumerate(dataset.records, start=1):
            if len(record.values) != feature_count:
                raise MLPreprocessingError(
                    f"Record {row_number} has {len(record.values)} values; "
                    f"expected {feature_count}."
                )

    @staticmethod
    def _prepare_matrix(
        dataset: MLDataset,
        config: PreprocessingConfig,
    ) -> NDArray[np.float64]:
        """Validate numeric cells and apply the configured missing policy."""
        values: list[list[float]] = []
        missing_locations: list[tuple[int, int]] = []
        for row_index, record in enumerate(dataset.records):
            row: list[float] = []
            for column_index, value in enumerate(record.values):
                if value is None:
                    missing_locations.append((row_index, column_index))
                    row.append(np.nan)
                elif isinstance(value, bool) or not isinstance(value, (int, float)):
                    raise MLPreprocessingError(
                        f"Non-numeric value at row {row_index + 1}, "
                        f"column {dataset.feature_names[column_index]!r}."
                    )
                elif not isfinite(value):
                    if isinstance(value, float) and isnan(value):
                        missing_locations.append((row_index, column_index))
                        row.append(np.nan)
                    else:
                        raise MLPreprocessingError(
                            f"Non-finite value at row {row_index + 1}, "
                            f"column {dataset.feature_names[column_index]!r}."
                        )
                else:
                    row.append(float(value))

            values.append(row)

        matrix = np.asarray(values, dtype=np.float64).reshape(
            len(dataset.records), len(dataset.feature_names)
        )
        if missing_locations and config.missing_value_strategy == "raise":
            row_index, column_index = missing_locations[0]
            raise MLPreprocessingError(
                f"Missing feature value at row {row_index + 1}, "
                f"column {dataset.feature_names[column_index]!r}."
            )
        if missing_locations and config.missing_value_strategy == "constant":
            matrix[np.isnan(matrix)] = float(config.missing_value_constant)
        return matrix

    @staticmethod
    def _make_scaler(strategy: str) -> Scaler | None:
        """Instantiate the selected sklearn numeric scaler."""
        if strategy == "none":
            return None
        if strategy == "standard":
            return StandardScaler()
        if strategy == "min_max":
            return MinMaxScaler()
        if strategy == "robust":
            return RobustScaler()
        raise MLPreprocessingError(f"Unsupported scaling strategy: {strategy!r}.")

    @staticmethod
    def _scaler_parameters(scaler: Scaler | None) -> Mapping[str, tuple[float, ...]]:
        """Return serializable fitted parameter vectors for the selected scaler."""
        if scaler is None:
            return {}
        if isinstance(scaler, StandardScaler):
            parameter_names: tuple[str, ...] = ("mean_", "var_", "scale_")
        elif isinstance(scaler, MinMaxScaler):
            parameter_names = (
                "data_min_",
                "data_max_",
                "data_range_",
                "scale_",
                "min_",
            )
        else:
            parameter_names = ("center_", "scale_")
        parameters: dict[str, tuple[float, ...]] = {}
        for name in parameter_names:
            parameter = getattr(scaler, name, None)
            if parameter is not None:
                parameters[name] = tuple(float(value) for value in parameter)
        return parameters

    @staticmethod
    def _metadata(
        dataset: MLDataset,
        config: PreprocessingConfig,
        *,
        scaler_parameters: Mapping[str, tuple[float, ...]],
        training_row_count: int,
        validation_row_count: int = 0,
        test_row_count: int = 0,
    ) -> PreprocessingMetadata:
        """Create an immutable summary of preprocessing configuration and state."""
        return PreprocessingMetadata(
            feature_names=dataset.feature_names,
            strategy=config.scaling_strategy,
            fitted=True,
            scaling_strategy=config.scaling_strategy,
            missing_value_strategy=config.missing_value_strategy,
            missing_value_constant=float(config.missing_value_constant),
            feature_count=len(dataset.feature_names),
            target_column=dataset.label_name,
            scaler_parameters=scaler_parameters,
            training_row_count=training_row_count,
            validation_row_count=validation_row_count,
            test_row_count=test_row_count,
            generated_at=datetime.now(UTC).isoformat(),
        )

    @staticmethod
    def _with_values(
        dataset: MLDataset,
        matrix: NDArray[np.float64],
    ) -> MLDataset:
        """Copy records with transformed values while retaining row labels."""
        records = tuple(
            MLRecord(
                subject_id=record.subject_id,
                values=tuple(
                    None if isnan(float(value)) else float(value)
                    for value in matrix[row_index]
                ),
                label=record.label,
            )
            for row_index, record in enumerate(dataset.records)
        )
        return MLDataset(
            feature_names=dataset.feature_names,
            records=records,
            label_name=dataset.label_name,
            metadata=dataset.metadata,
        )
