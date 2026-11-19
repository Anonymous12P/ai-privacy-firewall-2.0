"""Tests for model comparison, deterministic ranking, and report generation."""

import csv
import importlib.util
import json
from dataclasses import replace
from pathlib import Path
from types import ModuleType

import pytest

from app.ml.schemas import (
    DatasetMetadata,
    MLDataset,
    MLLabel,
    MLRecord,
    PreprocessedSplitResult,
    PreprocessingMetadata,
)
from app.models.comparison import ModelComparisonEntry, compare_models
from app.models.exceptions import ModelComparisonError, ModelDependencyError
from app.models.pipeline import ModelPipeline
from app.models.ranking import RankingConfig, rank_models
from app.models.schemas import ModelConfig


def _dataset(
    name: str,
    values: tuple[tuple[float, ...], ...],
    labels: tuple[MLLabel, ...],
) -> MLDataset:
    """Create a small labeled dataset with stable feature and row order."""
    records = tuple(
        MLRecord(subject_id=f"{name}-{index}", values=row, label=labels[index])
        for index, row in enumerate(values)
    )
    return MLDataset(
        feature_names=("signal_a", "signal_b"),
        records=records,
        label_name="label",
        metadata=DatasetMetadata(
            row_count=len(records),
            column_count=3,
            column_names=("signal_a", "signal_b", "label"),
            feature_names=("signal_a", "signal_b"),
        ),
    )


def _partitions() -> PreprocessedSplitResult:
    """Return small numeric partitions usable by the baseline classifiers."""
    return PreprocessedSplitResult(
        train=_dataset(
            "train",
            (
                (0.0, 0.0),
                (0.1, 0.2),
                (0.2, 0.1),
                (0.3, 0.2),
                (1.0, 1.0),
                (1.1, 0.9),
                (0.9, 1.1),
                (1.2, 1.0),
            ),
            ("normal",) * 4 + ("alert",) * 4,
        ),
        validation=_dataset(
            "validation",
            ((0.15, 0.15), (0.25, 0.1), (0.95, 1.0), (1.15, 0.95)),
            ("normal", "normal", "alert", "alert"),
        ),
        test=_dataset(
            "test",
            ((0.05, 0.1), (0.35, 0.25), (1.05, 1.05), (0.85, 0.95)),
            ("normal", "normal", "alert", "alert"),
        ),
        metadata=PreprocessingMetadata(
            feature_names=("signal_a", "signal_b"),
            strategy="none",
            fitted=True,
        ),
    )


def _entry(
    name: str,
    *,
    f1: float | None,
    roc_auc: float | None = 0.8,
    size: int = 100,
    prediction_time: float = 0.01,
) -> ModelComparisonEntry:
    """Create a synthetic result entry for ranking tests."""
    return ModelComparisonEntry(
        model_name=name,
        configuration={},
        metrics={
            "f1_score": f1,
            "roc_auc": roc_auc,
            "precision": 0.7,
            "recall": 0.7,
            "accuracy": 0.7,
            "log_loss": 0.5,
        },
        training_time_seconds=0.1,
        prediction_time_seconds=prediction_time,
        model_size_bytes=size,
        parameter_count=None,
    )


def test_rank_models_uses_metric_tiebreaks_and_stable_name() -> None:
    """Ties use the specified metric order, then size, time, and model name."""
    results = (
        _entry("beta", f1=0.8, roc_auc=0.8, size=90),
        _entry("alpha", f1=0.8, roc_auc=0.9, size=150),
        _entry("gamma", f1=0.8, roc_auc=0.9, size=100),
    )

    ranked = rank_models(results)

    assert tuple(item.model_name for item in ranked) == ("gamma", "alpha", "beta")


def test_rank_models_handles_missing_scores_and_ascending_log_loss() -> None:
    """Missing primary metrics rank last and Log Loss is minimized."""
    results = (
        _entry("missing", f1=None),
        _entry("high-loss", f1=0.5),
        _entry("low-loss", f1=0.5),
    )
    altered = tuple(
        replace(
            entry,
            metrics={
                **entry.metrics,
                "log_loss": (
                    None
                    if entry.model_name == "missing"
                    else 0.9
                    if entry.model_name == "high-loss"
                    else 0.2
                ),
            },
        )
        for entry in results
    )

    ranked = rank_models(altered, RankingConfig(primary_metric="log_loss"))

    assert tuple(item.model_name for item in ranked) == (
        "low-loss",
        "high-loss",
        "missing",
    )


