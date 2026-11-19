"""Tests for delegated model comparison in the experiment package."""

from pathlib import Path

import pytest

from app.experiments import ExperimentPipeline, ExperimentResult
from app.experiments.config import ExperimentConfig
from app.experiments.exceptions import ExperimentExecutionError
from app.ml.schemas import (
    DatasetSplit,
    MLDataset,
    MLPipelineResult,
    PreprocessedSplitResult,
    PreprocessingMetadata,
)
from app.models.comparison import (
    EvaluationPartition,
    ModelComparisonEntry,
    ModelComparisonResult,
)
from app.models.exceptions import ModelComparisonError
from app.models.persistence import ModelPersistence
from app.models.pipeline import ModelPipeline
from app.models.ranking import RankingMetric
from app.models.schemas import (
    ModelConfig,
    ModelPipelineResult,
    ModelTrainingRequest,
    ModelTrainingResult,
    TrainingMetadata,
)


def _ml_result() -> MLPipelineResult:
    """Create prepared split contracts from synthetic in-memory records."""
    dataset = MLDataset(
        feature_names=("login_count", "risk_index"),
        records=(),
        label_name="insider",
    )
    return MLPipelineResult(
        split=DatasetSplit(train=dataset, validation=dataset, test=dataset),
        preprocessing=PreprocessingMetadata(
            feature_names=dataset.feature_names,
            strategy="none",
            fitted=False,
            target_column="insider",
        ),
        run_id="synthetic-run",
    )


def _training_result(
    model_name: str,
    hyperparameters: dict[str, object] | None = None,
) -> ModelPipelineResult:
    """Create a model result without invoking training code."""
    return ModelPipelineResult(
        training=ModelTrainingResult(
            metadata=TrainingMetadata(
                model_name=model_name,
                training_row_count=0,
                feature_names=("login_count", "risk_index"),
                target_column="insider",
                random_seed=42,
                hyperparameters=hyperparameters or {},
            )
        )
    )


def _comparison_result() -> ModelComparisonResult:
    """Create a comparison contract without metrics or report generation."""
    return ModelComparisonResult(
        primary_metric="f1_score",
        evaluation_partition="test",
        entries=(
            ModelComparisonEntry(
                model_name="DecisionTree",
                configuration={},
                metrics={},
                training_time_seconds=0.0,
                prediction_time_seconds=0.0,
                model_size_bytes=0,
                parameter_count=0,
                rank=1,
            ),
        ),
        best_model="DecisionTree",
        json_path=Path("synthetic/model_comparison.json"),
        csv_path=Path("synthetic/model_comparison.csv"),
        markdown_path=Path("synthetic/model_comparison.md"),
    )


class _ModelPipelineStub(ModelPipeline):
    """Capture training and comparison calls without executing model work."""

    def __init__(
        self,
        training_results: tuple[ModelPipelineResult, ...],
        comparison_result: ModelComparisonResult,
        comparison_error: Exception | None = None,
    ) -> None:
        self.training_results = training_results
        self.comparison_result = comparison_result
        self.comparison_error = comparison_error
        self.training_requests: list[ModelTrainingRequest] = []
        self.comparison_calls: list[
            tuple[
                PreprocessedSplitResult,
                Path | None,
                tuple[ModelConfig, ...] | None,
                RankingMetric,
                EvaluationPartition,
                int,
                bool,
            ]
        ] = []

    def run(self, request: ModelTrainingRequest) -> ModelPipelineResult:
        self.training_requests.append(request)
        return self.training_results[len(self.training_requests) - 1]

    def compare_models(
        self,
        partitions: PreprocessedSplitResult,
        output_directory: Path | None = None,
        *,
        model_configs: tuple[ModelConfig, ...] | None = None,
        primary_metric: RankingMetric = "f1_score",
        evaluation_partition: EvaluationPartition = "test",
        random_seed: int = 42,
        generate_chart: bool = True,
    ) -> ModelComparisonResult:
        self.comparison_calls.append(
            (
                partitions,
                output_directory,
                model_configs,
                primary_metric,
                evaluation_partition,
                random_seed,
                generate_chart,
            )
        )
        if self.comparison_error is not None:
            raise self.comparison_error
        return self.comparison_result


class _ExperimentPipelineStub(ExperimentPipeline):
    """Expose pipeline delegation without implementing a full experiment."""

    def run(self, config: ExperimentConfig) -> ExperimentResult:
        raise NotImplementedError(config.experiment_name)


