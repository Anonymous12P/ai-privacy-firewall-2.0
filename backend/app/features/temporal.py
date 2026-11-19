"""Temporal feature contracts and generation from aggregated behavior."""

import logging
from abc import ABC, abstractmethod
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import UTC, datetime

from app.core.constants import APP_LOGGER_NAME
from app.features.schemas import (
    AggregatedFeatureSet,
    BehavioralFeatureRecord,
    TemporalFeatureRecord,
    TemporalFeatureSet,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.features.temporal")


@dataclass(frozen=True, slots=True)
class TemporalFeatureConfig:
    """Configure local business hours and weekend weekday indices.

    Hours use a 24-hour clock with an inclusive opening hour and exclusive
    closing hour. Weekdays follow ``datetime.date.weekday()``: Monday is 0 and
    Sunday is 6.
    """

    business_start_hour: int = 9
    business_end_hour: int = 17
    weekend_days: tuple[int, ...] = (5, 6)

    def __post_init__(self) -> None:
        """Validate configurable clock hours and weekday indexes."""
        if not 0 <= self.business_start_hour < 24:
            raise ValueError("business_start_hour must be between 0 and 23.")
        if not 1 <= self.business_end_hour <= 24:
            raise ValueError("business_end_hour must be between 1 and 24.")
        if self.business_start_hour >= self.business_end_hour:
            raise ValueError("Business hours must have a positive duration.")
        if not self.weekend_days:
            raise ValueError("weekend_days must contain at least one weekday.")
        if any(day < 0 or day > 6 for day in self.weekend_days):
            raise ValueError("Weekend weekday indexes must be between 0 and 6.")
        if len(set(self.weekend_days)) != len(self.weekend_days):
            raise ValueError("weekend_days must not contain duplicates.")


class TemporalFeatureExtractor(ABC):
    """Define the contract for temporal features from aggregated records."""

    @abstractmethod
    def generate(
        self,
        aggregated: AggregatedFeatureSet,
        config: TemporalFeatureConfig | None = None,
    ) -> TemporalFeatureSet:
        """Generate typed temporal metrics for aggregated behavioral windows."""
        raise NotImplementedError


class TemporalFeatureGenerator(TemporalFeatureExtractor):
    """Compute time, calendar, session, and relative activity metrics."""

    def generate(
        self,
        aggregated: AggregatedFeatureSet,
        config: TemporalFeatureConfig | None = None,
    ) -> TemporalFeatureSet:
        """Generate temporally ordered records without mutating input data."""
        selected_config = config or TemporalFeatureConfig()
        ordered_records = sorted(
            aggregated.records,
            key=lambda record: (
                record.subject_id,
                record.window_start,
                record.window_end,
            ),
        )
        temporal_records = tuple(
            self._generate_record(record, selected_config) for record in ordered_records
        )
        logger.info(
            "Temporal features generated: records=%d, window=%s",
            len(temporal_records),
            aggregated.window.value,
        )
        return TemporalFeatureSet(records=temporal_records)

    @classmethod
    def _generate_record(
        cls,
        record: BehavioralFeatureRecord,
        config: TemporalFeatureConfig,
    ) -> TemporalFeatureRecord:
        """Calculate temporal metrics for one behavioral window."""
        event_timestamps = tuple(
            timestamp
            for source in sorted(record.event_timestamps)
            for timestamp in record.event_timestamps[source]
        )
        timestamps_available = bool(event_timestamps)
        login_times = cls._seconds_since_midnight(record.login_timestamps)
        logout_times = cls._seconds_since_midnight(record.logout_timestamps)
        durations = cls._session_durations(
            record.login_timestamps,
            record.logout_timestamps,
        )
        weekend_days = frozenset(config.weekend_days)
        weekend_count = (
            sum(timestamp.weekday() in weekend_days for timestamp in event_timestamps)
            if timestamps_available
            else None
        )
        weekday_count = (
            len(event_timestamps) - weekend_count if weekend_count is not None else None
        )
        business_count = (
            sum(
                cls._is_business_hour(timestamp, config)
                for timestamp in event_timestamps
            )
            if timestamps_available
            else None
        )
        after_hours_count = (
            len(event_timestamps) - business_count
            if business_count is not None
            else None
        )
        activity_frequencies = cls._activity_frequencies(record.event_counts)
        duration_total = sum(durations) if durations else None

        return TemporalFeatureRecord(
            subject_id=record.subject_id,
            window=record.window,
            window_start=record.window_start,
            window_end=record.window_end,
            login_time_mean_seconds=cls._mean(login_times),
            login_time_min_seconds=min(login_times) if login_times else None,
            login_time_max_seconds=max(login_times) if login_times else None,
            logout_time_mean_seconds=cls._mean(logout_times),
            logout_time_min_seconds=min(logout_times) if logout_times else None,
            logout_time_max_seconds=max(logout_times) if logout_times else None,
            session_count=len(durations) if durations else None,
            session_total_seconds=duration_total,
            session_mean_seconds=cls._mean(durations),
            session_max_seconds=max(durations) if durations else None,
            weekday_event_count=weekday_count,
            weekend_event_count=weekend_count,
            business_hours_event_count=business_count,
            after_hours_event_count=after_hours_count,
            login_timestamps=tuple(record.login_timestamps),
            activity_frequencies=activity_frequencies,
            source_entity_values={
                key: tuple(values)
                for key, values in sorted(record.source_entity_values.items())
            },
            source_activity_counts=dict(sorted(record.source_activity_counts.items())),
            source_event_counts=dict(sorted(record.source_event_counts.items())),
        )

    @staticmethod
    def _seconds_since_midnight(timestamps: Sequence[datetime]) -> list[float]:
        """Return local wall-clock seconds, or no values for mixed timestamps."""
        awareness = {timestamp.utcoffset() is not None for timestamp in timestamps}
        if len(awareness) > 1:
            return []
        seconds: list[float] = []
        for timestamp in timestamps:
            clock = (
                timestamp.timetz()
                if timestamp.utcoffset() is not None
                else timestamp.time()
            )
            seconds.append(
                float(
                    clock.hour * 3600
                    + clock.minute * 60
                    + clock.second
                    + clock.microsecond / 1_000_000
                )
            )
        return seconds

    @classmethod
    def _session_durations(
        cls,
        login_timestamps: Sequence[datetime],
        logout_timestamps: Sequence[datetime],
    ) -> list[float]:
        """Pair each logout with the most recent prior login in this window."""
        events = [(timestamp, "login") for timestamp in login_timestamps] + [
            (timestamp, "logout") for timestamp in logout_timestamps
        ]
        awareness = {timestamp.utcoffset() is not None for timestamp, _ in events}
        if len(awareness) > 1:
            return []
        if not events:
            return []

        if True in awareness:
            events.sort(key=lambda item: item[0].astimezone(UTC))
        else:
            events.sort(key=lambda item: item[0])

        open_logins: list[datetime] = []
        durations: list[float] = []
        for timestamp, event_type in events:
            if event_type == "login":
                open_logins.append(timestamp)
                continue
            if not open_logins:
                continue
            login_time = open_logins.pop()
            if login_time.utcoffset() is not None:
                duration = timestamp.astimezone(UTC) - login_time.astimezone(UTC)
            else:
                duration = timestamp - login_time
            seconds = duration.total_seconds()
            if seconds >= 0:
                durations.append(seconds)
        return durations

    @staticmethod
    def _is_business_hour(
        timestamp: datetime,
        config: TemporalFeatureConfig,
    ) -> bool:
        """Return whether a timestamp lies within the configured local hours."""
        clock = (
            timestamp.timetz()
            if timestamp.utcoffset() is not None
            else timestamp.time()
        )
        clock_seconds = clock.hour * 3600 + clock.minute * 60 + clock.second
        return (
            config.business_start_hour * 3600
            <= clock_seconds
            < config.business_end_hour * 3600
        )

    @staticmethod
    def _activity_frequencies(
        event_counts: Mapping[str, int],
    ) -> dict[str, float]:
        """Return per-source proportions of known event counts."""
        valid_counts = {
            source: count
            for source, count in event_counts.items()
            if isinstance(source, str) and isinstance(count, int) and count >= 0
        }
        total_events = sum(valid_counts.values())
        if total_events == 0:
            return {}
        return {
            source: valid_counts[source] / total_events
            for source in sorted(valid_counts)
        }

    @staticmethod
    def _mean(values: Sequence[float]) -> float | None:
        """Calculate an arithmetic mean when values are available."""
        return sum(values) / len(values) if values else None
