"""Comprehensive tests for the Explainable Adaptive AI Privacy Firewall platform.

Tests cover:
- BehaviorService: behavioral indicator extraction, scoring, anomaly heuristics
- AIEngine: threat prediction, model resolution, confidence calculation
- ExplainabilityEngine: transparent feature attribution, reasoning, explanations
- PolicyEngine: multi-tier deterministic confidence policies, policy listing
- EnforcementEngine: active blocking with stable HTTP 403 error contract, monitor mode
- AuditService: structured immutable audit trail logging, filtering, pagination, metrics
- FirewallService: end-to-end orchestration (Behavior -> AI -> Explainability -> Policy -> Enforcement -> Audit)
- REST APIs: POST /evaluate, POST /enforce, GET /policies, GET /audit, GET /status
- Adapters: legacy scan backward compatibility
"""

from collections.abc import Mapping
from typing import Any

import pytest

from app.api.firewall import (
    enforce_access,
    evaluate_access,
    get_firewall_status,
    list_policies,
    query_audit_logs,
)
from app.main import app
from app.schemas.firewall import (
    FirewallEnforceRequest,
    FirewallEvaluationRequest,
)
from app.schemas.scan import ScanRequest
from app.services.ai_engine import AIEngine, AIPrediction
from app.services.audit_service import AuditService, InMemoryAuditRepository
from app.services.auth_service import UserRecord
from app.services.behavior_service import BehaviorService
from app.services.enforcement_engine import EnforcementEngine, FirewallBlockedError
from app.services.explainability_engine import ExplainabilityEngine
from app.services.firewall_adapter import (
    LegacyScanFirewallAdapter,
    ScanToFirewallAdapter,
)
from app.services.firewall_service import FirewallService
from app.services.policy_engine import PolicyEngine

# ============================================================================
# Stubs & Fixtures
# ============================================================================


class MockAIPredictor:
    """Mock AI predictor for deterministic threat testing."""

    def __init__(self, prediction: str = "insider", confidence: float = 0.95) -> None:
        self.prediction = prediction
        self.confidence = confidence
        self.calls: list[dict[str, Any]] = []

    def predict(
        self,
        features: Mapping[str, float],
        model_name: str = "LogisticRegression",
        subject_id: str | None = None,
    ) -> AIPrediction:
        self.calls.append(
            {
                "features": dict(features),
                "model_name": model_name,
                "subject_id": subject_id,
            }
        )
        return AIPrediction(
            prediction=self.prediction,
            confidence=self.confidence,
            model_name=model_name,
            explanation_summary=f"Mock predicted {self.prediction}",
        )


@pytest.fixture
def auth_user() -> UserRecord:
    """Provide a valid UserRecord for API dependency resolution in tests."""
    return UserRecord(username="architect", password_hash="hashed_secret")


# ============================================================================
# 1. BehaviorService Tests
# ============================================================================


def test_behavior_service_analyzes_indicators_and_scores_anomaly() -> None:
    service = BehaviorService()
    assessment = service.analyze(
        subject_id="EMP1001",
        features={
            "indicator.usb": 1.0,
            "indicator.file": 2.0,
            "indicator.email": 0.0,
            "indicator.login": 0.0,
            "indicator.http": 0.0,
        },
        context={"off_hours": True},
        resource="/api/v1/patient-records",
        action="bulk_download",
    )

    assert assessment.anomaly_score > 0.0
    assert "indicator.usb" in assessment.anomalous_indicators
    assert "indicator.file" in assessment.anomalous_indicators
    assert assessment.indicators_present["indicator.usb"] is True
    assert assessment.indicators_present["indicator.email"] is False
    assert any("USB" in r for r in assessment.risk_factors)
    assert any("off-hours" in r.lower() for r in assessment.risk_factors)
    assert any("bulk_download" in r for r in assessment.risk_factors)


def test_behavior_service_handles_clean_baseline() -> None:
    service = BehaviorService()
    assessment = service.analyze(
        subject_id="EMP1002",
        features={"indicator.login": 0.0, "normal_metric": 10.0},
        context={},
        resource="/api/v1/public-docs",
        action="read",
    )

    assert assessment.anomaly_score == 0.0
    assert len(assessment.anomalous_indicators) == 0
    assert len(assessment.risk_factors) == 0


