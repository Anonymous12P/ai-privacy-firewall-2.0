"""Tests for deterministic and stratified ML dataset splitting."""

from dataclasses import replace

import pytest

from app.ml import (
    DatasetMetadata,
    MLDataset,
    MLPipeline,
    MLRecord,
    SplitConfig,
    SplitMetadata,
    SplitResult,
)
from app.ml.exceptions import MLSplitError, MLStratificationError
from app.ml.schemas import MLPipelineRequest, MLPipelineResult
from app.ml.splitter import DeterministicDatasetSplitter


class SplitOnlyPipeline(MLPipeline):
    """Make split_dataset available without implementing model workflow."""

    def run(self, _request: MLPipelineRequest) -> MLPipelineResult:
        """Do not provide model orchestration as part of the splitting tests."""
        raise NotImplementedError


def _dataset(
    labels: tuple[str | None, ...] = ("normal",) * 20 + ("alert",) * 10,
) -> MLDataset:
    """Create an ordered feature dataset with explicit target labels."""
    records = tuple(
        MLRecord(
            subject_id=f"user-{index:03d}",
            values=(float(index), f"group-{index % 3}"),
            label=label,
        )
        for index, label in enumerate(labels)
    )
    return MLDataset(
        feature_names=("score", "group"),
        records=records,
        label_name="target",
        metadata=DatasetMetadata(
            row_count=len(records),
            column_count=3,
            column_names=("score", "group", "target"),
            feature_names=("score", "group"),
        ),
    )


def _record_ids(dataset: MLDataset) -> tuple[str, ...]:
    """Extract row identities in the order stored in one partition."""
    return tuple(record.subject_id for record in dataset.records)


def test_stratified_split_is_reproducible_complete_and_order_preserving() -> None:
    """Same seed yields identical disjoint assignments in original row order."""
    dataset = _dataset()
    config = SplitConfig(random_seed=23)
    splitter = DeterministicDatasetSplitter()

    first = splitter.split(dataset, config)
    second = splitter.split(dataset, config)

    assert first == second
    split_ids = (
        _record_ids(first.train)
        + _record_ids(first.validation)
        + _record_ids(first.test)
    )
    assert len(split_ids) == len(dataset.records)
    assert len(set(split_ids)) == len(dataset.records)
    input_positions = {
        record.subject_id: index for index, record in enumerate(dataset.records)
    }
    for partition in (first.train, first.validation, first.test):
        indexes = [input_positions[item] for item in _record_ids(partition)]
        assert indexes == sorted(indexes)
    assert first.metadata == SplitMetadata(
        input_row_count=30,
        train_row_count=21,
        validation_row_count=5,
        test_row_count=4,
        train_fraction=0.7,
        validation_fraction=0.15,
        test_fraction=0.15,
        random_seed=23,
        strategy="stratified",
        class_distribution={
            "train": {"alert": 7, "normal": 14},
            "validation": {"alert": 2, "normal": 3},
            "test": {"alert": 1, "normal": 3},
        },
    )


def test_random_split_supports_custom_ratios_and_seed() -> None:
    """Random strategy honors custom ratios and accounts for every source row."""
    dataset = _dataset(("a",) * 25)
    result = DeterministicDatasetSplitter().split(
        dataset,
        SplitConfig(
            train_fraction=0.6,
            validation_fraction=0.2,
            test_fraction=0.2,
            random_seed=91,
            strategy="random",
        ),
    )

    assert len(result.train.records) == 15
    assert len(result.validation.records) == 5
    assert len(result.test.records) == 5
    assert result.metadata.strategy == "random"
    assert result.metadata.random_seed == 91
    assert result.metadata.class_distribution["train"] == {"a": 15}


def test_stratification_maintains_approximate_class_proportions() -> None:
    """Every class appears in each split with distribution near source share."""
    dataset = _dataset(("major",) * 80 + ("minor",) * 20)
    result = DeterministicDatasetSplitter().split(dataset, SplitConfig())

    for partition_name in ("train", "validation", "test"):
        counts = result.metadata.class_distribution[partition_name]
        total = sum(counts.values())
        assert set(counts) == {"major", "minor"}
        assert counts["minor"] / total == pytest.approx(0.2, abs=0.08)


@pytest.mark.parametrize(
    "config",
    (
        SplitConfig(train_fraction=0.8, validation_fraction=0.1, test_fraction=0.2),
        SplitConfig(train_fraction=0, validation_fraction=0.5, test_fraction=0.5),
        SplitConfig(train_fraction=float("nan")),
        SplitConfig(strategy="unknown"),  # type: ignore[arg-type]
    ),
)
def test_invalid_split_configuration_is_rejected(config: SplitConfig) -> None:
    """Fractions and strategy configuration are validated before assignment."""
    with pytest.raises(MLSplitError):
        DeterministicDatasetSplitter().split(_dataset(), config)


def test_too_few_rows_for_three_partitions_raises() -> None:
    """A split cannot silently emit an empty partition."""
    with pytest.raises(MLSplitError, match="At least three rows"):
        DeterministicDatasetSplitter().split(
            _dataset(("one", "two")),
            SplitConfig(strategy="random"),
        )


def test_stratification_rejects_class_with_insufficient_rows() -> None:
    """A class must have enough rows to be represented in all partitions."""
    dataset = _dataset(("major",) * 8 + ("rare",) * 2)

    with pytest.raises(MLStratificationError, match="rare"):
        DeterministicDatasetSplitter().split(dataset)


def test_stratification_rejects_missing_target_or_missing_labels() -> None:
    """Stratification requires a target column and non-null labels."""
    with pytest.raises(MLStratificationError, match="target column"):
        DeterministicDatasetSplitter().split(replace(_dataset(), label_name=None))
    with pytest.raises(MLStratificationError, match="missing target"):
        DeterministicDatasetSplitter().split(
            _dataset(("yes", "yes", "yes", "no", "no", "no", None))
        )


def test_pipeline_exposes_configurable_dataset_splitting() -> None:
    """MLPipeline delegates splitting and returns metadata with partitions."""
    dataset = _dataset()

    result = SplitOnlyPipeline().split_dataset(
        dataset,
        SplitConfig(strategy="random", random_seed=7),
    )

    assert isinstance(result, SplitResult)
    assert result.metadata.strategy == "random"
    assert len(result.train.records) + len(result.validation.records) + len(
        result.test.records
    ) == len(dataset.records)
