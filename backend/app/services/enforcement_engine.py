"""Enforcement engine applying binding policy actions and raising error contracts."""

import logging
from dataclasses import dataclass
from typing import Any, Protocol

from app.core.constants import APP_LOGGER_NAME
from app.schemas.firewall import FirewallAction
from app.services.policy_engine import PolicyDecision

logger = logging.getLogger(f"{APP_LOGGER_NAME}.services.enforcement")


class FirewallBlockedError(RuntimeError):
    """Raised when an enforced firewall decision blocks a request."""

    def __init__(self, decision: Any) -> None:
        super().__init__("Request blocked by AI Privacy Firewall")
        self.decision = decision

    def payload(self) -> dict[str, object]:
        """Return the public error payload for an HTTP 403 response."""
        firewall_action = getattr(
            self.decision, "firewall_action", getattr(self.decision, "action", "BLOCK")
        )
        policy_name = getattr(self.decision, "policy_name", "firewall-block")
        reasons = list(getattr(self.decision, "reasons", ()))
        return {
            "error": "Request blocked by AI Privacy Firewall",
            "policy_name": policy_name,
            "firewall_action": firewall_action,
            "reasons": reasons,
        }


@dataclass(frozen=True, slots=True)
class EnforcementResult:
    """Execution outcome detailing how policy enforcement was handled."""

    enforced: bool
    action_taken: FirewallAction
    warning: str | None = None
    restriction_notice: str | None = None


class EnforcementEngineProtocol(Protocol):
    """Protocol defining the enforcement engine boundary."""

    def enforce(
        self,
        decision: PolicyDecision,
        *,
        enabled: bool = True,
    ) -> EnforcementResult:
        """Enforce a decision according to policy and active operating mode."""
        ...

    def evaluate_only(self, decision: PolicyDecision) -> EnforcementResult:
        """Inspect enforcement outcome without actively blocking the request."""
        ...


class EnforcementEngine:
    """Executes policy enforcement actions (ALLOW, WARN, RESTRICT, BLOCK)."""

    def enforce(
        self,
        decision: PolicyDecision,
        *,
        enabled: bool = True,
    ) -> EnforcementResult:
        """Apply active policy enforcement.

        Raises FirewallBlockedError if decision is BLOCK and enforcement is enabled.
        """
        if enabled and decision.action == "BLOCK":
            logger.warning(
                "Firewall blocked request: policy=%s reasons=%s",
                decision.policy_name,
                decision.reasons,
            )
            raise FirewallBlockedError(decision)

        if not enabled and decision.action == "BLOCK":
            logger.info(
                "Firewall monitor mode: BLOCK decision logged without enforcement for policy=%s",
                decision.policy_name,
            )
            return EnforcementResult(
                enforced=False,
                action_taken="BLOCK",
                warning="Access monitored under high threat condition.",
            )

        logger.info(
            "Firewall decision enforced: action=%s policy=%s enabled=%s",
            decision.action,
            decision.policy_name,
            enabled,
        )

        return EnforcementResult(
            enforced=True,
            action_taken=decision.action,
            warning=decision.warning,
            restriction_notice=decision.restriction_notice,
        )

    def evaluate_only(self, decision: PolicyDecision) -> EnforcementResult:
        """Return non-blocking evaluation result representing proposed enforcement."""
        return EnforcementResult(
            enforced=False,
            action_taken=decision.action,
            warning=decision.warning,
            restriction_notice=decision.restriction_notice,
        )
