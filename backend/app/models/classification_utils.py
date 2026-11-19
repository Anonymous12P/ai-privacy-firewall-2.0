"""Shared input validation and numeric conversion for classification models."""

import numpy as np
from numpy.typing import NDArray

from app.ml.schemas import MLDataset, MLLabel
from app.models.exceptions import ModelTrainingError


def validate_dataset(dataset: MLDataset, *, require_labels: bool) -> None:
    """Reject empty, malformed, missing, or non-numeric feature rows."""
    if not dataset.feature_names:
        raise ModelTrainingError("Dataset must contain at least one feature.")
    if not dataset.records:
        raise ModelTrainingError("Dataset must contain at least one row.")
    for row_number, record in enumerate(dataset.records, start=1):
        if len(record.values) != len(dataset.feature_names):
            raise ModelTrainingError(
                f"Row {row_number} has {len(record.values)} features; "
                f"expected {len(dataset.feature_names)}."
            )
        for column, value in zip(dataset.feature_names, record.values, strict=True):
            if (
                isinstance(value, bool)
                or not isinstance(value, (int, float))
                or not np.isfinite(value)
            ):
                raise ModelTrainingError(
                    f"Feature {column!r} in row {row_number} must be finite "
                    "and numeric."
                )
        if require_labels and record.label is None:
            raise ModelTrainingError(f"Target label is missing in row {row_number}.")


def feature_matrix(dataset: MLDataset) -> NDArray[np.float64]:
    """Create the dense feature matrix after dataset validation."""
    return np.asarray(
        [
            [_numeric_value(value) for value in record.values]
            for record in dataset.records
        ],
        dtype=np.float64,
    )


def as_label(value: object) -> MLLabel:
    """Convert NumPy scalar predictions and classes to supported Python labels."""
    python_value = value.item() if isinstance(value, np.generic) else value
    if isinstance(python_value, (str, int, float, bool)):
        return python_value
    raise ModelTrainingError(
        f"Unsupported class label type: {type(python_value).__name__}."
    )


def _numeric_value(value: object) -> float:
    """Convert one already-validated numeric feature to a floating-point value."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ModelTrainingError("Feature values must be finite numeric values.")
    if not np.isfinite(value):
        raise ModelTrainingError("Feature values must be finite numeric values.")
    return float(value)
