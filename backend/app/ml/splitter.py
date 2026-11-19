"""Deterministic train, validation, and test splitting."""

import logging
import math
import random
from abc import ABC, abstractmethod
from collections import Counter

from app.core.constants import APP_LOGGER_NAME
from app.ml.exceptions import MLSplitError, MLStratificationError
from app.ml.schemas import (
    DatasetMetadata,
    MLDataset,
    SplitConfig,
    SplitMetadata,
    SplitResult,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.ml.splitter")
_SPLIT_NAMES = ("train", "validation", "test")


class DatasetSplitter(ABC):
    """Define the interface for reproducible dataset partitioning."""

    @abstractmethod
    def split(
        self,
        dataset: MLDataset,
        config: SplitConfig | None = None,
    ) -> SplitResult:
        """Partition a dataset according to the supplied configuration."""
        raise NotImplementedError


class DeterministicDatasetSplitter(DatasetSplitter):
    """Split rows randomly or by target class with stable source row order."""

    def split(
        self,
        dataset: MLDataset,
        config: SplitConfig | None = None,
    ) -> SplitResult:
        """Assign every dataset row exactly once and report partition metadata."""
        selected_config = config or SplitConfig()
        ratios = _validated_ratios(selected_config)
        if len(dataset.records) < 3:
            raise MLSplitError(
                "At least three rows are required for non-empty train, "
                "validation, and test partitions."
            )

        strategy = (
            selected_config.strategy
            if selected_config.stratify is None
            else "stratified"
            if selected_config.stratify
            else "random"
        )
        if strategy == "stratified":
            assignments = self._stratified_assignments(dataset, ratios, selected_config)
        else:
            assignments = self._random_assignments(
                len(dataset.records), ratios, selected_config
            )

        split_datasets = tuple(
            _subset_dataset(dataset, assignments[name]) for name in _SPLIT_NAMES
        )
        self._validate_assignments(assignments, len(dataset.records))
        distributions = {
            name: dict(
                sorted(
                    Counter(
                        str(dataset.records[index].label)
                        for index in assignments[name]
                        if dataset.records[index].label is not None
                    ).items()
                )
            )
            for name in _SPLIT_NAMES
        }
        metadata = SplitMetadata(
            input_row_count=len(dataset.records),
            train_row_count=len(split_datasets[0].records),
            validation_row_count=len(split_datasets[1].records),
            test_row_count=len(split_datasets[2].records),
            train_fraction=ratios[0],
            validation_fraction=ratios[1],
            test_fraction=ratios[2],
            random_seed=selected_config.random_seed,
            strategy=strategy,
            class_distribution=distributions,
        )
        result = SplitResult(
            train=split_datasets[0],
            validation=split_datasets[1],
            test=split_datasets[2],
            metadata=metadata,
        )
        logger.info(
            "Dataset split completed: rows=%d, train=%d, validation=%d, test=%d, "
            "strategy=%s",
            metadata.input_row_count,
            metadata.train_row_count,
            metadata.validation_row_count,
            metadata.test_row_count,
            metadata.strategy,
        )
        return result

    @staticmethod
    def _random_assignments(
        row_count: int,
        ratios: tuple[float, float, float],
        config: SplitConfig,
    ) -> dict[str, list[int]]:
        """Shuffle source indexes reproducibly and apportion all rows."""
        indexes = list(range(row_count))
        random.Random(config.random_seed).shuffle(indexes)
        counts = _apportion(row_count, ratios, minimum=1)
        first_end = counts[0]
        second_end = first_end + counts[1]
        return {
            "train": sorted(indexes[:first_end]),
            "validation": sorted(indexes[first_end:second_end]),
            "test": sorted(indexes[second_end:]),
        }

    @staticmethod
    def _stratified_assignments(
        dataset: MLDataset,
        ratios: tuple[float, float, float],
        config: SplitConfig,
    ) -> dict[str, list[int]]:
        """Split each target class while retaining every class in each split."""
        if dataset.label_name is None:
            raise MLStratificationError(
                "Stratified splitting requires a configured target column."
            )
        indexes_by_class: dict[str, list[int]] = {}
        for index, record in enumerate(dataset.records):
            if record.label is None:
                raise MLStratificationError(
                    "Stratified splitting does not support missing target labels."
                )
            indexes_by_class.setdefault(str(record.label), []).append(index)
        too_small = {
            label: len(indexes)
            for label, indexes in indexes_by_class.items()
            if len(indexes) < 3
        }
        if too_small:
            description = ", ".join(
                f"{label!r} ({count})" for label, count in sorted(too_small.items())
            )
            raise MLStratificationError(
                "Each class needs at least three rows to appear in every split; "
                f"insufficient classes: {description}."
            )

        randomizer = random.Random(config.random_seed)
        assignments: dict[str, list[int]] = {name: [] for name in _SPLIT_NAMES}
        for label in sorted(indexes_by_class):
            class_indexes = list(indexes_by_class[label])
            randomizer.shuffle(class_indexes)
            class_counts = _apportion(len(class_indexes), ratios, minimum=1)
            first_end = class_counts[0]
            second_end = first_end + class_counts[1]
            assignments["train"].extend(class_indexes[:first_end])
            assignments["validation"].extend(class_indexes[first_end:second_end])
            assignments["test"].extend(class_indexes[second_end:])
        for indexes in assignments.values():
            indexes.sort()
        return assignments

    @staticmethod
    def _validate_assignments(
        assignments: dict[str, list[int]],
        row_count: int,
    ) -> None:
        """Ensure assignments are disjoint, complete, and contain no duplicates."""
        assigned = [
            row_index
            for split_indexes in assignments.values()
            for row_index in split_indexes
        ]
        if (
            len(assigned) != row_count
            or len(set(assigned)) != row_count
            or set(assigned) != set(range(row_count))
        ):
            raise MLSplitError(
                "Split assignments must include every input row exactly once."
            )
        if any(not assignments[name] for name in _SPLIT_NAMES):
            raise MLSplitError("Every split must contain at least one row.")


def _validated_ratios(config: SplitConfig) -> tuple[float, float, float]:
    """Validate proportions and normalize insignificant floating-point error."""
    ratios = (
        config.train_fraction,
        config.validation_fraction,
        config.test_fraction,
    )
    if any(
        isinstance(ratio, bool)
        or not isinstance(ratio, (int, float))
        or not math.isfinite(ratio)
        or ratio <= 0
        for ratio in ratios
    ):
        raise MLSplitError("All split fractions must be finite and greater than zero.")
    total = sum(ratios)
    if not math.isclose(total, 1.0, rel_tol=0.0, abs_tol=1e-9):
        raise MLSplitError(f"Split fractions must sum to 1.0; received {total:.12g}.")
    if not isinstance(config.random_seed, int) or isinstance(config.random_seed, bool):
        raise MLSplitError("random_seed must be an integer.")
    if config.stratify is not None and not isinstance(config.stratify, bool):
        raise MLSplitError("stratify must be a boolean or None.")
    if config.strategy not in {"random", "stratified"}:
        raise MLSplitError(f"Unsupported split strategy: {config.strategy!r}.")
    normalized = tuple(float(value) / total for value in ratios)
    return normalized[0], normalized[1], normalized[2]


def _apportion(
    total: int,
    ratios: tuple[float, float, float],
    minimum: int,
) -> tuple[int, int, int]:
    """Allocate integer counts by largest remainder with a per-split minimum."""
    if total < 3 * minimum:
        raise MLSplitError("Insufficient rows for the configured split minimum.")
    quotas = [total * ratio for ratio in ratios]
    counts = [max(minimum, math.floor(quota)) for quota in quotas]
    while sum(counts) > total:
        candidates = [index for index, count in enumerate(counts) if count > minimum]
        if not candidates:
            raise MLSplitError("Unable to satisfy split ratios and minimum sizes.")
        selected = min(
            candidates,
            key=lambda index: (quotas[index] - counts[index], -index),
        )
        counts[selected] -= 1
    remainder_order = sorted(
        range(3),
        key=lambda index: (quotas[index] - math.floor(quotas[index]), -index),
        reverse=True,
    )
    for index in remainder_order[: total - sum(counts)]:
        counts[index] += 1
    return counts[0], counts[1], counts[2]


def _subset_dataset(dataset: MLDataset, indexes: list[int]) -> MLDataset:
    """Construct an ordered subset while preserving dataset metadata."""
    subset_metadata = DatasetMetadata(
        source_path=dataset.metadata.source_path,
        file_format=dataset.metadata.file_format,
        sha256=dataset.metadata.sha256,
        row_count=len(indexes),
        column_count=dataset.metadata.column_count,
        column_names=dataset.metadata.column_names,
        feature_names=dataset.feature_names,
        numerical_columns=dataset.metadata.numerical_columns,
        categorical_columns=dataset.metadata.categorical_columns,
        missing_value_counts=dataset.metadata.missing_value_counts,
        class_distribution=dict(
            sorted(
                Counter(
                    str(dataset.records[index].label)
                    for index in indexes
                    if dataset.records[index].label is not None
                ).items()
            )
        ),
    )
    return MLDataset(
        feature_names=dataset.feature_names,
        records=tuple(dataset.records[index] for index in indexes),
        label_name=dataset.label_name,
        metadata=subset_metadata,
    )
