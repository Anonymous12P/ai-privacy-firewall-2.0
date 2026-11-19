"""Tests for delegated model training in the experiment package."""

from pathlib import Path

import pytest
from app.experiments import (
    ExperimentModelName,
    ExperimentModelPipelineResult,
    ExperimentModelTrainingConfig,
    ExperimentPipeline,
)
from app.ml.schemas import (
    DatasetMetadata,
    DatasetSplit,
    MLDataset,
    MLPipelineResult,
    MLRecord,
    PreprocessingMetadata,
)
from app.models.base import Model
from app.models.exceptions import ModelTrainingError
from app.models.persistence import ModelPersistence
from app.models.pipeline import ModelPipeline
from app.models.schemas import (
    ModelArtifactMetadata,
    ModelConfig,
    ModelPipelineResult,
    ModelTrainingConfig,
    ModelTrainingRequest,
    ModelTrainingResult,
    TrainingMetadata,
)


def _ml_result() -> MLPipelineResult:
    """Create synthetic split data without loading or transforming any files."""
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


def _model_result(
    model_name: str = "LogisticRegression",
) -> ExperimentModelPipelineResult:
    """Create a recognizable model result without running model code."""
    training_config: ExperimentModelTrainingConfig = ModelTrainingConfig(
        model=ModelConfig(name=model_name),  # type: ignore[arg-type]
        random_seed=42,
    )
    return ModelPipelineResult(
        training=ModelTrainingResult(
            metadata=TrainingMetadata(
                model_name=model_name,
                training_row_count=0,
                feature_names=("login_count", "risk_index"),
                target_column="insider",
                random_seed=training_config.random_seed,
            )
        )
    )


class _PersistenceStub(ModelPersistence):
    """Provide an identity-only persistence dependency for injection tests."""

    def save(
        self,
        model: Model,
        destination: Path,
        metadata: ModelArtifactMetadata,
    ) -> ModelArtifactMetadata:
        raise AssertionError(
            f"Unexpected persistence of {model!r} to {destination}: {metadata!r}"
        )

    def load(self, source: Path) -> Model:
        raise AssertionError(f"Unexpected model load from {source}.")


class _ModelPipelineStub(ModelPipeline):
    """Capture requests and return or raise a configured model result."""

    def __init__(
        self,
        results: tuple[ModelPipelineResult, ...] = (),
        error: Exception | None = None,
    ) -> None:
        self.results = results
        self.error = error
        self.requests: list[ModelTrainingRequest] = []

    def run(self, request: ModelTrainingRequest) -> ModelPipelineResult:
        self.requests.append(request)
        if self.error is not None:
            raise self.error
        if len(self.requests) > len(self.results):
            raise AssertionError("A result must be configured for each request.")
        return self.results[len(self.requests) - 1]


def _experiment_pipeline(
    model_pipeline: _ModelPipelineStub,
    received_options: list[tuple[Path | None, ModelPersistence | None]] | None = None,
) -> ExperimentPipeline:
    """Inject a model-pipeline factory and optionally capture its arguments."""

    def factory(
        output_directory: Path | None,
        persistence: ModelPersistence | None,
    ) -> ModelPipeline:
        if received_options is not None:
            received_options.append((output_directory, persistence))
        return model_pipeline

    return ExperimentPipeline(model_pipeline_factory=factory)


def test_model_training_delegates_once_and_returns_identical_result() -> None:
    ml_result = _ml_result()
    result = _model_result()
    model_pipeline = _ModelPipelineStub(results=(result,))
    experiment_pipeline = _experiment_pipeline(model_pipeline)

    actual = experiment_pipeline.model_training(ml_result)

    assert actual is result
    assert len(model_pipeline.requests) == 1
    request = model_pipeline.requests[0]
    assert request.dataset.train is ml_result.split.train
    assert request.dataset.validation is ml_result.split.validation
    assert request.dataset.test is ml_result.split.test
    assert request.dataset.metadata is ml_result.preprocessing
    assert request.config.model.name == "LogisticRegression"
    assert request.config.random_seed == 42


