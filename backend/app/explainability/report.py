"""Serialize SHAP explanations and assemble reproducibility reports."""

import csv
import hashlib
import json
import logging
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import cast

from app.core.constants import APP_LOGGER_NAME
from app.explainability.exceptions import ExplainabilityError
from app.explainability.schemas import (
    ExplainabilityResult,
    GlobalExplanation,
    LocalExplanation,
)
from app.explainability.visualization import generate_visualizations

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.explainability")


@dataclass(frozen=True, slots=True)
class ExplainabilityArtifact:
    """Describe one generated artifact and its integrity metadata."""

    path: Path
    sha256: str
    size_bytes: int
    timestamp: str


@dataclass(frozen=True, slots=True)
class ExplainabilityReportResult:
    """Return generated report paths and manifest artifact records."""

    output_directory: Path
    json_path: Path
    csv_path: Path
    markdown_path: Path
    summary_path: Path
    manifest_path: Path
    visualization_paths: tuple[Path, ...]
    artifacts: tuple[ExplainabilityArtifact, ...]


def generate_reports(
    shap_result: ExplainabilityResult,
    global_explanation: GlobalExplanation,
    output_directory: Path,
    local_explanation: LocalExplanation | None = None,
) -> ExplainabilityReportResult:
    """Generate machine-readable, human-readable, visual, and manifest files."""
    _validate_report_inputs(shap_result, global_explanation, local_explanation)
    output_directory.mkdir(parents=True, exist_ok=True)
    paths = {
        "json": output_directory / "shap_report.json",
        "csv": output_directory / "shap_report.csv",
        "markdown": output_directory / "shap_report.md",
        "summary": output_directory / "explainability_summary.md",
        "manifest": output_directory / "explainability_manifest.json",
    }

    visualizations = generate_visualizations(
        shap_result,
        global_explanation,
        output_directory,
        local_explanation,
    )
    report_artifact_paths = (
        paths["json"],
        paths["csv"],
        paths["markdown"],
        paths["summary"],
        *visualizations,
    )
    displayed_artifact_paths = (*report_artifact_paths, paths["manifest"])
    payload = _report_payload(
        shap_result,
        global_explanation,
        local_explanation,
        displayed_artifact_paths,
        output_directory,
    )
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
        _write_csv(paths["csv"], shap_result)
        paths["markdown"].write_text(
            _render_markdown(payload),
            encoding="utf-8",
            newline="",
        )
        paths["summary"].write_text(
            _render_summary(
                shap_result,
                global_explanation,
                local_explanation,
                displayed_artifact_paths,
            ),
            encoding="utf-8",
            newline="",
        )
        artifacts = tuple(
            _artifact(path) for path in sorted(report_artifact_paths, key=str)
        )
        manifest = {
            "model_type": shap_result.metadata.model_type,
            "explainer_type": shap_result.metadata.explainer_type,
            "shap_version": shap_result.metadata.shap_version,
            "output_directory": str(output_directory.resolve()),
            "generated_at": datetime.now(UTC).isoformat(),
            "manifest_self_hash_excluded": True,
            "artifacts": [
                {
                    "path": str(artifact.path),
                    "sha256": artifact.sha256,
                    "size_bytes": artifact.size_bytes,
                    "timestamp": artifact.timestamp,
                }
                for artifact in artifacts
            ],
        }
        paths["manifest"].write_text(
            json.dumps(
                manifest,
                ensure_ascii=False,
                allow_nan=False,
                sort_keys=True,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
            newline="",
        )
    except (OSError, TypeError, ValueError, csv.Error) as exc:
        raise ExplainabilityError(f"Unable to generate SHAP reports: {exc}") from exc

    logger.info(
        "SHAP reports generated: model=%s, artifacts=%d, output=%s",
        shap_result.metadata.model_type,
        len(artifacts),
        output_directory,
    )
    return ExplainabilityReportResult(
        output_directory=output_directory,
        json_path=paths["json"],
        csv_path=paths["csv"],
        markdown_path=paths["markdown"],
        summary_path=paths["summary"],
        manifest_path=paths["manifest"],
        visualization_paths=visualizations,
        artifacts=artifacts,
    )


def _validate_report_inputs(
    shap_result: ExplainabilityResult,
    global_explanation: GlobalExplanation,
    local_explanation: LocalExplanation | None,
) -> None:
    """Reject mismatched models or feature schemas before writing artifacts."""
    if global_explanation.model_name != shap_result.metadata.model_type:
        raise ExplainabilityError("Global explanation model does not match SHAP data.")
    if global_explanation.explainer != "SHAP":
        raise ExplainabilityError("Global explanation must use SHAP.")
    global_names = tuple(
        item.feature_name for item in global_explanation.feature_importance
    )
    if global_names and set(global_names) != set(shap_result.feature_names):
        raise ExplainabilityError(
            "Global importance feature schema does not match SHAP values."
        )
    if len(shap_result.shap_values) != shap_result.metadata.sample_count:
        raise ExplainabilityError("SHAP sample count does not match its metadata.")
    if local_explanation is not None:
        if local_explanation.model_name != shap_result.metadata.model_type:
            raise ExplainabilityError(
                "Local explanation model does not match SHAP data."
            )
        if {
            item.feature_name for item in local_explanation.feature_contributions
        } != set(shap_result.feature_names):
            raise ExplainabilityError(
                "Local explanation feature schema does not match SHAP values."
            )


def _report_payload(
    shap_result: ExplainabilityResult,
    global_explanation: GlobalExplanation,
    local_explanation: LocalExplanation | None,
    artifact_paths: tuple[Path, ...],
    output_directory: Path,
) -> dict[str, object]:
    """Build the complete JSON-serializable SHAP report payload."""
    return {
        "model_type": shap_result.metadata.model_type,
        "explainer": "SHAP",
        "dataset": {
            "sample_count": shap_result.metadata.sample_count,
            "feature_count": shap_result.metadata.feature_count,
            "feature_names": shap_result.feature_names,
        },
        "shap": {
            "values": shap_result.shap_values,
            "expected_values": shap_result.expected_values,
            "metadata": _metadata_dict(shap_result),
        },
        "global_feature_importance": [
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
            for item in global_explanation.feature_importance
        ],
        "local_explanation": _local_dict(local_explanation),
        "output_directory": str(output_directory.resolve()),
        "generated_artifacts": [str(path) for path in artifact_paths],
        "generated_at": datetime.now(UTC).isoformat(),
    }


def _metadata_dict(shap_result: ExplainabilityResult) -> dict[str, object]:
    """Serialize SHAP run metadata."""
    metadata = shap_result.metadata
    return {
        "explainer_type": metadata.explainer_type,
        "shap_version": metadata.shap_version,
        "model_type": metadata.model_type,
        "feature_count": metadata.feature_count,
        "sample_count": metadata.sample_count,
        "execution_time_seconds": metadata.execution_time_seconds,
        "timestamp": metadata.timestamp,
    }


def _local_dict(
    explanation: LocalExplanation | None,
) -> dict[str, object] | None:
    """Serialize an optional local explanation."""
    if explanation is None:
        return None
    return {
        "sample_index": explanation.sample_index,
        "subject_id": explanation.subject_id,
        "predicted_class": explanation.prediction,
        "prediction_probability": explanation.prediction_probability,
        "expected_value": explanation.baseline_value,
        "feature_contributions": [
            {
                "rank": item.rank,
                "feature_name": item.feature_name,
                "feature_value": item.feature_value,
                "contribution": item.contribution,
            }
            for item in explanation.feature_contributions
        ],
        "metadata": dict(explanation.metadata),
    }


def _write_csv(path: Path, shap_result: ExplainabilityResult) -> None:
    """Write one CSV row for every sample, feature, and model output."""
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=(
                "sample_index",
                "feature_name",
                "output_index",
                "shap_value",
                "expected_value",
            ),
        )
        writer.writeheader()
        for sample_index, sample in enumerate(shap_result.shap_values):
            for feature_name, outputs in zip(
                shap_result.feature_names,
                sample,
                strict=True,
            ):
                for output_index, value in enumerate(outputs):
                    writer.writerow(
                        {
                            "sample_index": sample_index,
                            "feature_name": feature_name,
                            "output_index": output_index,
                            "shap_value": value,
                            "expected_value": shap_result.expected_values[
                                min(output_index, len(shap_result.expected_values) - 1)
                            ],
                        }
                    )