# ============================================================================
# 2. AIEngine Tests
# ============================================================================


def test_ai_engine_with_injected_predictor() -> None:
    mock_pred = MockAIPredictor(prediction="normal", confidence=0.25)
    engine = AIEngine(predictor=mock_pred)

    result = engine.predict(
        features={"feature_a": 1.0},
        model_name="RandomForest",
        subject_id="EMP2001",
    )

    assert result.prediction == "normal"
    assert result.confidence == 0.25
    assert result.model_name == "RandomForest"
    assert len(mock_pred.calls) == 1
    assert mock_pred.calls[0]["subject_id"] == "EMP2001"


def test_ai_engine_reports_available_models() -> None:
    engine = AIEngine()
    models = engine.available_models()
    assert "LogisticRegression" in models
    assert "RandomForest" in models


# ============================================================================
# 3. ExplainabilityEngine Tests
# ============================================================================


def test_explainability_engine_generates_transparent_reasons_and_weights() -> None:
    behavior_service = BehaviorService()
    assessment = behavior_service.analyze(
        subject_id="EMP3001",
        features={"indicator.usb": 1.0, "indicator.file": 1.0},
        context={},
        action="read",
    )

    explainer = ExplainabilityEngine()
    explanation = explainer.explain(
        model_name="XGBoost",
        features={"indicator.usb": 1.0, "indicator.file": 1.0},
        prediction="insider",
        confidence=0.92,
        behavior_assessment=assessment,
    )

    assert "USB activity detected." in explanation.reasons
    assert "File activity detected." in explanation.reasons
    assert "indicator.usb" in explanation.contributing_factors
    assert "indicator.file" in explanation.contributing_factors
    assert explanation.confidence == 0.92
    assert "XGBoost" in explanation.summary


# ============================================================================
# 4. PolicyEngine Tests
# ============================================================================


@pytest.mark.parametrize(
    ("confidence", "expected_action", "expected_risk", "expected_policy"),
    [
        (0.95, "BLOCK", "Critical", "high-confidence-block"),
        (0.80, "RESTRICT", "High", "elevated-confidence-restrict"),
        (0.50, "WARN", "Medium", "moderate-confidence-warn"),
        (0.15, "ALLOW", "Low", "low-confidence-allow"),
    ],
)
def test_policy_engine_evaluates_confidence_tiers(
    confidence: float,
    expected_action: str,
    expected_risk: str,
    expected_policy: str,
) -> None:
    engine = PolicyEngine()
    decision = engine.evaluate(
        prediction="insider",
        confidence=confidence,
        features={"indicator.usb": 1.0},
    )

    assert decision.action == expected_action
    assert decision.risk_level == expected_risk
    assert decision.policy_name == expected_policy
    assert "USB activity detected." in decision.reasons


def test_policy_engine_lists_policies() -> None:
    engine = PolicyEngine()
    policies = engine.list_policies()

    assert len(policies) >= 4
    names = {p.name for p in policies}
    assert "high-confidence-block" in names
    assert "elevated-confidence-restrict" in names


# ============================================================================
# 5. EnforcementEngine Tests
# ============================================================================


def test_enforcement_engine_blocks_and_raises_error_contract() -> None:
    engine = EnforcementEngine()
    policy_engine = PolicyEngine()
    decision = policy_engine.evaluate(
        prediction="insider",
        confidence=0.95,
        features={"indicator.usb": 1.0, "indicator.file": 1.0},
    )

    with pytest.raises(FirewallBlockedError) as exc_info:
        engine.enforce(decision, enabled=True)

    payload = exc_info.value.payload()
    assert payload["error"] == "Request blocked by AI Privacy Firewall"
    assert payload["firewall_action"] == "BLOCK"
    assert payload["policy_name"] == "high-confidence-block"
    assert "USB activity detected." in payload["reasons"]  # type: ignore[operator]


