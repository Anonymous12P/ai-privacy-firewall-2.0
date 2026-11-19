"""Tests for the logistic-regression baseline, evaluation, and persistence."""

import hashlib
import json
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
    LogisticRegressionConfig,
    LogisticRegressionModel,
    ModelConfig,
    ModelFactory,
    ModelNotImplementedError,
    ModelPipeline,
    ModelTrainingConfig,
    ModelTrainingRequest,
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


def _prepared(*, target: bool = True) -> PreprocessedSplitResult:
    """Build deterministic train, validation, and test partitions."""
    label_name = "label" if target else None
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
        ),
        ("normal",) * 4 + ("alert",) * 4,
        name="train",
        label_name=label_name,
    )
    validation = _dataset(
        ((0.15, 0.15), (0.25, 0.1), (0.95, 1.0), (1.15, 0.95)),
        ("normal", "normal", "alert", "alert"),
        name="validation",
        label_name=label_name,
    )
    test = _dataset(
        ((0.05, 0.1), (0.35, 0.25), (1.05, 1.05), (0.85, 0.95)),
        ("normal", "normal", "alert", "alert"),
        name="test",
        label_name=label_name,
    )
    return PreprocessedSplitResult(
        train=train,
        validation=validation,
        test=test,
        metadata=PreprocessingMetadata(
            feature_names=train.feature_names,
            strategy="standard",
            fitted=True,
            scaling_strategy="standard",
            feature_count=len(train.feature_names),
            target_column=label_name,
        ),
    )


def _request(
    prepared: PreprocessedSplitResult,
    artifact: Path,
    **parameters: object,
) -> ModelTrainingRequest:
    """Create a typed logistic-regression request with optional parameters."""
    return ModelTrainingRequest(
        dataset=prepared,
        config=ModelTrainingConfig(
            model=ModelConfig(
                name="LogisticRegression",
                hyperparameters=parameters,
            ),
            random_seed=37,
            target_column="label",
            artifact_path=artifact,
        ),
    )


def test_logistic_regression_fit_prediction_probabilities_and_scores() -> None:
    """The estimator fits and returns ordered predictions and numeric scores."""
    prepared = _prepared()
    model = LogisticRegressionModel(
        LogisticRegressionConfig(
            random_state=19,
            max_iter=500,
            penalty="l2",
            solver="lbfgs",
            C=2.0,
            class_weight="balanced",
        )
    )
    training_config = ModelTrainingConfig(
        model=ModelConfig(name="LogisticRegression"),
        random_seed=19,
        target_column="label",
    )

    model.fit(prepared.train, training_config)
    prediction = model.predict(prepared.test)
    probabilities = model.predict_proba(prepared.test)
    decision_scores = model.decision_function(prepared.test)

    assert prediction.subject_ids == tuple(
        record.subject_id for record in prepared.test.records
    )
    assert prediction.predictions == tuple(
        record.label for record in prepared.test.records
    )
    assert len(probabilities) == len(prepared.test.records)
    assert all(sum(row) == pytest.approx(1.0) for row in probabilities)
    assert len(decision_scores) == len(prepared.test.records)
    assert model.feature_names == prepared.train.feature_names
    assert model.classes == ("alert", "normal")


def test_supported_parameter_combinations_and_multiclass_ovr() -> None:
    """The multi_class compatibility setting configures multi-class OVR."""
    data = _dataset(
        (
            (0.0, 0.0),
            (0.1, 0.2),
            (1.0, 0.0),
            (1.1, 0.2),
            (0.5, 1.0),
            (0.6, 1.1),
        ),
        ("a", "a", "b", "b", "c", "c"),
        name="multiclass",
    )
    model = LogisticRegressionModel(
        LogisticRegressionConfig(
            solver="liblinear",
            multi_class="ovr",
            max_iter=500,
        )
    )
    config = ModelTrainingConfig(
        model=ModelConfig(name="LogisticRegression"),
        random_seed=7,
    )

    model.fit(data, config)

    assert len(model.classes) == 3
    assert len(model.predict_proba(data)) == len(data.records)


