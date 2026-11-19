"""Tests for delegated explainability in the experiment package."""

from collections.abc import Sequence
from pathlib import Path
from typing import cast

import numpy as np
import pytest
from numpy.typing import NDArray

from app.experiments import (
    ExperimentExplainabilityResult,
    ExperimentModelName,
    ExperimentPipeline,
    ExperimentResult,
    ExperimentSHAPConfig,
)
from app.experiments.config import ExperimentConfig
from app.experiments.exceptions import ExperimentExecutionError
from app.explainability.pipeline import ExplainabilityPipeline
from app.explainability.report import (
    ExplainabilityArtifact,
    ExplainabilityReportResult,
)
from app.explainability.schemas import (
    ExplainabilityMetadata,
    ExplainabilityResult,
    ExplainerConfig,
    GlobalExplanation,
    LocalExplanation,
)
from app.ml.schemas import (
    DatasetSplit,
    MLDataset,
    MLPipelineResult,
    MLRecord,
    PreprocessingMetadata,
)
from app.models.base import Model
from app.models.persistence import ModelPersistence
from app.models.pipeline import ModelPipeline
from app.models.schemas import (
    ModelPipelineResult,
    ModelPrediction,
    ModelTrainingConfig,
    ModelTrainingRequest,
    ModelTrainingResult,
    TrainingMetadata,
)


class _TrainedModel(Model):
    """Provide an identifiable model object without performing model work."""

    def fit(self, training_dataset: MLDataset, config: ModelTrainingConfig) -> None:
        raise AssertionError(
            f"Unexpected fit with {training_dataset!r} and {config!r}."
        )

    def predict(self, dataset: MLDataset) -> ModelPrediction:
        raise AssertionError(f"Unexpected prediction for {dataset!r}.")


def _dataset() -> MLDataset:
    """Return small numeric test partitions constructed without file access."""
    return MLDataset(
        feature_names=("login_count", "risk_index"),
        records=(
            MLRecord(subject_id="user-1", values=(1, 0.1), label="normal"),
            MLRecord(subject_id="user-2", values=(2, 0.2), label="insider"),
        ),
        label_name="insider",
    )


def _ml_result() -> MLPipelineResult:
    """Build split metadata and datasets from the synthetic rows."""
    dataset = _dataset()
    return MLPipelineResult(
        split=DatasetSplit(train=dataset, validation=dataset, test=dataset),
        preprocessing=PreprocessingMetadata(
            feature_names=dataset.feature_names,
            strategy="none",
            fitted=False,
        ),
        run_id="synthetic-run",
    )


def _model_result(
    model: Model,
    model_name: str = "DecisionTree",
) -> ModelPipelineResult:
    """Create a training result that retains the synthetic model identity."""
    return ModelPipelineResult(
        training=ModelTrainingResult(
            metadata=TrainingMetadata(
                model_name=model_name,
                training_row_count=2,
                feature_names=("login_count", "risk_index"),
                target_column="insider",
                random_seed=42,
            ),
            trained_model=model,
        )
    )


def _shap_result() -> ExplainabilityResult:
    """Return a synthetic SHAP result without executing an explainer."""
    return ExplainabilityResult(
        shap_values=(((0.2, -0.2), (0.1, -0.1)),),
        expected_values=(0.5, 0.5),
        feature_names=("login_count", "risk_index"),
        metadata=ExplainabilityMetadata(
            explainer_type="TreeExplainer",
            shap_version="synthetic",
            model_type="DecisionTree",
            feature_count=2,
            sample_count=1,
            execution_time_seconds=0.0,
            timestamp="synthetic",
        ),
    )


def _global_result() -> GlobalExplanation:
    """Return a synthetic global summary without calculating importance."""
    return GlobalExplanation(
        model_name="DecisionTree",
        explainer="SHAP",
        feature_contributions=(),
        explained_row_count=1,
    )


def _local_result() -> LocalExplanation:
    """Return a synthetic local summary without calculating contributions."""
    return LocalExplanation(
        model_name="DecisionTree",
        explainer="SHAP",
        subject_id="user-1",
        prediction="normal",
        baseline_value=0.5,
        feature_contributions=(),
        sample_index=0,
    )


def _report_result() -> ExplainabilityReportResult:
    """Create report contract objects without generating any files."""
    directory = Path("synthetic-explainability-output")
    output_path = directory / "report.json"
    return ExplainabilityReportResult(
        output_directory=directory,
        json_path=output_path,
        csv_path=directory / "report.csv",
        markdown_path=directory / "report.md",
        summary_path=directory / "summary.md",
        manifest_path=directory / "manifest.json",
        visualization_paths=(),
        artifacts=(
            ExplainabilityArtifact(
                path=output_path,
                sha256="synthetic",
                size_bytes=0,
                timestamp="synthetic",
            ),
        ),
    )


