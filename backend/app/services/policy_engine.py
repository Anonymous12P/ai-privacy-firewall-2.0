"""Policy engine managing and evaluating privacy firewall access rules."""

import logging
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from typing import Protocol

from app.core.constants import APP_LOGGER_NAME
from app.schemas.firewall import FirewallAction, FirewallRiskLevel, PolicyRuleSchema
from app.services.behavior_service import BehaviorAssessment

logger = logging.getLogger(f"{APP_LOGGER_NAME}.services.policy")


@dataclass(frozen=True, slots=True)
class PolicyDecision:
    """Decision produced by policy evaluation."""

    action: FirewallAction
    risk_level: FirewallRiskLevel
    policy_name: str
    reasons: tuple[str, ...]
    warning: str | None = None
    restriction_notice: str | None = None
    applied_rule_id: str | None = None


@dataclass(frozen=True, slots=True)
class PolicyRule:
    """Configurable rule definition within the policy engine."""

    policy_id: str
    name: str
    description: str
    action: FirewallAction
    risk_level: FirewallRiskLevel
    min_confidence: float | None = None
    max_confidence: float | None = None
    enabled: bool = True
    conditions: tuple[str, ...] = field(default_factory=tuple)


DEFAULT_POLICIES: tuple[PolicyRule, ...] = (
    PolicyRule(
        policy_id="pol-001",
        name="high-confidence-block",
        description="Blocks access when AI insider threat confidence is 90% or higher.",
        action="BLOCK",
        risk_level="Critical",
        min_confidence=0.90,
        max_confidence=1.00,
        conditions=("confidence >= 0.90",),
    ),
    PolicyRule(
        policy_id="pol-002",
        name="elevated-confidence-restrict",
        description="Applies access restrictions when AI threat confidence is between 70% and 90%.",
        action="RESTRICT",
        risk_level="High",
        min_confidence=0.70,
        max_confidence=0.90,
        conditions=("0.70 <= confidence < 0.90",),
    ),
    PolicyRule(
        policy_id="pol-003",
        name="moderate-confidence-warn",
        description="Issues an administrative warning when AI threat confidence is between 40% and 70%.",
        action="WARN",
        risk_level="Medium",
        min_confidence=0.40,
        max_confidence=0.70,
        conditions=("0.40 <= confidence < 0.70",),
    ),
    PolicyRule(
        policy_id="pol-004",
        name="low-confidence-allow",
        description="Allows access normally when threat confidence is below 40%.",
        action="ALLOW",
        risk_level="Low",
        min_confidence=0.00,
        max_confidence=0.40,
        conditions=("confidence < 0.40",),
    ),
)


class PolicyEngineProtocol(Protocol):
    """Protocol defining the policy engine boundary."""

    def evaluate(
        self,
        prediction: str | float | bool,
        confidence: float,
        features: Mapping[str, float],
        behavior_assessment: BehaviorAssessment | None = None,
        reasons: Sequence[str] | None = None,
        resource: str | None = None,
        action: str | None = None,
        subject_id: str | None = None,
    ) -> PolicyDecision:
        """Evaluate access policies and return a binding decision."""
        ...

    def list_policies(self) -> list[PolicyRuleSchema]:
        """Return all active policy rules."""
        ...


class PolicyEngine:
    """Evaluates privacy and authorization policies based on confidence, behavior, and context."""

    def __init__(self, policies: Sequence[PolicyRule] | None = None) -> None:
        """Initialize the policy engine with default or custom policy rules."""
        self._policies = list(policies or DEFAULT_POLICIES)

    def list_policies(self) -> list[PolicyRuleSchema]:
        """Return all registered policy rules as Pydantic schemas."""
        return [
            PolicyRuleSchema(
                policy_id=rule.policy_id,
                name=rule.name,
                description=rule.description,
                action=rule.action,
                risk_level=rule.risk_level,
                threshold=rule.min_confidence,
                enabled=rule.enabled,
                conditions=list(rule.conditions),
            )
            for rule in self._policies
        ]

    def evaluate(
        self,
        prediction: str | float | bool,
        confidence: float,
        features: Mapping[str, float],
        behavior_assessment: BehaviorAssessment | None = None,
        reasons: Sequence[str] | None = None,
        resource: str | None = None,
        action: str | None = None,
        subject_id: str | None = None,
    ) -> PolicyDecision:
        """Evaluate active policies against confidence and behavioral factors."""
        if not 0.0 <= confidence <= 1.0:
            raise ValueError("confidence must be between 0 and 1.")

        # Extract reasons if not provided
        resolved_reasons = (
            tuple(reasons) if reasons is not None else self._feature_reasons(features)
        )

        # Match confidence-based policies (ordered highest severity first)
        matched_rule: PolicyRule | None = None
        for rule in self._policies:
            if not rule.enabled:
                continue
            min_c = rule.min_confidence if rule.min_confidence is not None else 0.0
            max_c = rule.max_confidence if rule.max_confidence is not None else 1.0
            if rule.action == "BLOCK" and confidence >= min_c:
                matched_rule = rule
                break
            if min_c <= confidence < max_c:
                matched_rule = rule
                break

        if matched_rule is None:
            # Fallback
            action_name: FirewallAction = "ALLOW"
            risk_tier: FirewallRiskLevel = "Low"
            pol_name = "default-allow"
            rule_id = "default"
        else:
            action_name = matched_rule.action
            risk_tier = matched_rule.risk_level
            pol_name = matched_rule.name
            rule_id = matched_rule.policy_id

        warning = (
            "Request allowed with an AI Privacy Firewall warning."
            if action_name == "WARN"
            else None
        )
        restriction = (
            "Request allowed with AI Privacy Firewall restrictions."
            if action_name == "RESTRICT"
            else None
        )

        logger.info(
            "Policy evaluated: subject=%r action=%s risk=%s policy=%s confidence=%.3f",
            subject_id,
            action_name,
            risk_tier,
            pol_name,
            confidence,
        )

        return PolicyDecision(
            action=action_name,
            risk_level=risk_tier,
            policy_name=pol_name,
            reasons=resolved_reasons,
            warning=warning,
            restriction_notice=restriction,
            applied_rule_id=rule_id,
        )

    def _feature_reasons(self, features: Mapping[str, float]) -> tuple[str, ...]:
        labels = {
            "indicator.usb": "USB activity detected.",
            "indicator.file": "File activity detected.",
            "indicator.email": "Email activity detected.",
            "indicator.login": "Login activity detected.",
            "indicator.http": "HTTP activity detected.",
        }
        return tuple(
            labels[name]
            for name in (
                "indicator.usb",
                "indicator.file",
                "indicator.email",
                "indicator.login",
                "indicator.http",
            )
            if features.get(name, 0.0) > 0.0
        )
