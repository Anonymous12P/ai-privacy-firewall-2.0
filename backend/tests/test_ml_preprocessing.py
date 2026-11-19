"""Tests for train-fitted ML preprocessing and split-wide transformations."""

import math
from typing import Literal

import pytest

from app.ml import (
    DatasetMetadata,
    MLDataset,
    MLPipeline,
    MLRecord,
    PreprocessingConfig,
    ScalerDatasetPreprocessor,
)
from app.ml.exceptions import MLPreprocessingError
from app.ml.schemas import (
    MLPipelineRequest,
    MLPipelineResult,
    SplitMetadata,
    SplitResult,
)


class PreprocessingOnlyPipeline(MLPipeline):
    """Provide pipeline preprocessing without implementing model training."""

    def run(self, request: MLPipelineRequest) -> MLPipelineResult:
        """Keep model execution outside these preprocessing tests."""
        del request
        raise NotImplementedError


def _dataset(
    values: tuple[tuple[float | None, ...], ...],
    *,
    name: str,
    features: tuple[str, ...] = ("x", "y"),
    labels: tuple[str, ...] | None = None,
) -> MLDataset:
    """Build a compact numeric dataset with stable record identities."""
    records = tuple(
        MLRecord(
            subject_id=f"{name}-{index}",
            values=row,
            label=labels[index] if labels is not None else f"label-{index}",
        )
        for index, row in enumerate(values)
    )
    return MLDataset(
        feature_names=features,
        records=records,
        label_name="target",
        metadata=DatasetMetadata(
            row_count=len(records),
            column_count=len(features) + 1,
            column_names=(*features, "target"),
            feature_names=features,
        ),
    )


def _split(
    *,
    train: MLDataset | None = None,
    validation: MLDataset | None = None,
    test: MLDataset | None = None,
) -> SplitResult:
    """Build three compatible partitions for preprocessing tests."""
    train_dataset = train or _dataset(((0.0, 0.0), (2.0, 2.0)), name="train")
    validation_dataset = validation or _dataset(((10.0, 10.0),), name="validation")
    test_dataset = test or _dataset(((-2.0, -2.0),), name="test")
    return SplitResult(
        train=train_dataset,
        validation=validation_dataset,
        test=test_dataset,
        metadata=SplitMetadata(
            input_row_count=sum(
                len(part.records)
                for part in (train_dataset, validation_dataset, test_dataset)
            ),
            train_row_count=len(train_dataset.records),
            validation_row_count=len(validation_dataset.records),
            test_row_count=len(test_dataset.records),
            train_fraction=0.5,
            validation_fraction=0.25,
            test_fraction=0.25,
            random_seed=42,
            strategy="random",
        ),
    )


@pytest.mark.parametrize(
    (
        "strategy",
        "expected_validation_value",
        "expected_parameter_name",
        "expected_parameter",
        "expected_training_values",
    ),
    [
        ("standard", 9.0, "mean_", (1.0, 1.0), (-1.0, 1.0)),
        ("min_max", 5.0, "data_min_", (0.0, 0.0), (0.0, 1.0)),
        ("robust", 9.0, "center_", (1.0, 1.0), (-1.0, 1.0)),
    ],
)
def test_scalers_are_fitted_on_training_only(
    strategy: Literal["standard", "min_max", "robust"],
    expected_validation_value: float,
    expected_parameter_name: str,
    expected_parameter: tuple[float, float],
    expected_training_values: tuple[float, float],
) -> None:
    """Held-out extremes use scaler parameters fitted only on training rows."""
    result = PreprocessingOnlyPipeline().preprocess(
        _split(),
        PreprocessingConfig(
            scaling_strategy=strategy,
        ),
    )

    assert result.train.records[0].values == pytest.approx(
        (expected_training_values[0], expected_training_values[0])
    )
    assert result.train.records[1].values == pytest.approx(
        (expected_training_values[1], expected_training_values[1])
    )
    assert result.validation.records[0].values == pytest.approx(
        (expected_validation_value, expected_validation_value)
    )
    assert result.metadata.scaler_parameters[expected_parameter_name] == pytest.approx(
        expected_parameter
    )
    assert result.metadata.training_row_count == 2
    assert result.metadata.validation_row_count == 1
    assert result.metadata.test_row_count == 1
    assert result.x_train == tuple(record.values for record in result.train.records)
    assert result.y_train == tuple(record.label for record in result.train.records)


def test_no_scaling_leaves_numeric_values_unchanged() -> None:
    """The no-scaling strategy preserves values, labels, and feature ordering."""
    source = _split()

    result = ScalerDatasetPreprocessor().preprocess(
        source,
        PreprocessingConfig(),
    )

    assert result.train.records == source.train.records
    assert result.validation.records == source.validation.records
    assert result.test.records == source.test.records
    assert result.metadata.scaler_parameters == {}


