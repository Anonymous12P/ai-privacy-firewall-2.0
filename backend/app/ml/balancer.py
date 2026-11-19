"""Training-only class balancing strategies for ML dataset partitions."""

import logging
import math
import random
from abc import ABC, abstractmethod
from collections import Counter
from collections.abc import Sequence
from importlib import import_module
from typing import Protocol, cast

from app.core.constants import APP_LOGGER_NAME
from app.ml.exceptions import MLBalancingError, MLDependencyError
from app.ml.schemas import (
    BalanceConfig,
    BalancedSplitResult,
    BalancingMetadata,
    DatasetMetadata,
    MLDataset,
    MLLabel,
    MLRecord,
    SplitResult,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.ml.balancer")


class _SMOTESampler(Protocol):
    """Describe the optional sampler methods used by this adapter."""

    def __init__(
        self,
        *,
        sampling_strategy: str | dict[MLLabel, int],
        random_state: int,
        k_neighbors: int,
    ) -> None: ...

    def fit_resample(
        self,
        samples: list[list[float]],
        labels: list[object],
    ) -> tuple[Sequence[Sequence[float]], Sequence[object]]: ...


class _SMOTEFactory(Protocol):
    """Represent the dynamically loaded optional SMOTE constructor."""

    def __call__(
        self,
        *,
        sampling_strategy: str | dict[MLLabel, int],
        random_state: int,
        k_neighbors: int,
    ) -> _SMOTESampler: ...


class DatasetBalancer(ABC):
    """Define the interface for balancing training data only."""

    @abstractmethod
    def balance(
        self,
        split: SplitResult,
        config: BalanceConfig | None = None,
    ) -> BalancedSplitResult:
        """Balance only the training partition and preserve held-out data."""
        raise NotImplementedError


class ClassBalancer(DatasetBalancer):
    """Balance training classes with deterministic random sampling or SMOTE."""

    def balance(
        self,
        split: SplitResult,
        config: BalanceConfig | None = None,
    ) -> BalancedSplitResult:
        """Apply the selected strategy to training rows only."""
        selected = config or BalanceConfig()
        train = split.train
        if not train.records:
            raise MLBalancingError("Cannot balance an empty training dataset.")
        if selected.strategy != "none" and train.label_name is None:
            raise MLBalancingError("Training dataset has no target column.")
        if selected.strategy != "none" and any(
            record.label is None for record in train.records
        ):
            raise MLBalancingError("Training dataset contains missing target labels.")

        before = _class_distribution(train)
        if selected.strategy == "none" or len(before) <= 1:
            balanced_train = train
        elif selected.strategy == "random_over":
            balanced_train = self._random_oversample(train, selected)
        elif selected.strategy == "random_under":
            balanced_train = self._random_undersample(train, selected)
        elif selected.strategy == "smote":
            balanced_train = self._smote(train, selected)
        else:
            raise MLBalancingError(
                f"Unsupported balancing strategy: {selected.strategy!r}."
            )

        after = _class_distribution(balanced_train)
        metadata = BalancingMetadata(
            strategy=selected.strategy,
            random_seed=selected.random_seed,
            before_row_count=len(train.records),
            after_row_count=len(balanced_train.records),
            before_class_distribution=before,
            after_class_distribution=after,
        )
        logger.info(
            "Training class balance completed: strategy=%s, before=%d, after=%d",
            selected.strategy,
            metadata.before_row_count,
            metadata.after_row_count,
        )
        return BalancedSplitResult(
            train=balanced_train,
            validation=split.validation,
            test=split.test,
            metadata=metadata,
        )

    @staticmethod
    def _random_oversample(
        dataset: MLDataset,
        config: BalanceConfig,
    ) -> MLDataset:
        """Sample minority rows with replacement up to configured proportions."""
        groups = _records_by_label(dataset)
        maximum = max(len(records) for records in groups.values())
        fraction = config.target_fraction if config.target_fraction is not None else 1.0
        target_count = math.ceil(maximum * fraction)
        randomizer = random.Random(config.random_seed)
        output: list[MLRecord] = list(dataset.records)
        used_subject_ids = {record.subject_id for record in dataset.records}
        duplicate_number = 1
        for label in sorted(groups):
            records = groups[label]
            additions = max(0, target_count - len(records))
            for _ in range(additions):
                selected = randomizer.choice(records)
                subject_id = f"{selected.subject_id}#oversample-{duplicate_number:08d}"
                while subject_id in used_subject_ids:
                    duplicate_number += 1
                    subject_id = (
                        f"{selected.subject_id}#oversample-{duplicate_number:08d}"
                    )
                output.append(
                    MLRecord(
                        subject_id=subject_id,
                        values=selected.values,
                        label=selected.label,
                    )
                )
                used_subject_ids.add(subject_id)
                duplicate_number += 1
        return _dataset_with_records(dataset, tuple(output))

    @staticmethod
    def _random_undersample(
        dataset: MLDataset,
        config: BalanceConfig,
    ) -> MLDataset:
        """Select majority examples without replacement to configured ratio."""
        groups = _records_by_label(dataset)
        minimum = min(len(records) for records in groups.values())
        fraction = config.target_fraction if config.target_fraction is not None else 1.0
        maximum_count = max(minimum, math.floor(minimum / fraction))
        randomizer = random.Random(config.random_seed)
        indexed_groups: dict[str, list[tuple[int, MLRecord]]] = {}
        for index, record in enumerate(dataset.records):
            if record.label is None:
                raise MLBalancingError(
                    "Training dataset contains missing target labels."
                )
            indexed_groups.setdefault(str(record.label), []).append((index, record))
        retained: set[int] = set()
        for indexed_records in indexed_groups.values():
            if len(indexed_records) <= maximum_count:
                retained.update(index for index, _ in indexed_records)
            else:
                selected_records = randomizer.sample(indexed_records, maximum_count)
                retained.update(index for index, _ in selected_records)
        output = tuple(
            record for index, record in enumerate(dataset.records) if index in retained
        )
        return _dataset_with_records(dataset, output)

    @staticmethod
    def _smote(dataset: MLDataset, config: BalanceConfig) -> MLDataset:
        """Delegate numeric synthetic sampling to optional imbalanced-learn."""
        try:
            smote_module = import_module("imblearn.over_sampling")
            smote_factory = cast(_SMOTEFactory, smote_module.__dict__["SMOTE"])
        except (ImportError, AttributeError) as exc:
            raise MLDependencyError(
                "SMOTE requires the optional 'imbalanced-learn' dependency."
            ) from exc

        if not dataset.feature_names:
            raise MLBalancingError("SMOTE requires numeric feature columns.")
        samples: list[list[float]] = []
        for record in dataset.records:
            numeric_row: list[float] = []
            for value in record.values:
                if (
                    isinstance(value, bool)
                    or not isinstance(value, (int, float))
                    or not math.isfinite(value)
                ):
                    raise MLBalancingError(
                        "SMOTE requires finite numeric values in every feature column."
                    )
                numeric_row.append(float(value))
            samples.append(numeric_row)
        groups = _records_by_label(dataset)
        if len(groups) < 2:
            return dataset
        smallest_class = min(len(records) for records in groups.values())
        if smallest_class < 2:
            raise MLBalancingError(
                "SMOTE requires at least two training examples in every class."
            )
        fraction = config.target_fraction if config.target_fraction is not None else 1.0
        majority_count = max(len(records) for records in groups.values())
        sampling_strategy: dict[MLLabel, int] = {}
        target_count = math.ceil(majority_count * fraction)
        for records in groups.values():
            target_label = records[0].label
            if len(records) < target_count and target_label is not None:
                sampling_strategy[target_label] = target_count
        if not sampling_strategy:
            return dataset
        try:
            sampler = smote_factory(
                sampling_strategy=sampling_strategy,
                random_state=config.random_seed,
                k_neighbors=min(5, smallest_class - 1),
            )
            sampled_features, labels = sampler.fit_resample(
                samples,
                [
                    record.label
                    for record in dataset.records
                    if record.label is not None
                ],
            )
        except (ValueError, TypeError) as exc:
            raise MLBalancingError(
                f"SMOTE could not balance training data: {exc}"
            ) from exc

        synthetic_records = tuple(
            MLRecord(
                subject_id=f"smote-{index + 1:08d}",
                values=tuple(float(value) for value in values),
                label=label
                if isinstance(label, (str, int, float, bool))
                else str(label),
            )
            for index, (values, label) in enumerate(
                zip(
                    sampled_features[len(dataset.records) :],
                    labels[len(dataset.records) :],
                    strict=True,
                )
            )
        )
        return _dataset_with_records(dataset, dataset.records + synthetic_records)


def _records_by_label(dataset: MLDataset) -> dict[str, list[MLRecord]]:
    """Group records by stringified target label with stable class keys."""
    groups: dict[str, list[MLRecord]] = {}
    for record in dataset.records:
        if record.label is None:
            raise MLBalancingError("Training dataset contains missing target labels.")
        groups.setdefault(str(record.label), []).append(record)
    if not groups:
        raise MLBalancingError("Training dataset has no target classes.")
    return groups


def _class_distribution(dataset: MLDataset) -> dict[str, int]:
    """Return a stable class-count mapping."""
    return dict(
        sorted(
            Counter(
                str(record.label)
                for record in dataset.records
                if record.label is not None
            ).items()
        )
    )


def _dataset_with_records(
    source: MLDataset,
    records: tuple[MLRecord, ...],
) -> MLDataset:
    """Create training dataset metadata consistent with the new row set."""
    metadata = DatasetMetadata(
        source_path=source.metadata.source_path,
        file_format=source.metadata.file_format,
        sha256=source.metadata.sha256,
        row_count=len(records),
        column_count=source.metadata.column_count,
        column_names=source.metadata.column_names,
        feature_names=source.feature_names,
        numerical_columns=source.metadata.numerical_columns,
        categorical_columns=source.metadata.categorical_columns,
        missing_value_counts=source.metadata.missing_value_counts,
        class_distribution=_class_distribution(
            MLDataset(
                feature_names=source.feature_names,
                records=records,
                label_name=source.label_name,
                metadata=source.metadata,
            )
        ),
    )
    return MLDataset(
        feature_names=source.feature_names,
        records=records,
        label_name=source.label_name,
        metadata=metadata,
    )
