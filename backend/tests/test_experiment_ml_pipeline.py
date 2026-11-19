"""Tests for delegated ML preprocessing in the experiment package."""

from dataclasses import replace
from datetime import date
from pathlib import Path

import pytest

from app.experiments import ExperimentConfigurationError, ExperimentPipeline
from app.features.schemas import (
    AggregatedFeatureSet,
    AggregationWindow,
    CERTDataset,
    EncodedFeatureRecord,
    EncodedFeatureSet,
    FeatureEncodingMetadata,
    FeatureEngineeringRunResult,
    FeatureExportResult,
    RiskFeatureSet,
    TemporalFeatureSet,
)
from app.ml.exceptions import MLTargetColumnError
from app.ml.exporter import MLExporter
from app.ml.pipeline import MLPipeline
from app.ml.schemas import (
    BalanceConfig,
    DatasetConfig,
    DatasetLoadConfig,
    DatasetSplit,
    MLDataset,
    MLExportResult,
    MLPipelineRequest,
    MLPipelineResult,
    MLValidationResult,
    PreprocessingConfig,
    PreprocessingMetadata,
    SplitConfig,
)
from app.ml.splitter import DeterministicDatasetSplitter


def _feature_result() -> FeatureEngineeringRunResult:
    """Create encoded synthetic rows without feature or file processing."""
    feature_names = ("login_count", "risk_index")
    return FeatureEngineeringRunResult(
        aggregated=AggregatedFeatureSet(
            window=AggregationWindow.DAILY,
            source_datasets=(CERTDataset.LOGON,),
            records=(),
        ),
        temporal=TemporalFeatureSet(records=()),
        risk=RiskFeatureSet(records=()),
        encoded=EncodedFeatureSet(
            feature_names=feature_names,
            records=(
                EncodedFeatureRecord(
                    "U001",
                    (1.0, 0.1),
                    date(2010, 1, 1),
                    date(2010, 1, 1),
                    "normal",
                ),
                EncodedFeatureRecord(
                    "U002",
                    (2.0, 0.2),
                    date(2010, 1, 1),
                    date(2010, 1, 1),
                    "insider",
                ),
                EncodedFeatureRecord(
                    "U003",
                    (3.0, 0.3),
                    date(2010, 1, 1),
                    date(2010, 1, 1),
                    "normal",
                ),
                EncodedFeatureRecord(
                    "U004",
                    (4.0, 0.4),
                    date(2010, 1, 1),
                    date(2010, 1, 1),
                    "insider",
                ),
            ),
            metadata=FeatureEncodingMetadata(
                strategy="one_hot",
                mappings={},
                encoded_columns={},
                numeric_columns=feature_names,
                missing_policy="category",
                unseen_policy="unknown",
            ),
            target_column="insider",
        ),
        export=FeatureExportResult(
            output_directory=Path("synthetic-feature-output"),
            artifact_paths={"features.parquet": Path("synthetic/features.parquet")},
            sha256={"features.parquet": "a" * 64},
        ),
    )


def _ml_result() -> MLPipelineResult:
    """Create a recognizable ML result without running any ML stages."""
    dataset = MLDataset(
        feature_names=("login_count", "risk_index"),
        records=(),
    )
    return MLPipelineResult(
        split=DatasetSplit(train=dataset, validation=dataset, test=dataset),
        preprocessing=PreprocessingMetadata(
            feature_names=dataset.feature_names,
            strategy="none",
            fitted=False,
        ),
        run_id="synthetic-run",
        validation=MLValidationResult(success=True, checked_partitions=()),
        export=MLExportResult(
            output_directory=Path("synthetic-ml-output"),
            artifacts=(),
            manifest_path=Path("synthetic-ml-output/ml_manifest.json"),
        ),
    )


class _MLPipelineStub(MLPipeline):
    """Capture one ML request and return or raise a configured value."""

    def __init__(
        self,
        result: MLPipelineResult | None = None,
        error: Exception | None = None,
    ) -> None:
        """Initialize a stub without constructing or executing ML stages."""
        self.result = result
        self.error = error
        self.requests: list[MLPipelineRequest] = []

    def run(self, request: MLPipelineRequest) -> MLPipelineResult:
        """Capture a request and return the configured output unchanged."""
        self.requests.append(request)
        if self.error is not None:
            raise self.error
        if self.result is None:
            raise AssertionError("A result must be configured for this test.")
        return self.result


def _create_pipeline(
    ml_pipeline: _MLPipelineStub,
    received_output_directories: list[Path | None],
) -> ExperimentPipeline:
    """Inject an ML pipeline factory and capture the requested output path."""

    def factory(output_directory: Path | None) -> MLPipeline:
        received_output_directories.append(output_directory)
        return ml_pipeline

    return ExperimentPipeline(ml_pipeline_factory=factory)


