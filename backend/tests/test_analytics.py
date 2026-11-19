"""Tests for analytics calculations and authenticated handlers."""

from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException, status

from app.api.analytics import get_analytics, get_model_analytics, get_risk_analytics
from app.auth.dependencies import get_current_user
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.scan_repository import ScanRepository, StoredScan
from app.services.analytics_service import AnalyticsService
from app.services.auth_service import UserRecord


def scan(
    scan_id: str,
    *,
    offset: int,
    risk_level: str,
    prediction: str,
    confidence: float,
    model_name: str | None,
    user_id: str | None = None,
) -> StoredScan:
    return StoredScan(
        scan_id=scan_id,
        prediction=prediction,
        confidence=confidence,
        risk_level=risk_level,
        timestamp=datetime(2026, 1, 1, tzinfo=UTC) + timedelta(days=offset),
        model_name=model_name,
        user_id=user_id,
    )


def populated_service() -> AnalyticsService:
    repository = ScanRepository()
    repository.save(
        scan(
            "1",
            offset=0,
            risk_level="low",
            prediction="normal",
            confidence=0.8,
            model_name="LogisticRegression",
        )
    )
    repository.save(
        scan(
            "2",
            offset=0,
            risk_level="high",
            prediction="insider",
            confidence=0.6,
            model_name="RandomForest",
            user_id="alice",
        )
    )
    repository.save(
        scan(
            "3",
            offset=1,
            risk_level="high",
            prediction="insider",
            confidence=1.0,
            model_name="RandomForest",
            user_id="alice",
        )
    )
    return AnalyticsService(AnalyticsRepository(repository))


def test_summary_calculations_are_deterministic() -> None:
    result = populated_service().summary()

    assert result.total_scans == 3
    assert result.total_high_risk_predictions == 2
    assert result.average_confidence == pytest.approx(0.8)
    assert result.daily_scan_counts == {"2026-01-01": 2, "2026-01-02": 1}
    assert result.top_risky_users == ["alice"]


def test_risk_and_prediction_distributions() -> None:
    result = populated_service().risk()

    assert result.risk_level_distribution == {"high": 2, "low": 1}
    assert result.prediction_distribution == {"insider": 2, "normal": 1}


def test_model_usage_statistics() -> None:
    result = populated_service().models()

    assert result.model_usage == {"LogisticRegression": 1, "RandomForest": 2}


def test_empty_repository_returns_zeroed_analytics() -> None:
    service = AnalyticsService(AnalyticsRepository(ScanRepository()))

    assert service.summary().model_dump() == {
        "total_scans": 0,
        "total_high_risk_predictions": 0,
        "average_confidence": 0.0,
        "daily_scan_counts": {},
        "top_risky_users": [],
    }
    assert service.risk().model_dump() == {
        "risk_level_distribution": {},
        "prediction_distribution": {},
    }
    assert service.models().model_dump() == {"model_usage": {}}


def test_analytics_handlers_delegate_to_service() -> None:
    import app.api.analytics as analytics_api

    original = analytics_api.analytics_service
    analytics_api.analytics_service = populated_service()
    try:
        user = UserRecord("alice", "hash")
        assert get_analytics(user).total_scans == 3
        assert get_risk_analytics(user).risk_level_distribution["high"] == 2
        assert get_model_analytics(user).model_usage["RandomForest"] == 2
    finally:
        analytics_api.analytics_service = original


def test_unauthorized_analytics_access_is_rejected() -> None:
    with pytest.raises(HTTPException) as error:
        get_current_user("invalid-token")

    assert error.value.status_code == status.HTTP_401_UNAUTHORIZED