def test_model_training_restores_target_metadata_for_all_partitions(
    tmp_path: Path,
) -> None:
    feature_names = ("login_count", "risk_index")

    def dataset(
        name: str,
        labels: tuple[str, ...],
        *,
        label_name: str | None,
    ) -> MLDataset:
        rows = tuple(
            MLRecord(
                subject_id=f"{name}-{index:02}",
                values=(float(index), float(index % 2)),
                label=label,
            )
            for index, label in enumerate(labels)
        )
        return MLDataset(
            feature_names=feature_names,
            records=rows,
            label_name=label_name,
            metadata=DatasetMetadata(
                row_count=len(rows),
                column_count=3,
                column_names=(*feature_names, "insider"),
                feature_names=feature_names,
            ),
        )

    train = dataset(
        "train",
        ("normal",) * 4 + ("alert",) * 4,
        label_name="insider",
    )
    validation = dataset(
        "validation",
        ("normal", "normal", "alert", "alert"),
        label_name=None,
    )
    test = dataset(
        "test",
        ("normal", "normal", "alert", "alert"),
        label_name=None,
    )
    ml_result = MLPipelineResult(
        split=DatasetSplit(train=train, validation=validation, test=test),
        preprocessing=PreprocessingMetadata(
            feature_names=feature_names,
            strategy="none",
            fitted=True,
            target_column="insider",
        ),
        run_id="target-metadata-regression",
    )

    class RecordingModelPipeline(ModelPipeline):
        """Capture the adapted request and still train with the real pipeline."""

        def __init__(self) -> None:
            super().__init__(artifact_directory=tmp_path)
            self.requests: list[ModelTrainingRequest] = []

        def run(self, request: ModelTrainingRequest) -> ModelPipelineResult:
            self.requests.append(request)
            return super().run(request)

    model_pipeline = RecordingModelPipeline()
    received_options: list[tuple[Path | None, ModelPersistence | None]] = []

    def factory(
        output_directory: Path | None,
        persistence: ModelPersistence | None,
    ) -> ModelPipeline:
        received_options.append((output_directory, persistence))
        return model_pipeline

    experiment_pipeline = ExperimentPipeline(model_pipeline_factory=factory)

    trained = experiment_pipeline.model_training(
        ml_result,
        selected_models=("DecisionTree",),
        output_directory=tmp_path,
    )

    request = model_pipeline.requests[0]
    assert received_options == [(tmp_path, None)]
    adapted_partitions = (
        request.dataset.train,
        request.dataset.validation,
        request.dataset.test,
    )
    assert tuple(partition.label_name for partition in adapted_partitions) == (
        "insider",
        "insider",
        "insider",
    )
    assert tuple(partition.feature_names for partition in adapted_partitions) == (
        feature_names,
        feature_names,
        feature_names,
    )
    assert request.dataset.train is train
    assert request.dataset.validation is not validation
    assert request.dataset.test is not test
    assert request.dataset.validation.records is validation.records
    assert request.dataset.test.records is test.records
    assert tuple(record.label for record in request.dataset.validation.records) == (
        "normal",
        "normal",
        "alert",
        "alert",
    )
    assert tuple(record.label for record in request.dataset.test.records) == (
        "normal",
        "normal",
        "alert",
        "alert",
    )
    assert tuple(record.values for record in request.dataset.validation.records) == (
        (0.0, 0.0),
        (1.0, 1.0),
        (2.0, 0.0),
        (3.0, 1.0),
    )
    assert tuple(record.values for record in request.dataset.test.records) == (
        (0.0, 0.0),
        (1.0, 1.0),
        (2.0, 0.0),
        (3.0, 1.0),
    )
    assert isinstance(trained, ModelPipelineResult)
    assert trained.training.metadata.target_column == "insider"