def test_machine_learning_calls_mlpipeline_once_and_returns_same_result() -> None:
    result = _ml_result()
    ml_pipeline = _MLPipelineStub(result=result)
    output_directories: list[Path | None] = []
    experiment_pipeline = _create_pipeline(ml_pipeline, output_directories)
    feature_result = _feature_result()

    actual = experiment_pipeline.machine_learning(feature_result)

    assert actual is result
    assert len(ml_pipeline.requests) == 1
    assert output_directories == [None]


def test_machine_learning_forwards_encoded_data_configuration_and_output_path() -> None:
    result = _ml_result()
    ml_pipeline = _MLPipelineStub(result=result)
    output_directories: list[Path | None] = []
    experiment_pipeline = _create_pipeline(ml_pipeline, output_directories)
    feature_result = _feature_result()
    dataset_load_config = DatasetLoadConfig(
        source=DatasetConfig(
            name="synthetic-experiment",
            path=Path("synthetic/input.parquet"),
            feature_columns=("login_count", "risk_index"),
        ),
        format="parquet",
    )
    split_config = SplitConfig(random_seed=17, strategy="random")
    balance_config = BalanceConfig(strategy="none", random_seed=29)
    preprocessing_config = PreprocessingConfig(
        missing_value_strategy="leave",
        scaling_strategy="none",
    )
    output_directory = Path("temporary-ml-output")

    actual = experiment_pipeline.machine_learning(
        feature_result,
        dataset_load_config=dataset_load_config,
        split_config=split_config,
        balance_config=balance_config,
        preprocessing_config=preprocessing_config,
        output_directory=output_directory,
    )

    assert actual is result
    assert output_directories == [output_directory]
    assert len(ml_pipeline.requests) == 1
    request = ml_pipeline.requests[0]
    assert request.config.dataset is not dataset_load_config
    assert request.config.dataset.source.name == "synthetic-experiment"
    assert request.config.dataset.source.path == Path("synthetic/input.parquet")
    assert request.config.dataset.source.label_column == "insider"
    assert request.config.split is split_config
    assert request.config.balance is balance_config
    assert request.config.preprocessing is preprocessing_config
    assert request.dataset is not None
    assert request.dataset.feature_names == feature_result.encoded.feature_names
    assert tuple(record.subject_id for record in request.dataset.records) == tuple(
        f"{record.subject_id}_{row_number:06d}"
        for row_number, record in enumerate(feature_result.encoded.records, start=1)
    )
    assert tuple(record.values for record in request.dataset.records) == tuple(
        record.values for record in feature_result.encoded.records
    )
    assert request.dataset.metadata.source_path == Path("synthetic/input.parquet")
    assert request.dataset.metadata.sha256 == "a" * 64
    assert request.dataset.label_name == "insider"
    assert tuple(record.label for record in request.dataset.records) == (
        "normal",
        "insider",
        "normal",
        "insider",
    )


def test_machine_learning_default_loader_configuration_uses_feature_artifacts() -> None:
    ml_pipeline = _MLPipelineStub(result=_ml_result())
    experiment_pipeline = _create_pipeline(ml_pipeline, [])
    feature_result = _feature_result()

    experiment_pipeline.machine_learning(feature_result)

    request = ml_pipeline.requests[0]
    assert request.config.dataset.source.name == "experiment-features"
    assert request.config.dataset.source.path == Path("synthetic/features.parquet")
    assert request.config.dataset.source.feature_columns == (
        feature_result.encoded.feature_names
    )
    assert request.config.dataset.source.label_column == "insider"
    assert request.config.dataset.format == "parquet"
    assert request.config.split.strategy == "stratified"


