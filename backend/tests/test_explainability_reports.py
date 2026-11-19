"""Tests for SHAP report serialization, manifests, and optional visuals."""

import csv
import hashlib
import importlib.util
import json
from datetime import UTC, datetime
from pathlib import Path
from types import ModuleType

import pytest

from app.explainability import (
    ExplainabilityError,
    ExplainabilityMetadata,
    ExplainabilityPipeline,
    ExplainabilityResult,
    FeatureImportance,
    GlobalExplanation,
    LocalExplanation,
    LocalFeatureContribution,
)


def _report_inputs() -> tuple[
    ExplainabilityResult,
    GlobalExplanation,
    LocalExplanation,
]:
    """Create typed binary SHAP values and matching global/local summaries."""
    timestamp = datetime.now(UTC).isoformat()
    shap_result = ExplainabilityResult(
        shap_values=(
            ((0.4, -0.4), (0.1, -0.1)),
            ((-0.2, 0.2), (0.3, -0.3)),
        ),
        expected_values=(0.5, 0.5),
        feature_names=("risk", "activity"),
        metadata=ExplainabilityMetadata(
            explainer_type="TreeExplainer",
            shap_version="0.49.1",
            model_type="DecisionTree",
            feature_count=2,
            sample_count=2,
            execution_time_seconds=0.125,
            timestamp=timestamp,
        ),
    )
    global_explanation = GlobalExplanation(
        model_name="DecisionTree",
        explainer="SHAP",
        feature_contributions=(
            # The global explanations and ranked importances share their schema.
        ),
        explained_row_count=2,
        metadata={"shap_version": "0.49.1"},
        feature_importance=(
            FeatureImportance(
                rank=1,
                feature_name="risk",
                mean_absolute_shap_value=0.3,
                mean_shap_value=0.0,
                standard_deviation=0.3,
                percentage_contribution=60.0,
                positive_contribution_count=2,
                negative_contribution_count=2,
            ),
            FeatureImportance(
                rank=2,
                feature_name="activity",
                mean_absolute_shap_value=0.2,
                mean_shap_value=0.0,
                standard_deviation=0.2,
                percentage_contribution=40.0,
                positive_contribution_count=2,
                negative_contribution_count=2,
            ),
        ),
    )
    local_explanation = LocalExplanation(
        model_name="DecisionTree",
        explainer="SHAP",
        subject_id="sample-1",
        prediction="alert",
        baseline_value=0.5,
        feature_contributions=(
            LocalFeatureContribution(
                feature_name="risk",
                contribution=0.2,
                feature_value=0.9,
                rank=1,
            ),
            LocalFeatureContribution(
                feature_name="activity",
                contribution=-0.1,
                feature_value=0.4,
                rank=2,
            ),
        ),
        metadata={"sample_index": 1},
        sample_index=1,
        prediction_probability=0.85,
    )
    return shap_result, global_explanation, local_explanation


def test_generate_reports_serializes_outputs_and_manifest_hashes(
    tmp_path: Path,
) -> None:
    """Report JSON, CSV, Markdown, summary, visuals, and hashes are consistent."""
    shap_result, global_explanation, local_explanation = _report_inputs()

    result = ExplainabilityPipeline(output_directory=tmp_path).generate_reports(
        shap_result,
        global_explanation,
        local_explanation,
    )

    for path in (
        result.json_path,
        result.csv_path,
        result.markdown_path,
        result.summary_path,
        result.manifest_path,
    ):
        assert path.is_file()
    report = json.loads(result.json_path.read_text(encoding="utf-8"))
    assert report["model_type"] == "DecisionTree"
    assert report["shap"]["values"][0][0] == [0.4, -0.4]
    assert report["global_feature_importance"][0]["feature_name"] == "risk"
    assert report["local_explanation"]["predicted_class"] == "alert"
    assert report["generated_artifacts"]

    with result.csv_path.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    assert len(rows) == 8
    assert rows[0]["feature_name"] == "risk"

    summary = result.summary_path.read_text(encoding="utf-8")
    assert "DecisionTree" in summary
    assert "risk" in summary
    assert "sample-1" in summary

    manifest = json.loads(result.manifest_path.read_text(encoding="utf-8"))
    assert manifest["shap_version"] == "0.49.1"
    assert manifest["model_type"] == "DecisionTree"
    assert Path(manifest["output_directory"]) == tmp_path.resolve()
    assert manifest["manifest_self_hash_excluded"] is True
    entries = {Path(item["path"]): item for item in manifest["artifacts"]}
    assert result.manifest_path not in entries
    assert set(entries) == {artifact.path for artifact in result.artifacts}
    for artifact in result.artifacts:
        entry = entries[artifact.path]
        assert entry["sha256"] == hashlib.sha256(artifact.path.read_bytes()).hexdigest()
        assert entry["size_bytes"] == artifact.path.stat().st_size
        assert entry["timestamp"]


