"""SHAP integration for supported fitted classification model adapters."""

import csv
import importlib
import json
import logging
import time
from collections.abc import Callable, Sequence
from dataclasses import replace
from datetime import UTC, datetime
from pathlib import Path
from types import ModuleType
from typing import Protocol, cast

import numpy as np
from numpy.typing import NDArray

from app.core.constants import APP_LOGGER_NAME
from app.explainability.base import ExplanationGenerator
from app.explainability.exceptions import (
    ExplainabilityError,
    ExplainerDependencyError,
    ExplainerNotSupportedError,
)
from app.explainability.schemas import (
    ExplainabilityMetadata,
    ExplainabilityResult,
    ExplainerConfig,
    FeatureImportance,
    GlobalExplanation,
    GlobalFeatureContribution,
    LocalExplanation,
    LocalFeatureContribution,
)
from app.ml.schemas import DatasetMetadata, MLDataset, MLLabel, MLRecord
from app.models.base import Model
from app.models.classification_utils import feature_matrix, validate_dataset
from app.models.decision_tree import DecisionTreeModel
from app.models.logistic_regression import LogisticRegressionModel
from app.models.random_forest import RandomForestModel
from app.models.xgboost_model import XGBoostModel

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.explainability")


class _ProbabilityModel(Protocol):
    """Describe prediction members required from supported classifier adapters."""

    classes: tuple[MLLabel, ...]

    def predict_proba(self, dataset: MLDataset) -> tuple[tuple[float, ...], ...]: ...


