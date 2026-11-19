"""Model comparison, measurement, ranking, and report generation."""

import csv
import importlib
import io
import json
import logging
import math
import time
from dataclasses import asdict, dataclass, replace
from pathlib import Path
from typing import Literal, cast

import joblib  # type: ignore[import-untyped]

from app.core.constants import APP_LOGGER_NAME
from app.ml.schemas import PreprocessedSplitResult
from app.models.base import Model
from app.models.decision_tree import DecisionTreeModel
from app.models.evaluator import ClassificationEvaluator
from app.models.exceptions import ModelComparisonError
from app.models.factory import ModelFactory
from app.models.logistic_regression import LogisticRegressionModel
from app.models.random_forest import RandomForestModel
from app.models.ranking import RankingConfig, RankingMetric, rank_models
from app.models.schemas import (
    ClassificationMetrics,
    ModelConfig,
    ModelName,
    ModelTrainingConfig,
)
from app.models.trainer import EstimatorTrainer
from app.models.xgboost_model import XGBoostModel

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.models.comparison")

type SupportedComparisonModel = (
    LogisticRegressionModel | DecisionTreeModel | RandomForestModel | XGBoostModel
)
type EvaluationPartition = Literal["validation", "test"]

_METRIC_NAMES: tuple[str, ...] = (
    "accuracy",
    "precision",
    "recall",
    "f1_score",
    "roc_auc",
    "pr_auc",
    "log_loss",
)


@dataclass(frozen=True, slots=True)
class ModelComparisonEntry:
    """Contain one model's configuration, evaluation, performance, and rank."""

    model_name: str
    configuration: dict[str, object]
    metrics: dict[str, float | None]
    training_time_seconds: float
    prediction_time_seconds: float
    model_size_bytes: int
    parameter_count: int | None
    rank: int = 0


@dataclass(frozen=True, slots=True)
class ModelComparisonResult:
    """Describe ranked comparison results and generated report locations."""

    primary_metric: RankingMetric
    evaluation_partition: EvaluationPartition
    entries: tuple[ModelComparisonEntry, ...]
    best_model: str
    json_path: Path
    csv_path: Path
    markdown_path: Path
    chart_path: Path | None = None


def compare_models(
    partitions: PreprocessedSplitResult,
    output_directory: Path,
    *,
    model_configs: tuple[ModelConfig, ...] | None = None,
    primary_metric: RankingMetric = "f1_score",
    evaluation_partition: EvaluationPartition = "test",
    random_seed: int = 42,
    generate_chart: bool = True,
    factory: ModelFactory | None = None,
) -> ModelComparisonResult:
    """Train and compare the four implemented classifiers on common partitions.

    Model fitting uses only the shared training partition. Every model is
    evaluated against the same selected held-out partition.
    """
    selected_configs = (
        _default_model_configs() if model_configs is None else model_configs
    )
    _validate_comparison_request(
        partitions,
        selected_configs,
        primary_metric,
        evaluation_partition,
    )
    selected_factory = factory or ModelFactory()
    evaluator = ClassificationEvaluator()
    trainer = EstimatorTrainer()
    target_data = (
        partitions.validation
        if evaluation_partition == "validation"
        else partitions.test
    )
    entries: list[ModelComparisonEntry] = []
    for model_config in selected_configs:
        model = selected_factory.create(model_config)
        if not isinstance(
            model,
            (
                LogisticRegressionModel,
                DecisionTreeModel,
                RandomForestModel,
                XGBoostModel,
            ),
        ):
            raise ModelComparisonError(
                f"Model {model_config.name!r} is not a supported comparison model."
            )
        training_config = ModelConfig(
            name=model_config.name,
            hyperparameters={
                **model_config.hyperparameters,
                "random_state": model_config.hyperparameters.get(
                    "random_state",
                    random_seed,
                ),
            },
        )
        model_training_config = ModelTrainingConfig(
            model=training_config,
            random_seed=random_seed,
            target_column=partitions.train.label_name,
        )
        start = time.perf_counter()
        trainer.train(model, partitions.train, model_training_config)
        training_seconds = time.perf_counter() - start

        start = time.perf_counter()
        model.predict(target_data)
        prediction_seconds = time.perf_counter() - start
        classification_metrics = evaluator.evaluate_classification(model, target_data)
        model_size = _serialized_size(model)
        entries.append(
            ModelComparisonEntry(
                model_name=model_config.name,
                configuration=_model_configuration(model, training_config),
                metrics=_metric_values(classification_metrics),
                training_time_seconds=training_seconds,
                prediction_time_seconds=prediction_seconds,
                model_size_bytes=model_size,
                parameter_count=_parameter_count(model),
            )
        )

    ranked = rank_models(entries, RankingConfig(primary_metric=primary_metric))
    ranked_entries = tuple(
        replace(cast("ModelComparisonEntry", entry), rank=index)
        for index, entry in enumerate(ranked, start=1)
    )
    best_model = ranked_entries[0].model_name
    output_directory.mkdir(parents=True, exist_ok=True)
    json_path = output_directory / "model_comparison.json"
    csv_path = output_directory / "model_comparison.csv"
    markdown_path = output_directory / "model_comparison.md"
    chart_path = output_directory / "model_comparison.png" if generate_chart else None
    result = ModelComparisonResult(
        primary_metric=primary_metric,
        evaluation_partition=evaluation_partition,
        entries=ranked_entries,
        best_model=best_model,
        json_path=json_path,
        csv_path=csv_path,
        markdown_path=markdown_path,
    )
    if chart_path is not None and _write_chart(ranked_entries, chart_path):
        result = replace(result, chart_path=chart_path)
    _write_reports(result)
    logger.info(
        "Model comparison completed: models=%d, primary_metric=%s, best=%s",
        len(result.entries),
        primary_metric,
        result.best_model,
    )
    return result


