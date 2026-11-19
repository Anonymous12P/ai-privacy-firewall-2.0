"""Tests for the experimental evaluation architecture-only contracts."""

from dataclasses import FrozenInstanceError
from datetime import UTC, datetime
from inspect import isabstract
from pathlib import Path

import pytest
from app import experiments
from app.experiments.config import (
    DEFAULT_DATASET_DIRECTORY,
    DEFAULT_OUTPUT_DIRECTORY,
    DEFAULT_SELECTED_MODELS,
)
from app.experiments.config import (
    ExperimentConfig as ConfigModuleConfig,
)
from app.experiments.dataset_loader import ExperimentDatasetLoader
from app.experiments.exceptions import (
    ExperimentConfigurationError,
    ExperimentDatasetError,
    ExperimentError,
    ExperimentExecutionError,
)
from app.experiments.exporter import ExperimentExporter
from app.experiments.metadata import ExperimentMetadataProvider
from app.experiments.pipeline import ExperimentPipeline
from app.experiments.runner import ExperimentRunner
from app.experiments.schemas import (
    ExperimentArtifact,
    ExperimentArtifacts,
    ExperimentConfig,
    ExperimentDatasetLoadMetadata,
    ExperimentDatasetLoadResult,
    ExperimentMetadata,
    ExperimentResult,
)


def _config() -> ExperimentConfig:
    """Return the validated default CERT experiment configuration."""
    return ExperimentConfig()


def test_public_package_exports_contracts_and_configuration() -> None:
    assert experiments.ExperimentConfig is ConfigModuleConfig
    assert experiments.ExperimentPipeline is ExperimentPipeline
    assert experiments.ExperimentRunner is ExperimentRunner
    assert experiments.ExperimentDatasetLoader is ExperimentDatasetLoader
    assert experiments.ExperimentExporter is ExperimentExporter
    assert experiments.ExperimentMetadataProvider is ExperimentMetadataProvider
    assert experiments.ExperimentMetadata is ExperimentMetadata
    assert experiments.ExperimentArtifacts is ExperimentArtifacts
    assert experiments.ExperimentResult is ExperimentResult
    assert experiments.ExperimentDatasetLoadMetadata is ExperimentDatasetLoadMetadata
    assert experiments.ExperimentDatasetLoadResult is ExperimentDatasetLoadResult


def test_experiment_config_contains_declared_configuration_fields() -> None:
    config = _config()

    assert config.dataset_path == DEFAULT_DATASET_DIRECTORY
    assert config.output_directory == DEFAULT_OUTPUT_DIRECTORY
    assert config.random_seed == 42
    assert config.selected_models == DEFAULT_SELECTED_MODELS
    assert config.experiment_name == "cert-r4.2-experiment"
    assert config.feature_directory == DEFAULT_OUTPUT_DIRECTORY / "features"
    assert (
        config.explainability_directory == DEFAULT_OUTPUT_DIRECTORY / "explainability"
    )


def test_contract_dataclasses_are_frozen_and_constructible() -> None:
    config = _config()
    metadata = ExperimentMetadata(
        experiment_name=config.experiment_name,
        dataset_path=config.dataset_path,
        random_seed=config.random_seed,
        selected_models=config.selected_models,
        generated_at=datetime(2026, 1, 1, tzinfo=UTC),
        environment=(("python", "3.14"),),
    )
    artifact = ExperimentArtifact("features", Path("features/output.parquet"))
    artifacts = ExperimentArtifacts((artifact,))
    result = ExperimentResult(config, metadata, artifacts)

    assert result.config is config
    assert result.metadata is metadata
    assert result.artifacts.items == (artifact,)
    with pytest.raises(FrozenInstanceError):
        config.random_seed = 10  # type: ignore[misc]
    with pytest.raises(FrozenInstanceError):
        metadata.experiment_name = "changed"  # type: ignore[misc]
    with pytest.raises(FrozenInstanceError):
        artifacts.items = ()  # type: ignore[misc]


def test_pipeline_is_concrete_and_names_workflow_stages() -> None:
    documentation = ExperimentPipeline.__doc__ or ""
    assert not isabstract(ExperimentPipeline)
    assert hasattr(ExperimentPipeline, "run")
    assert "orchestrate" in documentation.casefold()
    assert "FeaturePipeline" in documentation
    assert "MLPipeline" in documentation
    assert "ModelPipeline" in documentation
    assert "ExplainabilityPipeline" in documentation


@pytest.mark.parametrize(
    ("contract", "method_name"),
    [
        (ExperimentDatasetLoader, "load"),
        (ExperimentExporter, "export"),
        (ExperimentMetadataProvider, "build"),
        (ExperimentRunner, "run"),
    ],
)
def test_extension_contracts_are_abstract(
    contract: type[object],
    method_name: str,
) -> None:
    assert isabstract(contract)
    assert hasattr(contract, method_name)


@pytest.mark.parametrize(
    ("exception_type", "base_type"),
    [
        (ExperimentConfigurationError, ValueError),
        (ExperimentDatasetError, ExperimentError),
        (ExperimentExecutionError, ExperimentError),
    ],
)
def test_exception_hierarchy(
    exception_type: type[Exception], base_type: type[Exception]
) -> None:
    assert issubclass(exception_type, base_type)
    assert issubclass(exception_type, ExperimentError)
