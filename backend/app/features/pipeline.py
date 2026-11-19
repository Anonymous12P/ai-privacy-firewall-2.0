"""Feature extraction orchestration for validated CERT CSV row iterables."""

import logging
from collections.abc import Iterable
from dataclasses import replace
from datetime import datetime, time
from pathlib import Path

from app.core.constants import APP_LOGGER_NAME
from app.features.aggregations import BehavioralAggregator
from app.features.encoder import FeatureEncoder, FeatureEncodingConfig
from app.features.exceptions import FeatureInputError, FeaturePipelineError
from app.features.exporter import FeatureExporter
from app.features.extractor import (
    DeviceFeatureExtractor,
    EmailFeatureExtractor,
    FeatureExtractor,
    FileFeatureExtractor,
    HTTPFeatureExtractor,
    LDAPFeatureExtractor,
    LogonFeatureExtractor,
)
from app.features.metadata import build_feature_metadata
from app.features.risk_scores import (
    BehavioralRiskConfig,
    BehavioralRiskGenerator,
)
from app.features.schemas import (
    AggregatedFeatureSet,
    AggregationWindow,
    CERTDataset,
    CERTGroundTruth,
    CERTGroundTruthInterval,
    EncodedFeatureRecord,
    EncodedFeatureSet,
    FeatureEngineeringRunResult,
    FeaturePipelineResult,
    RiskFeatureSet,
    TemporalFeatureSet,
    ValidatedCSVRows,
)
from app.features.temporal import (
    TemporalFeatureConfig,
    TemporalFeatureGenerator,
)
from app.features.validator import FeatureSetValidator

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.features.pipeline")


