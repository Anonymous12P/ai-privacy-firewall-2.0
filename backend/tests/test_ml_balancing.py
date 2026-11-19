"""Tests for deterministic training-only ML class balancing."""

import sys
from types import ModuleType

import pytest

from app.ml import (
    BalanceConfig,
    ClassBalancer,
    DatasetMetadata,
    MLDataset,
    MLPipeline,
    MLRecord,
    SplitConfig,
    SplitResult,
)
from app.ml.exceptions import MLBalancingError, MLDependencyError
from app.ml.schemas import MLPipelineRequest, MLPipelineResult
from app.ml.splitter import DeterministicDatasetSplitter


class BalancingOnlyPipeline(MLPipeline):
    """Provide pipeline split and balance helpers without model execution."""

    def run(self, _request: MLPipelineRequest) -> MLPipelineResult:
        """Leave future model training outside this test helper."""
        raise NotImplementedError


def _dataset(
    labels: tuple[str, ...] = ("major",) * 8 + ("minor",) * 2,
    *,
    name: str = "train",
) -> MLDataset:
    """Create a numeric feature dataset with deterministic row identities."""
    records = tuple(
        MLRecord(
            subject_id=f"{name}-{index:03d}",
            values=(float(index), float(index % 2)),
            label=label,
        )
        for index, label in enumerate(labels)
    )
    return MLDataset(
        feature_names=("feature_a", "feature_b"),
        records=records,
        label_name="target",
        metadata=DatasetMetadata(
            row_count=len(records),
            column_count=3,
            column_names=("feature_a", "feature_b", "target"),
            feature_names=("feature_a", "feature_b"),
        ),
    )


def _split(train: MLDataset | None = None) -> SplitResult:
    """Create train and held-out partitions with known distinct identities."""
    return SplitResult(
        train=train or _dataset(),
        validation=_dataset(("validation",) * 3, name="validation"),
        test=_dataset(("test",) * 2, name="test"),
        metadata=DeterministicDatasetSplitter()
        .split(
            _dataset(("split",) * 6),
            SplitConfig(strategy="random"),
        )
        .metadata,
    )


def _counts(dataset: MLDataset) -> dict[str, int]:
    """Count labels in one dataset."""
    result: dict[str, int] = {}
    for record in dataset.records:
        assert record.label is not None
        key = str(record.label)
        result[key] = result.get(key, 0) + 1
    return dict(sorted(result.items()))


def test_none_strategy_returns_training_unchanged_and_metadata() -> None:
    """Default strategy preserves all three partition objects and counts."""
    split = _split()

    result = ClassBalancer().balance(split)

    assert result.train is split.train
    assert result.validation is split.validation
    assert result.test is split.test
    assert result.metadata.strategy == "none"
    assert result.metadata.before_row_count == result.metadata.after_row_count == 10
    assert result.metadata.before_class_distribution == {"major": 8, "minor": 2}
    assert result.metadata.after_class_distribution == {"major": 8, "minor": 2}


def test_random_oversampling_balances_labels_reproducibly() -> None:
    """Oversampling reproduces seeded rows while retaining original samples."""
    split = _split()
    config = BalanceConfig(strategy="random_over", random_seed=31)
    balancer = ClassBalancer()

    first = balancer.balance(split, config)
    second = balancer.balance(split, config)

    assert first.train == second.train
    assert len(first.train.records) == 16
    assert _counts(first.train) == {"major": 8, "minor": 8}
    assert first.train.records[:10] == split.train.records
    assert first.validation is split.validation
    assert first.test is split.test
    assert first.metadata.before_class_distribution == {"major": 8, "minor": 2}
    assert first.metadata.after_class_distribution == {"major": 8, "minor": 8}
    assert first.train.metadata.row_count == 16


def test_random_oversampling_honors_target_fraction() -> None:
    """Configured ratio controls minority sample count relative to largest class."""
    result = ClassBalancer().balance(
        _split(),
        BalanceConfig(strategy="random_over", target_fraction=0.5),
    )

    assert _counts(result.train) == {"major": 8, "minor": 4}


def test_random_undersampling_is_reproducible_and_preserves_input_order() -> None:
    """Undersampling keeps seeded selections in source order without replacement."""
    split = _split()
    config = BalanceConfig(strategy="random_under", random_seed=19)
    first = ClassBalancer().balance(split, config)
    second = ClassBalancer().balance(split, config)

    assert first.train == second.train
    assert len(first.train.records) == 4
    assert _counts(first.train) == {"major": 2, "minor": 2}
    original_positions = {
        record.subject_id: index for index, record in enumerate(split.train.records)
    }
    positions = [
        original_positions[record.subject_id] for record in first.train.records
    ]
    assert positions == sorted(positions)
    assert first.validation is split.validation
    assert first.test is split.test