def _render_markdown(payload: dict[str, object]) -> str:
    """Render a readable SHAP report with feature and local summaries."""
    global_features = cast(
        "list[dict[str, object]]",
        payload["global_feature_importance"],
    )
    lines = [
        "# SHAP Report",
        "",
        f"- **Model:** {payload['model_type']}",
        f"- **Explainer:** {payload['explainer']}",
        f"- **Dataset:** {payload['dataset']}",
        "",
        "## Global Feature Importance",
        "",
        "| Rank | Feature | Mean absolute SHAP | Contribution (%) |",
        "| --- | --- | --- | --- |",
    ]
    for item in global_features:
        lines.append(
            "| "
            + " | ".join(
                (
                    str(item["rank"]),
                    str(item["feature_name"]),
                    str(item["mean_absolute_shap_value"]),
                    str(item["percentage_contribution"]),
                )
            )
            + " |"
        )
    local = cast("dict[str, object] | None", payload["local_explanation"])
    lines.extend(["", "## Example Local Explanation", ""])
    if local is None:
        lines.append("No local explanation was supplied.")
    else:
        lines.extend(
            [
                f"- **Sample:** {local['sample_index']}",
                f"- **Predicted class:** {local['predicted_class']}",
                f"- **Probability:** {local['prediction_probability']}",
            ]
        )
    lines.extend(["", "## Generated Artifacts", ""])
    lines.extend(
        f"- `{path}`" for path in cast("list[str]", payload["generated_artifacts"])
    )
    lines.extend(["", f"- **Generated at:** {payload['generated_at']}", ""])
    return "\n".join(lines)