def test_report_generation_without_local_explanation(tmp_path: Path) -> None:
    """Global reports and summary remain valid when there is no local example."""
    shap_result, global_explanation, _ = _report_inputs()

    result = ExplainabilityPipeline(output_directory=tmp_path).generate_reports(
        shap_result,
        global_explanation,
    )

    payload = json.loads(result.json_path.read_text(encoding="utf-8"))
    assert payload["local_explanation"] is None
    assert "No local explanation was supplied." in result.markdown_path.read_text(
        encoding="utf-8"
    )
    assert not any("local_explanation_" in str(path) for path in result.artifacts)


def test_visualizations_are_skipped_if_matplotlib_is_missing(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Missing Matplotlib skips PNGs while all other reports still complete."""
    from app.explainability import visualization

    original_import = visualization.importlib.import_module

    def import_without_matplotlib(name: str, package: str | None = None) -> ModuleType:
        if name == "matplotlib":
            raise ImportError("Matplotlib intentionally hidden in test")
        return original_import(name, package)

    monkeypatch.setattr(
        visualization.importlib,
        "import_module",
        import_without_matplotlib,
    )
    shap_result, global_explanation, local_explanation = _report_inputs()

    result = ExplainabilityPipeline(output_directory=tmp_path).generate_reports(
        shap_result,
        global_explanation,
        local_explanation,
    )

    assert result.visualization_paths == ()
    assert result.json_path.is_file()
    manifest = json.loads(result.manifest_path.read_text(encoding="utf-8"))
    assert not any(item["path"].endswith(".png") for item in manifest["artifacts"])


@pytest.mark.skipif(
    importlib.util.find_spec("matplotlib") is None,
    reason="Matplotlib is not installed.",
)
def test_visualization_artifact_names_are_created(tmp_path: Path) -> None:
    """Installed Matplotlib produces the two global and optional local PNGs."""
    shap_result, global_explanation, local_explanation = _report_inputs()

    result = ExplainabilityPipeline(output_directory=tmp_path).generate_reports(
        shap_result,
        global_explanation,
        local_explanation,
    )

    assert {path.name for path in result.visualization_paths} == {
        "global_feature_importance.png",
        "top10_feature_importance.png",
        "local_explanation_1.png",
    }


def test_report_rejects_mismatched_model_before_writing(tmp_path: Path) -> None:
    """Inconsistent explanation inputs fail explicitly and create no reports."""
    shap_result, global_explanation, local_explanation = _report_inputs()
    invalid = GlobalExplanation(
        model_name="RandomForest",
        explainer=global_explanation.explainer,
        feature_contributions=global_explanation.feature_contributions,
        explained_row_count=global_explanation.explained_row_count,
        feature_importance=global_explanation.feature_importance,
    )

    with pytest.raises(ExplainabilityError, match="model does not match"):
        ExplainabilityPipeline(output_directory=tmp_path).generate_reports(
            shap_result,
            invalid,
            local_explanation,
        )

    assert tuple(tmp_path.iterdir()) == ()
