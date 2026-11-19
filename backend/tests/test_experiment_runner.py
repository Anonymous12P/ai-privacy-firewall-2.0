"""Tests for sequential end-to-end experiment orchestration."""

from dataclasses import FrozenInstanceError
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import Mock

import pytest

from app.experiments import ExperimentPipeline, ExperimentRunResult
from app.experiments.config import (
    DEFAULT_DATASET_DIRECTORY,
    DEFAULT_OUTPUT_DIRECTORY,
    ExperimentConfig,
)
from app.experiments.schemas import (
    ExperimentArtifacts,
    ExperimentDatasetLoadMetadata,
    ExperimentDatasetLoadResult,
    ExperimentExplainabilityResult,
    ExperimentMetadata,
)
from app.explainability.report import ExplainabilityReportResult
from app.explainability.schemas import (
    ExplainabilityMetadata,
    ExplainabilityResult,
    ExplainerConfig,
    GlobalExplanation,
)
from app.features.encoder import FeatureEncodingConfig
from app.features.risk_scores import BehavioralRiskConfig
from app.features.schemas import (
    AggregatedFeatureSet,
    AggregationWindow,
    CERTDataset,
    EncodedFeatureSet,
    FeatureEncodingMetadata,
    FeatureEngineeringRunResult,
    FeatureExportResult,
    RiskFeatureSet,
    TemporalFeatureSet,
    ValidatedCSVRows,
)
from app.features.temporal import TemporalFeatureConfig
from app.ml.schemas import (
    BalanceConfig,
    DatasetConfig,
    DatasetLoadConfig,
    DatasetSplit,
    MLDataset,
    MLPipelineResult,
    PreprocessingConfig,
    PreprocessingMetadata,
    SplitConfig,
)
from app.models.base import Model
from app.models.comparison import ModelComparisonResult
from app.models.persistence import ModelPersistence
from app.models.ranking import RankingMetric
from app.models.schemas import (
    ModelArtifactMetadata,
    ModelConfig,
    ModelPipelineResult,
    ModelTrainingConfig,
    ModelTrainingResult,
    TrainingMetadata,
)


class _PersistenceStub(ModelPersistence):
    """Provide an identity-only persistence configuration for forwarding tests."""

    def save(
        self,
        model: Model,
        destination: Path,
        metadata: ModelArtifactMetadata,
    ) -> ModelArtifactMetadata:
        raise AssertionError(
            f"Unexpected save operation: {model!r}, {destination!r}, {metadata!r}"
        )

    def load(self, source: Path) -> Model:
        raise AssertionError(f"Unexpected load operation: {source!r}")


def _dataset_result() -> ExperimentDatasetLoadResult:
    """Construct a validated synthetic dataset load result."""
    source = ValidatedCSVRows(dataset=CERTDataset.LOGON, headers=("date",), rows=())
    return ExperimentDatasetLoadResult(
        datasets=(source,),
        metadata=ExperimentDatasetLoadMetadata(
            dataset_path=Path("synthetic-cert"),
            dataset_sha256="d" * 64,
            file_count=1,
            row_counts=(("logon.csv", 0),),
            loaded_at=datetime(2026, 11, 1, tzinfo=UTC),
        ),
    )


def _feature_result() -> FeatureEngineeringRunResult:
    """Construct empty, synthetic feature results with no processing."""
    names = ("activity_count",)
    return FeatureEngineeringRunResult(
        aggregated=AggregatedFeatureSet(
            window=AggregationWindow.DAILY,
            source_datasets=(CERTDataset.LOGON,),
            records=(),
        ),
        temporal=TemporalFeatureSet(records=()),
        risk=RiskFeatureSet(records=()),
        encoded=EncodedFeatureSet(
            feature_names=names,
            records=(),
            metadata=FeatureEncodingMetadata(
                strategy="one_hot",
                mappings={},
                encoded_columns={},
                numeric_columns=names,
                missing_policy="category",
                unseen_policy="unknown",
            ),
        ),
        export=FeatureExportResult(
            output_directory=Path("synthetic-features"),
            artifact_paths={},
            sha256={},
        ),
    )


def _ml_result() -> MLPipelineResult:
    """Construct an empty synthetic ML result."""
    dataset = MLDataset(feature_names=("activity_count",), records=())
    return MLPipelineResult(
        split=DatasetSplit(train=dataset, validation=dataset, test=dataset),
        preprocessing=PreprocessingMetadata(
            feature_names=dataset.feature_names,
            strategy="none",
            fitted=False,
        ),
        run_id="synthetic-run",
    )


def _model_results() -> tuple[ModelPipelineResult, ...]:
    """Construct model results without training an implementation."""
    return (
        ModelPipelineResult(
            training=ModelTrainingResult(
                metadata=TrainingMetadata(
                    model_name="DecisionTree",
                    training_row_count=0,
                    feature_names=("activity_count",),
                    target_column=None,
                    random_seed=42,
                )
            )
        ),
    )