def test_factory_constructs_configured_logistic_regression() -> None:
    """Factory wiring consumes typed supported estimator parameters."""
    model = ModelFactory().create(
        ModelConfig(
            name="LogisticRegression",
            hyperparameters={
                "max_iter": 234,
                "solver": "liblinear",
                "C": 0.5,
                "multi_class": "ovr",
            },
        )
    )

    assert isinstance(model, LogisticRegressionModel)
    assert model.config.max_iter == 234
    assert model.config.solver == "liblinear"

    with pytest.raises(ModelNotImplementedError):
        ModelFactory().create(ModelConfig(name="CatBoost"))


@pytest.mark.parametrize(
    "config",
    (
        {"C": 0.0},
        {"C": float("inf")},
        {"max_iter": 0},
        {"random_state": True},
        {"unknown_parameter": 1},
    ),
)
def test_invalid_training_parameters_fail_with_typed_error(
    config: dict[str, object],
) -> None:
    """Invalid estimator configuration fails explicitly before model execution."""
    if "unknown_parameter" in config:
        with pytest.raises(ModelTrainingError, match="Unsupported"):
            ModelFactory().create(
                ModelConfig(
                    name="LogisticRegression",
                    hyperparameters=config,
                )
            )
        return
    with pytest.raises(ModelTrainingError):
        LogisticRegressionConfig(**config)  # type: ignore[arg-type]


def test_invalid_feature_values_labels_and_unfitted_prediction_fail() -> None:
    """Missing targets, nonnumeric cells, and unfitted use raise typed errors."""
    model = LogisticRegressionModel()
    with pytest.raises(ModelTrainingError, match="not been fitted"):
        model.predict(_prepared().test)

    training_config = ModelTrainingConfig(model=ModelConfig(name="LogisticRegression"))
    invalid_numeric = _dataset(
        ((None, 1.0), (1.0, 0.0)),
        ("normal", "alert"),
        name="missing",
    )
    with pytest.raises(ModelTrainingError, match="finite and numeric"):
        model.fit(invalid_numeric, training_config)

    missing_target = _dataset(
        ((0.0, 0.0), (1.0, 1.0)),
        ("normal", None),
        name="missing-target",
    )
    with pytest.raises(ModelTrainingError, match="Target label is missing"):
        model.fit(missing_target, training_config)

    single_class = _dataset(
        ((0.0, 0.0), (0.1, 0.1)),
        ("normal", "normal"),
        name="one-class",
    )
    with pytest.raises(ModelTrainingError, match="at least two classes"):
        model.fit(single_class, training_config)


def test_prediction_rejects_different_feature_order() -> None:
    """Prediction validates the exact feature names and order learned at fit."""
    prepared = _prepared()
    model = LogisticRegressionModel()
    model.fit(
        prepared.train,
        ModelTrainingConfig(model=ModelConfig(name="LogisticRegression")),
    )
    reordered = _dataset(
        tuple(
            (cast("float", record.values[1]), cast("float", record.values[0]))
            for record in prepared.test.records
        ),
        tuple(record.label for record in prepared.test.records),
        name="reordered",
        features=("events", "score"),
    )

    with pytest.raises(ModelTrainingError, match="feature names and order"):
        model.predict(reordered)


def test_evaluator_computes_requested_validation_metrics() -> None:
    """Validation evaluation includes all classification measures and reports."""
    prepared = _prepared()
    model = LogisticRegressionModel()
    model.fit(
        prepared.train,
        ModelTrainingConfig(model=ModelConfig(name="LogisticRegression")),
    )

    result = ClassificationEvaluator().evaluate_classification(
        model,
        prepared.validation,
    )

    assert result.accuracy == 1.0
    assert result.precision == 1.0
    assert result.recall == 1.0
    assert result.f1_score == 1.0
    assert result.roc_auc == 1.0
    assert result.pr_auc == 1.0
    assert result.confusion_matrix == ((2, 0), (0, 2))
    assert "alert" in result.classification_report
    assert "normal" in result.classification_report
    assert result.log_loss >= 0.0
    assert result.evaluated_row_count == 4


def test_evaluator_rejects_missing_labels_or_schema() -> None:
    """Metrics require labeled data with the model's exact feature schema."""
    prepared = _prepared()
    model = LogisticRegressionModel()
    model.fit(
        prepared.train,
        ModelTrainingConfig(model=ModelConfig(name="LogisticRegression")),
    )
    unlabeled = _dataset(
        ((0.2, 0.2),),
        (None,),
        name="unlabeled",
    )
    with pytest.raises(ModelEvaluationError, match="missing labels"):
        ClassificationEvaluator().evaluate_classification(model, unlabeled)

    wrong_schema = _dataset(
        ((0.2, 0.2),),
        ("normal",),
        name="wrong-schema",
        features=("other", "column"),
    )
    with pytest.raises(ModelEvaluationError, match="feature schema"):
        ClassificationEvaluator().evaluate_classification(model, wrong_schema)


