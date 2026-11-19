"""Tests for DefaultExperimentRunner's delegation and error handling."""

from typing import cast
from unittest.mock import Mock, patch

import pytest
from app.experiments import DefaultExperimentRunner, ExperimentPipeline
from app.experiments.config import ExperimentConfig
from app.experiments.exceptions import (
    ExperimentConfigurationError,
    ExperimentExecutionError,
)
from app.experiments.schemas import ExperimentRunResult


def _config() -> ExperimentConfig:
    """Create a valid default CERT experiment configuration."""
    return ExperimentConfig()


def _pipeline_mock() -> Mock:
    """Create an injectable pipeline mock with the correct runtime spec."""
    return Mock(spec=ExperimentPipeline)


def test_runner_delegates_once_forwards_config_and_preserves_identity(
    caplog: pytest.LogCaptureFixture,
) -> None:
    config = _config()
    result = cast(ExperimentRunResult, object())
    pipeline = _pipeline_mock()
    pipeline.run.return_value = result
    runner = DefaultExperimentRunner(cast(ExperimentPipeline, pipeline))

    with caplog.at_level("INFO"):
        actual = runner.run(config)

    assert actual is result
    pipeline.run.assert_called_once_with(config)
    assert "Experiment run started" in caplog.text
    assert "Experiment run completed" in caplog.text
    assert "duration_seconds=" in caplog.text


def test_runner_creates_default_pipeline_when_none_is_supplied() -> None:
    with patch("app.experiments.runner.ExperimentPipeline") as pipeline_class:
        runner = DefaultExperimentRunner()

    pipeline_class.assert_called_once_with()
    assert isinstance(runner, DefaultExperimentRunner)


@pytest.mark.parametrize(
    "error_type",
    [ExperimentConfigurationError, ExperimentExecutionError],
)
def test_runner_propagates_known_errors_unchanged(error_type: type[Exception]) -> None:
    error = error_type("synthetic expected failure")
    pipeline = _pipeline_mock()
    pipeline.run.side_effect = error
    runner = DefaultExperimentRunner(cast(ExperimentPipeline, pipeline))

    with pytest.raises(error_type) as raised:
        runner.run(_config())

    assert raised.value is error
    pipeline.run.assert_called_once()


def test_runner_wraps_and_chains_unexpected_exceptions(
    caplog: pytest.LogCaptureFixture,
) -> None:
    error = RuntimeError("synthetic unexpected failure")
    pipeline = _pipeline_mock()
    pipeline.run.side_effect = error
    runner = DefaultExperimentRunner(cast(ExperimentPipeline, pipeline))

    with caplog.at_level("ERROR"), pytest.raises(ExperimentExecutionError) as raised:
        runner.run(_config())

    assert raised.value.__cause__ is error
    pipeline.run.assert_called_once()
    assert "Unexpected experiment runner failure" in caplog.text
    assert "duration_seconds=" in caplog.text