def _comparison_result() -> ModelComparisonResult:
    """Construct a comparison output contract with no ranking operation."""
    return ModelComparisonResult(
        primary_metric="f1_score",
        evaluation_partition="test",
        entries=(),
        best_model="DecisionTree",
        json_path=Path("synthetic-comparison.json"),
        csv_path=Path("synthetic-comparison.csv"),
        markdown_path=Path("synthetic-comparison.md"),
    )


def _explainability_result() -> ExperimentExplainabilityResult:
    """Construct report and explanation outputs without executing explainers."""
    output = Path("synthetic-explainability")
    return ExperimentExplainabilityResult(
        model_name="DecisionTree",
        shap=ExplainabilityResult(
            shap_values=(),
            expected_values=(),
            feature_names=(),
            metadata=ExplainabilityMetadata(
                explainer_type="synthetic",
                shap_version="synthetic",
                model_type="DecisionTree",
                feature_count=0,
                sample_count=0,
                execution_time_seconds=0.0,
                timestamp="synthetic",
            ),
        ),
        global_explanation=GlobalExplanation(
            model_name="DecisionTree",
            explainer="SHAP",
            feature_contributions=(),
            explained_row_count=0,
        ),
        local_explanation=None,
        report=ExplainabilityReportResult(
            output_directory=output,
            json_path=output / "report.json",
            csv_path=output / "report.csv",
            markdown_path=output / "report.md",
            summary_path=output / "summary.md",
            manifest_path=output / "manifest.json",
            visualization_paths=(),
            artifacts=(),
        ),
    )


def _experiment_config() -> ExperimentConfig:
    """Create reproducible configuration with valid CERT and output paths."""
    return ExperimentConfig(
        dataset_path=DEFAULT_DATASET_DIRECTORY,
        output_directory=DEFAULT_OUTPUT_DIRECTORY,
        random_seed=83,
        selected_models=("DecisionTree",),
        experiment_name="synthetic-experiment",
        feature_directory=DEFAULT_OUTPUT_DIRECTORY / "features",
        explainability_directory=DEFAULT_OUTPUT_DIRECTORY / "explainability",
    )


