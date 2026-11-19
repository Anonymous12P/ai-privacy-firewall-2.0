"""Tests for optional XGBoost classification, evaluation, and persistence."""

import hashlib
import importlib.util
import json
import warnings
from collections.abc import Mapping
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from typing import cast

import numpy as np
import pytest

from app.ml.schemas import (
    DatasetMetadata,
    MLDataset,
    MLLabel,
    MLRecord,
    PreprocessedSplitResult,
    PreprocessingMetadata,
)
from app.models import (
    ClassificationEvaluator,
    JoblibModelPersistence,
    Model,
    ModelConfig,
    ModelFactory,
    ModelPipeline,
    ModelTrainingConfig,
    ModelTrainingRequest,
    XGBoostConfig,
    XGBoostModel,
)
from app.models import xgboost_model as xgboost_module
from app.models.exceptions import (
    ModelDependencyError,
    ModelEvaluationError,
    ModelPersistenceError,
    ModelTrainingError,
)

_XGBOOST_AVAILABLE = importlib.util.find_spec("xgboost") is not None
try:
    _XGBOOST_VERSION = version("xgboost")
except PackageNotFoundError:
    _XGBOOST_VERSION = ""
_requires_xgboost = pytest.mark.skipif(
    not _XGBOOST_AVAILABLE,
    reason="Install the optional backend extra: pip install -e '.[xgboost]'",
)


def _dataset(
    values: tuple[tuple[float | None, ...], ...],
    labels: tuple[MLLabel | None, ...],
    *,
    name: str,
    features: tuple[str, ...] = ("score", "events"),
    label_name: str | None = "label",
) -> MLDataset:
    """Create a typed numeric dataset with row-ordered target labels."""
    records = tuple(
        MLRecord(
            subject_id=f"{name}-{index:03d}",
            values=row,
            label=labels[index],
        )
        for index, row in enumerate(values)
    )
    return MLDataset(
        feature_names=features,
        records=records,
        label_name=label_name,
        metadata=DatasetMetadata(
            row_count=len(records),
            column_count=len(features) + int(label_name is not None),
            column_names=(*features, *((label_name,) if label_name else ())),
            feature_names=features,
        ),
    )


def _binary_splits() -> PreprocessedSplitResult:
    """Create stable binary training, validation, and test partitions."""
    train_values = tuple(
        (float(index % 3) / 10, float(index % 2) / 10)
        if index < 20
        else (1.0 + float(index % 3) / 10, 1.0 + float(index % 2) / 10)
        for index in range(40)
    )
    train_labels: tuple[MLLabel, ...] = ("normal",) * 20 + ("alert",) * 20
    train = _dataset(train_values, train_labels, name="train")
    validation = _dataset(
        ((0.1, 0.1), (0.2, 0.0), (1.1, 1.1), (1.2, 1.0)),
        ("normal", "normal", "alert", "alert"),
        name="validation",
    )
    test = _dataset(
        ((0.0, 0.1), (0.2, 0.1), (1.0, 1.0), (1.2, 1.1)),
        ("normal", "normal", "alert", "alert"),
        name="test",
    )
    return _splits(train, validation, test)


