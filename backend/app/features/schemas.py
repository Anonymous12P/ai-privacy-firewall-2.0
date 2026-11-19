"""Typed data contracts shared by future feature processing stages."""

from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field
from datetime import date, datetime
from enum import StrEnum
from pathlib import Path

type FeatureValue = float | int | str | bool | None
type CSVRow = Mapping[str, str | None]


class CERTDataset(StrEnum):
    """Supported CERT source file families for row extraction."""

    LOGON = "logon"
    FILE = "file"
    DEVICE = "device"
    HTTP = "http"
    EMAIL = "email"
    LDAP = "ldap"


class AggregationWindow(StrEnum):
    """Calendar window size used when grouping behavioral records."""

    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class RiskLevel(StrEnum):
    """Qualitative label for a future calibrated risk score."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass(frozen=True, slots=True)
class FeatureRequest:
    """Identify a subject and time window for a future feature computation."""

    subject_id: str
    window_start: datetime
    window_end: datetime


@dataclass(frozen=True, slots=True)
class ValidatedCSVRows:
    """CSV header and row iterator supplied by an upstream validation stage.

    The feature package consumes the already validated rows; it does not
    discover files, open paths, or validate the source file on disk.
    """

    dataset: CERTDataset
    headers: tuple[str, ...]
    rows: Iterable[CSVRow]


@dataclass(frozen=True, slots=True)
class FeatureRecord:
    """One typed event or directory record from a supported CERT CSV."""

    dataset: CERTDataset
    row_number: int
    subject_id: str
    timestamp: datetime | None
    attributes: Mapping[str, str]


@dataclass(frozen=True, slots=True)
class FeaturePipelineResult:
    """Records produced by one dataset-specific extraction request."""

    dataset: CERTDataset
    records: tuple[FeatureRecord, ...]


@dataclass(frozen=True, slots=True)
class BehavioralFeatureRecord:
    """Aggregated activity for one subject in one calendar window."""

    subject_id: str
    window: AggregationWindow
    window_start: date
    window_end: date
    event_counts: Mapping[str, int]
    unique_entity_counts: Mapping[str, int]
    first_timestamp: datetime | None
    last_timestamp: datetime | None
    ldap_attributes: Mapping[str, str]
    event_timestamps: Mapping[str, tuple[datetime, ...]]
    login_timestamps: tuple[datetime, ...]
    logout_timestamps: tuple[datetime, ...]
    source_entity_values: Mapping[str, tuple[str, ...]] = field(default_factory=dict)
    source_activity_counts: Mapping[str, int] = field(default_factory=dict)
    source_event_counts: Mapping[str, int] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class AggregatedFeatureSet:
    """Deterministically ordered behavioral records across input datasets."""

    window: AggregationWindow
    source_datasets: tuple[CERTDataset, ...]
    records: tuple[BehavioralFeatureRecord, ...]


@dataclass(frozen=True, slots=True)
class TemporalFeatureRecord:
    """Calendar and time metrics for one subject's aggregated window."""

    subject_id: str
    window: AggregationWindow
    window_start: date
    window_end: date
    login_time_mean_seconds: float | None
    login_time_min_seconds: float | None
    login_time_max_seconds: float | None
    logout_time_mean_seconds: float | None
    logout_time_min_seconds: float | None
    logout_time_max_seconds: float | None
    session_count: int | None
    session_total_seconds: float | None
    session_mean_seconds: float | None
    session_max_seconds: float | None
    weekday_event_count: int | None
    weekend_event_count: int | None
    business_hours_event_count: int | None
    after_hours_event_count: int | None
    activity_frequencies: Mapping[str, float]
    source_entity_values: Mapping[str, tuple[str, ...]] = field(default_factory=dict)
    source_activity_counts: Mapping[str, int] = field(default_factory=dict)
    source_event_counts: Mapping[str, int] = field(default_factory=dict)
    login_timestamps: tuple[datetime, ...] = ()


@dataclass(frozen=True, slots=True)
class TemporalFeatureSet:
    """Deterministically ordered temporal records for aggregated windows."""

    records: tuple[TemporalFeatureRecord, ...]


@dataclass(frozen=True, slots=True)
class RiskFeatureRecord:
    """Explainable behavioral component scores for one subject/window."""

    subject_id: str
    window: AggregationWindow
    window_start: date
    window_end: date
    indicators: Mapping[str, float | None]
    component_scores: Mapping[str, float]
    behavioral_risk_index: float


@dataclass(frozen=True, slots=True)
class RiskFeatureSet:
    """Deterministically ordered behavioral risk indicators."""

    records: tuple[RiskFeatureRecord, ...]


@dataclass(frozen=True, slots=True)
class FeatureContext:
    """Provide the request metadata required by feature-stage contracts."""

    request: FeatureRequest
    reference_time: datetime


@dataclass(frozen=True, slots=True)
class FeatureGroup:
    """Represent named typed feature values from one conceptual domain."""

    name: str
    values: dict[str, FeatureValue]


@dataclass(frozen=True, slots=True)
class FeatureSet:
    """Collect feature groups for one subject and analysis window."""

    subject_id: str
    window_start: datetime
    window_end: datetime
    groups: tuple[FeatureGroup, ...]


@dataclass(frozen=True, slots=True)
class EncodedFeatureRecord:
    """Represent one numerically encoded subject/window row."""

    subject_id: str
    values: tuple[float, ...]
    window_start: date
    window_end: date
    label: str | None = None


@dataclass(frozen=True, slots=True)
class FeatureEncodingMetadata:
    """Describe the fitted-in-batch categorical mappings and output columns."""

    strategy: str
    mappings: Mapping[str, Mapping[str, float]]
    encoded_columns: Mapping[str, tuple[str, ...]]
    numeric_columns: tuple[str, ...]
    missing_policy: str
    unseen_policy: str


@dataclass(frozen=True, slots=True)
class EncodedFeatureSet:
    """Represent ordered numeric rows and metadata for a risk feature batch."""

    feature_names: tuple[str, ...]
    records: tuple[EncodedFeatureRecord, ...]
    metadata: FeatureEncodingMetadata
    target_column: str | None = None


@dataclass(frozen=True, slots=True)
class CERTGroundTruthInterval:
    """Represent one annotated insider activity interval from CERT answers."""

    subject_id: str
    start: datetime
    end: datetime


@dataclass(frozen=True, slots=True)
class CERTGroundTruth:
    """Associate CERT insider intervals with a supervised target column."""

    target_column: str
    intervals: tuple[CERTGroundTruthInterval, ...]


@dataclass(frozen=True, slots=True)
class FeatureExportResult:
    """Paths and SHA-256 digests for artifacts written by the feature pipeline."""

    output_directory: Path
    artifact_paths: Mapping[str, Path]
    sha256: Mapping[str, str]


@dataclass(frozen=True, slots=True)
class FeatureEngineeringRunResult:
    """Typed results from extraction through final feature artifact export."""

    aggregated: AggregatedFeatureSet
    temporal: TemporalFeatureSet
    risk: RiskFeatureSet
    encoded: EncodedFeatureSet
    export: FeatureExportResult


@dataclass(frozen=True, slots=True)
class RiskScore:
    """Represent a risk score result without prescribing a scoring algorithm."""

    subject_id: str
    value: float
    level: RiskLevel
    scored_at: datetime
    rationale: tuple[str, ...] = ()