def test_run_calls_stages_once_in_order_and_forwards_configuration(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    pipeline = ExperimentPipeline()
    dataset_result = _dataset_result()
    feature_result = _feature_result()
    ml_result = _ml_result()
    model_result: ModelPipelineResult | tuple[ModelPipelineResult, ...] = (
        _model_results()[0]
    )
    comparison_result = _comparison_result()
    explainability_result = _explainability_result()
    order: list[str] = []
    captured_calls: dict[str, tuple[tuple[object, ...], dict[str, object]]] = {}

    def stage(name: str, result: object) -> Mock:
        def finish(*args: object, **kwargs: object) -> object:
            order.append(name)
            captured_calls[name] = (args, kwargs)
            return result

        return Mock(side_effect=finish)

    load = stage("dataset", dataset_result)
    features = stage("features", feature_result)
    machine_learning = stage("ml", ml_result)
    training = stage("training", model_result)
    comparison = stage("comparison", comparison_result)
    explainability = stage("explainability", explainability_result)
    monkeypatch.setattr(pipeline, "load_dataset", load)
    monkeypatch.setattr(pipeline, "feature_engineering", features)
    monkeypatch.setattr(pipeline, "machine_learning", machine_learning)
    monkeypatch.setattr(pipeline, "model_training", training)
    monkeypatch.setattr(pipeline, "compare_models", comparison)
    monkeypatch.setattr(pipeline, "explainability", explainability)

    config = _experiment_config()
    temporal = TemporalFeatureConfig()
    risk = BehavioralRiskConfig()
    encoding = FeatureEncodingConfig()
    dataset_load = DatasetLoadConfig(source=DatasetConfig(name="synthetic"))
    split = SplitConfig(random_seed=17)
    balance = BalanceConfig(random_seed=19)
    preprocessing = PreprocessingConfig()
    model_config = ModelTrainingConfig(model=ModelConfig(name="DecisionTree"))
    persistence = _PersistenceStub()
    ranking_metric: RankingMetric = "roc_auc"
    comparison_models = (ModelConfig(name="DecisionTree"),)
    shap_config = ExplainerConfig(random_seed=23)
    explanation_dataset = MLDataset(feature_names=("activity_count",), records=())

    result = pipeline.run(
        config,
        window=AggregationWindow.WEEKLY,
        temporal_config=temporal,
        risk_config=risk,
        encoding_config=encoding,
        dataset_load_config=dataset_load,
        split_config=split,
        balance_config=balance,
        preprocessing_config=preprocessing,
        training_configs=(model_config,),
        persistence=persistence,
        primary_metric=ranking_metric,
        comparison_model_configs=comparison_models,
        generate_chart=False,
        shap_config=shap_config,
        explanation_dataset=explanation_dataset,
        local_sample_index=None,
    )

    assert order == [
        "dataset",
        "features",
        "ml",
        "training",
        "comparison",
        "explainability",
    ]
    assert all(
        call.call_count == 1
        for call in (
            load,
            features,
            machine_learning,
            training,
            comparison,
            explainability,
        )
    )
    load.assert_called_once_with(config.dataset_path)
    features.assert_called_once_with(
        dataset_result.datasets,
        AggregationWindow.WEEKLY,
        temporal_config=temporal,
        risk_config=risk,
        encoding_config=encoding,
        output_directory=config.feature_directory,
    )
    machine_learning.assert_called_once_with(
        feature_result,
        dataset_load_config=dataset_load,
        split_config=split,
        balance_config=balance,
        preprocessing_config=preprocessing,
        output_directory=config.output_directory,
    )
    training.assert_called_once_with(
        ml_result,
        selected_models=("DecisionTree",),
        random_seed=config.random_seed,
        output_directory=config.output_directory,
        persistence=persistence,
        training_configs=(model_config,),
    )
    comparison.assert_called_once_with(
        model_result,
        output_directory=config.output_directory,
        primary_metric=ranking_metric,
        evaluation_partition="test",
        random_seed=config.random_seed,
        generate_chart=False,
        model_configs=comparison_models,
    )
    explainability.assert_called_once_with(
        model_result,
        shap_config=shap_config,
        dataset=explanation_dataset,
        local_sample_index=None,
        output_directory=config.explainability_directory,
    )
    assert isinstance(result, ExperimentRunResult)
    assert result.dataset is dataset_result
    assert result.feature_engineering is feature_result
    assert result.machine_learning is ml_result
    assert result.model_training is model_result
    assert result.comparison is comparison_result
    assert result.explainability is explainability_result
    assert result.execution_metadata.experiment_name == config.experiment_name
    assert result.execution_metadata.dataset_path == config.dataset_path
    assert result.execution_metadata.random_seed == config.random_seed
    assert result.execution_metadata.selected_models == config.selected_models
    assert result.execution_metadata.generated_at.tzinfo == UTC
    assert result.execution_duration_seconds >= 0
    assert captured_calls["features"][0] == (
        dataset_result.datasets,
        AggregationWindow.WEEKLY,
    )
    assert captured_calls["ml"][0] == (feature_result,)
    assert captured_calls["training"][0] == (ml_result,)
    assert captured_calls["comparison"][0] == (model_result,)
    assert captured_calls["explainability"][0] == (model_result,)


def test_run_propagates_stage_failure_without_running_later_stages(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    pipeline = ExperimentPipeline()
    expected_error = RuntimeError("synthetic feature failure")
    order: list[str] = []
    feature_arguments: list[tuple[tuple[object, ...], dict[str, object]]] = []

    def load_dataset(dataset_path: Path) -> ExperimentDatasetLoadResult:
        order.append("dataset")
        assert dataset_path == _experiment_config().dataset_path
        return _dataset_result()

    def feature_engineering(*args: object, **kwargs: object) -> object:
        order.append("features")
        feature_arguments.append((args, kwargs))
        raise expected_error

    monkeypatch.setattr(pipeline, "load_dataset", load_dataset)
    monkeypatch.setattr(pipeline, "feature_engineering", feature_engineering)
    ml = Mock()
    monkeypatch.setattr(pipeline, "machine_learning", ml)

    with pytest.raises(RuntimeError) as raised:
        pipeline.run(_experiment_config())

    assert raised.value is expected_error
    assert order == ["dataset", "features"]
    assert feature_arguments[0][0] == (
        _dataset_result().datasets,
        AggregationWindow.DAILY,
    )
    ml.assert_not_called()


def test_experiment_run_result_is_immutable() -> None:
    result = ExperimentRunResult(
        config=_experiment_config(),
        metadata=ExperimentMetadata(
            experiment_name="synthetic",
            dataset_path=Path("synthetic"),
            random_seed=42,
            selected_models=("DecisionTree",),
            generated_at=datetime.now(UTC),
        ),
        artifacts=ExperimentArtifacts(),
        dataset=_dataset_result(),
        feature_engineering=_feature_result(),
        machine_learning=_ml_result(),
        model_training=_model_results()[0],
        comparison=_comparison_result(),
        explainability=_explainability_result(),
        execution_duration_seconds=0.1,
    )

    with pytest.raises(FrozenInstanceError):
        result.execution_duration_seconds = 1.0  # type: ignore[misc]
