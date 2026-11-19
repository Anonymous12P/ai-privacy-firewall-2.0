"""Tests for configurable temporal feature generation."""

from collections.abc import Callable
from datetime import date, datetime

import pytest

from app.features import (
    AggregatedFeatureSet,
    AggregationWindow,
    BehavioralFeatureRecord,
    CERTDataset,
    FeaturePipeline,
    TemporalFeatureConfig,
    TemporalFeatureGenerator,
    TemporalFeatureRecord,
    TemporalFeatureSet,
)


def _record(
    *,
    subject_id: str = "alice",
    start: date = date(2024, 1, 3),
    event_timestamps: dict[str, tuple[datetime, ...]] | None = None,
    login_timestamps: tuple[datetime, ...] = (),
    logout_timestamps: tuple[datetime, ...] = (),
    event_counts: dict[str, int] | None = None,
) -> BehavioralFeatureRecord:
    """Create one aggregated window fixture with explicit timestamp evidence."""
    timestamps = event_timestamps or {}
    all_timestamps = tuple(
        timestamp for values in timestamps.values() for timestamp in values
    )
    return BehavioralFeatureRecord(
        subject_id=subject_id,
        window=AggregationWindow.DAILY,
        window_start=start,
        window_end=date.fromordinal(start.toordinal() + 1),
        event_counts=event_counts or {},
        unique_entity_counts={},
        first_timestamp=min(all_timestamps) if all_timestamps else None,
        last_timestamp=max(all_timestamps) if all_timestamps else None,
        ldap_attributes={},
        event_timestamps=timestamps,
        login_timestamps=login_timestamps,
        logout_timestamps=logout_timestamps,
        source_entity_values={},
        source_activity_counts={},
        source_event_counts=event_counts or {},
    )


def _aggregate(
    records: tuple[BehavioralFeatureRecord, ...],
) -> AggregatedFeatureSet:
    """Create an aggregated set for temporal generator tests."""
    return AggregatedFeatureSet(
        window=AggregationWindow.DAILY,
        source_datasets=(CERTDataset.LOGON,),
        records=records,
    )


def test_generator_computes_login_logout_and_session_metrics() -> None:
    """Login/logout clock statistics and matched session duration are computed."""
    logins = (
        datetime.fromisoformat("2024-01-03T08:00:00"),
        datetime.fromisoformat("2024-01-03T09:00:00"),
    )
    logouts = (
        datetime.fromisoformat("2024-01-03T10:00:00"),
        datetime.fromisoformat("2024-01-03T11:00:00"),
    )
    result = TemporalFeatureGenerator().generate(
        _aggregate(
            (
                _record(
                    event_timestamps={"logon": logins + logouts},
                    login_timestamps=logins,
                    logout_timestamps=logouts,
                    event_counts={"logon": 4},
                ),
            )
        )
    )

    record = result.records[0]
    assert record.login_time_mean_seconds == 30_600
    assert record.login_time_min_seconds == 28_800
    assert record.login_time_max_seconds == 32_400
    assert record.logout_time_mean_seconds == 37_800
    assert record.logout_time_min_seconds == 36_000
    assert record.logout_time_max_seconds == 39_600
    assert record.session_count == 2
    assert record.session_total_seconds == 14_400
    assert record.session_mean_seconds == 7_200
    assert record.session_max_seconds == 10_800


def test_calendar_features_count_weekday_weekend_and_hours() -> None:
    """Calendar and business-hours counts use timestamp-local date and time."""
    timestamps = (
        datetime.fromisoformat("2024-01-03T08:59:00"),
        datetime.fromisoformat("2024-01-03T09:00:00"),
        datetime.fromisoformat("2024-01-03T16:59:00"),
        datetime.fromisoformat("2024-01-06T12:00:00"),
    )
    result = TemporalFeatureGenerator().generate(
        _aggregate(
            (
                _record(
                    event_timestamps={"logon": timestamps},
                    event_counts={"logon": 4},
                ),
            )
        )
    )

    record = result.records[0]
    assert record.weekday_event_count == 3
    assert record.weekend_event_count == 1
    assert record.business_hours_event_count == 3
    assert record.after_hours_event_count == 1