def test_balancing_preserves_original_target_labels_and_features() -> None:
    """No balancing mode rewrites labels or the original feature values."""
    source = _split()
    originals = {record.subject_id: record for record in source.train.records}

    balanced = (
        ClassBalancer()
        .balance(
            source,
            BalanceConfig(strategy="random_over"),
        )
        .train
    )

    for record in balanced.records:
        if record.subject_id in originals:
            assert record == originals[record.subject_id]
        else:
            assert record.label == "minor"
            assert record.values in {item.values for item in source.train.records}


def test_single_class_dataset_is_noop_for_random_strategies() -> None:
    """Random over/under methods leave a single-class dataset unchanged."""
    split = _split(_dataset(("only",) * 5))

    for strategy in ("random_over", "random_under"):
        result = ClassBalancer().balance(split, BalanceConfig(strategy=strategy))
        assert result.train is split.train
        assert result.metadata.before_class_distribution == {"only": 5}
        assert result.metadata.after_class_distribution == {"only": 5}


def test_empty_training_dataset_is_rejected() -> None:
    """No strategy reports a successful result for empty training input."""
    split = _split(_dataset(()))

    with pytest.raises(MLBalancingError, match="empty training"):
        ClassBalancer().balance(split)


def test_missing_training_labels_are_rejected() -> None:
    """Balancing requires target labels for every training record."""
    dataset = _dataset(("major", "minor", "minor"))
    dataset = MLDataset(
        feature_names=dataset.feature_names,
        records=(
            dataset.records[0],
            MLRecord(
                subject_id="missing",
                values=(1.0, 0.0),
                label=None,
            ),
            dataset.records[2],
        ),
        label_name="target",
    )

    with pytest.raises(MLBalancingError, match="missing target"):
        ClassBalancer().balance(
            _split(dataset),
            BalanceConfig(strategy="random_over"),
        )


def test_invalid_balance_configuration_raises_typed_error() -> None:
    """Unknown strategies, fractions, and seeds fail at configuration time."""
    for create in (
        lambda: BalanceConfig(strategy="other"),  # type: ignore[arg-type]
        lambda: BalanceConfig(target_fraction=0),
        lambda: BalanceConfig(target_fraction=float("nan")),
        lambda: BalanceConfig(random_seed=True),
    ):
        with pytest.raises(MLBalancingError):
            create()


def test_smote_reports_missing_optional_dependency(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """SMOTE request raises the typed dependency error when import is unavailable."""
    monkeypatch.setitem(sys.modules, "imblearn", None)
    monkeypatch.delitem(sys.modules, "imblearn.over_sampling", raising=False)

    with pytest.raises(MLDependencyError, match="imbalanced-learn"):
        ClassBalancer().balance(_split(), BalanceConfig(strategy="smote"))


def test_smote_uses_optional_sampler_and_keeps_held_out_partitions(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """When supplied, SMOTE sampler outputs features and labels for train only."""

    class FakeSMOTE:
        """Small deterministic test double for the optional dependency."""

        def __init__(
            self,
            sampling_strategy: object,
            random_state: int,
            k_neighbors: int,
        ) -> None:
            self.sampling_strategy = sampling_strategy
            self.random_state = random_state
            self.k_neighbors = k_neighbors

        def fit_resample(
            self,
            samples: list[list[float]],
            labels: list[object],
        ) -> tuple[list[list[float]], list[object]]:
            return samples + [[99.0, 1.0], [100.0, 0.0]], labels + ["minor", "minor"]

    fake_root = ModuleType("imblearn")
    fake_over_sampling = ModuleType("imblearn.over_sampling")
    fake_over_sampling.SMOTE = FakeSMOTE  # type: ignore[attr-defined]
    fake_root.over_sampling = fake_over_sampling  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "imblearn", fake_root)
    monkeypatch.setitem(sys.modules, "imblearn.over_sampling", fake_over_sampling)
    split = _split()

    result = ClassBalancer().balance(
        split,
        BalanceConfig(strategy="smote", random_seed=8),
    )

    assert len(result.train.records) == len(split.train.records) + 2
    assert result.train.records[-1].label == "minor"
    assert result.validation is split.validation
    assert result.test is split.test
    assert result.metadata.strategy == "smote"


def test_pipeline_exposes_training_only_balancing() -> None:
    """Pipeline balancing keeps validation and test objects unchanged."""
    split = _split()

    result = BalancingOnlyPipeline().balance_split(
        split,
        BalanceConfig(strategy="random_over"),
    )

    assert result.validation is split.validation
    assert result.test is split.test
    assert len(result.train.records) > len(split.train.records)
