"""Tests for SHAP integration with the supported classification models."""

import csv
import importlib.util
import json
from dataclasses import replace
from datetime import datetime
from pathlib import Path
from types import ModuleType
from typing import Protocol, cast

import numpy as np
import pytest

from app.explainability import (
    ExplainabilityError,
    ExplainabilityPipeline,
    ExplainabilityResult,
    ExplainerConfig,
    ExplainerDependencyError,
    ExplainerNotSupportedError,
    ExplanationRequest,
    ShapExplainer,
)
from app.ml.schemas import DatasetMetadata, MLDataset, MLRecord
from app.models.base import Model
from app.models.decision_tree import DecisionTreeModel
from app.models.logistic_regression import LogisticRegressionModel
from app.models.random_forest import RandomForestModel
from app.models.schemas import (
    ModelConfig,
    ModelName,
    ModelPrediction,
    ModelTrainingConfig,
)
from app.models.xgboost_model import XGBoostModel


class _ProbabilityModel(Protocol):
    """Expose the fitted-adapter members checked by local explanation tests."""

    classes: tuple[object, ...]

    def predict_proba(
        self,
        dataset: MLDataset,
    ) -> tuple[tuple[float, ...], ...]: ...


def _dataset(name: str) -> MLDataset:
    """Create a stable binary classification dataset with numeric features."""
    values = (
        (0.0, 0.0),
        (0.1, 0.2),
        (0.2, 0.1),
        (0.3, 0.2),
        (0.0, 0.3),
        (0.2, 0.3),
        (1.0, 1.0),
        (1.1, 0.9),
        (0.9, 1.1),
        (1.2, 1.0),
        (0.8, 0.9),
        (1.0, 1.2),
    )
    labels = ("normal",) * 6 + ("alert",) * 6
    records = tuple(
        MLRecord(f"{name}-{index}", row, labels[index])
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


def _fitted_model(model_name: str) -> tuple[Model, MLDataset]:
    """Fit one registered adapter and return separate explanation rows."""
    training = _dataset("train")
    explanation = MLDataset(
        feature_names=training.feature_names,
        records=training.records[-4:],
        label_name=training.label_name,
        metadata=DatasetMetadata(
            row_count=4,
            column_count=3,
            column_names=("signal_a", "signal_b", "label"),
            feature_names=training.feature_names,
        ),
    )
    canonical_names: dict[str, ModelName] = {
        "LogisticRegression": "LogisticRegression",
        "DecisionTree": "DecisionTree",
        "RandomForest": "RandomForest",
        "XGBoost": "XGBoost",
    }
    hyperparameters: dict[str, object] = {}
    if model_name in {"DecisionTree", "RandomForest", "XGBoost"}:
        hyperparameters["max_depth"] = 2
    if model_name in {"RandomForest", "XGBoost"}:
        hyperparameters.update({"n_estimators": 8, "n_jobs": 1})
    model_config = ModelConfig(
        name=canonical_names[model_name],
        hyperparameters=hyperparameters,
    )
    model: Model
    if model_name == "LogisticRegression":
        model = LogisticRegressionModel()
    elif model_name == "DecisionTree":
        model = DecisionTreeModel()
    elif model_name == "RandomForest":
        model = RandomForestModel()
    else:
        model = XGBoostModel()
    training_config = ModelTrainingConfig(
        model=model_config,
        random_seed=19,
        target_column="label",
    )
    model.fit(training, training_config)
    return model, explanation


def _multiclass_model() -> tuple[Model, MLDataset]:
    """Fit a three-class decision tree for multi-output SHAP aggregation."""
    values = (
        (0.0, 0.0),
        (0.1, 0.2),
        (0.2, 0.1),
        (1.0, 1.0),
        (1.1, 0.9),
        (0.9, 1.1),
        (2.0, 0.0),
        (2.1, 0.2),
        (1.9, 0.1),
    )
    labels = ("alpha",) * 3 + ("beta",) * 3 + ("gamma",) * 3
    records = tuple(
        MLRecord(f"multi-{index}", row, labels[index])
        for index, row in enumerate(values)
    )
    dataset = MLDataset(
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
    model = DecisionTreeModel()
    model.fit(
        dataset,
        ModelTrainingConfig(
            model=ModelConfig(name="DecisionTree"),
            random_seed=29,
            target_column="label",
        ),
    )
    return model, dataset


def _encoded_matrix(dataset: MLDataset) -> np.ndarray:
    """Convert test records into a finite numerical feature matrix."""
    return np.asarray(
        [record.values for record in dataset.records],
        dtype=np.float64,
    )


@pytest.mark.parametrize(
    ("model_name", "expected_explainer"),
    [
        ("LogisticRegression", "LinearExplainer"),
        ("DecisionTree", "TreeExplainer"),
        ("RandomForest", "TreeExplainer"),
        ("XGBoost", "TreeExplainer"),
    ],
)
def test_shap_supports_each_model_adapter(
    model_name: str,
    expected_explainer: str,
) -> None:
    """Each classifier receives its designated official SHAP explainer."""
    if model_name == "XGBoost" and importlib.util.find_spec("xgboost") is None:
        pytest.skip("Optional XGBoost dependency is not installed.")
    model, dataset = _fitted_model(model_name)

    result = ShapExplainer().generate(model, dataset)

    assert isinstance(result, ExplainabilityResult)
    assert len(result.shap_values) == len(dataset.records)
    assert all(
        len(sample) == len(dataset.feature_names) for sample in result.shap_values
    )
    assert result.feature_names == dataset.feature_names
    assert result.expected_values
    assert result.metadata.explainer_type == expected_explainer
    assert result.metadata.model_type == model_name
    assert result.metadata.feature_count == len(dataset.feature_names)
    assert result.metadata.sample_count == len(dataset.records)
    assert result.metadata.execution_time_seconds >= 0
    assert datetime.fromisoformat(result.metadata.timestamp).tzinfo is not None
    assert result.metadata.shap_version
    assert np.isfinite(np.asarray(result.shap_values)).all()


def test_shap_values_are_reproducible() -> None:
    """Repeated tree explanations preserve values and expected baselines."""
    model, dataset = _fitted_model("DecisionTree")
    explainer = ShapExplainer()

    first = explainer.generate(model, dataset, ExplainerConfig(random_seed=7))
    second = explainer.generate(model, dataset, ExplainerConfig(random_seed=7))

    assert first.shap_values == second.shap_values
    assert first.expected_values == second.expected_values


def test_pipeline_generate_shap_and_run() -> None:
    """Pipeline convenience method and request workflow return typed values."""
    model, dataset = _fitted_model("DecisionTree")
    pipeline = ExplainabilityPipeline()

    generated = pipeline.generate_shap(model, dataset)
    result = pipeline.run(
        ExplanationRequest(model=model, dataset=dataset, config=ExplainerConfig())
    )

    assert isinstance(generated, ExplainabilityResult)
    assert isinstance(result, ExplainabilityResult)
    assert generated.shap_values == result.shap_values


@pytest.mark.parametrize(
    "model_name",
    ["LogisticRegression", "DecisionTree", "RandomForest", "XGBoost"],
)
def test_pipeline_local_explanation_for_supported_models(
    model_name: str,
    tmp_path: Path,
) -> None:
    """Local explanation produces class probability and ranked contributions."""
    if model_name == "XGBoost" and importlib.util.find_spec("xgboost") is None:
        pytest.skip("Optional XGBoost dependency is not installed.")
    model, dataset = _fitted_model(model_name)
    encoded = _encoded_matrix(dataset)
    sample_index = 2
    destination = tmp_path / "local"

    result = ExplainabilityPipeline(output_directory=destination).local_explanation(
        model,
        encoded,
        sample_index,
    )

    selected = MLDataset(
        feature_names=dataset.feature_names,
        records=(MLRecord("selected", encoded[sample_index]),),
    )
    prediction = model.predict(selected).predictions[0]
    probability_model = cast("_ProbabilityModel", model)
    probabilities = probability_model.predict_proba(selected)[0]
    class_labels = probability_model.classes
    class_index = class_labels.index(prediction)
    assert result.sample_index == sample_index
    assert result.prediction == prediction
    assert result.prediction_probability == pytest.approx(probabilities[class_index])
    assert result.baseline_value is not None
    assert tuple(item.rank for item in result.feature_contributions) == (1, 2)
    assert tuple(item.feature_name for item in result.feature_contributions) == tuple(
        item.feature_name
        for item in sorted(
            result.feature_contributions,
            key=lambda item: (-abs(item.contribution), item.feature_name),
        )
    )
    assert result.metadata["sample_index"] == sample_index
    assert result.metadata["predicted_class"] == prediction
    assert result.metadata["prediction_probability"] == pytest.approx(
        result.prediction_probability
    )
    assert (destination / f"local_explanation_{sample_index}.json").is_file()
    assert (destination / f"local_explanation_{sample_index}.md").is_file()


def test_multiclass_pipeline_local_explanation_selects_predicted_class(
    tmp_path: Path,
) -> None:
    """Multiclass local values and baseline use the predicted class output."""
    model, dataset = _multiclass_model()
    matrix = _encoded_matrix(dataset)
    result = ExplainabilityPipeline(output_directory=tmp_path).local_explanation(
        model,
        matrix,
        sample_index=5,
    )

    assert result.prediction in {"alpha", "beta", "gamma"}
    assert result.prediction_probability is not None
    assert 0.0 <= result.prediction_probability <= 1.0
    assert result.baseline_value is not None
    assert result.metadata["sample_count"] == 1
    assert tuple(item.rank for item in result.feature_contributions) == (1, 2)
    assert sum(len(item.feature_name) > 0 for item in result.feature_contributions) == 2


def test_local_explanation_is_reproducible(tmp_path: Path) -> None:
    """Repeated requests for the same sample preserve ranking and values."""
    model, dataset = _fitted_model("DecisionTree")
    matrix = _encoded_matrix(dataset)
    pipeline = ExplainabilityPipeline(output_directory=tmp_path)

    first = pipeline.local_explanation(model, matrix, 1)
    second = pipeline.local_explanation(model, matrix, 1)

    assert first.prediction == second.prediction
    assert first.prediction_probability == second.prediction_probability
    assert first.baseline_value == second.baseline_value
    assert first.feature_contributions == second.feature_contributions


@pytest.mark.parametrize("sample_index", [-1, 4, True])
def test_local_explanation_rejects_invalid_sample_indices(
    sample_index: int,
) -> None:
    """Negative, out-of-range, and boolean sample indices fail clearly."""
    model, dataset = _fitted_model("DecisionTree")

    with pytest.raises(ExplainabilityError, match="sample_index"):
        ShapExplainer().local_explanation(
            model,
            _encoded_matrix(dataset),
            sample_index,
        )


def test_global_and_local_explanations_use_shap_results() -> None:
    """Established global/local contracts are backed by SHAP output."""
    model, dataset = _fitted_model("DecisionTree")
    explainer = ShapExplainer()

    global_result = explainer.explain_global(model, dataset, ExplainerConfig())
    local_result = explainer.explain_local(
        model,
        dataset,
        dataset.records[0].subject_id,
        ExplainerConfig(),
    )

    assert global_result.explained_row_count == len(dataset.records)
    assert (
        tuple(item.feature_name for item in global_result.feature_contributions)
        == dataset.feature_names
    )
    assert local_result.subject_id == dataset.records[0].subject_id
    assert tuple(
        item.feature_name for item in local_result.feature_contributions
    ) == tuple(
        item.feature_name
        for item in sorted(
            local_result.feature_contributions,
            key=lambda item: (-abs(item.contribution), item.feature_name),
        )
    )


def test_global_importance_aggregates_binary_values_and_writes_reports(
    tmp_path: Path,
) -> None:
    """Statistics, deterministic ranks, metadata, percentages, and files agree."""
    model, dataset = _fitted_model("DecisionTree")
    destination = tmp_path / "importance"

    result = ExplainabilityPipeline(output_directory=destination).global_importance(
        model,
        dataset,
    )

    assert tuple(item.rank for item in result.feature_importance) == (1, 2)
    assert tuple(item.feature_name for item in result.feature_importance) == tuple(
        item.feature_name
        for item in sorted(
            result.feature_importance,
            key=lambda item: (-item.mean_absolute_shap_value, item.feature_name),
        )
    )
    assert sum(
        item.percentage_contribution for item in result.feature_importance
    ) == pytest.approx(100.0)
    assert all(
        item.positive_contribution_count >= 0
        and item.negative_contribution_count >= 0
        and item.standard_deviation >= 0
        for item in result.feature_importance
    )
    assert result.metadata["explainer_type"] == "TreeExplainer"
    assert result.metadata["model_type"] == "DecisionTree"
    assert result.metadata["feature_count"] == 2
    assert result.metadata["sample_count"] == 4
    report_paths = result.metadata["reports"]
    assert isinstance(report_paths, dict)
    json_path = Path(str(report_paths["json"]))
    csv_path = Path(str(report_paths["csv"]))
    markdown_path = Path(str(report_paths["markdown"]))
    assert json_path == destination / "global_feature_importance.json"
    assert csv_path == destination / "global_feature_importance.csv"
    assert markdown_path == destination / "global_feature_importance.md"
    payload = json.loads(json_path.read_text(encoding="utf-8"))
    assert payload["metadata"]["model_type"] == "DecisionTree"
    assert [feature["rank"] for feature in payload["features"]] == [1, 2]
    with csv_path.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    assert len(rows) == 2
    assert "## Metadata" in markdown_path.read_text(encoding="utf-8")


def test_multiclass_global_importance_aggregates_all_class_outputs(
    tmp_path: Path,
) -> None:
    """Multiclass samples and all class contributions participate in stats."""
    model, dataset = _multiclass_model()

    result = ShapExplainer().global_importance(
        model,
        dataset,
        output_directory=tmp_path,
    )
    raw_values = np.asarray(
        ShapExplainer().generate(model, dataset).shap_values,
        dtype=np.float64,
    )
    first_feature_values = raw_values[:, 0, :].reshape(-1)
    first = next(
        item for item in result.feature_importance if item.feature_name == "signal_a"
    )

    assert raw_values.shape == (len(dataset.records), 2, 3)
    assert first.mean_absolute_shap_value == pytest.approx(
        float(np.mean(np.abs(first_feature_values)))
    )
    assert first.mean_shap_value == pytest.approx(float(np.mean(first_feature_values)))
    assert first.standard_deviation == pytest.approx(
        float(np.std(first_feature_values))
    )
    assert first.positive_contribution_count == int(
        np.count_nonzero(first_feature_values > 0)
    )
    assert first.negative_contribution_count == int(
        np.count_nonzero(first_feature_values < 0)
    )
    assert sum(
        item.percentage_contribution for item in result.feature_importance
    ) == pytest.approx(100.0)


def test_global_importance_ties_rank_by_feature_name(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Equal absolute contributions use feature name as deterministic tie-break."""
    model, dataset = _fitted_model("DecisionTree")
    import app.explainability.shap_explainer as module

    monkeypatch.setattr(
        module.ShapExplainer,
        "generate",
        lambda _self, _selected_model, _selected_dataset, _config=None: (
            module.ExplainabilityResult(
                shap_values=(
                    ((1.0,), (1.0,)),
                    ((-1.0,), (-1.0,)),
                ),
                expected_values=(0.5,),
                feature_names=("zeta", "alpha"),
                metadata=module.ExplainabilityMetadata(
                    explainer_type="TreeExplainer",
                    shap_version="test",
                    model_type="DecisionTree",
                    feature_count=2,
                    sample_count=2,
                    execution_time_seconds=0.01,
                    timestamp="2026-01-01T00:00:00+00:00",
                ),
            )
        ),
    )
    smaller_dataset = MLDataset(
        feature_names=("zeta", "alpha"),
        records=dataset.records[:2],
        label_name=dataset.label_name,
        metadata=dataset.metadata,
    )
    result = ShapExplainer().global_importance(
        model,
        smaller_dataset,
        output_directory=tmp_path,
    )

    assert tuple(item.feature_name for item in result.feature_importance) == (
        "alpha",
        "zeta",
    )
    assert tuple(
        item.percentage_contribution for item in result.feature_importance
    ) == (
        50.0,
        50.0,
    )


def test_zero_importance_allocates_percentages_equally(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Zero total attribution still produces normalized percentages."""
    model, dataset = _fitted_model("DecisionTree")
    import app.explainability.shap_explainer as module

    original = ShapExplainer().generate(model, dataset)
    zeros = tuple(
        tuple(tuple(0.0 for _ in feature_outputs) for feature_outputs in sample)
        for sample in original.shap_values
    )
    zero_result = replace(original, shap_values=zeros)
    monkeypatch.setattr(
        module.ShapExplainer,
        "generate",
        lambda _self, _selected_model, _selected_dataset, _config=None: zero_result,
    )

    result = ShapExplainer().global_importance(
        model, dataset, output_directory=tmp_path
    )

    assert all(item.mean_absolute_shap_value == 0 for item in result.feature_importance)
    assert sum(
        item.percentage_contribution for item in result.feature_importance
    ) == pytest.approx(100.0)


def test_missing_shap_dependency_raises_typed_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Unavailable optional SHAP is reported with its dedicated exception."""
    model, dataset = _fitted_model("LogisticRegression")
    import app.explainability.shap_explainer as shap_module

    original_import = shap_module.importlib.import_module

    def import_without_shap(
        name: str,
        package: str | None = None,
    ) -> ModuleType:
        if name == "shap":
            raise ImportError("SHAP intentionally hidden for this test")
        return original_import(name, package)

    monkeypatch.setattr(shap_module.importlib, "import_module", import_without_shap)

    with pytest.raises(ExplainerDependencyError, match="pip install"):
        ShapExplainer().generate(model, dataset)


def test_unsupported_model_raises_typed_error() -> None:
    """Unknown model adapters are rejected before attempting SHAP imports."""

    class UnsupportedModel(Model):
        """Minimal valid model not supported by the SHAP integration."""

        def fit(
            self,
            training_dataset: MLDataset,
            config: ModelTrainingConfig,
        ) -> None:
            """Satisfy the abstract model contract."""
            del training_dataset, config

        def predict(self, dataset: MLDataset) -> ModelPrediction:
            """Return empty values for this unsupported test adapter."""
            return ModelPrediction(
                model_name="Unsupported",
                predictions=tuple(record.label for record in dataset.records),
                subject_ids=tuple(record.subject_id for record in dataset.records),
            )

    with pytest.raises(ExplainerNotSupportedError, match="UnsupportedModel"):
        ShapExplainer().generate(UnsupportedModel(), _dataset("explain"))