def test_compare_models_trains_selected_models_and_writes_reports(
    tmp_path: Path,
) -> None:
    """Comparison uses one common held-out set and creates all requested files."""
    result = compare_models(
        _partitions(),
        tmp_path,
        model_configs=(
            ModelConfig(name="LogisticRegression"),
            ModelConfig(name="DecisionTree"),
            ModelConfig(name="RandomForest", hyperparameters={"n_estimators": 8}),
        ),
        generate_chart=False,
    )

    assert len(result.entries) == 3
    assert result.best_model == result.entries[0].model_name
    assert tuple(entry.rank for entry in result.entries) == (1, 2, 3)
    assert all(
        set(entry.metrics)
        == {
            "accuracy",
            "precision",
            "recall",
            "f1_score",
            "roc_auc",
            "pr_auc",
            "log_loss",
        }
        for entry in result.entries
    )
    assert result.json_path.is_file()
    assert result.csv_path.is_file()
    assert result.markdown_path.is_file()
    assert result.chart_path is None

    payload = json.loads(result.json_path.read_text(encoding="utf-8"))
    assert payload["best_model"] == result.best_model
    assert [item["rank"] for item in payload["models"]] == [1, 2, 3]
    with result.csv_path.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    assert len(rows) == 3
    assert sum(row["selected_best"] == "True" for row in rows) == 1
    assert "Selected best model" in result.markdown_path.read_text(encoding="utf-8")


def test_comparison_supports_all_four_baselines(tmp_path: Path) -> None:
    """All implemented adapters participate; XGBoost remains an optional extra."""
    configs = (
        ModelConfig(name="LogisticRegression"),
        ModelConfig(name="DecisionTree"),
        ModelConfig(name="RandomForest", hyperparameters={"n_estimators": 8}),
        ModelConfig(name="XGBoost", hyperparameters={"n_estimators": 8}),
    )
    if importlib.util.find_spec("xgboost") is None:
        with pytest.raises(ModelDependencyError):
            compare_models(
                _partitions(),
                tmp_path,
                model_configs=configs,
                generate_chart=False,
            )
        return

    result = compare_models(
        _partitions(),
        tmp_path,
        model_configs=configs,
        generate_chart=False,
    )

    assert {entry.model_name for entry in result.entries} == {
        "LogisticRegression",
        "DecisionTree",
        "RandomForest",
        "XGBoost",
    }


def test_model_pipeline_exposes_comparison_with_injected_factory(
    tmp_path: Path,
) -> None:
    """Pipeline comparison forwards selected data and output location."""
    result = ModelPipeline(artifact_directory=tmp_path).compare_models(
        _partitions(),
        model_configs=(ModelConfig(name="DecisionTree"),),
        generate_chart=False,
    )

    assert result.best_model == "DecisionTree"
    assert result.json_path.parent == tmp_path / "comparison"


@pytest.mark.parametrize(
    "configs",
    [
        (),
        (ModelConfig(name="DecisionTree"), ModelConfig(name="DecisionTree")),
        (ModelConfig(name="LightGBM"),),
    ],
)
def test_compare_models_rejects_empty_duplicate_or_unsupported_selection(
    tmp_path: Path,
    configs: tuple[ModelConfig, ...],
) -> None:
    """Invalid model selections raise the comparison-specific error."""
    with pytest.raises(ModelComparisonError):
        compare_models(
            _partitions(),
            tmp_path,
            model_configs=configs,
            generate_chart=False,
        )


def test_compare_models_rejects_inconsistent_feature_schema(
    tmp_path: Path,
) -> None:
    """Feature schema mismatches are rejected before estimator construction."""
    partitions = _partitions()
    mismatched_test = _dataset(
        "test",
        ((0.05, 0.1), (0.35, 0.25), (1.05, 1.05), (0.85, 0.95)),
        ("normal", "normal", "alert", "alert"),
    )
    mismatched_test = MLDataset(
        feature_names=("different", "signal_b"),
        records=mismatched_test.records,
        label_name=mismatched_test.label_name,
        metadata=mismatched_test.metadata,
    )
    invalid = PreprocessedSplitResult(
        train=partitions.train,
        validation=partitions.validation,
        test=mismatched_test,
        metadata=partitions.metadata,
    )

    with pytest.raises(ModelComparisonError, match="test data"):
        compare_models(
            invalid,
            tmp_path,
            model_configs=(ModelConfig(name="DecisionTree"),),
            generate_chart=False,
        )


def test_chart_import_failure_is_graceful(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Missing optional Matplotlib omits the chart without failing comparison."""
    import app.models.comparison as comparison_module

    original_import = comparison_module.importlib.import_module

    def import_without_matplotlib(
        name: str,
        package: str | None = None,
    ) -> ModuleType:
        if name == "matplotlib":
            raise ImportError("not installed")
        return original_import(name, package)

    monkeypatch.setattr(
        comparison_module.importlib,
        "import_module",
        import_without_matplotlib,
    )
    result = compare_models(
        _partitions(),
        tmp_path,
        model_configs=(ModelConfig(name="DecisionTree"),),
    )

    assert result.chart_path is None
    payload = json.loads(result.json_path.read_text(encoding="utf-8"))
    assert payload["chart_path"] is None