class ShapExplainer(ExplanationGenerator):
    """Generate typed SHAP values for supported fitted model adapters."""

    def generate(
        self,
        model: Model,
        dataset: MLDataset,
        config: ExplainerConfig | None = None,
        *,
        background_dataset: MLDataset | None = None,
    ) -> ExplainabilityResult:
        """Calculate SHAP values and collect deterministic execution metadata."""
        del config
        explainer_type, estimator, model_type = _model_explainer(model)
        validate_dataset(dataset, require_labels=False)
        if estimator is None:
            raise ExplainabilityError(f"{model_type} has not been fitted.")
        values = feature_matrix(dataset)
        if dataset.feature_names != getattr(model, "feature_names", ()):
            raise ExplainabilityError(
                "Explanation feature names and order must match the fitted model."
            )
        background_values = values
        if background_dataset is not None:
            validate_dataset(background_dataset, require_labels=False)
            if background_dataset.feature_names != dataset.feature_names:
                raise ExplainabilityError(
                    "SHAP background features must match the explanation schema."
                )
            background_values = feature_matrix(background_dataset)

        logger.info(
            "SHAP explanation started: model=%s, explainer=%s, samples=%d",
            model_type,
            explainer_type,
            len(dataset.records),
        )
        started = time.perf_counter()
        shap_module = _load_shap()
        try:
            explanation = _create_explainer(
                shap_module,
                explainer_type,
                estimator,
                background_values,
            )
            calculate_values = getattr(explanation, "shap_values", None)
            if not callable(calculate_values):
                raise ExplainabilityError(
                    "The selected SHAP explainer does not expose shap_values()."
                )
            raw_values = calculate_values(values)
            raw_expected = getattr(explanation, "expected_value", None)
            shap_values = _normalize_shap_values(
                raw_values,
                sample_count=len(dataset.records),
                feature_count=len(dataset.feature_names),
            )
            expected_values = _normalize_expected_values(raw_expected)
            if len(expected_values) not in {1, len(shap_values[0][0])}:
                raise ExplainabilityError(
                    "SHAP expected values do not match the output dimensions."
                )
        except (TypeError, ValueError, RuntimeError) as exc:
            raise ExplainabilityError(
                f"Unable to calculate SHAP values for {model_type}: {exc}"
            ) from exc

        duration = time.perf_counter() - started
        version = getattr(shap_module, "__version__", "unknown")
        metadata = ExplainabilityMetadata(
            explainer_type=explainer_type,
            shap_version=version if isinstance(version, str) else "unknown",
            model_type=model_type,
            feature_count=len(dataset.feature_names),
            sample_count=len(dataset.records),
            execution_time_seconds=duration,
            timestamp=datetime.now(UTC).isoformat(),
        )
        result = ExplainabilityResult(
            shap_values=shap_values,
            expected_values=expected_values,
            feature_names=dataset.feature_names,
            metadata=metadata,
        )
        logger.info(
            "SHAP explanation completed: model=%s, samples=%d, seconds=%.6f",
            model_type,
            metadata.sample_count,
            duration,
        )
        return result

    def explain_global(
        self,
        model: Model,
        dataset: MLDataset,
        config: ExplainerConfig,
    ) -> GlobalExplanation:
        """Return global feature statistics without writing report files."""
        return self.global_importance(model, dataset, config)

    def global_importance(
        self,
        model: Model,
        dataset: MLDataset,
        config: ExplainerConfig | None = None,
        output_directory: Path | None = None,
    ) -> GlobalExplanation:
        """Aggregate SHAP values and optionally write structured reports."""
        result = self.generate(model, dataset, config)
        matrix = np.asarray(result.shap_values, dtype=np.float64)
        feature_rows: list[tuple[str, float, float, float, int, int]] = []
        for index, name in enumerate(result.feature_names):
            values = matrix[:, index, :].reshape(-1)
            feature_rows.append(
                (
                    name,
                    float(np.mean(np.abs(values))),
                    float(np.mean(values)),
                    float(np.std(values)),
                    int(np.count_nonzero(values > 0)),
                    int(np.count_nonzero(values < 0)),
                )
            )

        total_importance = sum(row[1] for row in feature_rows)
        ordered_rows = sorted(feature_rows, key=lambda row: (-row[1], row[0]))
        importance = tuple(
            FeatureImportance(
                rank=rank,
                feature_name=name,
                mean_absolute_shap_value=mean_absolute,
                mean_shap_value=mean,
                standard_deviation=standard_deviation,
                percentage_contribution=(
                    100.0 * mean_absolute / total_importance
                    if total_importance > 0
                    else 100.0 / len(feature_rows)
                ),
                positive_contribution_count=positive_count,
                negative_contribution_count=negative_count,
            )
            for rank, (
                name,
                mean_absolute,
                mean,
                standard_deviation,
                positive_count,
                negative_count,
            ) in enumerate(ordered_rows, start=1)
        )
        metadata = _metadata_mapping(result.metadata)
        explanation = GlobalExplanation(
            model_name=result.metadata.model_type,
            explainer="SHAP",
            feature_contributions=tuple(
                GlobalFeatureContribution(
                    feature_name=name,
                    mean_absolute_contribution=mean_absolute,
                )
                for name, mean_absolute, *_ in feature_rows
            ),
            explained_row_count=result.metadata.sample_count,
            metadata=metadata,
            feature_importance=importance,
        )
        if output_directory is not None:
            report_paths = _write_global_importance_reports(
                explanation,
                output_directory,
            )
            explanation = replace(
                explanation,
                metadata={**explanation.metadata, "reports": report_paths},
            )
        return explanation

    def explain_local(
        self,
        model: Model,
        dataset: MLDataset,
        subject_id: str,
        config: ExplainerConfig,
    ) -> LocalExplanation:
        """Return the contribution row matching a subject identifier."""
        row_indices = tuple(
            index
            for index, record in enumerate(dataset.records)
            if record.subject_id == subject_id
        )
        if len(row_indices) != 1:
            raise ExplainabilityError(
                f"Expected exactly one row for subject {subject_id!r}; "
                f"found {len(row_indices)}."
            )
        return self.local_explanation(
            model,
            feature_matrix(dataset),
            row_indices[0],
            feature_names=dataset.feature_names,
            config=config,
            subject_id=subject_id,
        )

    def local_explanation(
        self,
        model: Model,
        encoded_feature_matrix: Sequence[Sequence[float]] | NDArray[np.float64],
        sample_index: int,
        *,
        feature_names: tuple[str, ...] | None = None,
        config: ExplainerConfig | None = None,
        output_directory: Path | None = None,
        subject_id: str | None = None,
    ) -> LocalExplanation:
        """Explain one encoded row, ranked by absolute class-specific SHAP."""
        names = feature_names or _model_feature_names(model)
        matrix = _validate_encoded_matrix(encoded_feature_matrix, names)
        if isinstance(sample_index, bool) or not isinstance(sample_index, int):
            raise ExplainabilityError("sample_index must be an integer.")
        if not 0 <= sample_index < matrix.shape[0]:
            raise ExplainabilityError(
                f"sample_index {sample_index} is out of range for "
                f"{matrix.shape[0]} samples."
            )

        dataset = _matrix_dataset(matrix, names, prefix="sample")
        selected_dataset = _matrix_dataset(
            matrix[sample_index : sample_index + 1],
            names,
            prefix="sample",
            id_offset=sample_index,
        )
        result = self.generate(
            model,
            selected_dataset,
            config,
            background_dataset=dataset,
        )
        prediction = model.predict(selected_dataset).predictions[0]
        probability_model = cast("_ProbabilityModel", model)
        probabilities = probability_model.predict_proba(selected_dataset)
        if not probabilities or not probabilities[0]:
            raise ExplainabilityError("Model returned no prediction probabilities.")
        class_labels = _model_classes(model)
        try:
            class_index = class_labels.index(prediction)
        except ValueError as exc:
            raise ExplainabilityError(
                "Predicted class is missing from the fitted model's class labels."
            ) from exc
        if class_index >= len(probabilities[0]):
            raise ExplainabilityError(
                "Prediction probability columns do not match model classes."
            )
        prediction_probability = float(probabilities[0][class_index])
        if not np.isfinite(prediction_probability) or not (
            0.0 <= prediction_probability <= 1.0
        ):
            raise ExplainabilityError("Model returned an invalid class probability.")
        contributions = result.shap_values[0]
        output_index = class_index if len(result.expected_values) > 1 else 0
        if any(output_index >= len(feature_values) for feature_values in contributions):
            raise ExplainabilityError(
                "SHAP output columns do not match predicted class."
            )
        expected_value = result.expected_values[
            output_index if len(result.expected_values) > 1 else 0
        ]
        ranked = sorted(
            (
                (
                    name,
                    float(feature_values[output_index]),
                    float(matrix[sample_index, index]),
                )
                for index, (name, feature_values) in enumerate(
                    zip(names, contributions, strict=True)
                )
            ),
            key=lambda item: (-abs(item[1]), item[0]),
        )
        metadata = {
            **_metadata_mapping(result.metadata),
            "sample_index": sample_index,
            "predicted_class": prediction,
            "prediction_probability": prediction_probability,
            "expected_value": expected_value,
        }
        explanation = LocalExplanation(
            model_name=result.metadata.model_type,
            explainer="SHAP",
            subject_id=subject_id or f"sample-{sample_index}",
            prediction=prediction,
            baseline_value=expected_value,
            feature_contributions=tuple(
                LocalFeatureContribution(
                    feature_name=name,
                    contribution=contribution,
                    feature_value=value,
                    rank=rank,
                )
                for rank, (name, contribution, value) in enumerate(ranked, start=1)
            ),
            metadata=metadata,
            sample_index=sample_index,
            prediction_probability=prediction_probability,
        )
        if output_directory is not None:
            report_paths = _write_local_explanation_reports(
                explanation,
                output_directory,
            )
            explanation = replace(
                explanation,
                metadata={**explanation.metadata, "reports": report_paths},
            )
        return explanation