class FeaturePipeline:
    """Orchestrate validated row extraction through final artifact export.

    ``run`` does not discover or open raw files, preprocess data, scale
    features, train models, or select features. Export occurs only after the
    typed numerical feature set passes output validation.
    """

    def __init__(
        self,
        aggregator: BehavioralAggregator | None = None,
        temporal_generator: TemporalFeatureGenerator | None = None,
        risk_generator: BehavioralRiskGenerator | None = None,
        feature_encoder: FeatureEncoder | None = None,
        feature_validator: FeatureSetValidator | None = None,
        feature_exporter: FeatureExporter | None = None,
    ) -> None:
        """Create the supported extractors and downstream feature stages."""
        self._extractors: dict[CERTDataset, FeatureExtractor] = {
            CERTDataset.LOGON: LogonFeatureExtractor(),
            CERTDataset.FILE: FileFeatureExtractor(),
            CERTDataset.DEVICE: DeviceFeatureExtractor(),
            CERTDataset.HTTP: HTTPFeatureExtractor(),
            CERTDataset.EMAIL: EmailFeatureExtractor(),
            CERTDataset.LDAP: LDAPFeatureExtractor(),
        }
        self._aggregator = aggregator or BehavioralAggregator()
        self._temporal_generator = temporal_generator or TemporalFeatureGenerator()
        self._risk_generator = risk_generator or BehavioralRiskGenerator()
        self._feature_encoder = feature_encoder or FeatureEncoder()
        self._feature_validator = feature_validator or FeatureSetValidator()
        self._feature_exporter = feature_exporter or FeatureExporter()

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
        """Run extraction through feature encoding, validation, and export."""
        source_values = tuple(
            (sources,) if isinstance(sources, ValidatedCSVRows) else sources
        )
        if not source_values:
            raise FeaturePipelineError(
                "The full feature pipeline requires at least one source."
            )
        selected_temporal_config = temporal_config or TemporalFeatureConfig()
        selected_risk_config = risk_config or BehavioralRiskConfig()
        selected_encoding_config = encoding_config or FeatureEncodingConfig()

        extracted = tuple(self.extract(source) for source in source_values)
        aggregated = self.aggregate(extracted, window)
        temporal = self.generate_temporal(aggregated, selected_temporal_config)
        risk = self.generate_risk(temporal, selected_risk_config)
        encoded = self.encode_risk(risk, selected_encoding_config)
        if ground_truth is not None:
            encoded = _attach_ground_truth(encoded, ground_truth)
        validation = self._feature_validator.validate(encoded)
        metadata = build_feature_metadata(
            aggregated=aggregated,
            temporal=temporal,
            risk=risk,
            encoded=encoded,
            source_record_counts={
                result.dataset.value: len(result.records) for result in extracted
            },
            temporal_config=selected_temporal_config,
            risk_config=selected_risk_config,
            encoding_config=selected_encoding_config,
        )
        export = self._feature_exporter.export(
            encoded,
            metadata,
            validation,
            output_directory,
        )
        logger.info(
            "End-to-end feature pipeline completed: sources=%d, rows=%d, columns=%d",
            len(source_values),
            validation.row_count,
            validation.column_count,
        )
        return FeatureEngineeringRunResult(
            aggregated=aggregated,
            temporal=temporal,
            risk=risk,
            encoded=encoded,
            export=export,
        )

    def extract(self, source: ValidatedCSVRows) -> FeaturePipelineResult:
        """Extract typed records from one upstream-validated source."""
        if not isinstance(source.dataset, CERTDataset):
            raise FeatureInputError(
                f"Unsupported CERT dataset value: {source.dataset!r}."
            )
        logger.info(
            "Feature extraction started: dataset=%s",
            source.dataset.value,
        )
        return self._extractors[source.dataset].extract(source)

    def aggregate(
        self,
        results: Iterable[FeaturePipelineResult],
        window: AggregationWindow = AggregationWindow.DAILY,
    ) -> AggregatedFeatureSet:
        """Aggregate previously extracted result sets by calendar window."""
        return self._aggregator.aggregate(results, window)

    def generate_temporal(
        self,
        aggregated: AggregatedFeatureSet,
        config: TemporalFeatureConfig | None = None,
    ) -> TemporalFeatureSet:
        """Generate temporal metrics from an aggregated feature set."""
        return self._temporal_generator.generate(aggregated, config)

    def generate_risk(
        self,
        temporal: TemporalFeatureSet,
        config: BehavioralRiskConfig | None = None,
    ) -> RiskFeatureSet:
        """Generate explainable behavioral risk indicators from temporal data."""
        return self._risk_generator.generate(temporal, config)

    def encode_risk(
        self,
        risk_features: RiskFeatureSet,
        config: FeatureEncodingConfig | None = None,
    ) -> EncodedFeatureSet:
        """Encode a risk feature batch using the configured categorical strategy."""
        return self._feature_encoder.encode(risk_features, config)


def _attach_ground_truth(
    encoded: EncodedFeatureSet,
    ground_truth: CERTGroundTruth,
) -> EncodedFeatureSet:
    """Join CERT insider intervals to the encoded user/window feature rows."""
    target_column = ground_truth.target_column.strip()
    if not target_column:
        raise FeaturePipelineError("Ground-truth target column must not be empty.")
    if target_column in encoded.feature_names:
        raise FeaturePipelineError(
            f"Ground-truth target {target_column!r} conflicts with a feature name."
        )

    intervals_by_subject: dict[str, list[CERTGroundTruthInterval]] = {}
    for interval in ground_truth.intervals:
        intervals_by_subject.setdefault(interval.subject_id, []).append(interval)

    labeled_records: list[EncodedFeatureRecord] = []
    for record in encoded.records:
        window_start = datetime.combine(record.window_start, time.min)
        window_end = datetime.combine(record.window_end, time.min)
        is_insider = any(
            interval.start < window_end and interval.end >= window_start
            for interval in intervals_by_subject.get(record.subject_id, ())
        )
        labeled_records.append(
            replace(record, label="insider" if is_insider else "normal")
        )
    return replace(
        encoded,
        records=tuple(labeled_records),
        target_column=target_column,
    )
