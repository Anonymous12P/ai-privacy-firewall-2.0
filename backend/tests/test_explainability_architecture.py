"""Architecture tests for the Sprint 7.3 explainability module."""

import inspect
from importlib import import_module

import pytest

from app.explainability import (
    ExplainabilityError,
    ExplainabilityPipeline,
    ExplainerConfig,
    ExplainerNotImplementedError,
    ExplainerNotSupportedError,
    ExplainerRegistry,
    ExplainerSpec,
    ExplanationGenerator,
    ExplanationRequest,
    ExplanationResult,
    GlobalExplanation,
    GlobalFeatureContribution,
    LocalExplanation,
    LocalFeatureContribution,
    ShapExplainer,
)
from app.explainability.schemas import ExplainerName
from app.ml.schemas import DatasetMetadata, MLDataset, MLRecord
from app.models.base import Model
from app.models.schemas import ModelPrediction, ModelTrainingConfig


def test_explainability_modules_import() -> None:
    """Every declared module imports without optional explainability packages."""
    modules = (
        "__init__",
        "base",
        "exceptions",
        "pipeline",
        "registry",
        "schemas",
        "shap_explainer",
    )
    assert all(import_module(f"app.explainability.{module}") for module in modules)


def test_interfaces_are_abstract() -> None:
    """Generator remains abstract while orchestration is directly usable."""
    assert inspect.isabstract(ExplanationGenerator)
    assert not inspect.isabstract(ExplainabilityPipeline)


def test_typed_schemas_can_be_instantiated() -> None:
    """Explanation configuration and output schemas accept representative data."""
    config = ExplainerConfig(
        explainer="SHAP",
        random_seed=17,
        options={"max_samples": 100},
    )
    global_result = GlobalExplanation(
        model_name="LogisticRegression",
        explainer="SHAP",
        feature_contributions=(
            GlobalFeatureContribution(
                feature_name="risk_score",
                mean_absolute_contribution=0.42,
            ),
        ),
        explained_row_count=3,
    )
    local_result = LocalExplanation(
        model_name="LogisticRegression",
        explainer="SHAP",
        subject_id="employee-1",
        prediction="alert",
        baseline_value=0.2,
        feature_contributions=(
            LocalFeatureContribution(
                feature_name="risk_score",
                contribution=0.3,
                feature_value=0.8,
            ),
        ),
    )
    result = ExplanationResult(
        global_explanation=global_result,
        local_explanation=local_result,
    )

    assert config.options["max_samples"] == 100
    assert result.global_explanation == global_result
    assert result.local_explanation == local_result


def test_request_carries_model_dataset_and_config() -> None:
    """The request schema composes the existing model and dataset contracts."""

    class ModelStub(Model):
        """Minimal test implementation of the pre-existing model contract."""

        def fit(
            self,
            training_dataset: MLDataset,
            config: ModelTrainingConfig,
        ) -> None:
            """Provide the required interface without model behavior."""
            del training_dataset, config

        def predict(self, dataset: MLDataset) -> ModelPrediction:
            """Return empty aligned predictions for contract construction."""
            return ModelPrediction(
                model_name="stub",
                predictions=tuple(record.label for record in dataset.records),
                subject_ids=tuple(record.subject_id for record in dataset.records),
            )

    dataset = MLDataset(
        feature_names=("risk_score",),
        records=(MLRecord("employee-1", (0.8,), "alert"),),
        label_name="label",
        metadata=DatasetMetadata(row_count=1),
    )
    config = ExplainerConfig()

    request = ExplanationRequest(
        model=ModelStub(),
        dataset=dataset,
        config=config,
        subject_id="employee-1",
    )

    assert request.dataset is dataset
    assert request.config is config
    assert request.subject_id == "employee-1"


def test_registry_recognizes_shap_and_reserved_lime_in_stable_order() -> None:
    """Registry names, case-insensitive lookup, and implementation status agree."""
    registry = ExplainerRegistry()

    assert tuple(spec.name for spec in registry.list_explainers()) == ("SHAP", "LIME")
    assert registry.get("shap") == ExplainerSpec(name="SHAP", implemented=True)
    assert registry.get("Lime").implemented is False


def test_registry_updates_known_explainer_status() -> None:
    """A registered method may be marked implemented by a future extension."""
    registry = ExplainerRegistry()
    registry.register(ExplainerSpec(name="SHAP", implemented=True))

    assert registry.get("shap").implemented is True
    assert tuple(spec.name for spec in registry.list_explainers()) == ("SHAP", "LIME")


def test_registry_rejects_unknown_explainers() -> None:
    """Unrecognized names raise a typed, actionable exception."""
    registry = ExplainerRegistry()

    with pytest.raises(ExplainerNotSupportedError, match="not registered"):
        registry.get("UNKNOWN")  # type: ignore[arg-type]

    with pytest.raises(ExplainerNotSupportedError):
        registry.register(ExplainerSpec(name="UNKNOWN", implemented=True))  # type: ignore[arg-type]


def test_shap_adapter_implements_generator_contract() -> None:
    """SHAP generator fulfills the established explanation interface."""
    assert isinstance(ShapExplainer(), ExplanationGenerator)


class ModelStubForPlaceholder(Model):
    """Minimal concrete model class used to meet placeholder type contracts."""

    def fit(
        self,
        training_dataset: MLDataset,
        config: ModelTrainingConfig,
    ) -> None:
        """Provide the required interface without model behavior."""
        del training_dataset, config

    def predict(self, dataset: MLDataset) -> ModelPrediction:
        """Return empty aligned predictions for the architecture test."""
        return ModelPrediction(
            model_name="stub",
            predictions=tuple(record.label for record in dataset.records),
            subject_ids=tuple(record.subject_id for record in dataset.records),
        )


def test_public_api_exports_contracts_and_errors() -> None:
    """Package __all__ publishes the declared architecture surface."""
    module = import_module("app.explainability")
    public_names = (
        "ExplainabilityError",
        "ExplainabilityMetadata",
        "ExplainabilityPipeline",
        "ExplainabilityResult",
        "ExplanationGenerator",
        "ExplanationRequest",
        "ExplanationResult",
        "ExplainerConfig",
        "ExplainerDependencyError",
        "ExplainerNotImplementedError",
        "ExplainerNotSupportedError",
        "ExplainerRegistrationError",
        "ExplainerRegistry",
        "ExplainerSpec",
        "GlobalExplanation",
        "GlobalFeatureContribution",
        "LocalExplanation",
        "LocalFeatureContribution",
        "ShapExplainer",
    )

    assert all(name in module.__all__ for name in public_names)
    assert issubclass(ExplainerNotImplementedError, ExplainabilityError)
    assert issubclass(ExplainerNotSupportedError, ExplainabilityError)


def test_explainer_name_is_a_typed_closed_set() -> None:
    """The public explainer-name type includes SHAP and future LIME only."""
    names: tuple[ExplainerName, ...] = ("SHAP", "LIME")
    assert names == ("SHAP", "LIME")