class _ExplainabilityPipelineStub(ExplainabilityPipeline):
    """Capture existing pipeline calls and return prebuilt result identities."""

    def __init__(self, error: Exception | None = None) -> None:
        self.error = error
        self.shap_result = _shap_result()
        self.global_result = _global_result()
        self.local_result = _local_result()
        self.report_result = _report_result()
        self.shap_calls: list[tuple[Model, MLDataset, ExplainerConfig | None]] = []
        self.global_calls: list[
            tuple[Model, MLDataset, ExplainerConfig | None, Path | None]
        ] = []
        self.local_calls: list[
            tuple[
                Model,
                Sequence[Sequence[float]] | NDArray[np.float64],
                int,
                ExplainerConfig | None,
                Path | None,
            ]
        ] = []
        self.report_calls: list[
            tuple[
                ExplainabilityResult,
                GlobalExplanation,
                LocalExplanation | None,
                Path | None,
            ]
        ] = []

    def generate_shap(
        self,
        model: Model,
        dataset: MLDataset,
        config: ExplainerConfig | None = None,
    ) -> ExplainabilityResult:
        self.shap_calls.append((model, dataset, config))
        if self.error is not None:
            raise self.error
        return self.shap_result

    def global_importance(
        self,
        model: Model,
        dataset: MLDataset,
        config: ExplainerConfig | None = None,
        output_directory: Path | None = None,
    ) -> GlobalExplanation:
        self.global_calls.append((model, dataset, config, output_directory))
        if self.error is not None:
            raise self.error
        return self.global_result

    def local_explanation(
        self,
        model: Model,
        encoded_feature_matrix: Sequence[Sequence[float]] | NDArray[np.float64],
        sample_index: int,
        config: ExplainerConfig | None = None,
        output_directory: Path | None = None,
    ) -> LocalExplanation:
        self.local_calls.append(
            (model, encoded_feature_matrix, sample_index, config, output_directory)
        )
        if self.error is not None:
            raise self.error
        return self.local_result

    def generate_reports(
        self,
        shap_result: ExplainabilityResult,
        global_explanation: GlobalExplanation,
        local_explanation: LocalExplanation | None = None,
        output_directory: Path | None = None,
    ) -> ExplainabilityReportResult:
        self.report_calls.append(
            (shap_result, global_explanation, local_explanation, output_directory)
        )
        if self.error is not None:
            raise self.error
        return self.report_result


class _ExperimentPipelineStub(ExperimentPipeline):
    """Expose the delegated stage without implementing full experiment runs."""

    def run(self, config: ExperimentConfig) -> ExperimentResult:
        raise NotImplementedError(config.experiment_name)


class _ModelPipelineStub(ModelPipeline):
    """Return prebuilt training results without invoking model training."""

    def __init__(self, results: tuple[ModelPipelineResult, ...]) -> None:
        self.results = results
        self.requests: list[ModelTrainingRequest] = []

    def run(self, request: ModelTrainingRequest) -> ModelPipelineResult:
        self.requests.append(request)
        return self.results[len(self.requests) - 1]


def _prepared_pipeline(
    explainer: _ExplainabilityPipelineStub,
    model_results: tuple[ModelPipelineResult, ...],
) -> tuple[
    _ExperimentPipelineStub,
    tuple[ModelPipelineResult, ...] | ModelPipelineResult,
    list[Path | None],
]:
    """Inject existing-pipeline stubs and produce results via model_training()."""
    output_paths: list[Path | None] = []
    model_pipeline = _ModelPipelineStub(model_results)

    def factory(output_directory: Path | None) -> ExplainabilityPipeline:
        output_paths.append(output_directory)
        return explainer

    def model_factory(
        output_directory: Path | None,
        persistence: ModelPersistence | None,
    ) -> ModelPipeline:
        assert output_directory is None
        assert persistence is None
        return model_pipeline

    pipeline = _ExperimentPipelineStub(
        explainability_pipeline_factory=factory,
        model_pipeline_factory=model_factory,
    )
    names = tuple(result.training.metadata.model_name for result in model_results)
    selected_names = cast(tuple[ExperimentModelName, ...], names)
    training_results = pipeline.model_training(
        _ml_result(),
        selected_models=selected_names,
    )
    return pipeline, training_results, output_paths


