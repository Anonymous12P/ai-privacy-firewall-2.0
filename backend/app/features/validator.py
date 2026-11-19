"""Validation boundary for numerically encoded feature batches."""

import logging
import math
from dataclasses import dataclass

from app.core.constants import APP_LOGGER_NAME
from app.features.exceptions import FeatureValidationError
from app.features.schemas import EncodedFeatureSet

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.features.validator")


@dataclass(frozen=True, slots=True)
class FeatureValidationSummary:
    """Describe the validated row and feature-column counts."""

    row_count: int
    column_count: int


class FeatureSetValidator:
    """Check encoded feature dimensions, identities, ordering, and values."""

    def validate(self, features: EncodedFeatureSet) -> FeatureValidationSummary:
        """Validate all encoded rows or raise a typed validation error."""
        column_count = len(features.feature_names)
        if any(not name for name in features.feature_names):
            raise FeatureValidationError("Feature column names must not be empty.")
        if len(set(features.feature_names)) != column_count:
            raise FeatureValidationError("Feature column names must be unique.")
        if features.target_column is not None:
            if not features.target_column.strip():
                raise FeatureValidationError("Target column name must not be empty.")
            if features.target_column in features.feature_names:
                raise FeatureValidationError(
                    "Target column must not also be a feature column."
                )

        seen: set[tuple[str, object, object]] = set()
        sort_keys: list[tuple[str, object, object]] = []
        for row_number, record in enumerate(features.records, start=1):
            if len(record.values) != column_count:
                raise FeatureValidationError(
                    f"Feature row {row_number} has {len(record.values)} values; "
                    f"expected {column_count}."
                )
            if not record.subject_id:
                raise FeatureValidationError(
                    f"Feature row {row_number} has an empty subject identifier."
                )
            if features.target_column is not None and record.label is None:
                raise FeatureValidationError(
                    f"Feature row {row_number} has no value for target "
                    f"{features.target_column!r}."
                )
            if features.target_column is None and record.label is not None:
                raise FeatureValidationError(
                    f"Feature row {row_number} has a target value without a "
                    "target column name."
                )
            key = (record.subject_id, record.window_start, record.window_end)
            if key in seen:
                raise FeatureValidationError(
                    f"Duplicate subject/window feature row at row {row_number}."
                )
            seen.add(key)
            sort_keys.append(key)
            for column, value in zip(
                features.feature_names, record.values, strict=True
            ):
                if not math.isfinite(value):
                    raise FeatureValidationError(
                        f"Feature row {row_number}, column {column!r} "
                        "contains a non-finite value."
                    )

        if sort_keys != sorted(sort_keys):
            raise FeatureValidationError(
                "Feature rows must be sorted by subject and window."
            )
        summary = FeatureValidationSummary(
            row_count=len(features.records),
            column_count=column_count,
        )
        logger.info(
            "Encoded feature set validated: rows=%d, columns=%d",
            summary.row_count,
            summary.column_count,
        )
        return summary