def _multiclass_data() -> MLDataset:
    """Create three separable classes for automatic soft-probability objective."""
    values = tuple(
        (float(index // 20) * 2.0 + float(index % 20) / 100, float(index % 4) / 10)
        for index in range(60)
    )
    labels: tuple[MLLabel, ...] = tuple(
        ("amber", "blue", "green")[index // 20] for index in range(60)
    )
    return _dataset(values, labels, name="multiclass")


def _splits(
    train: MLDataset,
    validation: MLDataset,
    test: MLDataset,
) -> PreprocessedSplitResult:
    """Wrap three partitions with matching preprocessing metadata."""
    return PreprocessedSplitResult(
        train=train,
        validation=validation,
        test=test,
        metadata=PreprocessingMetadata(
            feature_names=train.feature_names,
            strategy="none",
            fitted=True,
            scaling_strategy="none",
            feature_count=len(train.feature_names),
            target_column="label",
        ),
    )


def _request(
    prepared: PreprocessedSplitResult,
    artifact: Path,
    **parameters: object,
) -> ModelTrainingRequest:
    """Create a typed XGBoost request with compact test settings."""
    return ModelTrainingRequest(
        dataset=prepared,
        config=ModelTrainingConfig(
            model=ModelConfig(
                name="XGBoost",
                hyperparameters={
                    "n_estimators": 8,
                    "max_depth": 2,
                    "n_jobs": 1,
                    **parameters,
                },
            ),
            random_seed=37,
            target_column="label",
            artifact_path=artifact,
        ),
    )


@_requires_xgboost
def test_binary_training_prediction_and_automatic_objective() -> None:
    """Binary labels train using logistic objective and decode to source labels."""
    prepared = _binary_splits()
    model = XGBoostModel(XGBoostConfig(n_estimators=8, max_depth=2, n_jobs=1))
    model.fit(
        prepared.train,
        ModelTrainingConfig(model=ModelConfig(name="XGBoost"), random_seed=37),
    )

    prediction = model.predict(prepared.test)
    probabilities = model.predict_proba(prepared.test)
    leaves = model.apply(prepared.test)

    assert model.objective == "binary:logistic"
    assert model.classes == ("alert", "normal")
    assert prediction.predictions == tuple(row.label for row in prepared.test.records)
    assert prediction.subject_ids == tuple(
        row.subject_id for row in prepared.test.records
    )
    assert all(sum(row) == pytest.approx(1.0) for row in probabilities)
    assert len(leaves) == len(prepared.test.records)
    assert all(len(row) == 8 for row in leaves)


@_requires_xgboost
def test_multiclass_training_uses_softprob_and_preserves_class_order() -> None:
    """Three-class training chooses a soft-probability objective automatically."""
    dataset = _multiclass_data()
    model = XGBoostModel(XGBoostConfig(n_estimators=5, max_depth=2, n_jobs=1))
    model.fit(
        dataset,
        ModelTrainingConfig(model=ModelConfig(name="XGBoost"), random_seed=11),
    )

    probabilities = model.predict_proba(dataset)
    predictions = model.predict(dataset)

    assert model.objective == "multi:softprob"
    assert model.classes == ("amber", "blue", "green")
    assert all(len(row) == 3 for row in probabilities)
    assert all(sum(row) == pytest.approx(1.0) for row in probabilities)
    assert predictions.predictions == tuple(row.label for row in dataset.records)


def test_explicit_objective_must_match_class_count() -> None:
    """Conflicting manually specified objectives fail before XGBoost import."""
    model = XGBoostModel(XGBoostConfig(objective="multi:softprob"))
    with pytest.raises(ModelTrainingError, match="does not match"):
        model.fit(
            _binary_splits().train,
            ModelTrainingConfig(model=ModelConfig(name="XGBoost")),
        )


def test_factory_constructs_configured_xgboost_model() -> None:
    """Factory validates and applies supported classifier settings."""
    model = ModelFactory().create(
        ModelConfig(
            name="XGBoost",
            hyperparameters={
                "n_estimators": 20,
                "learning_rate": 0.15,
                "max_depth": 4,
                "min_child_weight": 2.0,
                "subsample": 0.9,
                "colsample_bytree": 0.8,
                "gamma": 0.1,
                "reg_alpha": 0.2,
                "reg_lambda": 1.5,
                "objective": "binary:logistic",
                "eval_metric": "logloss",
                "random_state": 3,
                "n_jobs": 1,
            },
        )
    )

    assert isinstance(model, XGBoostModel)
    assert model.config.n_estimators == 20
    assert model.config.learning_rate == 0.15
    assert model.config.objective == "binary:logistic"
    assert model.config.eval_metric == "logloss"


@pytest.mark.parametrize(
    "parameters",
    (
        {"n_estimators": 0},
        {"n_estimators": True},
        {"learning_rate": 0},
        {"learning_rate": float("inf")},
        {"max_depth": 0},
        {"min_child_weight": -1},
        {"subsample": 0},
        {"subsample": 1.1},
        {"colsample_bytree": 0},
        {"gamma": -0.1},
        {"reg_alpha": float("nan")},
        {"reg_lambda": -1},
        {"objective": "multi:softmax"},
        {"eval_metric": ""},
        {"random_state": True},
        {"n_jobs": 0},
        {"unknown": 1},
    ),
)
def test_invalid_xgboost_parameters_raise_typed_errors(
    parameters: dict[str, object],
) -> None:
    """Invalid XGBoost settings fail explicitly with ModelTrainingError."""
    with pytest.raises(ModelTrainingError):
        ModelFactory().create(ModelConfig(name="XGBoost", hyperparameters=parameters))


@_requires_xgboost
def test_feature_importances_align_with_source_schema() -> None:
    """Importance output includes every original feature in stable order."""
    prepared = _binary_splits()
    model = XGBoostModel(XGBoostConfig(n_estimators=5, n_jobs=1))
    model.fit(
        prepared.train,
        ModelTrainingConfig(model=ModelConfig(name="XGBoost")),
    )

    assert tuple(name for name, _ in model.feature_importances) == (
        "score",
        "events",
    )
    assert all(np.isfinite(value) for _, value in model.feature_importances)


@_requires_xgboost
def test_evaluator_computes_all_classification_metrics() -> None:
    """Shared evaluation returns requested metrics for XGBoost predictions."""
    prepared = _binary_splits()
    model = XGBoostModel(XGBoostConfig(n_estimators=5, n_jobs=1))
    model.fit(
        prepared.train,
        ModelTrainingConfig(model=ModelConfig(name="XGBoost")),
    )

    with warnings.catch_warnings(record=True) as captured:
        warnings.simplefilter("always")
        metrics = ClassificationEvaluator().evaluate_classification(
            model,
            prepared.validation,
        )

    assert metrics.model_name == "XGBoost"
    assert metrics.evaluated_row_count == 4
    assert metrics.confusion_matrix == ((2, 0), (0, 2))
    assert metrics.classification_report
    assert metrics.log_loss >= 0
    assert metrics.oob_score is None
    assert not captured


@_requires_xgboost
def test_pipeline_persistence_metadata_reload_and_hash(tmp_path: Path) -> None:
    """Pipeline exports the fitted classifier and metadata with SHA-256."""
    prepared = _binary_splits()
    result = ModelPipeline().train_xgboost(
        _request(prepared, tmp_path / "xgboost.joblib")
    )

    assert result.training.artifact_path == tmp_path / "xgboost.joblib"
    assert result.artifact_metadata is not None
    assert result.artifact_metadata.model_name == "XGBoost"
    assert result.artifact_metadata.library_version == _XGBOOST_VERSION
    assert result.artifact_metadata.feature_names == ("score", "events")
    details = result.artifact_metadata.model_details
    assert details["xgboost_version"] == _XGBOOST_VERSION
    assert details["booster_type"] == "gbtree"
    assert details["objective"] == "binary:logistic"
    importances = cast("Mapping[str, float]", details["feature_importances"])
    assert tuple(importances) == ("score", "events")
    assert result.metadata_path is not None
    artifact = result.training.artifact_path
    assert artifact is not None
    sidecar = json.loads(result.metadata_path.read_text(encoding="utf-8"))
    assert sidecar["sha256"] == hashlib.sha256(artifact.read_bytes()).hexdigest()
    assert sidecar["library_version"] == _XGBOOST_VERSION
    assert "accuracy" in sidecar["validation_metrics"]
    assert "accuracy" in sidecar["test_metrics"]
    restored = JoblibModelPersistence().load(artifact)
    assert isinstance(restored, XGBoostModel)
    trained = result.training.trained_model
    assert isinstance(trained, XGBoostModel)
    assert restored.predict(prepared.test) == trained.predict(prepared.test)


@_requires_xgboost
def test_pipeline_dispatch_and_reproducibility(tmp_path: Path) -> None:
    """ModelPipeline.run dispatches XGBoost and produces seeded repeatable output."""
    prepared = _binary_splits()
    request = _request(
        prepared,
        tmp_path / "xgboost.joblib",
        n_estimators=10,
    )
    pipeline = ModelPipeline(artifact_directory=tmp_path)

    first = pipeline.run(request)
    second = pipeline.train_xgboost(request)

    assert first.validation_metrics == second.validation_metrics
    assert first.test_metrics == second.test_metrics
    assert first.artifact_metadata is not None
    assert second.artifact_metadata is not None
    assert first.artifact_metadata.sha256 == second.artifact_metadata.sha256


def test_dependency_error_includes_install_instructions(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Missing optional XGBoost produces a typed actionable dependency error."""

    def missing_module(name: str) -> object:
        """Simulate an environment without the optional XGBoost package."""
        raise ModuleNotFoundError(name)

    monkeypatch.setattr(xgboost_module.importlib, "import_module", missing_module)
    model = XGBoostModel()

    with pytest.raises(ModelDependencyError, match=r"\[xgboost\]"):
        model.fit(
            _binary_splits().train,
            ModelTrainingConfig(model=ModelConfig(name="XGBoost")),
        )


@_requires_xgboost
def test_persistence_detects_artifact_tampering(tmp_path: Path) -> None:
    """Changed model bytes cannot be loaded with a stale metadata digest."""
    result = ModelPipeline().train_xgboost(
        _request(_binary_splits(), tmp_path / "tamper.joblib")
    )
    assert result.training.artifact_path is not None
    result.training.artifact_path.write_bytes(b"tampered")
    with pytest.raises(ModelPersistenceError, match="hash mismatch"):
        JoblibModelPersistence().load(result.training.artifact_path)


def test_unfitted_prediction_and_invalid_labels_fail() -> None:
    """XGBoost rejects unfitted use and unsupported mixed primitive labels."""
    with pytest.raises(ModelTrainingError, match="has not been fitted"):
        XGBoostModel().predict(_binary_splits().test)

    mixed = _dataset(
        ((0.0, 0.0), (1.0, 1.0)),
        (0, "alert"),
        name="mixed-labels",
    )
    with pytest.raises(ModelTrainingError, match="one consistent primitive type"):
        XGBoostModel().fit(
            mixed,
            ModelTrainingConfig(model=ModelConfig(name="XGBoost")),
        )


def test_evaluator_rejects_unsupported_model() -> None:
    """The classification evaluator keeps a typed supported-model boundary."""
    with pytest.raises(ModelEvaluationError, match="supports"):
        ClassificationEvaluator().evaluate_classification(
            cast("Model", object()),
            _binary_splits().validation,
        )