def _model_explainer(model: Model) -> tuple[str, object | None, str]:
    """Select an estimator only for the four supported model adapter types."""
    if isinstance(model, LogisticRegressionModel):
        return "LinearExplainer", model.shap_estimator, model.model_name
    if isinstance(model, DecisionTreeModel):
        return "TreeExplainer", model.shap_estimator, model.model_name
    if isinstance(model, RandomForestModel):
        return "TreeExplainer", model.shap_estimator, model.model_name
    if isinstance(model, XGBoostModel):
        return "TreeExplainer", model.shap_estimator, model.model_name
    raise ExplainerNotSupportedError(
        f"SHAP explanations are not supported for {type(model).__name__}."
    )


def _load_shap() -> ModuleType:
    """Load the optional SHAP package or raise an actionable dependency error."""
    try:
        return importlib.import_module("shap")
    except ImportError as exc:
        raise ExplainerDependencyError(
            "SHAP support requires the optional dependency. Install it with "
            '`pip install -e ".[shap]"` from the backend directory.'
        ) from exc


def _create_explainer(
    shap_module: ModuleType,
    explainer_type: str,
    estimator: object,
    values: NDArray[np.float64],
) -> object:
    """Construct the selected official SHAP explainer with model background."""
    constructor = getattr(shap_module, explainer_type, None)
    if not callable(constructor):
        raise ExplainabilityError(
            f"The installed SHAP package does not provide {explainer_type}."
        )
    typed_constructor = cast(
        "Callable[..., object]",
        constructor,
    )
    if explainer_type == "LinearExplainer":
        return typed_constructor(estimator, values)
    return typed_constructor(estimator)