def test_machine_learning_maps_configured_target_and_stratifies_labels() -> None:
    base_result = _feature_result()
    feature_names = ("login_count",)
    labeled_records = tuple(
        EncodedFeatureRecord(
            subject_id=f"user-{index:02}",
            values=(float(index),),
            window_start=date(2010, 1, 1),
            window_end=date(2010, 1, 1),
            label="insider" if index % 2 else "normal",
        )
        for index in range(30)
    )
    feature_result = replace(
        base_result,
        encoded=replace(
            base_result.encoded,
            feature_names=feature_names,
            records=labeled_records,
            target_column="outcome",
        ),
    )
    dataset_config = DatasetLoadConfig(
        source=DatasetConfig(
            name="labeled-synthetic",
            feature_columns=("login_count",),
            label_column="outcome",
        ),
        format="parquet",
    )
    ml_pipeline = _MLPipelineStub(result=_ml_result())
    experiment_pipeline = _create_pipeline(ml_pipeline, [])

    experiment_pipeline.machine_learning(
        feature_result,
        dataset_load_config=dataset_config,
    )

    request = ml_pipeline.requests[0]
    assert request.config.dataset is dataset_config
    assert request.config.split.strategy == "stratified"
    assert request.dataset is not None
    assert request.dataset.label_name == "outcome"
    assert request.dataset.feature_names == ("login_count",)
    assert request.dataset.records[0].values == (0.0,)
    assert tuple(record.label for record in request.dataset.records) == tuple(
        "insider" if index % 2 else "normal" for index in range(30)
    )
    assert request.dataset.metadata.class_distribution == {
        "insider": 15,
        "normal": 15,
    }

    split = DeterministicDatasetSplitter().split(
        request.dataset,
        request.config.split,
    )
    assert split.metadata.strategy == "stratified"
    assert split.metadata.class_distribution == {
        "train": {"insider": 11, "normal": 11},
        "validation": {"insider": 2, "normal": 2},
        "test": {"insider": 2, "normal": 2},
    }


def test_machine_learning_assigns_unique_ids_and_real_ml_validation_accepts_them(
    tmp_path: Path,
) -> None:
    source_result = _feature_result()
    duplicate_subject_records = tuple(
        replace(record, subject_id="EMP001") for record in source_result.encoded.records
    )
    feature_result = replace(
        source_result,
        encoded=replace(
            source_result.encoded,
            records=duplicate_subject_records,
        ),
    )
    ml_pipeline = MLPipeline(dataset_exporter=MLExporter(tmp_path / "ml-output"))
    output_directories: list[Path | None] = []

    def factory(output_directory: Path | None) -> MLPipeline:
        output_directories.append(output_directory)
        return ml_pipeline

    experiment_pipeline = ExperimentPipeline(ml_pipeline_factory=factory)
    result = experiment_pipeline.machine_learning(
        feature_result,
        split_config=SplitConfig(strategy="random", random_seed=37),
    )
    partitions = (result.split.train, result.split.validation, result.split.test)
    split_records = tuple(
        record for partition in partitions for record in partition.records
    )
    source_ids = tuple(record.subject_id for record in split_records)
    expected_ids = tuple(
        f"EMP001_{row_number:06d}"
        for row_number in range(1, len(duplicate_subject_records) + 1)
    )

    assert result.validation is not None
    assert result.validation.success
    assert output_directories == [None]
    assert len(set(source_ids)) == len(duplicate_subject_records)
    assert set(source_ids) == set(expected_ids)
    assert sum(len(partition.records) for partition in partitions) == len(
        duplicate_subject_records
    )
    assert all(
        tuple(record.subject_id for record in partition.records)
        == tuple(
            sorted(
                (record.subject_id for record in partition.records),
                key=lambda subject_id: int(subject_id.rsplit("_", maxsplit=1)[1]),
            )
        )
        for partition in partitions
    )
    assert all(subject_id.startswith("EMP001_") for subject_id in source_ids)


def test_machine_learning_rejects_missing_configured_target() -> None:
    ml_pipeline = _MLPipelineStub(result=_ml_result())
    experiment_pipeline = _create_pipeline(ml_pipeline, [])
    dataset_config = DatasetLoadConfig(
        source=DatasetConfig(name="missing-target", label_column="outcome")
    )

    with pytest.raises(MLTargetColumnError, match="outcome"):
        experiment_pipeline.machine_learning(
            _feature_result(),
            dataset_load_config=dataset_config,
        )

    assert ml_pipeline.requests == []


def test_machine_learning_rejects_unlabeled_dataset_before_delegation() -> None:
    ml_pipeline = _MLPipelineStub(result=_ml_result())
    experiment_pipeline = _create_pipeline(ml_pipeline, [])
    feature_result = _feature_result()
    unlabeled = replace(
        feature_result.encoded,
        target_column=None,
        records=tuple(
            replace(record, label=None) for record in feature_result.encoded.records
        ),
    )

    with pytest.raises(
        ExperimentConfigurationError,
        match="contains no target column or target labels",
    ):
        experiment_pipeline.machine_learning(replace(feature_result, encoded=unlabeled))

    assert ml_pipeline.requests == []


def test_machine_learning_propagates_mlpipeline_errors() -> None:
    error = ValueError("synthetic ML-stage error")
    ml_pipeline = _MLPipelineStub(error=error)
    experiment_pipeline = _create_pipeline(ml_pipeline, [])

    with pytest.raises(ValueError) as raised:
        experiment_pipeline.machine_learning(_feature_result())

    assert raised.value is error
    assert len(ml_pipeline.requests) == 1
