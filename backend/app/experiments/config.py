"""Immutable configuration and validated defaults for CERT experiments."""

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from app.experiments.exceptions import ExperimentConfigurationError
from app.features.schemas import AggregationWindow

BACKEND_DIRECTORY = Path(__file__).resolve().parents[2]
DEFAULT_DATASET_DIRECTORY = BACKEND_DIRECTORY / "data" / "raw" / "cert_r4.2_subset"
DEFAULT_OUTPUT_DIRECTORY = BACKEND_DIRECTORY / "data" / "experiments" / "default"
SUPPORTED_EXPERIMENT_MODELS: tuple[
    Literal["LogisticRegression", "DecisionTree", "RandomForest", "XGBoost"], ...
] = (
    "LogisticRegression",
    "DecisionTree",
    "RandomForest",
    "XGBoost",
)
DEFAULT_SELECTED_MODELS = SUPPORTED_EXPERIMENT_MODELS


@dataclass(frozen=True, slots=True, init=False)
class ExperimentConfig:
    """Describe validated dataset, output, and reproducibility settings.

    The default source is the CERT r4.2 subset. Output directories default to
    children of the configured output directory and are created on construction.
    """

    dataset_path: Path
    output_directory: Path
    random_seed: int
    selected_models: tuple[str, ...]
    experiment_name: str
    feature_directory: Path
    explainability_directory: Path
    aggregation_window: AggregationWindow

    def __init__(
        self,
        dataset_path: Path = DEFAULT_DATASET_DIRECTORY,
        output_directory: Path = DEFAULT_OUTPUT_DIRECTORY,
        random_seed: int = 42,
        selected_models: tuple[str, ...] = DEFAULT_SELECTED_MODELS,
        experiment_name: str = "cert-r4.2-experiment",
        feature_directory: Path | None = None,
        explainability_directory: Path | None = None,
        aggregation_window: AggregationWindow = AggregationWindow.DAILY,
    ) -> None:
        """Set defaults, derive stage directories, and validate configuration."""
        selected_output = Path(output_directory)
        object.__setattr__(self, "dataset_path", Path(dataset_path))
        object.__setattr__(self, "output_directory", selected_output)
        object.__setattr__(self, "random_seed", random_seed)
        object.__setattr__(self, "selected_models", tuple(selected_models))
        object.__setattr__(self, "experiment_name", experiment_name)
        object.__setattr__(
            self,
            "feature_directory",
            (
                Path(feature_directory)
                if feature_directory is not None
                else selected_output / "features"
            ),
        )
        object.__setattr__(
            self,
            "explainability_directory",
            (
                Path(explainability_directory)
                if explainability_directory is not None
                else selected_output / "explainability"
            ),
        )
        object.__setattr__(self, "aggregation_window", aggregation_window)
        self.__post_init__()

    def __post_init__(self) -> None:
        """Reject invalid inputs and create the configured output directories."""
        if not self.dataset_path.exists() or not self.dataset_path.is_dir():
            raise ExperimentConfigurationError(
                f"Dataset path does not exist or is not a directory: "
                f"{self.dataset_path}"
            )
        if (
            isinstance(self.random_seed, bool)
            or not isinstance(self.random_seed, int)
            or self.random_seed < 0
        ):
            raise ExperimentConfigurationError(
                "random_seed must be a non-negative integer."
            )
        if not self.selected_models:
            raise ExperimentConfigurationError(
                "selected_models must contain at least one supported model."
            )
        unsupported = tuple(
            name
            for name in self.selected_models
            if not isinstance(name, str) or name not in SUPPORTED_EXPERIMENT_MODELS
        )
        if unsupported:
            raise ExperimentConfigurationError(
                "Unsupported selected models: "
                + ", ".join(repr(name) for name in unsupported)
            )
        if all(isinstance(name, str) for name in self.selected_models) and len(
            set(self.selected_models)
        ) != len(self.selected_models):
            raise ExperimentConfigurationError(
                "selected_models must not contain duplicates."
            )
        if not isinstance(self.aggregation_window, AggregationWindow):
            raise ExperimentConfigurationError(
                "aggregation_window must be an AggregationWindow."
            )
        if not self.experiment_name.strip():
            raise ExperimentConfigurationError("experiment_name must not be empty.")

        try:
            for directory in (
                self.output_directory,
                self.feature_directory,
                self.explainability_directory,
            ):
                directory.mkdir(parents=True, exist_ok=True)
                if not directory.is_dir():
                    raise OSError(f"Output path is not a directory: {directory}")
        except OSError as exc:
            raise ExperimentConfigurationError(
                f"Unable to create experiment output directories: {exc}"
            ) from exc
