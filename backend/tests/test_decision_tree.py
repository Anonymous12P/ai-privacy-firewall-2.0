"""Tests for the decision-tree baseline, evaluation, and persistence."""

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
    DecisionTreeConfig,
    DecisionTreeModel,
    JoblibModelPersistence,
    Model,
    ModelConfig,
    ModelFactory,
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
        ),
        ("normal",) * 4 + ("alert",) * 4,
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
    """Create a typed decision-tree request with optional parameters."""
    return ModelTrainingRequest(
        dataset=prepared,
        config=ModelTrainingConfig(
            model=ModelConfig(name="DecisionTree", hyperparameters=parameters),
            random_seed=37,
            target_column="label",
            artifact_path=artifact,
        ),
    )


def test_decision_tree_fit_and_prediction_operations() -> None:
    """Fit returns ordered predictions, probabilities, paths, and leaf ids."""
    prepared = _prepared()
    model = DecisionTreeModel(DecisionTreeConfig(max_depth=3, random_state=19))
    model.fit(
        prepared.train,
        ModelTrainingConfig(model=ModelConfig(name="DecisionTree"), random_seed=19),
    )

    prediction = model.predict(prepared.test)
    probabilities = model.predict_proba(prepared.test)
    paths = model.decision_path(prepared.test)
    leaves = model.apply(prepared.test)

    assert prediction.subject_ids == tuple(
        record.subject_id for record in prepared.test.records
    )
    assert prediction.predictions == tuple(
        record.label for record in prepared.test.records
    )
    assert all(sum(row) == pytest.approx(1.0) for row in probabilities)
    assert len(paths) == len(prepared.test.records)
    assert all(path[-1] == leaf for path, leaf in zip(paths, leaves, strict=True))
    assert len(leaves) == len(prepared.test.records)
    assert model.feature_names == prepared.train.feature_names
    assert model.classes == ("alert", "normal")


def test_feature_importances_and_tree_statistics_are_named_and_valid() -> None:
    """Fitted tree details are deterministic and feature-order aligned."""
    prepared = _prepared()
    model = DecisionTreeModel()
    model.fit(
        prepared.train,
        ModelTrainingConfig(model=ModelConfig(name="DecisionTree")),
    )

    assert tuple(name for name, _ in model.feature_importances) == (
        "score",
        "events",
    )
    assert sum(value for _, value in model.feature_importances) == pytest.approx(1.0)
    assert model.tree_depth >= 1
    assert model.number_of_leaves >= 2
    assert model.number_of_nodes >= model.number_of_leaves


def test_factory_constructs_configured_decision_tree() -> None:
    """Factory wiring validates and applies supported tree options."""
    model = ModelFactory().create(
        ModelConfig(
            name="DecisionTree",
            hyperparameters={
                "criterion": "entropy",
                "max_depth": 4,
                "min_samples_split": 3,
                "min_samples_leaf": 2,
                "max_features": "sqrt",
                "class_weight": "balanced",
                "random_state": 13,
                "ccp_alpha": 0.01,
            },
        )
    )

    assert isinstance(model, DecisionTreeModel)
    assert model.config.criterion == "entropy"
    assert model.config.max_depth == 4
    assert model.config.min_samples_leaf == 2


@pytest.mark.parametrize(
    "parameters",
    (
        {"criterion": "unknown"},
        {"max_depth": 0},
        {"min_samples_split": 1},
        {"min_samples_leaf": 0},
        {"min_samples_leaf": 0.6},
        {"max_features": 0.0},
        {"max_features": True},
        {"class_weight": "balanced_subsample"},
        {"class_weight": {"normal": float("nan")}},
        {"random_state": True},
        {"ccp_alpha": -0.1},
        {"ccp_alpha": float("nan")},
        {"unknown_parameter": 1},
    ),
)
def test_invalid_tree_parameters_raise_typed_errors(
    parameters: dict[str, object],
) -> None:
    """Invalid estimator settings are rejected with ModelTrainingError."""
    with pytest.raises(ModelTrainingError):
        ModelFactory().create(
            ModelConfig(name="DecisionTree", hyperparameters=parameters)
        )


def test_invalid_training_data_and_unfitted_operations_fail() -> None:
    """Missing labels, one-class data, and unfitted use produce typed errors."""
    model = DecisionTreeModel()
    with pytest.raises(ModelTrainingError, match="has not been fitted"):
        model.predict(_prepared().test)

    config = ModelTrainingConfig(model=ModelConfig(name="DecisionTree"))
    single_class = _dataset(
        ((0.0, 0.0), (0.1, 0.1)),
        ("normal", "normal"),
        name="single-class",
    )
    with pytest.raises(ModelTrainingError, match="at least two classes"):
        model.fit(single_class, config)

    missing_label = _dataset(
        ((0.0, 0.0), (1.0, 1.0)),
        ("normal", None),
        name="missing-label",
    )
    with pytest.raises(ModelTrainingError, match="Target label is missing"):
        model.fit(missing_label, config)


def test_prediction_rejects_reordered_features() -> None:
    """Tree inference requires the exact feature names and order."""
    prepared = _prepared()
    model = DecisionTreeModel()
    model.fit(
        prepared.train,
        ModelTrainingConfig(model=ModelConfig(name="DecisionTree")),
    )
    reordered = _dataset(
        tuple(
            (cast("float", row.values[1]), cast("float", row.values[0]))
            for row in prepared.test.records
        ),
        tuple(row.label for row in prepared.test.records),
        name="reordered",
        features=("events", "score"),
    )
    with pytest.raises(ModelTrainingError, match="feature names and order"):
        model.predict(reordered)


