"""Deterministic behavioral risk indicators from temporal feature records.

The rules in this module produce transparent heuristics, not calibrated
predictions. They do not consume labels, train models, or modify input data.
"""

import logging
import math
from abc import ABC, abstractmethod
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import PurePosixPath, PureWindowsPath
from urllib.parse import urlsplit

from app.core.constants import APP_LOGGER_NAME
from app.features.exceptions import FeatureRiskError
from app.features.schemas import (
    RiskFeatureRecord,
    RiskFeatureSet,
    TemporalFeatureRecord,
    TemporalFeatureSet,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.features.risk")

_COMPONENTS = ("login", "file", "usb", "email", "http", "session")
_DEFAULT_THRESHOLDS = {
    "login": 0.25,
    "file": 1.0,
    "usb": 1.0,
    "email": 100.0,
    "http": 1.0,
    "session": 8.0 * 60.0 * 60.0,
}
_CONNECT_ACTIVITIES = frozenset({"connect", "insert", "attach", "mount"})


@dataclass(frozen=True, slots=True)
class BehavioralRiskConfig:
    """Configure heuristic thresholds, component weights, and risk context.

    Login risk uses the proportion of logins outside business hours or on a
    configured weekend day. Other component indicators are counts, except
    session risk, which uses the longest completed session in seconds.
    """

    thresholds: Mapping[str, float] = field(
        default_factory=lambda: dict(_DEFAULT_THRESHOLDS)
    )
    weights: Mapping[str, float] = field(
        default_factory=lambda: dict.fromkeys(_COMPONENTS, 1.0)
    )
    business_start_hour: int = 9
    business_end_hour: int = 17
    weekend_days: tuple[int, ...] = (5, 6)
    suspicious_domains: tuple[str, ...] = ()
    suspicious_extensions: tuple[str, ...] = (
        ".exe",
        ".dll",
        ".bat",
        ".cmd",
        ".ps1",
        ".zip",
        ".7z",
        ".rar",
    )

    def __post_init__(self) -> None:
        """Validate all configurable risk values before generation."""
        for field_name, supplied, defaults, allow_zero in (
            ("thresholds", self.thresholds, _DEFAULT_THRESHOLDS, False),
            ("weights", self.weights, dict.fromkeys(_COMPONENTS, 1.0), True),
        ):
            unknown = set(supplied) - set(_COMPONENTS)
            if unknown:
                raise FeatureRiskError(
                    f"{field_name} contains unknown components: "
                    f"{', '.join(sorted(unknown))}."
                )
            values = {**defaults, **supplied}
            for name, value in values.items():
                if (
                    isinstance(value, bool)
                    or not isinstance(value, (int, float))
                    or not math.isfinite(value)
                    or value < 0
                    or (not allow_zero and value == 0)
                ):
                    qualifier = "non-negative" if allow_zero else "positive"
                    raise FeatureRiskError(
                        f"{field_name}[{name!r}] must be finite and {qualifier}."
                    )
            object.__setattr__(
                self,
                field_name,
                {name: float(value) for name, value in values.items()},
            )

        if not any(self.weights.values()):
            raise FeatureRiskError("At least one component weight must be positive.")
        if not 0 <= self.business_start_hour < self.business_end_hour <= 24:
            raise FeatureRiskError(
                "Business hours must satisfy 0 <= start < end <= 24."
            )
        if any(day < 0 or day > 6 for day in self.weekend_days):
            raise FeatureRiskError("Weekend weekday indexes must be between 0 and 6.")
        if len(set(self.weekend_days)) != len(self.weekend_days):
            raise FeatureRiskError("weekend_days must not contain duplicates.")
        if any(not domain.strip() for domain in self.suspicious_domains):
            raise FeatureRiskError("Suspicious domains must not be empty strings.")
        if any(not extension.strip() for extension in self.suspicious_extensions):
            raise FeatureRiskError(
                "Suspicious file extensions must not be empty strings."
            )
        normalized_domains = tuple(
            sorted(
                {
                    domain.strip().casefold().rstrip(".")
                    for domain in self.suspicious_domains
                }
            )
        )
        normalized_extensions = tuple(
            sorted(
                {
                    (
                        extension.strip().casefold()
                        if extension.strip().startswith(".")
                        else f".{extension.strip().casefold()}"
                    )
                    for extension in self.suspicious_extensions
                }
            )
        )
        object.__setattr__(self, "suspicious_domains", normalized_domains)
        object.__setattr__(self, "suspicious_extensions", normalized_extensions)


class RiskScoreCalculator(ABC):
    """Define the interface for explainable behavioral risk generation."""

    @abstractmethod
    def generate(
        self,
        temporal: TemporalFeatureSet,
        config: BehavioralRiskConfig | None = None,
    ) -> RiskFeatureSet:
        """Generate typed risk indicators and component scores."""
        raise NotImplementedError


class BehavioralRiskGenerator(RiskScoreCalculator):
    """Generate deterministic, configurable behavioral risk indicators."""

    def generate(
        self,
        temporal: TemporalFeatureSet,
        config: BehavioralRiskConfig | None = None,
    ) -> RiskFeatureSet:
        """Score temporal records and return stable subject/window ordering."""
        selected_config = config or BehavioralRiskConfig()
        logger.info(
            "Behavioral risk generation started: records=%d", len(temporal.records)
        )
        ordered_records = sorted(
            temporal.records,
            key=lambda record: (
                record.subject_id,
                record.window_start,
                record.window_end,
            ),
        )
        results = tuple(
            self._generate_record(record, selected_config) for record in ordered_records
        )
        logger.info("Behavioral risk generation completed: records=%d", len(results))
        return RiskFeatureSet(records=results)

    @classmethod
    def _generate_record(
        cls,
        record: TemporalFeatureRecord,
        config: BehavioralRiskConfig,
    ) -> RiskFeatureRecord:
        """Generate raw indicators and normalized weighted scores for one window."""
        indicators: dict[str, float | None] = {
            "login": cls._login_indicator(record, config),
            "file": cls._file_indicator(record, config),
            "usb": cls._usb_indicator(record),
            "email": cls._count_indicator(record, "email"),
            "http": cls._http_indicator(record, config),
            "session": record.session_max_seconds,
        }
        component_scores = {
            component: cls._score(indicators[component], config.thresholds[component])
            for component in _COMPONENTS
        }
        total_weight = sum(
            config.weights[component]
            for component in _COMPONENTS
            if indicators[component] is not None
        )
        risk_index = (
            sum(
                component_scores[component] * config.weights[component]
                for component in _COMPONENTS
            )
            / total_weight
            if total_weight
            else 0.0
        )
        return RiskFeatureRecord(
            subject_id=record.subject_id,
            window=record.window,
            window_start=record.window_start,
            window_end=record.window_end,
            indicators=indicators,
            component_scores=component_scores,
            behavioral_risk_index=round(min(max(risk_index, 0.0), 100.0), 6),
        )

    @staticmethod
    def _login_indicator(
        record: TemporalFeatureRecord,
        config: BehavioralRiskConfig,
    ) -> float | None:
        """Return the fraction of logins outside configured safe hours."""
        if not record.login_timestamps:
            return None
        weekend_days = frozenset(config.weekend_days)
        risky_count = sum(
            timestamp.weekday() in weekend_days
            or not (
                config.business_start_hour <= timestamp.hour < config.business_end_hour
            )
            for timestamp in record.login_timestamps
        )
        return risky_count / len(record.login_timestamps)

    @staticmethod
    def _file_indicator(
        record: TemporalFeatureRecord,
        config: BehavioralRiskConfig,
    ) -> float | None:
        """Count unique filenames with a configured suspicious extension."""
        if "file" not in record.source_event_counts:
            return None
        extensions = frozenset(config.suspicious_extensions)
        filenames = record.source_entity_values.get("file.filename", ())
        return float(
            sum(_filename_suffix(filename) in extensions for filename in filenames)
        )

    @staticmethod
    def _usb_indicator(record: TemporalFeatureRecord) -> float | None:
        """Count Device connect/insert/attach/mount events in the window."""
        if "device" not in record.source_event_counts:
            return None
        return float(
            sum(
                count
                for key, count in record.source_activity_counts.items()
                if key.startswith("device.")
                and key.removeprefix("device.") in _CONNECT_ACTIVITIES
            )
        )

    @staticmethod
    def _count_indicator(
        record: TemporalFeatureRecord,
        source: str,
    ) -> float | None:
        """Return a source event count when the source was observed."""
        count = record.source_event_counts.get(source)
        return float(count) if count is not None else None

    @staticmethod
    def _http_indicator(
        record: TemporalFeatureRecord,
        config: BehavioralRiskConfig,
    ) -> float | None:
        """Count unique URLs whose host matches configured suspicious domains."""
        if "http" not in record.source_event_counts:
            return None
        domains = config.suspicious_domains
        urls = record.source_entity_values.get("http.url", ())
        return float(sum(_matches_domain(url, domains) for url in urls))

    @staticmethod
    def _score(indicator: float | None, threshold: float) -> float:
        """Map a non-negative indicator to a bounded, threshold-relative score."""
        if indicator is None:
            return 0.0
        return round(min(max(indicator, 0.0) / threshold * 100.0, 100.0), 6)


def _filename_suffix(filename: str) -> str:
    """Return a case-insensitive suffix supporting POSIX and Windows paths."""
    return max(
        PurePosixPath(filename).suffix.casefold(),
        PureWindowsPath(filename).suffix.casefold(),
    )


def _matches_domain(url: str, domains: tuple[str, ...]) -> bool:
    """Match URL hosts exactly or as subdomains of configured domains."""
    try:
        host = urlsplit(url).hostname
    except ValueError:
        return False
    if host is None:
        return False
    normalized_host = host.casefold().rstrip(".")
    return any(
        normalized_host == domain or normalized_host.endswith(f".{domain}")
        for domain in domains
    )