def _prepare_pipeline(
    training_results: tuple[ModelPipelineResult, ...],
    comparison_result: ModelComparisonResult | None = None,
    comparison_error: Exception | None = None,
) -> tuple[_ExperimentPipelineStub, _ModelPipelineStub, list[Path | None]]:
    """Train synthetic models and return the configured delegated stages."""
    model_pipeline = _ModelPipelineStub(
        training_results=training_results,
        comparison_result=comparison_result or _comparison_result(),
        comparison_error=comparison_error,
    )
    output_paths: list[Path | None] = []

    def factory(
        output_directory: Path | None,
        persistence: ModelPersistence | None,
    ) -> ModelPipeline:
        assert persistence is None
        output_paths.append(output_directory)
        return model_pipeline

    experiment_pipeline = _ExperimentPipelineStub(model_pipeline_factory=factory)
    return experiment_pipeline, model_pipeline, output_paths


def test_compare_models_delegates_once_and_returns_identical_result() -> None:
    trained_result = _training_result("DecisionTree", {"max_depth": 3})
    comparison_result = _comparison_result()
    experiment_pipeline, model_pipeline, _ = _prepare_pipeline(
        (trained_result,),
        comparison_result,
    )
    training_result = experiment_pipeline.model_training(
        _ml_result(),
        selected_models=("DecisionTree",),
    )

    actual = experiment_pipeline.compare_models(training_result)

    assert actual is comparison_result
    assert len(model_pipeline.comparison_calls) == 1
    call = model_pipeline.comparison_calls[0]
    assert call[0].train is model_pipeline.training_requests[0].dataset.train
    assert call[2] == (
        ModelConfig(name="DecisionTree", hyperparameters={"max_depth": 3}),
    )


def test_compare_models_forwards_config_and_output_directory() -> None:
    trained_result = _training_result("RandomForest", {"n_estimators": 17})
    experiment_pipeline, model_pipeline, output_paths = _prepare_pipeline(
        (trained_result,)
    )
    trained_models = experiment_pipeline.model_training(
        _ml_result(),
        selected_models=("RandomForest",),
    )
    output_directory = Path("synthetic-comparison-output")
    model_configs = (
        ModelConfig(name="RandomForest", hyperparameters={"n_estimators": 11}),
    )
    metric: RankingMetric = "roc_auc"
    evaluation_partition: EvaluationPartition = "validation"

    experiment_pipeline.compare_models(
        trained_models,
        output_directory=output_directory,
        primary_metric=metric,
        evaluation_partition=evaluation_partition,
        random_seed=71,
        generate_chart=False,
        model_configs=model_configs,
    )

    assert output_paths == [None, output_directory]
    assert len(model_pipeline.comparison_calls) == 1
    call = model_pipeline.comparison_calls[0]
    assert call[1] == output_directory
    assert call[2] is model_configs
    assert call[3:] == (metric, evaluation_partition, 71, False)


def test_compare_models_supports_multiple_training_results() -> None:
    trained_results = (
        _training_result("LogisticRegression", {"C": 0.5}),
        _training_result("DecisionTree", {"max_depth": 5}),
    )
    experiment_pipeline, model_pipeline, _ = _prepare_pipeline(trained_results)
    trained_models = experiment_pipeline.model_training(
        _ml_result(),
        selected_models=("LogisticRegression", "DecisionTree"),
    )

    experiment_pipeline.compare_models(trained_models)

    assert isinstance(trained_models, tuple)
    assert len(model_pipeline.comparison_calls) == 1
    assert model_pipeline.comparison_calls[0][2] == (
        ModelConfig(name="LogisticRegression", hyperparameters={"C": 0.5}),
        ModelConfig(name="DecisionTree", hyperparameters={"max_depth": 5}),
    )


def test_compare_models_propagates_comparison_error_unchanged() -> None:
    error = ModelComparisonError("synthetic comparison failure")
    experiment_pipeline, model_pipeline, _ = _prepare_pipeline(
        (_training_result("DecisionTree"),),
        comparison_error=error,
    )
    trained_models = experiment_pipeline.model_training(
        _ml_result(),
        selected_models=("DecisionTree",),
    )

    with pytest.raises(ModelComparisonError) as raised:
        experiment_pipeline.compare_models(trained_models)

    assert raised.value is error
    assert len(model_pipeline.comparison_calls) == 1


def test_compare_models_requires_results_from_latest_training_call() -> None:
    experiment_pipeline, _, _ = _prepare_pipeline((_training_result("DecisionTree"),))

    with pytest.raises(ExperimentExecutionError, match="successful model_training"):
        experiment_pipeline.compare_models(_training_result("DecisionTree"))