def test_enforcement_engine_monitor_mode_does_not_raise() -> None:
    engine = EnforcementEngine()
    policy_engine = PolicyEngine()
    decision = policy_engine.evaluate(
        prediction="insider",
        confidence=0.95,
        features={"indicator.usb": 1.0},
    )

    result = engine.enforce(decision, enabled=False)
    assert result.enforced is False
    assert result.action_taken == "BLOCK"


# ============================================================================
# 6. AuditService Tests
# ============================================================================


def test_audit_service_recording_querying_and_metrics() -> None:
    repo = InMemoryAuditRepository()
    service = AuditService(repository=repo)

    service.record(
        evaluation_id="eval-1",
        subject_id="alice",
        resource="/data/financials",
        action="export",
        decision="BLOCK",
        risk_level="Critical",
        risk_score=0.95,
        policy_name="high-confidence-block",
        enforced=True,
        reasons=["USB activity detected."],
    )
    service.record(
        evaluation_id="eval-2",
        subject_id="bob",
        resource="/data/reports",
        action="read",
        decision="ALLOW",
        risk_level="Low",
        risk_score=0.10,
        policy_name="low-confidence-allow",
        enforced=True,
        reasons=[],
    )

    records, total = service.query(action="BLOCK")
    assert total == 1
    assert records[0].subject_id == "alice"
    assert records[0].decision == "BLOCK"

    metrics = service.metrics()
    assert metrics["total_evaluations"] == 2
    assert metrics["total_blocks"] == 1


# ============================================================================
# 7. FirewallService Orchestration Tests
# ============================================================================


def test_firewall_service_orchestrates_full_pipeline_evaluate() -> None:
    audit_repo = InMemoryAuditRepository()
    mock_ai = MockAIPredictor(prediction="insider", confidence=0.85)
    firewall = FirewallService(
        ai_engine=AIEngine(predictor=mock_ai),
        audit_service=AuditService(repository=audit_repo),
    )

    req = FirewallEvaluationRequest(
        features={"indicator.usb": 1.0},
        subject_id="charlie",
        resource="/api/v1/confidential",
        action="read",
        model_name="DecisionTree",
    )

    response = firewall.evaluate(req, user_id="charlie")

    assert response.decision == "RESTRICT"
    assert response.risk_level == "High"
    assert response.risk_score == 0.85
    assert response.restriction_notice is not None
    assert response.explanation.confidence == 0.85
    assert response.behavior.anomaly_score > 0.0

    # Ensure evaluation was audited
    _, total = audit_repo.list()
    assert total == 1


def test_firewall_service_orchestrates_enforce_and_blocks() -> None:
    audit_repo = InMemoryAuditRepository()
    mock_ai = MockAIPredictor(prediction="insider", confidence=0.95)
    firewall = FirewallService(
        ai_engine=AIEngine(predictor=mock_ai),
        audit_service=AuditService(repository=audit_repo),
        enforce_firewall=True,
    )

    req = FirewallEnforceRequest(
        features={"indicator.usb": 1.0, "indicator.file": 1.0},
        subject_id="dave",
        resource="/data/vault",
        action="export",
    )

    with pytest.raises(FirewallBlockedError) as exc_info:
        firewall.enforce(req, user_id="dave")

    assert exc_info.value.payload()["firewall_action"] == "BLOCK"

    # Crucial security check: blocked attempt was audited in the audit trail!
    records, total = audit_repo.list()
    assert total == 1
    assert records[0].decision == "BLOCK"
    assert records[0].enforced is True


# ============================================================================
# 8. REST API Endpoints Tests
# ============================================================================


def test_firewall_api_routes_registered_in_openapi() -> None:
    paths = set(app.openapi()["paths"])
    assert "/api/v1/firewall/evaluate" in paths
    assert "/api/v1/firewall/enforce" in paths
    assert "/api/v1/firewall/policies" in paths
    assert "/api/v1/firewall/audit" in paths
    assert "/api/v1/firewall/status" in paths


def test_api_firewall_status_handler(auth_user: UserRecord) -> None:
    service = FirewallService()
    status_response = get_firewall_status(auth_user, service)

    assert status_response.status == "HEALTHY"
    assert "models_available" in status_response.model_dump()
    assert status_response.services["policy_engine"] == "OPERATIONAL"