def _render_summary(
    shap_result: ExplainabilityResult,
    global_explanation: GlobalExplanation,
    local_explanation: LocalExplanation | None,
    artifact_paths: tuple[Path, ...],
) -> str:
    """Summarize model, dataset, highest-ranked features, and generated files."""
    top_features = global_explanation.feature_importance[:10]
    lines = [
        "# Explainability Summary",
        "",
        f"- **Model:** {shap_result.metadata.model_type}",
        f"- **Explainer:** {shap_result.metadata.explainer_type}",
        f"- **SHAP version:** {shap_result.metadata.shap_version}",
        (
            f"- **Dataset:** {shap_result.metadata.sample_count} samples, "
            f"{shap_result.metadata.feature_count} features"
        ),
        f"- **SHAP generated at:** {shap_result.metadata.timestamp}",
        "",
        "## Top Global Features",
        "",
        "| Rank | Feature | Mean absolute SHAP | Contribution (%) |",
        "| --- | --- | --- | --- |",
    ]
    lines.extend(
        "| "
        + " | ".join(
            (
                str(item.rank),
                item.feature_name,
                f"{item.mean_absolute_shap_value:.10g}",
                f"{item.percentage_contribution:.10g}",
            )
        )
        + " |"
        for item in top_features
    )
    lines.extend(["", "## Example Local Explanation", ""])
    if local_explanation is None:
        lines.append("No local explanation was supplied.")
    else:
        lines.extend(
            [
                f"- **Sample:** {local_explanation.sample_index}",
                f"- **Subject:** {local_explanation.subject_id}",
                f"- **Predicted class:** {local_explanation.prediction}",
                f"- **Probability:** {local_explanation.prediction_probability}",
            ]
        )
    lines.extend(["", "## Generated Artifacts", ""])
    lines.extend(f"- `{path}`" for path in artifact_paths)
    lines.extend(
        [
            "",
            f"- **Summary generated at:** {datetime.now(UTC).isoformat()}",
            "",
        ]
    )
    return "\n".join(lines)


def _artifact(path: Path) -> ExplainabilityArtifact:
    """Compute integrity and size metadata for a generated artifact."""
    try:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        stat = path.stat()
    except OSError as exc:
        raise ExplainabilityError(
            f"Unable to inspect generated artifact {path}: {exc}"
        ) from exc
    return ExplainabilityArtifact(
        path=path,
        sha256=digest,
        size_bytes=stat.st_size,
        timestamp=datetime.fromtimestamp(stat.st_mtime, UTC).isoformat(),
    )