def _validate_encoded_matrix(
    values: Sequence[Sequence[float]] | NDArray[np.float64],
    feature_names: tuple[str, ...],
) -> NDArray[np.float64]:
    """Validate a non-empty, finite encoded matrix and fitted feature schema."""
    if not feature_names:
        raise ExplainabilityError("The fitted model has no feature names.")
    try:
        matrix = np.asarray(values, dtype=np.float64)
    except (TypeError, ValueError) as exc:
        raise ExplainabilityError(
            "Encoded feature matrix must contain numeric values."
        ) from exc
    if matrix.ndim != 2 or matrix.shape[0] == 0:
        raise ExplainabilityError(
            "Encoded feature matrix must be a non-empty two-dimensional matrix."
        )
    if matrix.shape[1] != len(feature_names):
        raise ExplainabilityError(
            "Encoded feature matrix column count does not match model features."
        )
    if not np.all(np.isfinite(matrix)):
        raise ExplainabilityError(
            "Encoded feature matrix values must be finite numbers."
        )
    return matrix


def _matrix_dataset(
    matrix: NDArray[np.float64],
    feature_names: tuple[str, ...],
    *,
    prefix: str,
    id_offset: int = 0,
) -> MLDataset:
    """Adapt encoded rows to the existing model prediction and SHAP contracts."""
    records = tuple(
        MLRecord(
            subject_id=f"{prefix}-{index + id_offset}",
            values=tuple(float(value) for value in row),
        )
        for index, row in enumerate(matrix)
    )
    return MLDataset(
        feature_names=feature_names,
        records=records,
        metadata=DatasetMetadata(
            row_count=len(records),
            column_count=len(feature_names),
            column_names=feature_names,
            feature_names=feature_names,
        ),
    )


def _model_feature_names(model: Model) -> tuple[str, ...]:
    """Return fitted feature names exposed by a supported adapter."""
    names = getattr(model, "feature_names", None)
    if not isinstance(names, tuple) or not all(isinstance(name, str) for name in names):
        raise ExplainabilityError(
            "The supported fitted model must expose feature_names."
        )
    return names


def _model_classes(model: Model) -> tuple[object, ...]:
    """Return the fitted class order used by model probability columns."""
    classes = cast("_ProbabilityModel", model).classes
    if not classes:
        raise ExplainabilityError(
            "The supported fitted model must expose fitted class labels."
        )
    return classes


def _normalize_shap_values(
    raw_values: object,
    *,
    sample_count: int,
    feature_count: int,
) -> tuple[tuple[tuple[float, ...], ...], ...]:
    """Normalize SHAP outputs to sample × feature × model-output ordering."""
    if isinstance(raw_values, (list, tuple)):
        output_arrays = tuple(
            np.asarray(values, dtype=np.float64) for values in raw_values
        )
        if not output_arrays or any(
            values.shape != (sample_count, feature_count) for values in output_arrays
        ):
            raise ExplainabilityError("SHAP returned an unsupported list shape.")
        array = np.stack(output_arrays, axis=-1)
    else:
        array = np.asarray(raw_values, dtype=np.float64)
        if array.ndim == 2:
            if array.shape != (sample_count, feature_count):
                raise ExplainabilityError("SHAP returned an unsupported array shape.")
            array = array[:, :, np.newaxis]
        elif array.ndim == 3:
            if array.shape[:2] == (sample_count, feature_count):
                pass
            elif array.shape[1:] == (sample_count, feature_count):
                array = np.transpose(array, (1, 2, 0))
            else:
                raise ExplainabilityError("SHAP returned an unsupported array shape.")
        else:
            raise ExplainabilityError("SHAP values must have two or three dimensions.")

    if not np.all(np.isfinite(array)):
        raise ExplainabilityError("SHAP values contain non-finite numbers.")
    return tuple(
        tuple(
            tuple(float(value) for value in feature_outputs)
            for feature_outputs in sample
        )
        for sample in array
    )


