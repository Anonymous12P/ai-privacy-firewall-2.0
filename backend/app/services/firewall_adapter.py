"""Adapters bridging legacy scan contracts and the Privacy Firewall platform."""

import logging

from app.core.constants import APP_LOGGER_NAME
from app.schemas.firewall import (
    FirewallEnforceRequest,
    FirewallEvaluationRequest,
    FirewallEvaluationResponse,
)
from app.schemas.scan import ScanRequest, ScanResponse
from app.services.firewall_service import FirewallService

logger = logging.getLogger(f"{APP_LOGGER_NAME}.adapters.scan")


class ScanToFirewallAdapter:
    """Adapter translating between legacy URL/feature scan payloads and the Privacy Firewall platform."""

    @staticmethod
    def to_evaluation_request(scan_request: ScanRequest) -> FirewallEvaluationRequest:
        """Convert a legacy ScanRequest into a FirewallEvaluationRequest."""
        return FirewallEvaluationRequest(
            features=scan_request.features,
            subject_id=scan_request.subject_id,
            resource=scan_request.url or "scan_resource",
            action="read",
            model_name=scan_request.model_name,
            context={"legacy_scan": True, "url": scan_request.url},
            url=scan_request.url,
        )

    @staticmethod
    def to_enforce_request(
        scan_request: ScanRequest,
        enforce: bool | None = None,
    ) -> FirewallEnforceRequest:
        """Convert a legacy ScanRequest into a FirewallEnforceRequest."""
        return FirewallEnforceRequest(
            features=scan_request.features,
            subject_id=scan_request.subject_id,
            resource=scan_request.url or "scan_resource",
            action="read",
            model_name=scan_request.model_name,
            context={"legacy_scan": True, "url": scan_request.url},
            url=scan_request.url,
            enforce=enforce,
        )

    @staticmethod
    def to_scan_response(
        eval_response: FirewallEvaluationResponse,
        prediction: str | float | bool | None = None,
    ) -> ScanResponse:
        """Convert a FirewallEvaluationResponse into a legacy ScanResponse."""
        risk_level_map = {
            "Low": "low",
            "Medium": "medium",
            "High": "high",
            "Critical": "high",
        }
        mapped_risk = risk_level_map.get(eval_response.risk_level, "medium")

        return ScanResponse(
            scan_id=eval_response.evaluation_id,
            status="COMPLETED",
            prediction=prediction
            or (
                "insider"
                if eval_response.decision in {"BLOCK", "RESTRICT"}
                else "normal"
            ),
            confidence=eval_response.risk_score,
            risk_level=mapped_risk,  # type: ignore[arg-type]
            firewall_action=eval_response.decision,
            policy_name=eval_response.policy_name,
            reasons=eval_response.reasons,
            warning=eval_response.warning,
            restriction_notice=eval_response.restriction_notice,
            timestamp=eval_response.timestamp,
            created_at=eval_response.timestamp,
            explanation_summary=eval_response.explanation.summary,
            completed_at=eval_response.timestamp,
            error=None,
        )


class LegacyScanFirewallAdapter:
    """Adapts the modern FirewallService to satisfy legacy scanner workflows."""

    def __init__(self, firewall_service: FirewallService) -> None:
        """Initialize adapter wrapping the firewall orchestrator."""
        self._firewall = firewall_service

    def process_legacy_scan(
        self,
        request: ScanRequest,
        user_id: str | None = None,
        enforce: bool = False,
    ) -> ScanResponse:
        """Route a legacy scan through the full Privacy Firewall pipeline."""
        resp: FirewallEvaluationResponse
        if enforce:
            enforce_req = ScanToFirewallAdapter.to_enforce_request(request)
            resp = self._firewall.enforce(enforce_req, user_id=user_id)
        else:
            eval_req = ScanToFirewallAdapter.to_evaluation_request(request)
            resp = self._firewall.evaluate(eval_req, user_id=user_id)

        return ScanToFirewallAdapter.to_scan_response(resp)