def _default_model_configs() -> tuple[ModelConfig, ...]:
    """Return all currently implemented classifiers in stable registry order."""
    return (
        ModelConfig(name="LogisticRegression"),
        ModelConfig(name="DecisionTree"),
        ModelConfig(name="RandomForest", hyperparameters={"n_jobs": 1}),
        ModelConfig(name="XGBoost", hyperparameters={"n_jobs": 1}),
    )


def _validate_comparison_request(
    partitions: PreprocessedSplitResult,
    model_configs: tuple[ModelConfig, ...],
    primary_metric: RankingMetric,
    evaluation_partition: EvaluationPartition,
) -> None:
    """Validate shared data schema and unique supported model selection."""
    RankingConfig(primary_metric=primary_metric)
    if evaluation_partition not in {"validation", "test"}:
        raise ModelComparisonError(
            "evaluation_partition must be 'validation' or 'test'."
        )
    feature_names = partitions.train.feature_names
    target_name = partitions.train.label_name
    if not feature_names or target_name is None:
        raise ModelComparisonError(
            "Comparison data must have features and a target label column."
        )
    for name, dataset in (
        ("validation", partitions.validation),
        ("test", partitions.test),
    ):
        if dataset.feature_names != feature_names or dataset.label_name != target_name:
            raise ModelComparisonError(
                f"{name} data must use the training feature and target schema."
            )
        if not dataset.records or any(
            record.label is None for record in dataset.records
        ):
            raise ModelComparisonError(
                f"{name} data must contain rows with target labels."
            )
    if (
        partitions.metadata.feature_names
        and partitions.metadata.feature_names != feature_names
    ):
        raise ModelComparisonError(
            "Preprocessing metadata feature schema does not match training data."
        )
    names = tuple(config.name for config in model_configs)
    if not names:
        raise ModelComparisonError(
            "At least one model must be selected for comparison."
        )
    if len(set(names)) != len(names):
        raise ModelComparisonError("Each model may only be compared once.")
    supported: tuple[ModelName, ...] = (
        "LogisticRegression",
        "DecisionTree",
        "RandomForest",
        "XGBoost",
    )
    unsupported = set(names) - set(supported)
    if unsupported:
        raise ModelComparisonError(
            f"Unsupported comparison models: {', '.join(sorted(unsupported))}."
        )


def _model_configuration(
    model: SupportedComparisonModel,
    training_config: ModelConfig,
) -> dict[str, object]:
    """Combine declared defaults with explicit parameters for the report."""
    configuration = cast("dict[str, object]", asdict(model.config))
    configuration.update(training_config.hyperparameters)
    if isinstance(model, XGBoostModel):
        configuration["resolved_objective"] = model.objective
        configuration["xgboost_version"] = model.xgboost_version
    return configuration


def _metric_values(metrics: ClassificationMetrics) -> dict[str, float | None]:
    """Return only the requested comparable scalar classification metrics."""
    values = {
        "accuracy": metrics.accuracy,
        "precision": metrics.precision,
        "recall": metrics.recall,
        "f1_score": metrics.f1_score,
        "roc_auc": metrics.roc_auc,
        "pr_auc": metrics.pr_auc,
        "log_loss": metrics.log_loss,
    }
    return {name: _finite_or_none(value) for name, value in values.items()}


def _finite_or_none(value: float | None) -> float | None:
    """Convert non-finite metric outputs to JSON-safe null values."""
    return value if value is not None and math.isfinite(value) else None


def _serialized_size(model: Model) -> int:
    """Measure the size of the joblib serialization without writing an artifact."""
    buffer = io.BytesIO()
    joblib.dump(model, buffer, compress=0)
    return buffer.tell()


def _parameter_count(model: SupportedComparisonModel) -> int | None:
    """Return the number of learned scalar model parameters when supported."""
    return model.parameter_count


