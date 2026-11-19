"""Tests for scan persistence, service orchestration, and API contracts."""

from datetime import UTC, datetime
from pathlib import Path

import pytest
from fastapi import HTTPException, status
from fastapi.background import BackgroundTasks
from pydantic import ValidationError

from app.api.scan import create_scan, get_scan
from app.auth.dependencies import get_current_user
from app.repositories.scan_repository import ScanRepository, StoredScan
from app.schemas.scan import ScanRequest
from app.services.auth_service import UserRecord
from app.services.firewall_service import FirewallBlockedError
from app.services.scan_service import (
    PredictionOutcome,
    ScanPredictionError,
    ScanService,
    normalize_scan_features,
    validate_model_artifacts,
)


class StubPredictor:
    def __init__(self, outcome: PredictionOutcome) -> None:
        self.outcome = outcome
        self.requests: list[ScanRequest] = []

    def predict(self, request: ScanRequest) -> PredictionOutcome:
        self.requests.append(request)
        return self.outcome


def request() -> ScanRequest:
    return ScanRequest(features={"feature_a": 1.5, "feature_b": 0.0})


def test_service_predicts_and_persists_scan() -> None:
    repository = ScanRepository()
    predictor = StubPredictor(
        PredictionOutcome(
            prediction="insider",
            confidence=0.93,
            explanation_summary="Feature a increased risk.",
        )
    )
    service = ScanService(repository=repository, predictor=predictor)

    result = service.create_scan(request())

    assert result.prediction == "insider"
    assert result.confidence == 0.93
    assert result.risk_level == "high"
    assert service.get_scan(result.scan_id) == result
    assert predictor.requests == [request()]


def test_repository_persists_and_reads_scan() -> None:
    repository = ScanRepository()
    stored = StoredScan(
        scan_id="scan-1",
        prediction="normal",
        confidence=0.8,
        risk_level="low",
        timestamp=datetime.now(UTC),
    )

    assert repository.save(stored) is stored
    assert repository.get("scan-1") is stored
    assert repository.get("missing") is None


def test_api_create_scan_delegates_to_service() -> None:
    service = ScanService(predictor=StubPredictor(PredictionOutcome("normal", 0.8)))
    import app.api.scan as scan_api

    original = scan_api.scan_service
    scan_api.scan_service = service
    try:
        result = create_scan(request(), UserRecord("alice", "hash"))
    finally:
        scan_api.scan_service = original

    assert result.prediction == "normal"
    assert result.risk_level == "low"


def test_api_returns_not_found_for_missing_scan() -> None:
    with pytest.raises(HTTPException) as error:
        get_scan("missing", UserRecord("alice", "hash"))

    assert error.value.status_code == status.HTTP_404_NOT_FOUND


def test_unauthorized_access_is_rejected() -> None:
    with pytest.raises(HTTPException) as error:
        get_current_user("invalid-token")

    assert error.value.status_code == status.HTTP_401_UNAUTHORIZED


def test_invalid_scan_payload_is_rejected() -> None:
    with pytest.raises(ValidationError):
        ScanRequest(features={})

    with pytest.raises(ValidationError):
        ScanRequest(features={"feature": "not-a-number"})  # type: ignore[dict-item]


def test_invalid_prediction_confidence_is_rejected() -> None:
    service = ScanService(predictor=StubPredictor(PredictionOutcome("normal", 2.0)))

    with pytest.raises(ScanPredictionError):
        service.create_scan(request())


def test_enforced_block_does_not_persist_scan() -> None:
    repository = ScanRepository()
    service = ScanService(
        repository=repository,
        predictor=StubPredictor(PredictionOutcome("insider", 0.95)),
        enforce_firewall=True,
    )

    with pytest.raises(FirewallBlockedError) as error:
        service.create_scan(request())

    assert error.value.payload()["firewall_action"] == "BLOCK"
    assert repository.list() == ()


def test_enforced_warning_returns_notice() -> None:
    service = ScanService(
        repository=ScanRepository(),
        predictor=StubPredictor(PredictionOutcome("normal", 0.5)),
        enforce_firewall=True,
    )

    result = service.create_scan(request())

    assert result.firewall_action == "WARN"
    assert result.warning is not None
    assert result.restriction_notice is None


def test_background_scan_starts_pending_and_completes() -> None:
    repository = ScanRepository()
    service = ScanService(
        repository=repository,
        predictor=StubPredictor(PredictionOutcome("normal", 0.8)),
    )
    import app.api.scan as scan_api

    original = scan_api.scan_service
    scan_api.scan_service = service
    tasks = BackgroundTasks()
    try:
        pending = create_scan(request(), UserRecord("alice", "hash"), tasks)
    finally:
        scan_api.scan_service = original

    assert pending.status == "PENDING"
    assert pending.prediction is None
    assert len(tasks.tasks) == 1
    tasks.tasks[0].func(pending.scan_id, request())
    completed = service.get_scan(pending.scan_id)
    assert completed is not None
    assert completed.status == "COMPLETED"
    assert completed.prediction == "normal"
    assert completed.completed_at is not None


def test_background_scan_failure_is_persisted() -> None:
    repository = ScanRepository()
    service = ScanService(
        repository=repository,
        predictor=StubPredictor(PredictionOutcome("normal", 2.0)),
    )
    pending = service.create_pending_scan(request())

    service.process_scan(pending.scan_id, request())

    failed = service.get_scan(pending.scan_id)
    assert failed is not None
    assert failed.status == "FAILED"
    assert failed.prediction is None
    assert failed.error == "Prediction confidence must be between 0 and 1."


def test_repository_partial_update_preserves_scan_fields() -> None:
    repository = ScanRepository()
    stored = StoredScan(
        scan_id="scan-update",
        prediction=None,
        confidence=None,
        risk_level=None,
        timestamp=datetime.now(UTC),
        status="PENDING",
    )
    repository.save(stored)

    updated = repository.update(
        "scan-update",
        status="COMPLETED",
        prediction="normal",
        confidence=0.9,
        risk_level="low",
    )

    assert updated is not None
    assert updated.status == "COMPLETED"
    assert updated.prediction == "normal"
    assert updated.confidence == 0.9


def test_model_artifact_validation_reports_missing_models(tmp_path: Path) -> None:
    missing = validate_model_artifacts(tmp_path)

    assert missing == (
        "LogisticRegression",
        "DecisionTree",
        "RandomForest",
        "XGBoost",
    )


def test_sparse_scan_features_are_normalized_in_model_order() -> None:
    scan_request = ScanRequest(
        features={"unknown": 9.0, "indicator.http": 1.0},
        subject_id="ABC0001",
    )

    assert normalize_scan_features(
        scan_request,
        (
            "categorical.subject_id==ABC0001",
            "categorical.window==daily",
            "indicator.http",
            "indicator.email",
        ),
    ) == (1.0, 1.0, 1.0, 0.0)
