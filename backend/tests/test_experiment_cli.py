"""Synthetic integration tests for the experiment command-line entry point."""

from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace
from typing import cast
from unittest.mock import Mock

import pytest
from app.experiments import __main__ as experiment_cli
from app.experiments.config import ExperimentConfig
from app.experiments.exceptions import ExperimentExecutionError
from app.experiments.schemas import (
    ExperimentArtifact,
    ExperimentArtifacts,
    ExperimentDatasetLoadResult,
    ExperimentExplainabilityResult,
    ExperimentMetadata,
    ExperimentResult,
    ExperimentRunResult,
)
from app.features.schemas import AggregationWindow, FeatureEngineeringRunResult
from app.ml.schemas import MLPipelineResult
from app.models.comparison import ModelComparisonResult
from app.models.schemas import ModelPipelineResult


def _result() -> ExperimentResult:
    """Create an immutable result with a synthetic existing artifact path."""
    config = ExperimentConfig()
    return ExperimentResult(
        config=config,
        metadata=ExperimentMetadata(
            experiment_name=config.experiment_name,
            dataset_path=config.dataset_path,
            random_seed=config.random_seed,
            selected_models=config.selected_models,
            generated_at=datetime(2026, 11, 1, tzinfo=UTC),
        ),
        artifacts=ExperimentArtifacts(
            items=(ExperimentArtifact(name="existing", path=Path("existing.json")),)
        ),
    )


def _completed_run_result() -> ExperimentRunResult:
    """Create a synthetic run with paths returned by existing pipeline stages."""
    base = _result()
    feature_path = Path("synthetic-output/features/features.parquet")
    comparison_path = Path("synthetic-output/model_comparison.json")
    model_path = Path("synthetic-output/decision_tree.joblib")
    explanation_path = Path("synthetic-output/explainability/shap_report.json")
    feature_result = SimpleNamespace(
        export=SimpleNamespace(artifact_paths={"features.parquet": feature_path})
    )
    model_result = SimpleNamespace(
        training=SimpleNamespace(artifact_path=model_path),
        metadata_path=None,
    )
    comparison = SimpleNamespace(
        json_path=comparison_path,
        csv_path=Path("synthetic-output/model_comparison.csv"),
        markdown_path=Path("synthetic-output/model_comparison.md"),
        chart_path=None,
    )
    report = SimpleNamespace(
        json_path=explanation_path,
        csv_path=Path("synthetic-output/explainability/shap_report.csv"),
        markdown_path=Path("synthetic-output/explainability/shap_report.md"),
        summary_path=Path("synthetic-output/explainability/summary.md"),
        manifest_path=Path("synthetic-output/explainability/manifest.json"),
        visualization_paths=(),
    )
    explanation = SimpleNamespace(report=report)
    return ExperimentRunResult(
        config=base.config,
        metadata=base.metadata,
        artifacts=base.artifacts,
        dataset=cast(ExperimentDatasetLoadResult, object()),
        feature_engineering=cast(FeatureEngineeringRunResult, feature_result),
        machine_learning=cast(MLPipelineResult, object()),
        model_training=cast(ModelPipelineResult, model_result),
        comparison=cast(ModelComparisonResult, comparison),
        explainability=cast(ExperimentExplainabilityResult, explanation),
        execution_duration_seconds=0.1,
    )


def test_cli_builds_config_delegates_and_reports_existing_artifacts(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    result = _result()
    runner = Mock()
    runner.run.return_value = result
    runner_factory = Mock(return_value=runner)
    monkeypatch.setattr(experiment_cli, "DefaultExperimentRunner", runner_factory)
    dataset_path = tmp_path / "cert"
    dataset_path.mkdir()
    output_directory = tmp_path / "output"

    exit_code = experiment_cli.main(
        [
            "--dataset-path",
            str(dataset_path),
            "--output-directory",
            str(output_directory),
            "--random-seed",
            "123",
            "--selected-models",
            "DecisionTree",
            "RandomForest",
        ]
    )

    assert exit_code == 0
    runner_factory.assert_called_once_with()
    config = cast(ExperimentConfig, runner.run.call_args.args[0])
    assert config.dataset_path == dataset_path
    assert config.output_directory == output_directory
    assert config.random_seed == 123
    assert config.selected_models == ("DecisionTree", "RandomForest")
    assert config.feature_directory == output_directory / "features"
    assert config.explainability_directory == output_directory / "explainability"
    output = capsys.readouterr().out
    assert "Starting experiment:" in output
    assert "Experiment completed:" in output
    assert "existing.json" in output


def test_cli_reports_paths_from_existing_pipeline_outputs(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    runner = Mock()
    runner.run.return_value = _completed_run_result()
    monkeypatch.setattr(
        experiment_cli,
        "DefaultExperimentRunner",
        Mock(return_value=runner),
    )

    assert experiment_cli.main([]) == 0

    config = cast(ExperimentConfig, runner.run.call_args.args[0])
    assert config.selected_models == (
        "LogisticRegression",
        "DecisionTree",
        "RandomForest",
        "XGBoost",
    )
    assert config.aggregation_window is AggregationWindow.DAILY
    output = capsys.readouterr().out
    for path in (
        "features.parquet",
        "model_comparison.json",
        "decision_tree.joblib",
        "shap_report.json",
    ):
        assert path in output


def test_cli_returns_nonzero_and_reports_runner_failure(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    runner = Mock()
    runner.run.side_effect = ExperimentExecutionError("synthetic failure")
    monkeypatch.setattr(
        experiment_cli,
        "DefaultExperimentRunner",
        Mock(return_value=runner),
    )

    exit_code = experiment_cli.main([])

    assert exit_code == 1
    assert "synthetic failure" in capsys.readouterr().err