def test_joblib_persistence_hash_metadata_and_reload(tmp_path: Path) -> None:
    """Persisted model is hash-verified and preserves prediction behavior."""
    prepared = _prepared()
    request = _request(prepared, tmp_path / "baseline.joblib")

    result = ModelPipeline().train_logistic_regression(request)

    assert result.training.artifact_path == tmp_path / "baseline.joblib"
    assert result.metadata_path == tmp_path / "baseline.joblib.metadata.json"
    assert result.artifact_metadata is not None
    assert result.artifact_metadata.feature_count == 2
    assert result.artifact_metadata.feature_names == ("score", "events")
    assert result.artifact_metadata.target_classes == ("alert", "normal")
    assert len(result.artifact_metadata.sha256) == 64
    assert result.validation_metrics is not None
    assert result.test_metrics is not None

    model_path = result.training.artifact_path
    assert model_path is not None
    assert result.metadata_path is not None
    sidecar = json.loads(result.metadata_path.read_text(encoding="utf-8"))
    assert sidecar["sha256"] == hashlib.sha256(model_path.read_bytes()).hexdigest()
    for metric_name in (
        "accuracy",
        "precision",
        "recall",
        "f1_score",
        "roc_auc",
        "pr_auc",
        "confusion_matrix",
        "classification_report",
        "log_loss",
    ):
        assert metric_name in sidecar["validation_metrics"]
        assert metric_name in sidecar["test_metrics"]

    restored = JoblibModelPersistence().load(model_path)
    assert isinstance(restored, LogisticRegressionModel)
    trained_model = result.training.trained_model
    assert isinstance(trained_model, LogisticRegressionModel)
    assert restored.predict(prepared.test) == trained_model.predict(prepared.test)


def test_joblib_persistence_detects_tampering(tmp_path: Path) -> None:
    """A changed model artifact cannot be reloaded against stale metadata."""
    result = ModelPipeline().train_logistic_regression(
        _request(_prepared(), tmp_path / "model.joblib")
    )
    assert result.training.artifact_path is not None
    result.training.artifact_path.write_bytes(b"tampered")

    with pytest.raises(ModelPersistenceError, match="hash mismatch"):
        JoblibModelPersistence().load(result.training.artifact_path)


def test_pipeline_integration_and_reproducibility(tmp_path: Path) -> None:
    """Public train API evaluates both holdouts and repeats seeded outcomes."""
    prepared = _prepared()
    pipeline = ModelPipeline(artifact_directory=tmp_path)
    config = ModelTrainingConfig(
        model=ModelConfig(name="LogisticRegression"),
        random_seed=12,
    )
    request = ModelTrainingRequest(dataset=prepared, config=config)

    first = pipeline.run(request)
    second = pipeline.train_logistic_regression(request)

    assert first.training.metadata.random_seed == 12
    assert first.validation_metrics == second.validation_metrics
    assert first.test_metrics == second.test_metrics
    assert first.artifact_metadata is not None
    assert second.artifact_metadata is not None
    assert first.artifact_metadata.sha256 == second.artifact_metadata.sha256


def test_pipeline_rejects_wrong_model_and_target_schema(tmp_path: Path) -> None:
    """Pipeline checks model selection and target contracts before training."""
    prepared = _prepared()
    wrong_model = ModelTrainingRequest(
        dataset=prepared,
        config=ModelTrainingConfig(
            model=ModelConfig(name="CatBoost"),
        ),
    )
    with pytest.raises(ModelTrainingError, match="requires model name"):
        ModelPipeline(artifact_directory=tmp_path).run(wrong_model)

    no_target = _prepared(target=False)
    invalid_target = ModelTrainingRequest(
        dataset=no_target,
        config=ModelTrainingConfig(
            model=ModelConfig(name="LogisticRegression"),
            target_column=None,
        ),
    )
    with pytest.raises(ModelTrainingError, match="target column"):
        ModelPipeline(artifact_directory=tmp_path).run(invalid_target)
