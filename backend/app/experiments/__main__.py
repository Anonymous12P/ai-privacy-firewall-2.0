"""Command-line entry point for running an experiment."""

import argparse
import sys
from collections.abc import Sequence
from pathlib import Path

from app.experiments.config import (
    DEFAULT_DATASET_DIRECTORY,
    DEFAULT_OUTPUT_DIRECTORY,
    DEFAULT_SELECTED_MODELS,
    SUPPORTED_EXPERIMENT_MODELS,
    ExperimentConfig,
)
from app.experiments.exceptions import ExperimentError
from app.experiments.runner import DefaultExperimentRunner
from app.experiments.schemas import ExperimentResult, ExperimentRunResult


def _build_parser() -> argparse.ArgumentParser:
    """Create the supported command-line options."""
    parser = argparse.ArgumentParser(
        description="Run the configured experimental evaluation workflow."
    )
    parser.add_argument(
        "--dataset-path",
        type=Path,
        default=DEFAULT_DATASET_DIRECTORY,
        help="CERT dataset directory (default: %(default)s)",
    )
    parser.add_argument(
        "--output-directory",
        type=Path,
        default=DEFAULT_OUTPUT_DIRECTORY,
        help="Directory for generated experiment artifacts (default: %(default)s)",
    )
    parser.add_argument(
        "--random-seed",
        type=int,
        default=42,
        help="Reproducibility seed (default: %(default)s)",
    )
    parser.add_argument(
        "--selected-models",
        nargs="+",
        choices=SUPPORTED_EXPERIMENT_MODELS,
        default=list(DEFAULT_SELECTED_MODELS),
        metavar="MODEL",
        help="One or more registered models (all registered models by default)",
    )
    return parser


def _generated_artifact_paths(result: ExperimentResult) -> tuple[Path, ...]:
    """Collect paths already produced by pipeline stages without writing files."""
    paths = [artifact.path for artifact in result.artifacts.items]
    if isinstance(result, ExperimentRunResult):
        paths.extend(result.feature_engineering.export.artifact_paths.values())

        comparison = result.comparison
        paths.extend(
            (comparison.json_path, comparison.csv_path, comparison.markdown_path)
        )
        if comparison.chart_path is not None:
            paths.append(comparison.chart_path)

        model_results = (
            result.model_training
            if isinstance(result.model_training, tuple)
            else (result.model_training,)
        )
        for model_result in model_results:
            if model_result.training.artifact_path is not None:
                paths.append(model_result.training.artifact_path)
            if model_result.metadata_path is not None:
                paths.append(model_result.metadata_path)

        explainability_results = (
            result.explainability
            if isinstance(result.explainability, tuple)
            else (result.explainability,)
        )
        for explanation in explainability_results:
            report = explanation.report
            paths.extend(
                (
                    report.json_path,
                    report.csv_path,
                    report.markdown_path,
                    report.summary_path,
                    report.manifest_path,
                    *report.visualization_paths,
                )
            )

    return tuple(dict.fromkeys(paths))


def main(argv: Sequence[str] | None = None) -> int:
    """Parse configuration, delegate execution, and report existing outputs."""
    args = _build_parser().parse_args(argv)
    try:
        config = ExperimentConfig(
            dataset_path=args.dataset_path,
            output_directory=args.output_directory,
            random_seed=args.random_seed,
            selected_models=tuple(args.selected_models),
            experiment_name=args.output_directory.name or "experiment",
        )
        print(f"Starting experiment: {config.experiment_name}")
        result = DefaultExperimentRunner().run(config)
    except ExperimentError as exc:
        print(f"Experiment failed: {exc}", file=sys.stderr)
        return 1

    print(f"Experiment completed: {config.experiment_name}")
    artifact_paths = _generated_artifact_paths(result)
    if artifact_paths:
        print("Generated artifacts:")
        for path in artifact_paths:
            print(f"- {path}")
    else:
        print(f"Artifacts are available under: {config.output_directory}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