def test_api_firewall_policies_handler(auth_user: UserRecord) -> None:
    service = FirewallService()
    response = list_policies(auth_user, service)

    assert response.total_count >= 4
    assert any(p.name == "high-confidence-block" for p in response.policies)


def test_api_firewall_evaluate_handler(auth_user: UserRecord) -> None:
    mock_ai = MockAIPredictor(prediction="normal", confidence=0.20)
    service = FirewallService(ai_engine=AIEngine(predictor=mock_ai))

    req = FirewallEvaluationRequest(
        features={"indicator.login": 1.0, "indicator.http": 0.5},
        subject_id="test_subject",
        resource="/api/v1/hr/records",
        action="read",
        model_name="LogisticRegression",
    )
    response = evaluate_access(req, auth_user, service)

    assert response.decision in {"ALLOW", "WARN", "RESTRICT", "BLOCK"}
    assert response.risk_score == 0.20
    assert response.explanation.confidence == 0.20
    assert response.subject_id == "test_subject"


def test_api_firewall_enforce_blocks_handler(auth_user: UserRecord) -> None:
    mock_ai = MockAIPredictor(prediction="insider", confidence=0.98)
    service = FirewallService(
        ai_engine=AIEngine(predictor=mock_ai), enforce_firewall=True
    )

    req = FirewallEnforceRequest(
        features={"indicator.usb": 1.0, "indicator.file": 1.0},
        subject_id="malicious_user",
        resource="/api/v1/classified-docs",
        action="export",
    )

    with pytest.raises(FirewallBlockedError) as exc_info:
        enforce_access(req, auth_user, service)

    payload = exc_info.value.payload()
    assert payload["error"] == "Request blocked by AI Privacy Firewall"
    assert payload["firewall_action"] == "BLOCK"
    assert payload["policy_name"] == "high-confidence-block"


def test_api_firewall_audit_handler(auth_user: UserRecord) -> None:
    repo = InMemoryAuditRepository()
    service = FirewallService(audit_service=AuditService(repository=repo))

    # Add a sample record
    service.audit_service.record(
        evaluation_id="eval-test",
        action="read",
        decision="ALLOW",
        risk_level="Low",
        risk_score=0.1,
        policy_name="low-confidence-allow",
        enforced=True,
        reasons=[],
        subject_id="audit_tester",
    )

    response = query_audit_logs(
        auth_user,
        service,
        page=1,
        page_size=10,
        subject_id="audit_tester",
    )

    assert response.total_count == 1
    assert response.items[0].subject_id == "audit_tester"


# ============================================================================
# 9. Adapters & Backward Compatibility Tests
# ============================================================================


def test_scan_to_firewall_adapter() -> None:
    scan_req = ScanRequest(
        features={"indicator.usb": 1.0},
        model_name="RandomForest",
        subject_id="legacy_user",
        url="http://legacy.scanner/test",
    )

    eval_req = ScanToFirewallAdapter.to_evaluation_request(scan_req)
    assert eval_req.features == scan_req.features
    assert eval_req.subject_id == "legacy_user"
    assert eval_req.resource == "http://legacy.scanner/test"

    enforce_req = ScanToFirewallAdapter.to_enforce_request(scan_req, enforce=True)
    assert enforce_req.enforce is True


def test_legacy_scan_firewall_adapter_execution() -> None:
    mock_ai = MockAIPredictor(prediction="normal", confidence=0.10)
    firewall = FirewallService(ai_engine=AIEngine(predictor=mock_ai))
    adapter = LegacyScanFirewallAdapter(firewall)

    scan_req = ScanRequest(
        features={"indicator.login": 0.0},
        model_name="LogisticRegression",
        subject_id="legacy_alice",
    )

    scan_resp = adapter.process_legacy_scan(scan_req, user_id="legacy_alice")
    assert scan_resp.status == "COMPLETED"
    assert scan_resp.firewall_action == "ALLOW"
    assert scan_resp.confidence == 0.10