def test_explainability_delegates_each_stage_once_and_preserves_results() -> None:
    explainer = _ExplainabilityPipelineStub()
    trained_model = _TrainedModel()
    trained_result = _model_result(trained_model)
    pipeline, training_results, output_paths = _prepared_pipeline(
        explainer,
        (trained_result,),
    )
    shap_config: ExperimentSHAPConfig = ExplainerConfig(
        random_seed=31,
        options={"background_size": 5},
    )
    output_directory = Path("synthetic-output")

    actual = pipeline.explainability(
        trained_result,
        shap_config=shap_config,
        output_directory=output_directory,
    )

    assert isinstance(actual, ExperimentExplainabilityResult)
    assert output_paths == [output_directory]
    assert len(explainer.shap_calls) == 1
    assert len(explainer.global_calls) == 1
    assert len(explainer.local_calls) == 1
    assert len(explainer.report_calls) == 1
    assert training_results is trained_result
    assert explainer.shap_calls[0] == (
        trained_model,
        _dataset(),
        shap_config,
    )
    assert explainer.global_calls[0] == (
        trained_model,
        _dataset(),
        shap_config,
        output_directory,
    )
    assert explainer.local_calls[0] == (
        trained_model,
        ((1.0, 0.1), (2.0, 0.2)),
        0,
        shap_config,
        output_directory,
    )
    assert explainer.report_calls[0] == (
        explainer.shap_result,
        explainer.global_result,
        explainer.local_result,
        output_directory,
    )
    assert actual.shap is explainer.shap_result
    assert actual.global_explanation is explainer.global_result
    assert actual.local_explanation is explainer.local_result
    assert actual.report is explainer.report_result


def test_explainability_accepts_custom_dataset_and_can_skip_local_explanation() -> None:
    explainer = _ExplainabilityPipelineStub()
    trained_result = _model_result(_TrainedModel())
    pipeline, training_results, _ = _prepared_pipeline(explainer, (trained_result,))
    custom_dataset = _dataset()

    actual = pipeline.explainability(
        training_results,
        dataset=custom_dataset,
        local_sample_index=None,
    )

    assert isinstance(actual, ExperimentExplainabilityResult)
    assert explainer.shap_calls[0][1] is custom_dataset
    assert explainer.global_calls[0][1] is custom_dataset
    assert len(explainer.local_calls) == 0
    assert explainer.report_calls[0][2] is None


def test_explainability_propagates_pipeline_error_unchanged() -> None:
    error = RuntimeError("synthetic explainability failure")
    explainer = _ExplainabilityPipelineStub(error=error)
    trained_result = _model_result(_TrainedModel())
    pipeline, training_results, _ = _prepared_pipeline(explainer, (trained_result,))

    with pytest.raises(RuntimeError) as raised:
        pipeline.explainability(training_results)

    assert raised.value is error
    assert len(explainer.shap_calls) == 1


def test_explainability_supports_multiple_trained_models() -> None:
    explainer = _ExplainabilityPipelineStub()
    first = _model_result(_TrainedModel())
    second = _model_result(_TrainedModel(), "RandomForest")
    pipeline, training_results, _ = _prepared_pipeline(explainer, (first, second))

    actual = pipeline.explainability(training_results)

    assert isinstance(actual, tuple)
    assert len(actual) == 2
    assert len(explainer.shap_calls) == 2
    assert len(explainer.global_calls) == 2
    assert len(explainer.local_calls) == 2
    assert len(explainer.report_calls) == 2


def test_explainability_rejects_non_model_training_artifact() -> None:
    explainer = _ExplainabilityPipelineStub()
    invalid_result = ModelPipelineResult(
        training=ModelTrainingResult(
            metadata=TrainingMetadata(
                model_name="DecisionTree",
                training_row_count=0,
                feature_names=(),
                target_column=None,
                random_seed=42,
            ),
            trained_model=object(),
        )
    )
    pipeline, training_results, _ = _prepared_pipeline(explainer, (invalid_result,))

    with pytest.raises(ExperimentExecutionError, match="supported trained Model"):
        pipeline.explainability(training_results)


def test_explainability_rejects_out_of_range_local_sample() -> None:
    explainer = _ExplainabilityPipelineStub()
    trained_result = _model_result(_TrainedModel())
    pipeline, training_results, _ = _prepared_pipeline(explainer, (trained_result,))

    with pytest.raises(ExperimentExecutionError, match="local_sample_index"):
        pipeline.explainability(training_results, local_sample_index=10)
