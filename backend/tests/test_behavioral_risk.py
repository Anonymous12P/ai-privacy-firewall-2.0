"""Tests for explainable behavioral risk indicator generation."""

from dataclasses import replace
from datetime import date, datetime

import pytest

from app.features import (
    AggregationWindow,
    BehavioralRiskConfig,
    BehavioralRiskGenerator,
    FeaturePipeline,
    RiskFeatureSet,
    TemporalFeatureRecord,
    TemporalFeatureSet,
)
from app.features.exceptions import FeatureRiskError


def _record(
    *,
    subject_id: str = "alice",
    logins: tuple[datetime, ...] = (),
    entities: dict[str, tuple[str, ...]] | None = None,
    activities: dict[str, int] | None = None,
    event_counts: dict[str, int] | None = None,
    session_max_seconds: float | None = None,
) -> TemporalFeatureRecord:
    """Create one temporal feature record for risk tests."""
    return TemporalFeatureRecord(
        subject_id=subject_id,
        window=AggregationWindow.DAILY,
        window_start=date(2024, 1, 1),
        window_end=date(2024, 1, 2),
        login_time_mean_seconds=None,
        login_time_min_seconds=None,
        login_time_max_seconds=None,
        logout_time_mean_seconds=None,
        logout_time_min_seconds=None,
        logout_time_max_seconds=None,
        session_count=None,
        session_total_seconds=None,
        session_mean_seconds=None,
        session_max_seconds=session_max_seconds,
        weekday_event_count=None,
        weekend_event_count=None,
        business_hours_event_count=None,
        after_hours_event_count=None,
        login_timestamps=logins,
        activity_frequencies={},
        source_entity_values=entities or {},
        source_activity_counts=activities or {},
        source_event_counts=event_counts or {},
    )


def test_generator_creates_configured_indicators_and_weighted_score() -> None:
    """All six transparent signals contribute to a bounded weighted index."""
    record = _record(
        logins=(
            datetime.fromisoformat("2024-01-01T10:00:00"),
            datetime.fromisoformat("2024-01-06T10:00:00"),
        ),
        entities={
            "file.filename": ("report.txt", r"C:\temp\payload.EXE"),
            "http.url": ("https://child.bad.example/path", "https://safe.example/"),
        },
        activities={"device.connect": 2, "device.disconnect": 8},
        event_counts={"file": 2, "device": 10, "email": 20, "http": 2},
        session_max_seconds=14_400,
    )
    config = BehavioralRiskConfig(
        thresholds={
            "login": 0.5,
            "file": 1,
            "usb": 2,
            "email": 20,
            "http": 1,
            "session": 14_400,
        },
        weights={
            "login": 2,
            "file": 1,
            "usb": 1,
            "email": 0,
            "http": 1,
            "session": 1,
        },
        suspicious_domains=("bad.example",),
        suspicious_extensions=("exe",),
    )

    risk = BehavioralRiskGenerator().generate(TemporalFeatureSet((record,)), config)

    result = risk.records[0]
    assert result.indicators == {
        "login": 0.5,
        "file": 1.0,
        "usb": 2.0,
        "email": 20.0,
        "http": 1.0,
        "session": 14_400,
    }
    assert result.component_scores == {
        "login": 100.0,
        "file": 100.0,
        "usb": 100.0,
        "email": 100.0,
        "http": 100.0,
        "session": 100.0,
    }
    assert result.behavioral_risk_index == 100


def test_partial_evidence_is_not_treated_as_zero_risk_evidence() -> None:
    """Missing signals are explainable and excluded from weighted averaging."""
    record = _record(
        event_counts={"email": 10},
    )

    result = (
        BehavioralRiskGenerator()
        .generate(
            TemporalFeatureSet((record,)),
            BehavioralRiskConfig(thresholds={"email": 20}),
        )
        .records[0]
    )

    assert result.indicators["login"] is None
    assert result.indicators["file"] is None
    assert result.indicators["usb"] is None
    assert result.indicators["email"] == 10
    assert result.indicators["http"] is None
    assert result.indicators["session"] is None
    assert result.behavioral_risk_index == 50


def test_indicators_apply_configured_business_hours_weekends_and_domain_boundaries() -> (
    None
):
    """Login and host matching honor configuration without substring matches."""
    record = _record(
        logins=(
            datetime.fromisoformat("2024-01-01T10:00:00"),
            datetime.fromisoformat("2024-01-01T18:00:00"),
        ),
        entities={
            "http.url": (
                "https://evil.example/path",
                "https://example.evil/path",
                "not a url",
            )
        },
        event_counts={"http": 3},
    )
    config = BehavioralRiskConfig(
        business_start_hour=10,
        business_end_hour=18,
        weekend_days=(0,),
        suspicious_domains=("example",),
    )

    result = (
        BehavioralRiskGenerator()
        .generate(TemporalFeatureSet((record,)), config)
        .records[0]
    )

    assert result.indicators["login"] == 1
    assert result.indicators["http"] == 1


def test_generation_order_is_deterministic_and_scores_stay_bounded() -> None:
    """Input order does not affect output order and high counts cap at 100."""
    later = replace(_record(subject_id="zoe"), window_start=date(2024, 1, 2))
    earlier = _record(subject_id="amy", event_counts={"email": 100_000})

    result = BehavioralRiskGenerator().generate(TemporalFeatureSet((later, earlier)))

    assert [record.subject_id for record in result.records] == ["amy", "zoe"]
    assert 0 <= result.records[0].behavioral_risk_index <= 100
    assert result.records[0].component_scores["email"] == 100


def test_missing_all_telemetry_returns_zero_without_division_by_zero() -> None:
    """A window without observations has null indicators and a zero index."""
    result = (
        BehavioralRiskGenerator().generate(TemporalFeatureSet((_record(),))).records[0]
    )

    assert all(value is None for value in result.indicators.values())
    assert result.behavioral_risk_index == 0


def test_invalid_configuration_raises_typed_error_for_runtime_values() -> None:
    """Invalid runtime overrides fail with the dedicated exception type."""
    for build_config in (
        lambda: BehavioralRiskConfig(
            weights={
                "login": 0,
                "file": 0,
                "usb": 0,
                "email": 0,
                "http": 0,
                "session": 0,
            }
        ),
        lambda: BehavioralRiskConfig(business_start_hour=20, business_end_hour=8),
        lambda: BehavioralRiskConfig(suspicious_domains=("",)),
        lambda: BehavioralRiskConfig(thresholds={"email": 0}),
    ):
        with pytest.raises(FeatureRiskError):
            build_config()


def test_pipeline_delegates_risk_generation() -> None:
    """The application pipeline exposes the risk stage without file access."""
    temporal = TemporalFeatureSet((_record(event_counts={"email": 100}),))

    result = FeaturePipeline().generate_risk(temporal)

    assert isinstance(result, RiskFeatureSet)
    assert result.records[0].indicators["email"] == 100
