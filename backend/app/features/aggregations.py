"""Deterministic calendar-window aggregation for extracted CERT records."""

import logging
from abc import ABC, abstractmethod
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field
from datetime import UTC, date, datetime, timedelta

from app.core.constants import APP_LOGGER_NAME
from app.features.exceptions import FeatureAggregationError
from app.features.schemas import (
    AggregatedFeatureSet,
    AggregationWindow,
    BehavioralFeatureRecord,
    CERTDataset,
    FeaturePipelineResult,
    FeatureRecord,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.features.aggregations")

_ENTITY_COLUMNS: dict[CERTDataset, tuple[str, ...]] = {
    CERTDataset.LOGON: ("pc",),
    CERTDataset.FILE: ("pc", "filename"),
    CERTDataset.DEVICE: ("pc", "activity"),
    CERTDataset.HTTP: ("pc", "url"),
    CERTDataset.EMAIL: ("pc", "to", "cc", "bcc", "from"),
    CERTDataset.LDAP: (),
}


class AggregationStrategy(ABC):
    """Define a replaceable contract for aggregating numeric observations."""

    @abstractmethod
    def aggregate(self, values: Sequence[float]) -> float:
        """Aggregate a sequence of values according to a future strategy."""
        raise NotImplementedError


@dataclass
class _WindowAccumulator:
    """Mutable internal accumulator for one source/user/calendar window."""

    event_count: int = 0
    unique_entities: dict[str, set[str]] = field(default_factory=dict)
    timestamps: list[datetime] = field(default_factory=list)
    login_timestamps: list[datetime] = field(default_factory=list)
    logout_timestamps: list[datetime] = field(default_factory=list)
    activity_counts: dict[str, int] = field(default_factory=dict)


@dataclass
class _MergedAccumulator:
    """Mutable cross-source accumulation for one user/calendar window."""

    event_counts: dict[str, int] = field(default_factory=dict)
    unique_entity_counts: dict[str, int] = field(default_factory=dict)
    timestamps_by_source: dict[str, list[datetime]] = field(default_factory=dict)
    login_timestamps: list[datetime] = field(default_factory=list)
    logout_timestamps: list[datetime] = field(default_factory=list)
    source_entity_values: dict[str, set[str]] = field(default_factory=dict)
    source_activity_counts: dict[str, int] = field(default_factory=dict)


class BehavioralAggregator:
    """Aggregate extracted records into user-level calendar-window records.

    Dataset records are aggregated independently first and merged afterward.
    LDAP records have no event timestamp, so the latest row-numbered LDAP
    snapshot supplied for a subject is attached to each of that subject's
    event windows.
    """

    def aggregate(
        self,
        results: Iterable[FeaturePipelineResult],
        window: AggregationWindow = AggregationWindow.DAILY,
    ) -> AggregatedFeatureSet:
        """Aggregate independently by source, then merge user-window results."""
        dataset_results = tuple(results)
        if not isinstance(window, AggregationWindow):
            raise FeatureAggregationError(f"Unsupported aggregation window: {window!r}")

        seen_datasets: set[CERTDataset] = set()
        for result in dataset_results:
            if result.dataset in seen_datasets:
                raise FeatureAggregationError(
                    f"Duplicate feature result for dataset {result.dataset.value}."
                )
            seen_datasets.add(result.dataset)
            if any(record.dataset is not result.dataset for record in result.records):
                raise FeatureAggregationError(
                    f"Feature result for {result.dataset.value} contains a "
                    "record from another dataset."
                )

        source_datasets = tuple(sorted(seen_datasets, key=lambda item: item.value))
        latest_ldap: dict[str, FeatureRecord] = {}
        per_source: dict[
            CERTDataset,
            dict[tuple[str, date], _WindowAccumulator],
        ] = {}
        for result in dataset_results:
            if result.dataset is CERTDataset.LDAP:
                latest_ldap = self._latest_ldap_records(
                    latest_ldap,
                    result.records,
                )
                continue
            per_source[result.dataset] = self._aggregate_dataset(
                result.dataset,
                result.records,
                window,
            )

        merged: dict[tuple[str, date], _MergedAccumulator] = {}
        for dataset in source_datasets:
            for key, source_window in per_source.get(dataset, {}).items():
                aggregate = merged.setdefault(key, _MergedAccumulator())
                aggregate.event_counts[dataset.value] = source_window.event_count
                for entity, values in sorted(source_window.unique_entities.items()):
                    aggregate.unique_entity_counts[f"{dataset.value}.{entity}"] = len(
                        values
                    )
                    aggregate.source_entity_values[f"{dataset.value}.{entity}"] = values
                aggregate.timestamps_by_source[dataset.value] = source_window.timestamps
                for activity, count in source_window.activity_counts.items():
                    aggregate.source_activity_counts[f"{dataset.value}.{activity}"] = (
                        count
                    )
                if dataset is CERTDataset.LOGON:
                    aggregate.login_timestamps.extend(source_window.login_timestamps)
                    aggregate.logout_timestamps.extend(source_window.logout_timestamps)

        records: list[BehavioralFeatureRecord] = []
        for (subject_id, window_start), aggregate in sorted(
            merged.items(),
            key=lambda item: (item[0][0], item[0][1]),
        ):
            timestamps = self._ordered_timestamps(
                [
                    timestamp
                    for values in aggregate.timestamps_by_source.values()
                    for timestamp in values
                ]
            )
            ldap_record = latest_ldap.get(subject_id)
            records.append(
                BehavioralFeatureRecord(
                    subject_id=subject_id,
                    window=window,
                    window_start=window_start,
                    window_end=self._window_end(window_start, window),
                    event_counts=dict(sorted(aggregate.event_counts.items())),
                    unique_entity_counts=dict(
                        sorted(aggregate.unique_entity_counts.items())
                    ),
                    first_timestamp=timestamps[0] if timestamps else None,
                    last_timestamp=timestamps[-1] if timestamps else None,
                    ldap_attributes=(
                        dict(sorted(ldap_record.attributes.items()))
                        if ldap_record is not None
                        else {}
                    ),
                    event_timestamps={
                        source: tuple(self._ordered_timestamps(values))
                        for source, values in sorted(
                            aggregate.timestamps_by_source.items()
                        )
                    },
                    login_timestamps=tuple(
                        self._ordered_timestamps(aggregate.login_timestamps)
                    ),
                    logout_timestamps=tuple(
                        self._ordered_timestamps(aggregate.logout_timestamps)
                    ),
                    source_entity_values={
                        name: tuple(sorted(values))
                        for name, values in sorted(
                            aggregate.source_entity_values.items()
                        )
                    },
                    source_activity_counts=dict(
                        sorted(aggregate.source_activity_counts.items())
                    ),
                    source_event_counts=dict(sorted(aggregate.event_counts.items())),
                )
            )

        logger.info(
            "Behavioral aggregation completed: datasets=%d, window=%s, records=%d",
            len(source_datasets),
            window.value,
            len(records),
        )
        return AggregatedFeatureSet(
            window=window,
            source_datasets=source_datasets,
            records=tuple(records),
        )

    def _aggregate_dataset(
        self,
        dataset: CERTDataset,
        records: Sequence[FeatureRecord],
        window: AggregationWindow,
    ) -> dict[tuple[str, date], _WindowAccumulator]:
        """Aggregate one dataset's event records before cross-source merging."""
        if dataset is CERTDataset.LDAP:
            raise FeatureAggregationError(
                "LDAP snapshots must be merged separately from event records."
            )

        grouped: dict[tuple[str, date], _WindowAccumulator] = {}
        entity_columns = _ENTITY_COLUMNS[dataset]
        for record in records:
            if record.timestamp is None:
                raise FeatureAggregationError(
                    f"{record.dataset.value} record at row {record.row_number} "
                    "has no timestamp."
                )
            key = (record.subject_id, self._window_start(record.timestamp, window))
            accumulator = grouped.setdefault(key, _WindowAccumulator())
            accumulator.event_count += 1
            accumulator.timestamps.append(record.timestamp)
            activity = record.attributes.get("activity", "").strip().casefold()
            if activity:
                accumulator.activity_counts[activity] = (
                    accumulator.activity_counts.get(activity, 0) + 1
                )
            if dataset is CERTDataset.LOGON:
                if activity == "logon":
                    accumulator.login_timestamps.append(record.timestamp)
                elif activity == "logoff":
                    accumulator.logout_timestamps.append(record.timestamp)
            for column in entity_columns:
                value = record.attributes.get(column)
                if value:
                    accumulator.unique_entities.setdefault(column, set()).add(value)
        return grouped

    @staticmethod
    def _latest_ldap_records(
        existing: dict[str, FeatureRecord],
        records: Sequence[FeatureRecord],
    ) -> dict[str, FeatureRecord]:
        """Choose each user's latest LDAP snapshot by supplied row order."""
        for record in records:
            if record.dataset is not CERTDataset.LDAP:
                raise FeatureAggregationError(
                    "LDAP feature result contains a non-LDAP record."
                )
            if record.timestamp is not None:
                raise FeatureAggregationError(
                    "LDAP directory snapshots must not have event timestamps."
                )
            current = existing.get(record.subject_id)
            if current is None or record.row_number >= current.row_number:
                existing[record.subject_id] = record
        return existing

    @staticmethod
    def _window_start(timestamp: datetime, window: AggregationWindow) -> date:
        """Return the calendar date that starts the requested aggregation window."""
        event_date = timestamp.date()
        if window is AggregationWindow.DAILY:
            return event_date
        if window is AggregationWindow.WEEKLY:
            return event_date - timedelta(days=event_date.weekday())
        if window is AggregationWindow.MONTHLY:
            return event_date.replace(day=1)
        raise FeatureAggregationError(f"Unsupported aggregation window: {window!r}")

    @staticmethod
    def _window_end(start: date, window: AggregationWindow) -> date:
        """Return the exclusive calendar date after an aggregation window."""
        if window is AggregationWindow.DAILY:
            return start + timedelta(days=1)
        if window is AggregationWindow.WEEKLY:
            return start + timedelta(days=7)
        if window is AggregationWindow.MONTHLY:
            if start.month == 12:
                return date(start.year + 1, 1, 1)
            return date(start.year, start.month + 1, 1)
        raise FeatureAggregationError(f"Unsupported aggregation window: {window!r}")

    @staticmethod
    def _ordered_timestamps(timestamps: Sequence[datetime]) -> list[datetime]:
        """Sort timestamps and reject ambiguous naive/aware mixtures."""
        awareness = {timestamp.utcoffset() is not None for timestamp in timestamps}
        if len(awareness) > 1:
            raise FeatureAggregationError(
                "Cannot order naive and timezone-aware timestamps together."
            )
        if not timestamps:
            return []
        if True in awareness:
            return sorted(timestamps, key=lambda item: item.astimezone(UTC))
        return sorted(timestamps)
