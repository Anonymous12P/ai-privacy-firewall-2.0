"""Configurable categorical encoding for behavioral risk feature batches."""

import logging
import math
from abc import ABC, abstractmethod
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Literal

from app.core.constants import APP_LOGGER_NAME
from app.features.exceptions import FeatureEncodingError
from app.features.schemas import (
    EncodedFeatureRecord,
    EncodedFeatureSet,
    FeatureEncodingMetadata,
    RiskFeatureRecord,
    RiskFeatureSet,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.features.encoder")

EncodingStrategy = Literal["one_hot", "label", "frequency"]
MissingCategoryPolicy = Literal["category", "ignore", "error"]
UnseenCategoryPolicy = Literal["unknown", "ignore", "error"]
_CATEGORICAL_FIELDS = frozenset({"subject_id", "window"})
_MISSING_TOKEN = "__MISSING__"
_UNKNOWN_TOKEN = "__UNKNOWN__"


@dataclass(frozen=True, slots=True)
class FeatureEncodingConfig:
    """Configure categorical strategy, category vocabularies, and missingness.

    Known categories optionally provide a stable vocabulary across batches.
    Without them, the current input batch defines each field's vocabulary.
    Numeric values are never scaled; missing numeric values use the configured
    numeric replacement, which defaults to zero.
    """

    strategy: EncodingStrategy = "one_hot"
    categorical_fields: tuple[str, ...] = ("subject_id", "window")
    known_categories: Mapping[str, tuple[str, ...]] = field(default_factory=dict)
    missing_policy: MissingCategoryPolicy = "category"
    unseen_policy: UnseenCategoryPolicy = "unknown"
    numeric_missing_value: float = 0.0

    def __post_init__(self) -> None:
        """Validate strategy, feature selection, vocabularies, and defaults."""
        if self.strategy not in {"one_hot", "label", "frequency"}:
            raise FeatureEncodingError(
                f"Unsupported categorical encoding strategy: {self.strategy!r}."
            )
        if self.missing_policy not in {"category", "ignore", "error"}:
            raise FeatureEncodingError(
                f"Unsupported missing category policy: {self.missing_policy!r}."
            )
        if self.unseen_policy not in {"unknown", "ignore", "error"}:
            raise FeatureEncodingError(
                f"Unsupported unseen category policy: {self.unseen_policy!r}."
            )
        if not self.categorical_fields:
            raise FeatureEncodingError("At least one categorical field is required.")
        if len(set(self.categorical_fields)) != len(self.categorical_fields):
            raise FeatureEncodingError(
                "Categorical fields must not contain duplicates."
            )
        unknown_fields = set(self.categorical_fields) - _CATEGORICAL_FIELDS
        if unknown_fields:
            raise FeatureEncodingError(
                f"Unsupported categorical fields: {', '.join(sorted(unknown_fields))}."
            )
        unknown_vocabularies = set(self.known_categories) - set(self.categorical_fields)
        if unknown_vocabularies:
            raise FeatureEncodingError(
                "Known categories supplied for unselected fields: "
                f"{', '.join(sorted(unknown_vocabularies))}."
            )
        for field_name, categories in self.known_categories.items():
            if any(not category for category in categories):
                raise FeatureEncodingError(
                    f"Known categories for {field_name!r} must not be empty."
                )
            if len(set(categories)) != len(categories):
                raise FeatureEncodingError(
                    f"Known categories for {field_name!r} contain duplicates."
                )
            if _MISSING_TOKEN in categories or _UNKNOWN_TOKEN in categories:
                raise FeatureEncodingError(
                    "Known categories must not use reserved encoding tokens."
                )
        if (
            isinstance(self.numeric_missing_value, bool)
            or not isinstance(self.numeric_missing_value, (int, float))
            or not math.isfinite(self.numeric_missing_value)
        ):
            raise FeatureEncodingError("numeric_missing_value must be a finite number.")


class FeatureEncoderContract(ABC):
    """Define the boundary for encoding a batch of risk feature records."""

    @abstractmethod
    def encode(
        self,
        features: RiskFeatureSet,
        config: FeatureEncodingConfig | None = None,
    ) -> EncodedFeatureSet:
        """Convert selected categorical fields into numerical columns."""
        raise NotImplementedError


class FeatureEncoder(FeatureEncoderContract):
    """Encode categorical risk fields, preserving numeric feature values."""

    def encode(
        self,
        features: RiskFeatureSet,
        config: FeatureEncodingConfig | None = None,
    ) -> EncodedFeatureSet:
        """Encode one risk batch with reproducible columns and mappings."""
        selected = config or FeatureEncodingConfig()
        logger.info(
            "Feature encoding started: records=%d, strategy=%s",
            len(features.records),
            selected.strategy,
        )
        ordered_records = tuple(
            sorted(
                features.records,
                key=lambda record: (
                    record.subject_id,
                    record.window_start,
                    record.window_end,
                ),
            )
        )
        numeric_columns = self._numeric_column_names(ordered_records)
        category_values = self._category_values(ordered_records, selected)
        mappings, categorical_columns = self._build_mappings(
            ordered_records,
            category_values,
            selected,
        )
        feature_names = (
            tuple(
                column
                for field_name in sorted(selected.categorical_fields)
                for column in categorical_columns[field_name]
            )
            + numeric_columns
        )
        encoded_records = tuple(
            self._encode_record(
                record,
                feature_names,
                categorical_columns,
                mappings,
                selected,
            )
            for record in ordered_records
        )
        metadata = FeatureEncodingMetadata(
            strategy=selected.strategy,
            mappings=mappings,
            encoded_columns=categorical_columns,
            numeric_columns=numeric_columns,
            missing_policy=selected.missing_policy,
            unseen_policy=selected.unseen_policy,
        )
        logger.info(
            "Feature encoding completed: records=%d, columns=%d",
            len(encoded_records),
            len(feature_names),
        )
        return EncodedFeatureSet(
            feature_names=feature_names,
            records=encoded_records,
            metadata=metadata,
        )

    @staticmethod
    def _category_values(
        records: tuple[RiskFeatureRecord, ...],
        config: FeatureEncodingConfig,
    ) -> dict[str, tuple[str, ...]]:
        """Build sorted category vocabularies after applying missing policy."""
        values_by_field: dict[str, set[str]] = {
            field_name: set(config.known_categories.get(field_name, ()))
            for field_name in config.categorical_fields
        }
        for record in records:
            for field_name in config.categorical_fields:
                value = _categorical_value(record, field_name)
                if value is None:
                    if config.missing_policy == "error":
                        raise FeatureEncodingError(
                            f"Missing categorical value for {field_name!r} "
                            f"on subject {record.subject_id!r}."
                        )
                    if config.missing_policy == "category":
                        values_by_field[field_name].add(_MISSING_TOKEN)
                else:
                    if value in {_MISSING_TOKEN, _UNKNOWN_TOKEN}:
                        raise FeatureEncodingError(
                            f"Category value {value!r} is reserved for encoding."
                        )
                    known = config.known_categories.get(field_name, ())
                    if field_name in config.known_categories and value not in known:
                        if config.unseen_policy == "error":
                            raise FeatureEncodingError(
                                f"Unseen category {value!r} for {field_name!r} "
                                f"on subject {record.subject_id!r}."
                            )
                        if config.unseen_policy == "unknown":
                            values_by_field[field_name].add(_UNKNOWN_TOKEN)
                    else:
                        values_by_field[field_name].add(value)
        for field_name in config.categorical_fields:
            if (
                field_name in config.known_categories
                and config.unseen_policy == "unknown"
            ):
                values_by_field[field_name].add(_UNKNOWN_TOKEN)
        return {
            field_name: tuple(
                sorted(
                    values,
                    key=lambda value: (
                        value in {_MISSING_TOKEN, _UNKNOWN_TOKEN},
                        value == _MISSING_TOKEN,
                        value,
                    ),
                )
            )
            for field_name, values in sorted(values_by_field.items())
        }

    @staticmethod
    def _build_mappings(
        records: tuple[RiskFeatureRecord, ...],
        categories: Mapping[str, tuple[str, ...]],
        config: FeatureEncodingConfig,
    ) -> tuple[dict[str, dict[str, float]], dict[str, tuple[str, ...]]]:
        """Create strategy-specific numerical mappings and output columns."""
        mappings: dict[str, dict[str, float]] = {}
        columns: dict[str, tuple[str, ...]] = {}
        for field_name in sorted(config.categorical_fields):
            field_categories = categories[field_name]
            if config.strategy == "one_hot":
                mappings[field_name] = {category: 1.0 for category in field_categories}
                columns[field_name] = tuple(
                    f"categorical.{field_name}=={category}"
                    for category in field_categories
                    if category != _UNKNOWN_TOKEN or config.unseen_policy == "unknown"
                )
            elif config.strategy == "label":
                mappings[field_name] = {
                    category: float(index)
                    for index, category in enumerate(field_categories)
                    if category != _UNKNOWN_TOKEN or config.unseen_policy == "unknown"
                }
                columns[field_name] = (f"categorical.{field_name}",)
            else:
                counts: dict[str, int] = {}
                for record in records:
                    value = _categorical_value(record, field_name)
                    if value is None and config.missing_policy == "category":
                        value = _MISSING_TOKEN
                    known = config.known_categories.get(field_name, ())
                    if (
                        value is not None
                        and field_name in config.known_categories
                        and value not in known
                    ):
                        value = (
                            _UNKNOWN_TOKEN
                            if config.unseen_policy == "unknown"
                            else None
                        )
                    if value is not None:
                        counts[value] = counts.get(value, 0) + 1
                total = len(records)
                mappings[field_name] = {
                    category: counts.get(category, 0) / total if total else 0.0
                    for category in field_categories
                    if category != _UNKNOWN_TOKEN or config.unseen_policy == "unknown"
                }
                columns[field_name] = (f"categorical.{field_name}",)
        return mappings, columns

    @staticmethod
    def _numeric_column_names(
        records: tuple[RiskFeatureRecord, ...],
    ) -> tuple[str, ...]:
        """Return the deterministic union of numeric risk feature names."""
        indicator_names = sorted(
            {name for record in records for name in record.indicators}
        )
        component_names = sorted(
            {name for record in records for name in record.component_scores}
        )
        return (
            tuple(f"indicator.{name}" for name in indicator_names)
            + tuple(f"component_score.{name}" for name in component_names)
            + (("behavioral_risk_index",) if records else ())
        )

    @classmethod
    def _encode_record(
        cls,
        record: RiskFeatureRecord,
        feature_names: tuple[str, ...],
        categorical_columns: Mapping[str, tuple[str, ...]],
        mappings: Mapping[str, Mapping[str, float]],
        config: FeatureEncodingConfig,
    ) -> EncodedFeatureRecord:
        """Encode categorical and numeric values for one risk record."""
        categorical_values = {
            field_name: _categorical_value(record, field_name)
            for field_name in config.categorical_fields
        }
        encoded: dict[str, float] = {}
        for field_name, value in categorical_values.items():
            if value is None:
                if config.missing_policy == "error":
                    raise FeatureEncodingError(
                        f"Missing categorical value for {field_name!r} "
                        f"on subject {record.subject_id!r}."
                    )
                category = (
                    _MISSING_TOKEN if config.missing_policy == "category" else None
                )
            elif (
                field_name in config.known_categories
                and value not in config.known_categories[field_name]
            ):
                if config.unseen_policy == "error":
                    raise FeatureEncodingError(
                        f"Unseen category {value!r} for {field_name!r} "
                        f"on subject {record.subject_id!r}."
                    )
                category = _UNKNOWN_TOKEN if config.unseen_policy == "unknown" else None
            else:
                category = value
            if config.strategy == "one_hot":
                for column in categorical_columns[field_name]:
                    category_name = column.split("==", maxsplit=1)[1]
                    encoded[column] = float(category == category_name)
            else:
                column = categorical_columns[field_name][0]
                default = -1.0 if config.strategy == "label" else 0.0
                encoded[column] = (
                    mappings[field_name].get(category, default)
                    if category is not None
                    else default
                )

        encoded.update(cls._numeric_values(record, config))
        for name in feature_names:
            encoded.setdefault(name, config.numeric_missing_value)
        return EncodedFeatureRecord(
            subject_id=record.subject_id,
            window_start=record.window_start,
            window_end=record.window_end,
            values=tuple(encoded[name] for name in feature_names),
        )

    @staticmethod
    def _numeric_values(
        record: RiskFeatureRecord,
        config: FeatureEncodingConfig,
    ) -> dict[str, float]:
        """Preserve numeric values and apply configured representation of nulls."""
        values = {
            f"indicator.{name}": (
                config.numeric_missing_value if value is None else float(value)
            )
            for name, value in record.indicators.items()
        }
        values.update(
            {
                f"component_score.{name}": float(value)
                for name, value in record.component_scores.items()
            }
        )
        values["behavioral_risk_index"] = float(record.behavioral_risk_index)
        return values


def _categorical_value(record: RiskFeatureRecord, field_name: str) -> str | None:
    """Read a supported categorical field from its risk record."""
    if field_name == "subject_id":
        return record.subject_id or None
    if field_name == "window":
        return record.window.value
    raise FeatureEncodingError(f"Unsupported categorical field: {field_name!r}.")
