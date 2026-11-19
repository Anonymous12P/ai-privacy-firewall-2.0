"""Validation tests for default and user-supplied experiment configuration."""

from pathlib import Path

import pytest
from app.experiments.config import (
    DEFAULT_DATASET_DIRECTORY,
    DEFAULT_OUTPUT_DIRECTORY,
    DEFAULT_SELECTED_MODELS,
    ExperimentConfig,
)
from app.experiments.exceptions import ExperimentConfigurationError
from app.features.schemas import AggregationWindow


def test_default_config_targets_cert_subset_and_creates_output_directories(
    tmp_path: Path,
) -> None:
    config = ExperimentConfig(output_directory=tmp_path / "run")

    assert config.dataset_path == DEFAULT_DATASET_DIRECTORY
    assert config.output_directory == tmp_path / "run"
    assert config.feature_directory == tmp_path / "run" / "features"
    assert config.explainability_directory == tmp_path / "run" / "explainability"
    assert config.random_seed == 42
    assert config.selected_models == (
        "LogisticRegression",
        "DecisionTree",
        "RandomForest",
        "XGBoost",
    )
    assert config.selected_models == DEFAULT_SELECTED_MODELS
    assert config.aggregation_window is AggregationWindow.DAILY
    assert config.output_directory.is_dir()
    assert config.feature_directory.is_dir()
    assert config.explainability_directory.is_dir()


def test_config_accepts_explicit_stage_directories_and_window(tmp_path: Path) -> None:
    feature_directory = tmp_path / "custom-features"
    explainability_directory = tmp_path / "custom-explanations"
    config = ExperimentConfig(
        dataset_path=DEFAULT_DATASET_DIRECTORY,
        output_directory=tmp_path / "output",
        random_seed=11,
        selected_models=("DecisionTree",),
        experiment_name="custom",
        feature_directory=feature_directory,
        explainability_directory=explainability_directory,
        aggregation_window=AggregationWindow.WEEKLY,
    )

    assert config.feature_directory == feature_directory
    assert config.explainability_directory == explainability_directory
    assert config.aggregation_window is AggregationWindow.WEEKLY
    assert feature_directory.is_dir()
    assert explainability_directory.is_dir()


def test_config_rejects_missing_dataset_path(tmp_path: Path) -> None:
    with pytest.raises(ExperimentConfigurationError, match="Dataset path"):
        ExperimentConfig(dataset_path=tmp_path / "missing")


def test_config_rejects_dataset_file_instead_of_directory(tmp_path: Path) -> None:
    dataset_file = tmp_path / "dataset.csv"
    dataset_file.touch()

    with pytest.raises(ExperimentConfigurationError, match="Dataset path"):
        ExperimentConfig(dataset_path=dataset_file)


@pytest.mark.parametrize("random_seed", [-1, True, 1.5])
def test_config_rejects_invalid_random_seed(
    tmp_path: Path,
    random_seed: object,
) -> None:
    with pytest.raises(ExperimentConfigurationError, match="random_seed"):
        ExperimentConfig(
            dataset_path=DEFAULT_DATASET_DIRECTORY,
            output_directory=tmp_path / "output",
            random_seed=random_seed,  # type: ignore[arg-type]
        )


@pytest.mark.parametrize(
    "selected_models",
    [(), ("NotARegisteredModel",), ("DecisionTree", "DecisionTree")],
)
def test_config_rejects_invalid_model_selection(
    tmp_path: Path,
    selected_models: tuple[str, ...],
) -> None:
    with pytest.raises(ExperimentConfigurationError, match="selected_models|models"):
        ExperimentConfig(
            dataset_path=DEFAULT_DATASET_DIRECTORY,
            output_directory=tmp_path / "output",
            selected_models=selected_models,
        )


def test_config_wraps_output_directory_creation_failure(tmp_path: Path) -> None:
    output_parent = tmp_path / "not-a-directory"
    output_parent.touch()

    with pytest.raises(ExperimentConfigurationError, match="Unable to create"):
        ExperimentConfig(
            dataset_path=DEFAULT_DATASET_DIRECTORY,
            output_directory=output_parent / "output",
        )


def test_default_config_is_available_without_cli_arguments() -> None:
    config = ExperimentConfig()

    assert config.dataset_path.is_dir()
    assert config.output_directory == DEFAULT_OUTPUT_DIRECTORY