def _write_reports(result: ModelComparisonResult) -> None:
    """Write deterministic JSON, CSV, and Markdown comparison reports."""
    payload: dict[str, object] = {
        "primary_metric": result.primary_metric,
        "evaluation_partition": result.evaluation_partition,
        "best_model": result.best_model,
        "chart_path": (
            str(result.chart_path) if result.chart_path is not None else None
        ),
        "models": [
            {
                "rank": entry.rank,
                "model_name": entry.model_name,
                "configuration": entry.configuration,
                "metrics": entry.metrics,
                "training_time_seconds": entry.training_time_seconds,
                "prediction_time_seconds": entry.prediction_time_seconds,
                "model_size_bytes": entry.model_size_bytes,
                "parameter_count": entry.parameter_count,
            }
            for entry in result.entries
        ],
    }
    try:
        result.json_path.write_text(
            json.dumps(
                payload, ensure_ascii=False, allow_nan=False, sort_keys=True, indent=2
            )
            + "\n",
            encoding="utf-8",
            newline="",
        )
        _write_csv(result)
        result.markdown_path.write_text(
            _markdown_report(result),
            encoding="utf-8",
            newline="",
        )
    except (OSError, TypeError, ValueError, csv.Error) as exc:
        raise ModelComparisonError(
            f"Unable to write comparison reports: {exc}"
        ) from exc


def _write_csv(result: ModelComparisonResult) -> None:
    """Write a tabular CSV report with configuration and metric columns."""
    with result.csv_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=(
                "rank",
                "model_name",
                "selected_best",
                "configuration",
                *_METRIC_NAMES,
                "training_time_seconds",
                "prediction_time_seconds",
                "model_size_bytes",
                "parameter_count",
            ),
        )
        writer.writeheader()
        for entry in result.entries:
            writer.writerow(
                {
                    "rank": entry.rank,
                    "model_name": entry.model_name,
                    "selected_best": entry.rank == 1,
                    "configuration": json.dumps(
                        entry.configuration,
                        ensure_ascii=False,
                        sort_keys=True,
                    ),
                    **entry.metrics,
                    "training_time_seconds": entry.training_time_seconds,
                    "prediction_time_seconds": entry.prediction_time_seconds,
                    "model_size_bytes": entry.model_size_bytes,
                    "parameter_count": entry.parameter_count,
                }
            )


def _markdown_report(result: ModelComparisonResult) -> str:
    """Render a human-readable summary table and selected model."""
    headers = (
        "Rank",
        "Model",
        *_METRIC_NAMES,
        "Training (s)",
        "Prediction (s)",
        "Model size (bytes)",
        "Parameters",
    )
    lines = [
        "# Model Comparison",
        "",
        f"- **Evaluation partition:** {result.evaluation_partition}",
        f"- **Primary ranking metric:** {result.primary_metric}",
        f"- **Selected best model:** {result.best_model}",
        "",
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for entry in result.entries:
        cells = (
            str(entry.rank),
            entry.model_name,
            *(_format_value(entry.metrics[name]) for name in _METRIC_NAMES),
            f"{entry.training_time_seconds:.6f}",
            f"{entry.prediction_time_seconds:.6f}",
            str(entry.model_size_bytes),
            _format_value(entry.parameter_count),
        )
        lines.append("| " + " | ".join(cells) + " |")
    lines.extend(["", "## Configurations", ""])
    for entry in result.entries:
        lines.extend(
            [
                f"### {entry.rank}. {entry.model_name}",
                "",
                "```json",
                json.dumps(
                    entry.configuration, ensure_ascii=False, sort_keys=True, indent=2
                ),
                "```",
                "",
            ]
        )
    return "\n".join(lines)


def _format_value(value: object) -> str:
    """Format optional numeric report values consistently."""
    if value is None:
        return "—"
    if isinstance(value, float):
        return f"{value:.6f}"
    return str(value)


def _write_chart(
    entries: tuple[ModelComparisonEntry, ...],
    destination: Path,
) -> bool:
    """Write an optional metric chart, returning false when Matplotlib is absent."""
    try:
        matplotlib = importlib.import_module("matplotlib")
    except ImportError:
        logger.info("Skipping model comparison chart: Matplotlib is not installed.")
        return False
    matplotlib.use("Agg")
    pyplot = importlib.import_module("matplotlib.pyplot")
    names = [entry.model_name for entry in entries]
    scores = [entry.metrics["f1_score"] or 0.0 for entry in entries]
    figure, axis = pyplot.subplots(figsize=(8, 4))
    axis.bar(names, scores)
    axis.set_title("Model Comparison — F1 Score")
    axis.set_ylabel("F1 score")
    axis.set_ylim(0, 1)
    figure.tight_layout()
    figure.savefig(destination)
    pyplot.close(figure)
    return True
