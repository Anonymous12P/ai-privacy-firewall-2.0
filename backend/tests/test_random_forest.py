"""Tests for the random-forest baseline, evaluation, and persistence."""

import hashlib
import json
from collections.abc import Mapping
from pathlib import Path
from typing import cast

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
    RandomForestConfig,
    RandomForestModel,
)
from app.models.exceptions import (
    ModelEvaluationError,
    ModelPersistenceError,
    ModelTrainingError,
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


def _prepared() -> PreprocessedSplitResult:
    """Build deterministic train, validation, and test partitions."""
    train = _dataset(
        (
            (0.0, 0.0),
            (0.1, 0.2),
            (0.2, 0.1),
            (0.3, 0.2),
            (1.0, 1.0),
            (1.1, 0.9),
            (0.9, 1.1),
            (1.2, 1.0),
            (0.05, 0.25),
            (1.05, 0.85),
            (0.15, 0.05),
            (0.95, 1.15),
        ),
        ("normal",) * 6 + ("alert",) * 6,
        name="train",
    )
    validation = _dataset(
        ((0.15, 0.15), (0.25, 0.1), (0.95, 1.0), (1.15, 0.95)),
        ("normal", "normal", "alert", "alert"),
        name="validation",
    )
    test = _dataset(
        ((0.05, 0.1), (0.35, 0.25), (1.05, 1.05), (0.85, 0.95)),
        ("normal", "normal", "alert", "alert"),
        name="test",
    )
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
    """Create a typed random-forest request with optional parameters."""
    return ModelTrainingRequest(
        dataset=prepared,
        config=ModelTrainingConfig(
            model=ModelConfig(name="RandomForest", hyperparameters=parameters),
            random_seed=37,
            target_column="label",
            artifact_path=artifact,
        ),
    )


def _fitted_model(*, oob_score: bool = False) -> RandomForestModel:
    """Fit a compact seeded forest against the training partition."""
    model = RandomForestModel(
        RandomForestConfig(n_estimators=25, random_state=23, oob_score=oob_score)
    )
    model.fit(
        _prepared().train,
        ModelTrainingConfig(model=ModelConfig(name="RandomForest"), random_seed=23),
    )
    return model


def test_random_forest_fit_prediction_and_path_operations() -> None:
    """Fit returns ordered class outputs and per-tree path information."""
    prepared = _prepared()
    model = _fitted_model()

    prediction = model.predict(prepared.test)
    probabilities = model.predict_proba(prepared.test)
    log_probabilities = model.predict_log_proba(prepared.test)
    leaves = model.apply(prepared.test)
    paths = model.decision_path(prepared.test)

    assert prediction.model_name == "RandomForest"
    assert prediction.subject_ids == tuple(
        record.subject_id for record in prepared.test.records
    )
    assert len(probabilities) == len(prepared.test.records)
    assert all(sum(row) == pytest.approx(1.0) for row in probabilities)
    assert len(log_probabilities) == len(prepared.test.records)
    assert all(len(row) == 2 for row in log_probabilities)
    assert all(len(row) == model.config.n_estimators for row in leaves)
    assert len(paths) == len(prepared.test.records)
    assert all(path for path in paths)
    assert model.feature_names == prepared.train.feature_names
    assert model.classes == ("alert", "normal")


def test_feature_importances_and_ensemble_statistics() -> None:
    """Forest metadata is paired with feature names and reports tree stats."""
    model = _fitted_model()

    assert tuple(name for name, _ in model.feature_importances) == ("score", "events")
    assert sum(value for _, value in model.feature_importances) == pytest.approx(1.0)
    statistics = model.ensemble_statistics
    assert statistics["tree_count"] == 25
    assert statistics["mean_tree_depth"] is not None
    assert statistics["total_node_count"] is not None
    assert model.out_of_bag_score is None


def test_oob_score_is_available_only_when_configured() -> None:
    """Bootstrap OOB evaluation is computed and returned for fitted forests."""
    model = _fitted_model(oob_score=True)

    assert model.out_of_bag_score is not None
    assert 0.0 <= model.out_of_bag_score <= 1.0
    metrics = ClassificationEvaluator().evaluate_classification(
        model,
        _prepared().validation,
    )
    assert metrics.oob_score == model.out_of_bag_score
    assert (
        ClassificationEvaluator()
        .evaluate(model, _prepared().validation)
        .metrics["oob_score"]
        == model.out_of_bag_score
    )


def test_factory_constructs_configured_random_forest() -> None:
    """Factory validates and applies supported forest options."""
    model = ModelFactory().create(
        ModelConfig(
            name="RandomForest",
            hyperparameters={
                "n_estimators": 12,
                "criterion": "entropy",
                "max_depth": 4,
                "min_samples_split": 3,
                "min_samples_leaf": 2,
                "max_features": "log2",
                "bootstrap": True,
                "oob_score": True,
                "class_weight": "balanced_subsample",
                "random_state": 13,
                "n_jobs": 1,
            },
        )
    )

    assert isinstance(model, RandomForestModel)
    assert model.config.n_estimators == 12
    assert model.config.criterion == "entropy"
    assert model.config.max_features == "log2"
    assert model.config.oob_score
    assert model.config.n_jobs == 1


@pytest.mark.parametrize(
    "parameters",
    (
        {"n_estimators": 0},
        {"n_estimators": True},
        {"criterion": "bad"},
        {"max_depth": 0},
        {"min_samples_split": 1},
        {"min_samples_leaf": 0.6},
        {"max_features": 0.0},
        {"bootstrap": 1},
        {"oob_score": True, "bootstrap": False},
        {"class_weight": "invalid"},
        {"class_weight": {"alert": float("nan")}},
        {"random_state": True},
        {"n_jobs": 0},
        {"unknown": 1},
    ),
)
def test_invalid_random_forest_parameters_raise_typed_errors(
    parameters: dict[str, object],
) -> None:
    """Invalid forest settings fail explicitly through ModelTrainingError."""
    with pytest.raises(ModelTrainingError):
        ModelFactory().create(
            ModelConfig(name="RandomForest", hyperparameters=parameters)
        )


def test_unfitted_prediction_and_invalid_training_data_fail() -> None:
    """Forest methods reject unfitted models and malformed training inputs."""
    model = RandomForestModel()
    with pytest.raises(ModelTrainingError, match="has not been fitted"):
        model.predict(_prepared().test)

    one_class = _dataset(
        ((0.0, 0.0), (0.1, 0.1)),
        ("normal", "normal"),
        name="single-class",
    )
    with pytest.raises(ModelTrainingError, match="at least two classes"):
        model.fit(
            one_class,
            ModelTrainingConfig(model=ModelConfig(name="RandomForest")),
        )

    missing_label = _dataset(
        ((0.0, 0.0), (1.0, 1.0)),
        ("normal", None),
        name="missing-label",
    )
    with pytest.raises(ModelTrainingError, match="Target label is missing"):
        model.fit(
            missing_label,
            ModelTrainingConfig(model=ModelConfig(name="RandomForest")),
        )


def test_evaluator_reuses_classification_metrics() -> None:
    """Shared evaluation reports all requested metrics for a forest."""
    model = _fitted_model()
    result = ClassificationEvaluator().evaluate_classification(
        model,
        _prepared().validation,
    )

    assert result.model_name == "RandomForest"
    assert result.evaluated_row_count == 4
    assert result.accuracy == 0.75
    assert result.confusion_matrix == ((1, 1), (0, 2))
    assert result.classification_report
    assert result.log_loss >= 0.0
    assert result.oob_score is None


def test_pipeline_persistence_metadata_and_reload(tmp_path: Path) -> None:
    """Pipeline persists RF metrics, configuration, statistics, and model hash."""
    prepared = _prepared()
    result = ModelPipeline().train_random_forest(
        _request(
            prepared,
            tmp_path / "forest.joblib",
            n_estimators=15,
            oob_score=True,
        )
    )

    assert result.training.artifact_path == tmp_path / "forest.joblib"
    assert result.artifact_metadata is not None
    assert result.artifact_metadata.model_name == "RandomForest"
    assert result.artifact_metadata.feature_names == ("score", "events")
    details = cast(
        "Mapping[str, object]",
        result.artifact_metadata.model_details,
    )
    assert details["oob_score"] is not None
    statistics = cast("Mapping[str, object]", details["ensemble_statistics"])
    assert statistics["tree_count"] == 15
    importances = cast("Mapping[str, float]", details["feature_importances"])
    assert tuple(importances) == ("score", "events")
    assert result.validation_metrics is not None
    assert result.validation_metrics.oob_score == details["oob_score"]
    assert result.test_metrics is not None
    assert result.test_metrics.oob_score == details["oob_score"]
    assert result.metadata_path is not None
    artifact = result.training.artifact_path
    assert artifact is not None

    sidecar = json.loads(result.metadata_path.read_text(encoding="utf-8"))
    assert sidecar["sha256"] == hashlib.sha256(artifact.read_bytes()).hexdigest()
    assert sidecar["model_details"]["oob_score"] == details["oob_score"]
    assert sidecar["configuration"]["hyperparameters"]["n_estimators"] == 15
    restored = JoblibModelPersistence().load(artifact)
    assert isinstance(restored, RandomForestModel)
    trained = result.training.trained_model
    assert isinstance(trained, RandomForestModel)
    assert restored.predict(prepared.test) == trained.predict(prepared.test)


def test_pipeline_run_and_reproducibility(tmp_path: Path) -> None:
    """Pipeline dispatches seeded RF runs and preserves metric results."""
    prepared = _prepared()
    request = ModelTrainingRequest(
        dataset=prepared,
        config=ModelTrainingConfig(
            model=ModelConfig(
                name="RandomForest",
                hyperparameters={"n_estimators": 20, "n_jobs": 1},
            ),
            random_seed=31,
        ),
    )
    pipeline = ModelPipeline(artifact_directory=tmp_path)

    first = pipeline.run(request)
    second = pipeline.train_random_forest(request)

    assert first.validation_metrics == second.validation_metrics
    assert first.test_metrics == second.test_metrics
    assert first.artifact_metadata is not None
    assert second.artifact_metadata is not None
    assert first.artifact_metadata.sha256 == second.artifact_metadata.sha256


def test_pipeline_rejects_mismatched_target() -> None:
    """Pipeline enforces one shared target column across all data partitions."""
    request = _request(_prepared(), Path("model.joblib"))
    invalid = ModelTrainingRequest(
        dataset=request.dataset,
        config=ModelTrainingConfig(
            model=ModelConfig(name="RandomForest"),
            target_column="different",
        ),
    )
    with pytest.raises(ModelTrainingError, match="share a target column"):
        ModelPipeline().train_random_forest(invalid)


def test_persistence_detects_tampering(tmp_path: Path) -> None:
    """A changed forest artifact cannot load against stale SHA metadata."""
    result = ModelPipeline().train_random_forest(
        _request(_prepared(), tmp_path / "tamper.joblib", n_estimators=5)
    )
    assert result.training.artifact_path is not None
    result.training.artifact_path.write_bytes(b"tampered")
    with pytest.raises(ModelPersistenceError, match="hash mismatch"):
        JoblibModelPersistence().load(result.training.artifact_path)


def test_evaluator_rejects_unsupported_model() -> None:
    """The classifier evaluator protects its supported model boundary."""
    with pytest.raises(ModelEvaluationError, match="supports"):
        ClassificationEvaluator().evaluate_classification(
            cast("Model", object()),
            _prepared().validation,
        )
