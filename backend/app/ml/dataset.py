"""Load and validate engineered feature datasets for ML workflows."""

import hashlib
import logging
from abc import ABC, abstractmethod
from collections import Counter
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import cast

import pyarrow as pa
import pyarrow.csv as arrow_csv
from pyarrow import parquet

from app.core.constants import APP_LOGGER_NAME
from app.ml.exceptions import (
    MLDatasetNotFoundError,
    MLInvalidSchemaError,
    MLTargetColumnError,
    MLUnsupportedFormatError,
)
from app.ml.schemas import (
    DatasetConfig,
    DatasetLoadConfig,
    DatasetMetadata,
    MLDataset,
    MLLabel,
    MLRecord,
    MLValue,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.ml.dataset")


class MLDatasetLoader(ABC):
    """Define the interface for obtaining a typed feature dataset."""

    @abstractmethod
    def load(self, config: DatasetLoadConfig) -> MLDataset:
        """Return a dataset matching the requested source configuration."""
        raise NotImplementedError


class DatasetSchemaValidator(ABC):
    """Define the interface for checking an in-memory ML dataset contract."""

    @abstractmethod
    def validate(self, dataset: MLDataset, config: DatasetConfig) -> None:
        """Check that dataset columns match the declared source contract."""
        raise NotImplementedError


class FeatureDatasetLoader(MLDatasetLoader):
    """Load exported feature tables from UTF-8 CSV or Parquet files."""

    def load(self, config: DatasetLoadConfig) -> MLDataset:
        """Load a feature table, validate its target, and compute metadata."""
        path = config.source.path
        if path is None:
            raise MLInvalidSchemaError("A dataset path must be configured.")
        if not path.exists() or not path.is_file():
            raise MLDatasetNotFoundError(f"Dataset file does not exist: {path}")

        file_format = _detect_format(path, config.format)
        logger.info("ML dataset loading started: path=%s, format=%s", path, file_format)
        try:
            table = (
                arrow_csv.read_csv(
                    path,
                    read_options=arrow_csv.ReadOptions(encoding=config.encoding),
                    convert_options=arrow_csv.ConvertOptions(
                        null_values=[""],
                        strings_can_be_null=True,
                    ),
                )
                if file_format == "csv"
                else parquet.read_table(path)
            )
        except (OSError, pa.ArrowException, UnicodeError) as exc:
            raise MLInvalidSchemaError(
                f"Unable to read {file_format} dataset {path}: {exc}"
            ) from exc

        column_names = tuple(table.column_names)
        self._validate_schema(column_names, table, config.source)
        target = config.source.label_column
        if target is not None and target not in column_names:
            raise MLTargetColumnError(
                f"Configured target column {target!r} is missing from {path}."
            )

        requested_features = set(config.source.feature_columns)
        if target in requested_features:
            raise MLInvalidSchemaError(
                "The target column must not also be selected as a feature."
            )
        feature_names = tuple(
            name
            for name in column_names
            if name != target and (not requested_features or name in requested_features)
        )
        if not feature_names:
            raise MLInvalidSchemaError(
                "The loaded dataset must contain at least one feature column."
            )

        missing_counts = {
            name: sum(value is None for value in table.column(name).to_pylist())
            for name in column_names
        }
        numerical_columns = tuple(
            name
            for name in feature_names
            if _is_numeric_type(table.schema.field(name).type)
        )
        numerical_set = set(numerical_columns)
        categorical_columns = tuple(
            name for name in feature_names if name not in numerical_set
        )
        labels = table.column(target).to_pylist() if target is not None else []
        class_distribution = dict(
            sorted(
                Counter(
                    str(_to_ml_value(value)) for value in labels if value is not None
                ).items()
            )
        )
        feature_columns = tuple(
            table.column(name).to_pylist() for name in feature_names
        )
        label_values = labels if target is not None else [None] * table.num_rows
        records = tuple(
            MLRecord(
                subject_id=f"row-{row_index + 1:08d}",
                values=tuple(
                    _to_ml_value(column[row_index]) for column in feature_columns
                ),
                label=(
                    cast(MLLabel | None, _to_ml_value(label_values[row_index]))
                    if target is not None
                    else None
                ),
            )
            for row_index in range(table.num_rows)
        )
        metadata = DatasetMetadata(
            source_path=path,
            file_format=file_format,
            sha256=_sha256_file(path),
            row_count=table.num_rows,
            column_count=len(column_names),
            column_names=column_names,
            feature_names=feature_names,
            numerical_columns=numerical_columns,
            categorical_columns=categorical_columns,
            missing_value_counts=dict(sorted(missing_counts.items())),
            class_distribution=class_distribution,
        )
        dataset = MLDataset(
            feature_names=feature_names,
            records=records,
            label_name=target,
            metadata=metadata,
        )
        logger.info(
            "ML dataset loaded: rows=%d, columns=%d, features=%d",
            metadata.row_count,
            metadata.column_count,
            len(metadata.feature_names),
        )
        return dataset

    @staticmethod
    def _validate_schema(
        column_names: tuple[str, ...],
        table: pa.Table,
        config: DatasetConfig,
    ) -> None:
        """Check column names, duplicates, and configured selections."""
        if not column_names:
            raise MLInvalidSchemaError("Dataset must contain at least one column.")
        if any(not name.strip() for name in column_names):
            raise MLInvalidSchemaError("Dataset column names must not be blank.")
        if len(set(column_names)) != len(column_names):
            raise MLInvalidSchemaError("Dataset column names must be unique.")
        if table.num_rows == 0:
            raise MLInvalidSchemaError("Dataset must contain at least one data row.")
        if len(set(config.feature_columns)) != len(config.feature_columns):
            raise MLInvalidSchemaError("Configured feature columns must be unique.")
        missing_features = set(config.feature_columns) - set(column_names)
        if missing_features:
            raise MLInvalidSchemaError(
                "Configured feature columns are missing: "
                f"{', '.join(sorted(missing_features))}."
            )


def _detect_format(
    path: Path,
    requested_format: str,
) -> str:
    """Resolve CSV or Parquet format from settings and file suffix."""
    suffix = path.suffix.casefold()
    detected = {
        ".csv": "csv",
        ".parquet": "parquet",
        ".pq": "parquet",
    }.get(suffix)
    if requested_format == "auto":
        if detected is None:
            raise MLUnsupportedFormatError(
                f"Cannot detect dataset format from extension {suffix!r}."
            )
        return detected
    if requested_format not in {"csv", "parquet"}:
        raise MLUnsupportedFormatError(
            f"Unsupported configured dataset format: {requested_format!r}."
        )
    if detected is not None and detected != requested_format:
        raise MLUnsupportedFormatError(
            f"Configured format {requested_format!r} conflicts with "
            f"file extension {suffix!r}."
        )
    return requested_format


def _is_numeric_type(data_type: pa.DataType) -> bool:
    """Classify Arrow integer, floating-point, and decimal types as numeric."""
    return (
        pa.types.is_integer(data_type)
        or pa.types.is_floating(data_type)
        or pa.types.is_decimal(data_type)
    )


def _to_ml_value(value: object) -> MLValue:
    """Convert supported Arrow scalar values to standard Python primitives."""
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, bytes):
        try:
            return value.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise MLInvalidSchemaError(
                "Binary dataset values must contain UTF-8 text."
            ) from exc
    raise MLInvalidSchemaError(
        f"Unsupported dataset scalar type: {type(value).__name__}."
    )


def _sha256_file(path: Path) -> str:
    """Compute a source file digest using bounded-memory reads."""
    digest = hashlib.sha256()
    with path.open("rb") as source_file:
        for chunk in iter(lambda: source_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()
