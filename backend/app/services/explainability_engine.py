"""Explainability engine generating human-interpretable privacy firewall justifications."""

import logging
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Protocol

from app.core.constants import APP_LOGGER_NAME
from app.services.behavior_service import BehaviorAssessment

logger = logging.getLogger(f"{APP_LOGGER_NAME}.services.explainability")

DEFAULT_REASON_MAP: dict[str, str] = {
    "indicator.usb": "USB activity detected.",
    "indicator.file": "File activity detected.",
    "indicator.email": "Email activity detected.",
    "indicator.login": "Login activity detected.",
    "indicator.http": "HTTP activity detected.",
}


@dataclass(frozen=True, slots=True)
class FirewallExplanation:
    """Structured explainability outcome detailing decision rationale."""

    summary: str
    reasons: tuple[str, ...]
    contributing_factors: dict[str, float] = field(default_factory=dict)
    confidence: float = 0.0
    model_name: str = "LogisticRegression"


class ExplainabilityEngineProtocol(Protocol):
    """Protocol defining the explainability engine boundary."""

    def explain(
        self,
        model_name: str,
        features: Mapping[str, float],
        prediction: str | float | bool,
        confidence: float,
        behavior_assessment: BehaviorAssessment,
    ) -> FirewallExplanation:
        """Derive reasons and contributing factors for a firewall evaluation."""
        ...


class ExplainabilityEngine:
    """Generate transparent, deterministic feature explanations for AI evaluations."""

    def __init__(self, reason_map: Mapping[str, str] | None = None) -> None:
        """Initialize the explainability engine with a configurable feature-to-reason mapping."""
        self._reason_map = dict(reason_map or DEFAULT_REASON_MAP)

    def explain(
        self,
        model_name: str,
        features: Mapping[str, float],
        prediction: str | float | bool,
        confidence: float,
        behavior_assessment: BehaviorAssessment,
    ) -> FirewallExplanation:
        """Analyze indicators, compute factor weights, and generate human-readable explanations."""
        reasons: list[str] = []
        contributing_factors: dict[str, float] = {}
        total_active_val = 0.0

        for indicator_name in (
            "indicator.usb",
            "indicator.file",
            "indicator.email",
            "indicator.login",
            "indicator.http",
        ):
            val = float(features.get(indicator_name, 0.0))
            if val > 0.0:
                reason = self._reason_map.get(
                    indicator_name, f"{indicator_name} activity detected."
                )
                reasons.append(reason)
                contributing_factors[indicator_name] = val
                total_active_val += val

        # Normalize contributing factor proportions
        if total_active_val > 0.0:
            contributing_factors = {
                k: round(v / total_active_val, 4)
                for k, v in contributing_factors.items()
            }

        # Include behavioral contextual risk factors if present
        for factor in behavior_assessment.risk_factors:
            if factor not in reasons:
                reasons.append(factor)

        # Build natural language summary
        if str(prediction).lower() in {"insider", "high", "1", "threat"}:
            if reasons:
                summary = (
                    f"Access flagged as insider risk by {model_name} "
                    f"({confidence:.1%} confidence). Key factors: {'; '.join(reasons[:2])}."
                )
            else:
                summary = (
                    f"Access flagged as potential insider risk by {model_name} "
                    f"({confidence:.1%} confidence)."
                )
        elif confidence < 0.40:
            summary = (
                f"Access deemed safe by {model_name} with low anomaly confidence "
                f"({confidence:.1%})."
            )
        else:
            summary = (
                f"Access evaluated by {model_name} ({confidence:.1%} confidence) "
                f"with {len(reasons)} behavioral observations."
            )

        logger.info(
            "Explainability generated: model=%s confidence=%.3f reasons=%d",
            model_name,
            confidence,
            len(reasons),
        )

        return FirewallExplanation(
            summary=summary,
            reasons=tuple(reasons),
            contributing_factors=contributing_factors,
            confidence=round(confidence, 4),
            model_name=model_name,
        )
