"""Architecture tests for the Sprint 7.2 model-training module."""

import inspect
from importlib import import_module
from pathlib import Path

import pytest

from app.ml.schemas import (
    DatasetMetadata,
    MLDataset,
    MLRecord,
    PreprocessedSplitResult,
    PreprocessingMetadata,
)
from app.models import (
    EvaluationResult,
    Model,
    ModelConfig,
    ModelEvaluator,
    ModelFactory,
    ModelNotImplementedError,
    ModelNotSupportedError,
    ModelPersistence,
    ModelPipelineResult,
    ModelPrediction,
    ModelRegistrationError,
    ModelRegistry,
    ModelSpec,
    ModelTrainer,
    ModelTrainingConfig,
    ModelTrainingPipeline,
    ModelTrainingRequest,
    ModelTrainingResult,
    TrainingMetadata,
)
from app.models.exceptions import ModelError


def test_model_modules_import() -> None:
    """Every module in the model-training package imports successfully."""
    modules = (
        "base",
        "classification_utils",
        "decision_tree",
        "random_forest",
        "exceptions",
        "evaluator",
        "factory",
        "persistence",
        "pipeline",
        "registry",
        "schemas",
        "trainer",
    )
    assert all(import_module(f"app.models.{module}") for module in modules)


def test_interfaces_are_abstract() -> None:
    """Model stage contracts remain abstract and contain no algorithms."""
    for interface in (
        Model,
        ModelEvaluator,
        ModelPersistence,
        ModelTrainer,
        ModelTrainingPipeline,
    ):
        assert inspect.isabstract(interface)


def test_typed_schemas_can_be_instantiated(tmp_path: Path) -> None:
    """Configuration and result dataclasses accept representative typed values."""
    model_config = ModelConfig(
        name="RandomForest",
        hyperparameters={"max_depth": 5, "n_estimators": 100},
    )
    training_config = ModelTrainingConfig(
        model=model_config,
        random_seed=11,
        target_column="label",
    )
    metadata = TrainingMetadata(
        model_name="CatBoost",
        training_row_count=3,
        feature_names=("risk", "activity"),
        target_column="label",
        random_seed=11,
        hyperparameters=model_config.hyperparameters,
    )
    training_result = ModelTrainingResult(
        metadata=metadata,
        artifact_path=tmp_path / "model.bin",
    )
    prediction = ModelPrediction(
        model_name="RandomForest",
        predictions=("alert", "normal"),
        subject_ids=("row-1", "row-2"),
    )
    evaluation = EvaluationResult(
        model_name="RandomForest",
        metrics={"accuracy": 0.9},
        evaluated_row_count=2,
    )
    dataset = MLDataset(
        feature_names=("risk",),
        records=(MLRecord("row-1", (0.5,), "alert"),),
        label_name="label",
        metadata=DatasetMetadata(row_count=1),
    )
    partition = PreprocessedSplitResult(
        train=dataset,
        validation=dataset,
        test=dataset,
        metadata=PreprocessingMetadata(
            feature_names=dataset.feature_names,
            strategy="none",
            fitted=True,
        ),
    )
    request = ModelTrainingRequest(
        dataset=partition,
        config=training_config,
    )
    result = ModelPipelineResult(
        training=training_result,
        evaluation=evaluation,
    )

    assert request.config.model.name == "RandomForest"
    assert prediction.subject_ids == ("row-1", "row-2")
    assert result.training.metadata.training_row_count == 3


def test_registry_recognizes_supported_models_in_stable_order() -> None:
    """The factory marks implemented baselines without changing registry order."""
    registry = ModelRegistry()
    ModelFactory(registry)
    expected_names = (
        "LogisticRegression",
        "DecisionTree",
        "RandomForest",
        "XGBoost",
        "LightGBM",
        "CatBoost",
    )

    assert tuple(spec.name for spec in registry.list_models()) == expected_names
    assert registry.get("randomforest") == ModelSpec(
        name="RandomForest",
        implemented=True,
    )
    implementation_status = {
        spec.name: spec.implemented for spec in registry.list_models()
    }
    assert implementation_status == {
        "LogisticRegression": True,
        "DecisionTree": True,
        "RandomForest": True,
        "XGBoost": True,
        "LightGBM": False,
        "CatBoost": False,
    }


def test_factory_raises_placeholder_for_recognized_model() -> None:
    """Recognized models are explicit placeholders, never silent fake models."""
    factory = ModelFactory()

    with pytest.raises(ModelNotImplementedError, match="recognized"):
        factory.create(ModelConfig(name="LightGBM"))


def test_factory_registers_and_uses_future_constructor() -> None:
    """The factory supports future model adapters without shipping an algorithm."""

    class RegisteredModel(Model):
        """Minimal test double implementing only the abstract model contract."""

        def fit(self, training_dataset: MLDataset, config: ModelTrainingConfig) -> None:
            """Represent the fit boundary without model behavior."""
            del training_dataset, config

        def predict(self, dataset: MLDataset) -> ModelPrediction:
            """Represent a prediction boundary for constructor registration."""
            return ModelPrediction(
                model_name="RandomForest",
                predictions=tuple(record.label for record in dataset.records),
                subject_ids=tuple(record.subject_id for record in dataset.records),
            )

    def constructor(config: ModelConfig) -> Model:
        """Create a contract-only model used to verify factory wiring."""
        del config
        return RegisteredModel()

    factory = ModelFactory()
    factory.register("CatBoost", constructor)

    model = factory.create(ModelConfig(name="CatBoost"))

    assert isinstance(model, RegisteredModel)
    with pytest.raises(ModelRegistrationError):
        factory.register("CatBoost", constructor)


def test_registry_and_factory_reject_unknown_model_names() -> None:
    """Unknown model names produce a typed, actionable exception."""
    registry = ModelRegistry()

    with pytest.raises(ModelNotSupportedError, match="not registered"):
        registry.get("UnknownModel")

    with pytest.raises(ModelNotSupportedError):
        ModelFactory(registry).create(
            ModelConfig(name="UnknownModel")  # type: ignore[arg-type]
        )


def test_public_api_exports_contracts_and_typed_errors() -> None:
    """Package __all__ publishes the architecture surface consistently."""
    models_module = import_module("app.models")
    names = (
        "Model",
        "ModelConfig",
        "ModelError",
        "ModelDependencyError",
        "ModelEvaluator",
        "ModelFactory",
        "ModelNotImplementedError",
        "ModelRegistrationError",
        "ModelNotSupportedError",
        "ModelPersistence",
        "ModelPipelineResult",
        "ModelPrediction",
        "ModelRegistry",
        "ModelSpec",
        "ModelTrainer",
        "ModelTrainingConfig",
        "ModelTrainingPipeline",
        "ModelTrainingRequest",
        "ModelTrainingResult",
        "RandomForestConfig",
        "RandomForestModel",
        "RandomForestTrainer",
        "TrainingMetadata",
        "EvaluationResult",
    )

    assert all(name in models_module.__all__ for name in names)
    assert issubclass(ModelNotImplementedError, ModelError)
    assert issubclass(ModelNotSupportedError, ModelError)
