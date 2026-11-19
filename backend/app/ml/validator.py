"""Validate prepared ML dataset schema, ordering, integrity, and reproducibility."""

import logging
import math
import re
from collections.abc import Sequence

from app.core.constants import APP_LOGGER_NAME
from app.ml.exceptions import MLValidationError
from app.ml.metadata import build_reproducibility_metadata, source_sha256
from app.ml.schemas import (
    BalancedSplitResult,
    MLDataset,
    MLPipelineConfig,
    MLReproducibilityMetadata,
    MLValidationResult,
    PreprocessedSplitResult,
    SplitResult,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.ml.validator")
_SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")


class MLDatasetValidator:
    """Check all partition and fingerprint invariants before exporting."""

    def validate(
        self,
        source: MLDataset,
        split: SplitResult,
        balanced: BalancedSplitResult,
        prepared: PreprocessedSplitResult,
        metadata: MLReproducibilityMetadata,
        config: MLPipelineConfig,
    ) -> MLValidationResult:
        """Raise a typed error unless prepared datasets retain valid lineage."""
        errors: list[str] = []
        source_ids = [record.subject_id for record in source.records]
        if len(set(source_ids)) != len(source_ids):
            errors.append("Source row identifiers must be unique.")

        source_position = {
            subject_id: index for index, subject_id in enumerate(source_ids)
        }
        split_datasets = {
            "train": split.train,
            "validation": split.validation,
            "test": split.test,
        }
        split_counts = {
            "train": split.metadata.train_row_count,
            "validation": split.metadata.validation_row_count,
            "test": split.metadata.test_row_count,
        }
        if (
            split.metadata.input_row_count != len(source.records)
            or sum(len(dataset.records) for dataset in split_datasets.values())
            != len(source.records)
            or any(
                len(split_datasets[name].records) != row_count
                for name, row_count in split_counts.items()
            )
        ):
            errors.append("Split row counts do not account for each source row.")

        assigned_ids = [
            record.subject_id
            for dataset in split_datasets.values()
            for record in dataset.records
        ]
        if len(set(assigned_ids)) != len(assigned_ids) or set(assigned_ids) != set(
            source_ids
        ):
            errors.append("Splitting must assign each source row exactly once.")
        for partition, dataset in split_datasets.items():
            positions = [
                source_position[record.subject_id]
                for record in dataset.records
                if record.subject_id in source_position
            ]
            if positions != sorted(positions):
                errors.append(f"{partition} source rows are not in stable input order.")

        if balanced.validation != split.validation or balanced.test != split.test:
            errors.append(
                "Balancing must leave validation and test partitions unchanged."
            )
        if balanced.train.feature_names != source.feature_names:
            errors.append("Balancing changed the training feature schema.")

        expected_partitions: Sequence[tuple[str, MLDataset, MLDataset]] = (
            ("train", balanced.train, prepared.train),
            ("validation", split.validation, prepared.validation),
            ("test", split.test, prepared.test),
        )
        for name, before, after in expected_partitions:
            if after.feature_names != source.feature_names:
                errors.append(f"{name} feature names or order do not match source.")
            if after.label_name != source.label_name:
                errors.append(f"{name} target column does not match source.")
            if len(after.records) != len(before.records):
                errors.append(f"{name} row count changed during preprocessing.")
            if [r.subject_id for r in after.records] != [
                r.subject_id for r in before.records
            ]:
                errors.append(f"{name} row ordering or identity changed.")
            if [r.label for r in after.records] != [r.label for r in before.records]:
                errors.append(f"{name} target labels changed during preprocessing.")
            for row_number, (before_record, record) in enumerate(
                zip(before.records, after.records, strict=False),
                start=1,
            ):
                if len(record.values) != len(source.feature_names):
                    errors.append(
                        f"{name} row {row_number} has an invalid feature count."
                    )
                    continue
                if any(
                    value is not None
                    and (
                        isinstance(value, bool)
                        or not isinstance(value, (int, float))
                        or not math.isfinite(value)
                    )
                    for value in record.values
                ):
                    errors.append(f"{name} row {row_number} has a non-numeric feature.")
                    break
                if len(before_record.values) != len(source.feature_names):
                    errors.append(
                        f"{name} input row {row_number} has an invalid feature count."
                    )
                    break
                for column_index, (input_value, output_value) in enumerate(
                    zip(before_record.values, record.values, strict=True)
                ):
                    if not _feature_matches_preprocessing(
                        input_value,
                        output_value,
                        column_index,
                        config,
                        prepared,
                    ):
                        errors.append(
                            f"{name} row {row_number}, feature "
                            f"{source.feature_names[column_index]!r} failed "
                            "preprocessing integrity checks."
                        )
                        break

        digest = source_sha256(source)
        if not _SHA256_PATTERN.fullmatch(digest):
            errors.append("Source dataset SHA-256 is malformed.")
        if metadata.source_sha256 != digest:
            errors.append("Reproducibility metadata does not match source SHA-256.")
        if metadata.dataset_name != config.dataset.source.name:
            errors.append("Reproducibility metadata does not match dataset config.")
        if config.dataset.source.label_column != source.label_name:
            errors.append("Loaded dataset target does not match dataset config.")
        if config.dataset.source.feature_columns and set(
            config.dataset.source.feature_columns
        ) != set(source.feature_names):
            errors.append("Loaded dataset features do not match dataset config.")
        if (
            metadata.feature_names != source.feature_names
            or metadata.target_column != source.label_name
        ):
            errors.append("Reproducibility metadata does not match source schema.")
        if (
            metadata.train_row_count != len(prepared.train.records)
            or metadata.validation_row_count != len(prepared.validation.records)
            or metadata.test_row_count != len(prepared.test.records)
        ):
            errors.append("Reproducibility metadata partition counts do not match.")
        expected_metadata = build_reproducibility_metadata(
            metadata.dataset_name,
            source,
            config,
            prepared,
        )
        if metadata.fingerprint != expected_metadata.fingerprint:
            errors.append("Reproducibility fingerprint does not match prepared data.")

        result = MLValidationResult(
            success=not errors,
            checked_partitions=("train", "validation", "test"),
            errors=tuple(errors),
        )
        if errors:
            logger.error("ML dataset validation failed: %s", "; ".join(errors))
            raise MLValidationError("; ".join(errors))
        logger.info(
            "ML dataset validation succeeded: partitions=%s, fingerprint=%s",
            ",".join(result.checked_partitions),
            metadata.fingerprint,
        )
        return result


def _feature_matches_preprocessing(
    input_value: object,
    output_value: object,
    column_index: int,
    config: MLPipelineConfig,
    prepared: PreprocessedSplitResult,
) -> bool:
    """Verify one output feature follows the configured fill and scaler math."""
    is_missing = input_value is None or (
        isinstance(input_value, float) and math.isnan(input_value)
    )
    if is_missing:
        if config.preprocessing.missing_value_strategy == "raise":
            return False
        if config.preprocessing.missing_value_strategy == "leave":
            return output_value is None
        value = float(config.preprocessing.missing_value_constant)
    elif isinstance(input_value, bool) or not isinstance(input_value, (int, float)):
        return False
    else:
        value = float(input_value)

    strategy = config.preprocessing.scaling_strategy
    parameters = prepared.metadata.scaler_parameters
    if strategy == "standard":
        center = parameters.get("mean_", ())
        scale = parameters.get("scale_", ())
        if len(center) <= column_index or len(scale) <= column_index:
            return False
        expected = (value - center[column_index]) / scale[column_index]
    elif strategy == "min_max":
        scale = parameters.get("scale_", ())
        offset = parameters.get("min_", ())
        if len(scale) <= column_index or len(offset) <= column_index:
            return False
        expected = value * scale[column_index] + offset[column_index]
    elif strategy == "robust":
        center = parameters.get("center_", ())
        scale = parameters.get("scale_", ())
        if len(center) <= column_index or len(scale) <= column_index:
            return False
        expected = (value - center[column_index]) / scale[column_index]
    else:
        expected = value
    return (
        isinstance(output_value, (int, float))
        and not isinstance(output_value, bool)
        and math.isfinite(output_value)
        and math.isclose(output_value, expected, rel_tol=1e-9, abs_tol=1e-12)
    )