def _normalize_expected_values(raw_values: object) -> tuple[float, ...]:
    """Convert scalar or class-wise SHAP expected values into a finite tuple."""
    if raw_values is None:
        raise ExplainabilityError("SHAP did not provide expected values.")
    values = np.asarray(raw_values, dtype=np.float64).reshape(-1)
    if values.size == 0 or not np.all(np.isfinite(values)):
        raise ExplainabilityError("SHAP expected values must be finite and non-empty.")
    return tuple(float(value) for value in values)


def _metadata_mapping(metadata: ExplainabilityMetadata) -> dict[str, object]:
    """Return execution metadata in the generic explanation schema form."""
    return {
        "explainer_type": metadata.explainer_type,
        "shap_version": metadata.shap_version,
        "model_type": metadata.model_type,
        "feature_count": metadata.feature_count,
        "sample_count": metadata.sample_count,
        "execution_time_seconds": metadata.execution_time_seconds,
        "timestamp": metadata.timestamp,
    }


def _write_global_importance_reports(
    explanation: GlobalExplanation,
    output_directory: Path,
) -> dict[str, str]:
    """Write JSON, CSV, and Markdown global importance reports."""
    output_directory.mkdir(parents=True, exist_ok=True)
    paths = {
        "json": output_directory / "global_feature_importance.json",
        "csv": output_directory / "global_feature_importance.csv",
        "markdown": output_directory / "global_feature_importance.md",
    }
    report_metadata = {
        **explanation.metadata,
        "reports": {name: str(path) for name, path in paths.items()},
    }
    try:
        payload: dict[str, object] = {
            "model_name": explanation.model_name,
            "explainer": explanation.explainer,
            "explained_row_count": explanation.explained_row_count,
            "metadata": report_metadata,
            "features": [
                {
                    "rank": item.rank,
                    "feature_name": item.feature_name,
                    "mean_absolute_shap_value": item.mean_absolute_shap_value,
                    "mean_shap_value": item.mean_shap_value,
                    "standard_deviation": item.standard_deviation,
                    "percentage_contribution": item.percentage_contribution,
                    "positive_contribution_count": item.positive_contribution_count,
                    "negative_contribution_count": item.negative_contribution_count,
                }
                for item in explanation.feature_importance
            ],
        }
        paths["json"].write_text(
            json.dumps(
                payload,
                ensure_ascii=False,
                allow_nan=False,
                sort_keys=True,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
            newline="",
        )
        with paths["csv"].open("w", encoding="utf-8", newline="") as file:
            writer = csv.DictWriter(
                file,
                fieldnames=(
                    "rank",
                    "feature_name",
                    "mean_absolute_shap_value",
                    "mean_shap_value",
                    "standard_deviation",
                    "percentage_contribution",
                    "positive_contribution_count",
                    "negative_contribution_count",
                ),
            )
            writer.writeheader()
            writer.writerows(
                {
                    "rank": item.rank,
                    "feature_name": item.feature_name,
                    "mean_absolute_shap_value": item.mean_absolute_shap_value,
                    "mean_shap_value": item.mean_shap_value,
                    "standard_deviation": item.standard_deviation,
                    "percentage_contribution": item.percentage_contribution,
                    "positive_contribution_count": item.positive_contribution_count,
                    "negative_contribution_count": item.negative_contribution_count,
                }
                for item in explanation.feature_importance
            )
        paths["markdown"].write_text(
            _global_importance_markdown(explanation, report_metadata),
            encoding="utf-8",
            newline="",
        )
    except (OSError, ValueError, csv.Error) as exc:
        raise ExplainabilityError(
            f"Unable to write global feature importance reports: {exc}"
        ) from exc
    return {name: str(path) for name, path in paths.items()}


def _write_local_explanation_reports(
    explanation: LocalExplanation,
    output_directory: Path,
) -> dict[str, str]:
    """Write JSON and Markdown reports for one local explanation."""
    if explanation.sample_index is None:
        raise ExplainabilityError("Local explanation has no sample index.")
    output_directory.mkdir(parents=True, exist_ok=True)
    sample_name = str(explanation.sample_index)
    paths = {
        "json": output_directory / f"local_explanation_{sample_name}.json",
        "markdown": output_directory / f"local_explanation_{sample_name}.md",
    }
    metadata = {
        **explanation.metadata,
        "reports": {name: str(path) for name, path in paths.items()},
    }
    payload: dict[str, object] = {
        "sample_index": explanation.sample_index,
        "subject_id": explanation.subject_id,
        "model_name": explanation.model_name,
        "explainer": explanation.explainer,
        "predicted_class": explanation.prediction,
        "prediction_probability": explanation.prediction_probability,
        "expected_value": explanation.baseline_value,
        "metadata": metadata,
        "feature_contributions": [
            {
                "rank": item.rank,
                "feature_name": item.feature_name,
                "contribution": item.contribution,
                "absolute_contribution": abs(item.contribution),
                "feature_value": item.feature_value,
            }
            for item in explanation.feature_contributions
        ],
    }
    try:
        paths["json"].write_text(
            json.dumps(
                payload,
                ensure_ascii=False,
                allow_nan=False,
                sort_keys=True,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
            newline="",
        )
        lines = [
            f"# Local SHAP Explanation — Sample {sample_name}",
            "",
            f"- **Model:** {explanation.model_name}",
            f"- **Explainer:** {explanation.explainer}",
            f"- **Predicted class:** {explanation.prediction}",
            (
                f"- **Prediction probability:** "
                f"{_format_optional_float(explanation.prediction_probability)}"
            ),
            (
                f"- **Expected value:** "
                f"{_format_optional_float(explanation.baseline_value)}"
            ),
            "",
            "| Rank | Feature | Feature value | SHAP contribution |",
            "| --- | --- | --- | --- |",
        ]
        lines.extend(
            "| "
            + " | ".join(
                (
                    str(item.rank),
                    item.feature_name.replace("|", "\\|"),
                    str(item.feature_value).replace("|", "\\|"),
                    f"{item.contribution:.10g}",
                )
            )
            + " |"
            for item in explanation.feature_contributions
        )
        lines.extend(
            [
                "",
                "## Metadata",
                "",
                "```json",
                json.dumps(metadata, ensure_ascii=False, sort_keys=True, indent=2),
                "```",
                "",
            ]
        )
        paths["markdown"].write_text(
            "\n".join(lines),
            encoding="utf-8",
            newline="",
        )
    except (OSError, ValueError) as exc:
        raise ExplainabilityError(
            f"Unable to write local explanation reports: {exc}"
        ) from exc
    return {name: str(path) for name, path in paths.items()}


def _format_optional_float(value: float | None) -> str:
    """Format optional numeric explanation values for Markdown."""
    return "N/A" if value is None else f"{value:.10g}"


def _global_importance_markdown(
    explanation: GlobalExplanation,
    metadata: dict[str, object],
) -> str:
    """Render a ranked importance table and complete run metadata."""
    headers = (
        "Rank",
        "Feature",
        "Mean |SHAP|",
        "Mean SHAP",
        "Std Dev",
        "Contribution (%)",
        "Positive",
        "Negative",
    )
    lines = [
        "# Global SHAP Feature Importance",
        "",
        f"- **Model:** {explanation.model_name}",
        f"- **Explainer:** {explanation.explainer}",
        f"- **Samples explained:** {explanation.explained_row_count}",
        "",
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for item in explanation.feature_importance:
        cells = (
            str(item.rank),
            item.feature_name,
            f"{item.mean_absolute_shap_value:.10g}",
            f"{item.mean_shap_value:.10g}",
            f"{item.standard_deviation:.10g}",
            f"{item.percentage_contribution:.10g}",
            str(item.positive_contribution_count),
            str(item.negative_contribution_count),
        )
        lines.append("| " + " | ".join(cells) + " |")
    lines.extend(
        [
            "",
            "## Metadata",
            "",
            "```json",
            json.dumps(metadata, ensure_ascii=False, sort_keys=True, indent=2),
            "```",
            "",
        ]
    )
    return "\n".join(lines)
