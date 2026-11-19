"""Tests for delegated feature engineering in the experiment pipeline."""

from collections.abc import Iterable
from pathlib import Path

import pytest

from app.experiments import (
    ExperimentPipeline,
    FeatureEngineeringRunResult,
)
from app.features.encoder import FeatureEncodingConfig
from app.features.pipeline import FeaturePipeline
from app.features.risk_scores import BehavioralRiskConfig
from app.features.schemas import (
    AggregatedFeatureSet,
    AggregationWindow,
    CERTDataset,
    CERTGroundTruth,
    EncodedFeatureSet,
    FeatureEncodingMetadata,
    FeatureExportResult,
    RiskFeatureSet,
    TemporalFeatureSet,
    ValidatedCSVRows,
)
from app.features.temporal import TemporalFeatureConfig


def _validated_rows(dataset: CERTDataset = CERTDataset.LOGON) -> ValidatedCSVRows:
    """Create an in-memory validated input without filesystem access."""
    return ValidatedCSVRows(
        dataset=dataset,
        headers=("id", "date", "user", "pc", "activity"),
        rows=(
            {
                "id": "event-1",
                "date": "01/01/2010 08:00:00",
                "user": "U001",
                "pc": "PC-1",
                "activity": "Logon",
            },
        ),
    )


def _feature_result() -> FeatureEngineeringRunResult:
    """Create a complete feature pipeline result in memory."""
    return FeatureEngineeringRunResult(
        aggregated=AggregatedFeatureSet(
            window=AggregationWindow.DAILY,
            source_datasets=(CERTDataset.LOGON,),
            records=(),
        ),
        temporal=TemporalFeatureSet(records=()),
        risk=RiskFeatureSet(records=()),
        encoded=EncodedFeatureSet(
            feature_names=(),
            records=(),
            metadata=FeatureEncodingMetadata(
                strategy="one_hot",
                mappings={},
                encoded_columns={},
                numeric_columns=(),
                missing_policy="category",
                unseen_policy="unknown",
            ),
        ),
        export=FeatureExportResult(
            output_directory=Path("synthetic-output"),
            artifact_paths={},
            sha256={},
        ),
    )


class _PipelineStub(ExperimentPipeline):
    """Concrete experiment pipeline used only to expose the delegation method."""


class _FeaturePipelineStub(FeaturePipeline):
    """Capture feature pipeline calls and return a configured result."""

    def __init__(
        self,
        result: FeatureEngineeringRunResult | None = None,
        error: Exception | None = None,
    ) -> None:
        """Initialize call capture without constructing feature stages."""
        self.result = result
        self.error = error
        self.calls: list[
            tuple[
                ValidatedCSVRows | Iterable[ValidatedCSVRows],
                AggregationWindow,
                TemporalFeatureConfig | None,
                BehavioralRiskConfig | None,
                FeatureEncodingConfig | None,
                Path | None,
            ]
        ] = []

    def run(
        self,
        sources: ValidatedCSVRows | Iterable[ValidatedCSVRows],
        window: AggregationWindow = AggregationWindow.DAILY,
        *,
        temporal_config: TemporalFeatureConfig | None = None,
        risk_config: BehavioralRiskConfig | None = None,
        encoding_config: FeatureEncodingConfig | None = None,
        ground_truth: CERTGroundTruth | None = None,
        output_directory: Path | None = None,
    ) -> FeatureEngineeringRunResult:
        """Record one delegated call and return or raise the configured value."""
        del ground_truth
        self.calls.append(
            (
                sources,
                window,
                temporal_config,
                risk_config,
                encoding_config,
                output_directory,
            )
        )
        if self.error is not None:
            raise self.error
        if self.result is None:
            raise AssertionError("A result must be configured for this test.")
        return self.result


def test_feature_engineering_delegates_once_and_returns_identical_result() -> None:
    result = _feature_result()
    feature_pipeline = _FeaturePipelineStub(result=result)
    experiment_pipeline = _PipelineStub(feature_pipeline=feature_pipeline)
    rows = _validated_rows()

    actual = experiment_pipeline.feature_engineering(rows)

    assert actual is result
    assert len(feature_pipeline.calls) == 1
    assert feature_pipeline.calls[0][0] is rows
    assert feature_pipeline.calls[0][1] is AggregationWindow.DAILY


def test_feature_engineering_forwards_all_configuration_and_destination() -> None:
    result = _feature_result()
    feature_pipeline = _FeaturePipelineStub(result=result)
    experiment_pipeline = _PipelineStub(feature_pipeline=feature_pipeline)
    rows = _validated_rows()
    sources = (rows, _validated_rows(CERTDataset.DEVICE))
    window = AggregationWindow.WEEKLY
    temporal_config = TemporalFeatureConfig(
        business_start_hour=8,
        business_end_hour=16,
        weekend_days=(4, 5),
    )
    risk_config = BehavioralRiskConfig(suspicious_domains=("example.test",))
    encoding_config = FeatureEncodingConfig(
        strategy="label",
        categorical_fields=("subject_id",),
    )
    output_directory = Path("temporary-feature-output")

    actual = experiment_pipeline.feature_engineering(
        sources,
        window,
        temporal_config=temporal_config,
        risk_config=risk_config,
        encoding_config=encoding_config,
        output_directory=output_directory,
    )

    assert actual is result
    assert len(feature_pipeline.calls) == 1
    (
        passed_sources,
        passed_window,
        passed_temporal,
        passed_risk,
        passed_encoding,
        passed_output,
    ) = feature_pipeline.calls[0]
    assert passed_sources is sources
    assert passed_window is window
    assert passed_temporal is temporal_config
    assert passed_risk is risk_config
    assert passed_encoding is encoding_config
    assert passed_output is output_directory


def test_feature_engineering_propagates_feature_pipeline_errors() -> None:
    error = ValueError("synthetic feature-stage error")
    feature_pipeline = _FeaturePipelineStub(error=error)
    experiment_pipeline = _PipelineStub(feature_pipeline=feature_pipeline)

    with pytest.raises(ValueError) as raised:
        experiment_pipeline.feature_engineering(_validated_rows())

    assert raised.value is error
    assert len(feature_pipeline.calls) == 1