def test_model_training_uses_train_target_when_preprocessing_metadata_omits_it() -> (
    None
):
    feature_names = ("login_count", "risk_index")

    def dataset(
        name: str,
        labels: tuple[str, ...],
        target: str | None,
    ) -> MLDataset:
        rows = tuple(
            MLRecord(
                subject_id=f"{name}-{index:02}",
                values=(float(index), float(index % 2)),
                label=label,
            )
            for index, label in enumerate(labels)
        )
        return MLDataset(
            feature_names=feature_names,
            records=rows,
            label_name=target,
            metadata=DatasetMetadata(
                row_count=len(rows),
                column_count=3,
                column_names=(*feature_names, "insider"),
                feature_names=feature_names,
            ),
        )

    train = dataset("train", ("normal",) * 4 + ("alert",) * 4, "insider")
    validation = dataset("validation", ("normal", "normal", "alert", "alert"), None)
    test = dataset("test", ("normal", "normal", "alert", "alert"), None)
    ml_result = MLPipelineResult(
        split=DatasetSplit(train=train, validation=validation, test=test),
        preprocessing=PreprocessingMetadata(
            feature_names=feature_names,
            strategy="none",
            fitted=True,
            target_column=None,
        ),
        run_id="target-fallback-regression",
    )
    model_pipeline = _ModelPipelineStub(results=(_model_result(),))
    experiment_pipeline = _experiment_pipeline(model_pipeline)

    experiment_pipeline.model_training(ml_result)

    prepared = model_pipeline.requests[0].dataset
    assert tuple(
        dataset.label_name
        for dataset in (prepared.train, prepared.validation, prepared.test)
    ) == ("insider", "insider", "insider")
    assert tuple(
        tuple(record.label for record in dataset.records)
        for dataset in (prepared.train, prepared.validation, prepared.test)
    ) == (
        tuple(record.label for record in train.records),
        tuple(record.label for record in validation.records),
        tuple(record.label for record in test.records),
    )


def test_real_logistic_regression_pipeline_accepts_experiment_adapter(
    tmp_path: Path,
) -> None:
    feature_names = ("login_count", "risk_index")

    def partition(name: str, size: int, target: str | None) -> MLDataset:
        rows = tuple(
            MLRecord(
                subject_id=f"{name}-{index:02}",
                values=(float(index), float(index % 5)),
                label="alert" if index % 2 else "normal",
            )
            for index in range(size)
        )
        return MLDataset(
            feature_names=feature_names,
            records=rows,
            label_name=target,
            metadata=DatasetMetadata(
                row_count=size,
                column_count=3,
                column_names=(*feature_names, "outcome"),
                feature_names=feature_names,
            ),
        )

    train = partition("train", 40, None)
    validation = partition("validation", 10, None)
    test = partition("test", 10, None)
    ml_result = MLPipelineResult(
        split=DatasetSplit(train=train, validation=validation, test=test),
        preprocessing=PreprocessingMetadata(
            feature_names=feature_names,
            strategy="none",
            fitted=True,
            target_column=None,
        ),
        run_id="synthetic-logistic-run",
    )

    class RecordingModelPipeline(ModelPipeline):
        def __init__(self) -> None:
            super().__init__(artifact_directory=tmp_path / "models")
            self.requests: list[ModelTrainingRequest] = []

        def run(self, request: ModelTrainingRequest) -> ModelPipelineResult:
            self.requests.append(request)
            return super().run(request)

    model_pipeline = RecordingModelPipeline()

    def model_factory(
        output_directory: Path | None,
        persistence: ModelPersistence | None,
    ) -> ModelPipeline:
        assert output_directory == tmp_path / "models"
        assert persistence is None
        return model_pipeline

    experiment_pipeline = ExperimentPipeline(model_pipeline_factory=model_factory)
    training_config = ModelTrainingConfig(
        model=ModelConfig(name="LogisticRegression"),
        target_column="outcome",
    )

    trained = experiment_pipeline.model_training(
        ml_result,
        selected_models=("LogisticRegression",),
        training_configs=(training_config,),
        output_directory=tmp_path / "models",
    )

    assert isinstance(trained, ModelPipelineResult)
    assert trained.training.metadata.model_name == "LogisticRegression"
    assert trained.training.metadata.target_column == "outcome"
    assert trained.training.metadata.feature_names == feature_names
    prepared = model_pipeline.requests[0].dataset
    assert tuple(
        dataset.label_name
        for dataset in (prepared.train, prepared.validation, prepared.test)
    ) == ("outcome", "outcome", "outcome")
    assert tuple(record.label for record in prepared.train.records) == tuple(
        record.label for record in train.records
    )
    assert tuple(
        dataset.feature_names
        for dataset in (prepared.train, prepared.validation, prepared.test)
    ) == (feature_names, feature_names, feature_names)