def test_business_hours_and_weekend_are_configurable() -> None:
    """Configured hours are start-inclusive/end-exclusive and weekends vary."""
    timestamps = (
        datetime.fromisoformat("2024-01-05T10:00:00"),
        datetime.fromisoformat("2024-01-05T17:59:00"),
        datetime.fromisoformat("2024-01-06T12:00:00"),
    )
    result = TemporalFeatureGenerator().generate(
        _aggregate(
            (
                _record(
                    event_timestamps={"http": timestamps},
                    event_counts={"http": 3},
                ),
            )
        ),
        TemporalFeatureConfig(
            business_start_hour=10,
            business_end_hour=18,
            weekend_days=(4, 5),
        ),
    )

    record = result.records[0]
    assert record.business_hours_event_count == 3
    assert record.weekend_event_count == 3
    assert record.weekday_event_count == 0


def test_activity_frequencies_are_deterministic_proportions() -> None:
    """Per-source counts become proportions without scaling or mutation."""
    counts = {"http": 1, "logon": 3, "file": 0}
    aggregated_record = _record(event_counts=counts)

    temporal = TemporalFeatureGenerator().generate(_aggregate((aggregated_record,)))

    assert temporal.records[0].activity_frequencies == {
        "file": 0.0,
        "http": 0.25,
        "logon": 0.75,
    }
    assert counts == {"http": 1, "logon": 3, "file": 0}


def test_missing_timestamps_return_none_for_time_dependent_metrics() -> None:
    """Missing event and login timestamps do not raise or invent values."""
    temporal = TemporalFeatureGenerator().generate(
        _aggregate((_record(event_counts={"logon": 2}),))
    )

    record = temporal.records[0]
    assert record.login_time_mean_seconds is None
    assert record.logout_time_mean_seconds is None
    assert record.session_count is None
    assert record.session_total_seconds is None
    assert record.weekday_event_count is None
    assert record.weekend_event_count is None
    assert record.business_hours_event_count is None
    assert record.after_hours_event_count is None
    assert record.activity_frequencies == {"logon": 1.0}


def test_unmatched_logins_and_logouts_yield_no_session_metrics() -> None:
    """An incomplete session is excluded and session statistics are nullable."""
    result = TemporalFeatureGenerator().generate(
        _aggregate(
            (
                _record(
                    event_timestamps={
                        "logon": (datetime.fromisoformat("2024-01-03T08:00:00"),)
                    },
                    login_timestamps=(datetime.fromisoformat("2024-01-03T08:00:00"),),
                    event_counts={"logon": 1},
                ),
            )
        )
    )

    record = result.records[0]
    assert record.login_time_mean_seconds == 28_800
    assert record.session_count is None
    assert record.session_total_seconds is None


def test_temporal_output_is_sorted_by_subject_and_window() -> None:
    """Output order is deterministic regardless of aggregate input order."""
    later = _record(
        subject_id="zara",
        start=date(2024, 1, 4),
        event_counts={"logon": 1},
    )
    earlier = _record(
        subject_id="alice",
        start=date(2024, 1, 3),
        event_counts={"logon": 1},
    )

    result = TemporalFeatureGenerator().generate(_aggregate((later, earlier)))

    assert [(record.subject_id, record.window_start) for record in result.records] == [
        ("alice", date(2024, 1, 3)),
        ("zara", date(2024, 1, 4)),
    ]


def test_generator_returns_typed_empty_feature_set() -> None:
    """An empty aggregate produces an empty typed temporal result."""
    result = TemporalFeatureGenerator().generate(_aggregate(()))

    assert isinstance(result, TemporalFeatureSet)
    assert result.records == ()


@pytest.mark.parametrize(
    "config_factory",
    [
        lambda: TemporalFeatureConfig(business_start_hour=-1),
        lambda: TemporalFeatureConfig(business_end_hour=25),
        lambda: TemporalFeatureConfig(business_start_hour=18, business_end_hour=9),
        lambda: TemporalFeatureConfig(weekend_days=()),
        lambda: TemporalFeatureConfig(weekend_days=(0, 0)),
        lambda: TemporalFeatureConfig(weekend_days=(7,)),
    ],
)
def test_temporal_config_rejects_invalid_values(
    config_factory: Callable[[], TemporalFeatureConfig],
) -> None:
    """Invalid values fail during config construction."""
    with pytest.raises(ValueError):
        config_factory()


def test_pipeline_exposes_temporal_generation() -> None:
    """The application pipeline delegates to its temporal generator."""
    aggregate = _aggregate(
        (
            _record(
                event_timestamps={
                    "logon": (datetime.fromisoformat("2024-01-03T09:00:00"),)
                },
                event_counts={"logon": 1},
            ),
        )
    )

    result = FeaturePipeline().generate_temporal(aggregate)

    assert isinstance(result.records[0], TemporalFeatureRecord)
    assert result.records[0].business_hours_event_count == 1