def test_missing_raise_reports_row_and_feature() -> None:
    """The strict missing policy fails with precise record and column context."""
    split = _split(
        train=_dataset(((0.0, None), (2.0, 2.0)), name="train"),
    )

    with pytest.raises(
        MLPreprocessingError,
        match=r"row 1, column 'y'",
    ):
        ScalerDatasetPreprocessor().preprocess(
            split,
            PreprocessingConfig(missing_value_strategy="raise"),
        )


def test_missing_constant_imputes_all_partitions_before_scaling() -> None:
    """Configured constants replace null feature values before the scaler fit."""
    split = _split(
        train=_dataset(((None, 0.0), (2.0, 2.0)), name="train"),
        validation=_dataset(((None, 1.0),), name="validation"),
        test=_dataset(((4.0, None),), name="test"),
    )

    result = ScalerDatasetPreprocessor().preprocess(
        split,
        PreprocessingConfig(
            missing_value_strategy="constant",
            missing_value_constant=-1.0,
            scaling_strategy="none",
        ),
    )

    assert result.train.records[0].values == (-1.0, 0.0)
    assert result.validation.records[0].values == (-1.0, 1.0)
    assert result.test.records[0].values == (4.0, -1.0)
    assert result.metadata.missing_value_constant == -1.0


def test_leave_policy_preserves_missing_values_with_or_without_scaling() -> None:
    """Unfilled nulls remain null while supported scalers ignore them in fitting."""
    split = _split(
        train=_dataset(((None, 0.0), (2.0, 2.0)), name="train"),
        validation=_dataset(((None, 1.0),), name="validation"),
    )

    result = ScalerDatasetPreprocessor().preprocess(
        split,
        PreprocessingConfig(
            missing_value_strategy="leave",
            scaling_strategy="standard",
        ),
    )

    assert result.train.records[0].values[0] is None
    assert result.validation.records[0].values[0] is None
    assert result.train.records[0].values[1] == pytest.approx(-1.0)


def test_inconsistent_feature_or_target_schema_is_rejected() -> None:
    """Every split must have the same ordered feature and target schema."""
    split = _split(
        validation=_dataset(
            ((10.0, 10.0),),
            name="validation",
            features=("y", "x"),
        ),
    )

    with pytest.raises(MLPreprocessingError, match="schema mismatch"):
        ScalerDatasetPreprocessor().preprocess(split, PreprocessingConfig())

    mismatched_target = MLDataset(
        feature_names=split.train.feature_names,
        records=_dataset(((10.0, 10.0),), name="validation").records,
        label_name="other_target",
    )
    with pytest.raises(MLPreprocessingError, match="Target column mismatch"):
        ScalerDatasetPreprocessor().preprocess(
            _split(validation=mismatched_target),
            PreprocessingConfig(),
        )


def test_categorical_values_and_invalid_config_raise_typed_errors() -> None:
    """Non-numeric input and unsupported strategies fail as typed errors."""
    categorical = MLDataset(
        feature_names=("category",),
        records=(MLRecord("row-1", ("value",), "label"),),
        label_name="target",
    )
    single_feature_split = _split(
        train=categorical,
        validation=categorical,
        test=categorical,
    )
    with pytest.raises(MLPreprocessingError, match="Non-numeric"):
        ScalerDatasetPreprocessor().preprocess(
            single_feature_split,
            PreprocessingConfig(),
        )

    with pytest.raises(MLPreprocessingError, match="Unsupported scaling"):
        PreprocessingConfig(scaling_strategy="unknown")  # type: ignore[arg-type]
    with pytest.raises(MLPreprocessingError, match="finite number"):
        PreprocessingConfig(missing_value_constant=math.inf)


def test_pipeline_exposes_configurable_preprocessing() -> None:
    """The ML pipeline delegates configured preprocessing to its stage."""
    result = PreprocessingOnlyPipeline().preprocess(
        _split(),
        PreprocessingConfig(scaling_strategy="min_max"),
    )

    assert result.metadata.scaling_strategy == "min_max"
    assert result.train.feature_names == ("x", "y")
    assert [row.label for row in result.train.records] == ["label-0", "label-1"]
    assert result.x_train == ((0.0, 0.0), (1.0, 1.0))
    assert result.y_train == ("label-0", "label-1")


def test_empty_partition_and_wrong_record_width_are_rejected() -> None:
    """Malformed inputs produce preprocessing errors instead of scaler failures."""
    empty_training = _dataset((), name="train")
    with pytest.raises(MLPreprocessingError, match="empty partition"):
        ScalerDatasetPreprocessor().preprocess(
            _split(train=empty_training),
            PreprocessingConfig(),
        )

    malformed = MLDataset(
        feature_names=("x", "y"),
        records=(MLRecord("row-1", (1.0,), "label"),),
        label_name="target",
    )
    with pytest.raises(MLPreprocessingError, match="expected 2"):
        ScalerDatasetPreprocessor().preprocess(
            _split(train=malformed, validation=malformed, test=malformed),
            PreprocessingConfig(),
        )