def test_evaluator_reuses_classification_metrics_for_decision_tree() -> None:
    """Shared evaluation computes the full metric set for tree predictions."""
    prepared = _prepared()
    model = DecisionTreeModel()
    model.fit(
        prepared.train,
        ModelTrainingConfig(model=ModelConfig(name="DecisionTree")),
    )

    metrics = ClassificationEvaluator().evaluate_classification(
        model,
        prepared.validation,
    )

    assert metrics.model_name == "DecisionTree"
    assert metrics.accuracy == 1.0
    assert metrics.precision == 1.0
    assert metrics.recall == 1.0
    assert metrics.f1_score == 1.0
    assert metrics.roc_auc == 1.0
    assert metrics.pr_auc == 1.0
    assert metrics.confusion_matrix == ((2, 0), (0, 2))
    assert metrics.log_loss >= 0.0


def test_decision_tree_pipeline_persists_metadata_and_reload(
    tmp_path: Path,
) -> None:
    """Pipeline exports the model plus tree details and verifies its hash."""
    prepared = _prepared()
    request = _request(
        prepared,
        tmp_path / "decision_tree.joblib",
        criterion="entropy",
        max_depth=3,
    )
    result = ModelPipeline().train_decision_tree(request)

    assert result.training.artifact_path == tmp_path / "decision_tree.joblib"
    assert result.artifact_metadata is not None
    assert result.artifact_metadata.model_name == "DecisionTree"
    assert result.artifact_metadata.model_details["criterion"] == "entropy"
    assert result.artifact_metadata.model_details["feature_importances"] == {
        "score": 1.0,
        "events": 0.0,
    }
    assert result.artifact_metadata.model_details["tree_depth"] == 1
    assert result.artifact_metadata.model_details["number_of_leaves"] == 2
    assert result.artifact_metadata.model_details["number_of_nodes"] == 3
    assert result.validation_metrics is not None
    assert result.test_metrics is not None
    assert result.metadata_path is not None
    artifact = result.training.artifact_path
    assert artifact is not None
    sidecar = json.loads(result.metadata_path.read_text(encoding="utf-8"))
    assert sidecar["sha256"] == hashlib.sha256(artifact.read_bytes()).hexdigest()
    assert sidecar["model_details"]["criterion"] == "entropy"
    assert "accuracy" in sidecar["validation_metrics"]
    restored = JoblibModelPersistence().load(artifact)
    assert isinstance(restored, DecisionTreeModel)
    trained = result.training.trained_model
    assert isinstance(trained, DecisionTreeModel)
    assert restored.predict(prepared.test) == trained.predict(prepared.test)


def test_pipeline_run_and_reproducibility(tmp_path: Path) -> None:
    """Public pipeline dispatches trees and seeded results are reproducible."""
    prepared = _prepared()
    config = ModelTrainingConfig(
        model=ModelConfig(name="DecisionTree"),
        random_seed=12,
    )
    request = ModelTrainingRequest(dataset=prepared, config=config)
    pipeline = ModelPipeline(artifact_directory=tmp_path)

    first = pipeline.run(request)
    second = pipeline.train_decision_tree(request)

    assert first.training.metadata.random_seed == 12
    assert first.validation_metrics == second.validation_metrics
    assert first.test_metrics == second.test_metrics
    assert first.artifact_metadata is not None
    assert second.artifact_metadata is not None
    assert first.artifact_metadata.sha256 == second.artifact_metadata.sha256


def test_pipeline_rejects_missing_target_or_schema(tmp_path: Path) -> None:
    """Pipeline validates consistent target and feature metadata."""
    prepared = _prepared()
    invalid = ModelTrainingRequest(
        dataset=prepared,
        config=ModelTrainingConfig(
            model=ModelConfig(name="DecisionTree"),
            target_column="other",
            artifact_path=tmp_path / "invalid.joblib",
        ),
    )
    with pytest.raises(ModelTrainingError, match="share a target column"):
        ModelPipeline().train_decision_tree(invalid)

    bad_metadata = PreprocessedSplitResult(
        train=prepared.train,
        validation=prepared.validation,
        test=prepared.test,
        metadata=PreprocessingMetadata(
            feature_names=("other",),
            strategy="none",
            fitted=True,
        ),
    )
    invalid_schema = ModelTrainingRequest(
        dataset=bad_metadata,
        config=ModelTrainingConfig(model=ModelConfig(name="DecisionTree")),
    )
    with pytest.raises(ModelTrainingError, match="feature schema"):
        ModelPipeline().train_decision_tree(invalid_schema)


def test_pipeline_persistence_tampering_is_rejected(tmp_path: Path) -> None:
    """A changed tree model cannot be loaded with its stale metadata."""
    result = ModelPipeline().train_decision_tree(
        _request(_prepared(), tmp_path / "tree.joblib")
    )
    assert result.training.artifact_path is not None
    result.training.artifact_path.write_bytes(b"tampered")
    with pytest.raises(ModelPersistenceError, match="hash mismatch"):
        JoblibModelPersistence().load(result.training.artifact_path)


def test_evaluator_rejects_unsupported_model() -> None:
    """The classification evaluator keeps a typed guard for other model types."""
    with pytest.raises(ModelEvaluationError, match="supports"):
        ClassificationEvaluator().evaluate_classification(
            cast("Model", object()),
            _prepared().validation,
        )