def test_model_training_forwards_selected_model_config_output_and_persistence() -> None:
    result = _model_result("DecisionTree")
    model_pipeline = _ModelPipelineStub(results=(result,))
    received_options: list[tuple[Path | None, ModelPersistence | None]] = []
    experiment_pipeline = _experiment_pipeline(model_pipeline, received_options)
    persistence = _PersistenceStub()
    output_directory = Path("synthetic-model-output")
    training_config: ExperimentModelTrainingConfig = ModelTrainingConfig(
        model=ModelConfig(
            name="DecisionTree",
            hyperparameters={"max_depth": 4},
        ),
        random_seed=19,
        target_column="insider",
        artifact_path=output_directory / "custom-model.joblib",
    )

    actual = experiment_pipeline.model_training(
        _ml_result(),
        selected_models=("DecisionTree",),
        random_seed=7,
        output_directory=output_directory,
        persistence=persistence,
        training_configs=(training_config,),
    )

    assert actual is result
    assert received_options == [(output_directory, persistence)]
    assert len(model_pipeline.requests) == 1
    assert model_pipeline.requests[0].config is training_config
    assert model_pipeline.requests[0].config.model.name == "DecisionTree"


def test_model_training_delegates_each_selected_model_without_wrapping_results() -> (
    None
):
    logistic_result = _model_result("LogisticRegression")
    tree_result = _model_result("DecisionTree")
    model_pipeline = _ModelPipelineStub(results=(logistic_result, tree_result))
    experiment_pipeline = _experiment_pipeline(model_pipeline)
    selected_models: tuple[ExperimentModelName, ...] = (
        "LogisticRegression",
        "DecisionTree",
    )

    actual = experiment_pipeline.model_training(
        _ml_result(),
        selected_models=selected_models,
        random_seed=13,
    )

    assert actual == (logistic_result, tree_result)
    assert isinstance(actual, tuple)
    assert actual[0] is logistic_result
    assert actual[1] is tree_result
    assert [request.config.model.name for request in model_pipeline.requests] == [
        "LogisticRegression",
        "DecisionTree",
    ]
    assert [request.config.random_seed for request in model_pipeline.requests] == [
        13,
        13,
    ]


def test_model_training_propagates_pipeline_exception_unchanged() -> None:
    error = ModelTrainingError("synthetic model failure")
    model_pipeline = _ModelPipelineStub(error=error)
    experiment_pipeline = _experiment_pipeline(model_pipeline)

    with pytest.raises(ModelTrainingError) as raised:
        experiment_pipeline.model_training(_ml_result())

    assert raised.value is error
    assert len(model_pipeline.requests) == 1


@pytest.mark.parametrize(
    "selected_models",
    [
        (),
        ("LightGBM",),
        ("DecisionTree", "DecisionTree"),
    ],
)
def test_model_training_rejects_empty_unsupported_or_duplicate_models(
    selected_models: tuple[str, ...],
) -> None:
    experiment_pipeline = _experiment_pipeline(_ModelPipelineStub())

    with pytest.raises(ModelTrainingError):
        experiment_pipeline.model_training(
            _ml_result(),
            selected_models=selected_models,  # type: ignore[arg-type]
        )


def test_model_training_rejects_configs_for_unselected_models() -> None:
    experiment_pipeline = _experiment_pipeline(_ModelPipelineStub())
    config = ModelTrainingConfig(model=ModelConfig(name="DecisionTree"))

    with pytest.raises(ModelTrainingError, match="unselected"):
        experiment_pipeline.model_training(
            _ml_result(),
            selected_models=("LogisticRegression",),
            training_configs=(config,),
        )


def test_model_training_rejects_duplicate_training_config_names() -> None:
    experiment_pipeline = _experiment_pipeline(_ModelPipelineStub())
    config = ModelTrainingConfig(model=ModelConfig(name="DecisionTree"))

    with pytest.raises(ModelTrainingError, match="unique"):
        experiment_pipeline.model_training(
            _ml_result(),
            selected_models=("DecisionTree",),
            training_configs=(config, config),
        )
