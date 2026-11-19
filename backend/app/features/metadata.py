"""Reproducibility metadata construction for exported feature datasets."""

import platform
from collections.abc import Mapping
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from typing import Any

from app.features.encoder import FeatureEncodingConfig
from app.features.risk_scores import BehavioralRiskConfig
from app.features.schemas import (
    AggregatedFeatureSet,
    EncodedFeatureSet,
    RiskFeatureSet,
    TemporalFeatureSet,
)
from app.features.temporal import TemporalFeatureConfig


@dataclass(frozen=True, slots=True)
class FeatureRunMetadata:
    """Capture input scope, stage counts, configuration, and runtime version."""

    generated_at: str
    python_version: str
    source_datasets: tuple[str, ...]
    source_record_counts: Mapping[str, int]
    aggregated_record_count: int
    temporal_record_count: int
    risk_record_count: int
    exported_row_count: int
    feature_names: tuple[str, ...]
    temporal_config: Mapping[str, Any]
    risk_config: Mapping[str, Any]
    encoding_config: Mapping[str, Any]
    target_column: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Return JSON-compatible reproducibility metadata."""
        return asdict(self)


def build_feature_metadata(
    aggregated: AggregatedFeatureSet,
    temporal: TemporalFeatureSet,
    risk: RiskFeatureSet,
    encoded: EncodedFeatureSet,
    source_record_counts: Mapping[str, int],
    temporal_config: TemporalFeatureConfig,
    risk_config: BehavioralRiskConfig,
    encoding_config: FeatureEncodingConfig,
) -> FeatureRunMetadata:
    """Build deterministic configuration metadata with a run timestamp."""
    return FeatureRunMetadata(
        generated_at=datetime.now(UTC).isoformat(timespec="microseconds"),
        python_version=platform.python_version(),
        source_datasets=tuple(
            dataset.value for dataset in sorted(aggregated.source_datasets)
        ),
        source_record_counts=dict(sorted(source_record_counts.items())),
        aggregated_record_count=len(aggregated.records),
        temporal_record_count=len(temporal.records),
        risk_record_count=len(risk.records),
        exported_row_count=len(encoded.records),
        feature_names=encoded.feature_names,
        temporal_config=asdict(temporal_config),
        risk_config=asdict(risk_config),
        encoding_config=asdict(encoding_config),
        target_column=encoded.target_column,
    )
