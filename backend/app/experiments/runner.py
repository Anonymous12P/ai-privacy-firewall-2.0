"""Runner boundary and default experiment pipeline delegation."""

import logging
from abc import ABC, abstractmethod
from time import perf_counter

from app.core.constants import APP_LOGGER_NAME
from app.experiments.config import ExperimentConfig
from app.experiments.exceptions import (
    ExperimentConfigurationError,
    ExperimentExecutionError,
)
from app.experiments.pipeline import ExperimentPipeline
from app.experiments.schemas import ExperimentResult

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.experiments.runner")


class ExperimentRunner(ABC):
    """Define the entry point for submitting experiment configurations."""

    @abstractmethod
    def run(self, config: ExperimentConfig) -> ExperimentResult:
        """Run the experiment represented by the supplied configuration."""
        raise NotImplementedError


class DefaultExperimentRunner(ExperimentRunner):
    """Run experiments by delegating once to an injected ExperimentPipeline."""

    def __init__(self, pipeline: ExperimentPipeline | None = None) -> None:
        """Use the supplied pipeline or construct the default implementation."""
        self._pipeline = pipeline if pipeline is not None else ExperimentPipeline()

    def run(self, config: ExperimentConfig) -> ExperimentResult:
        """Delegate execution, preserve results, and report duration and failures."""
        logger.info("Experiment run started: name=%s", config.experiment_name)
        started = perf_counter()
        try:
            result = self._pipeline.run(config)
        except (ExperimentConfigurationError, ExperimentExecutionError):
            duration = perf_counter() - started
            logger.exception(
                "Experiment run failed: name=%s, duration_seconds=%.6f",
                config.experiment_name,
                duration,
            )
            raise
        except Exception as exc:
            duration = perf_counter() - started
            logger.exception(
                "Unexpected experiment runner failure: name=%s, duration_seconds=%.6f",
                config.experiment_name,
                duration,
            )
            raise ExperimentExecutionError(
                f"Experiment {config.experiment_name!r} failed unexpectedly: {exc}"
            ) from exc

        duration = perf_counter() - started
        logger.info(
            "Experiment run completed: name=%s, duration_seconds=%.6f",
            config.experiment_name,
            duration,
        )
        return result
