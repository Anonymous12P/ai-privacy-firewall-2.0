"""Behavioral analytics service for user activity and risk assessment."""

import logging
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any, Protocol

from app.core.constants import APP_LOGGER_NAME

logger = logging.getLogger(f"{APP_LOGGER_NAME}.services.behavior")

CORE_INDICATORS = (
    "indicator.usb",
    "indicator.file",
    "indicator.email",
    "indicator.login",
    "indicator.http",
)

INDICATOR_DESCRIPTIONS = {
    "indicator.usb": "Removable storage / USB activity detected",
    "indicator.file": "Elevated file system access / data read volume detected",
    "indicator.email": "Outbound email data transmission detected",
    "indicator.login": "Anomalous or off-hours authentication detected",
    "indicator.http": "High-frequency HTTP web traffic / data transfer detected",
}

INDICATOR_WEIGHTS = {
    "indicator.usb": 0.35,
    "indicator.file": 0.25,
    "indicator.email": 0.20,
    "indicator.login": 0.10,
    "indicator.http": 0.10,
}


@dataclass(frozen=True, slots=True)
class BehaviorAssessment:
    """Immutable assessment produced by behavioral analysis."""

    anomaly_score: float
    anomalous_indicators: tuple[str, ...]
    risk_factors: tuple[str, ...]
    indicators_present: dict[str, bool]
    normalized_features: dict[str, float] = field(default_factory=dict)
    context_metadata: dict[str, Any] = field(default_factory=dict)


class BehaviorServiceProtocol(Protocol):
    """Protocol defining the behavioral analytics boundary."""

    def analyze(
        self,
        subject_id: str | None,
        features: Mapping[str, float],
        context: Mapping[str, Any] | None = None,
        resource: str | None = None,
        action: str | None = None,
    ) -> BehaviorAssessment:
        """Analyze subject activity and generate a behavioral risk assessment."""
        ...


class BehaviorService:
    """Extract and analyze user behavior patterns to identify unauthorized access indicators."""

    def __init__(
        self,
        weights: Mapping[str, float] | None = None,
        descriptions: Mapping[str, str] | None = None,
    ) -> None:
        """Initialize the behavior service with customizable indicator weights."""
        self._weights = dict(weights or INDICATOR_WEIGHTS)
        self._descriptions = dict(descriptions or INDICATOR_DESCRIPTIONS)

    def analyze(
        self,
        subject_id: str | None,
        features: Mapping[str, float],
        context: Mapping[str, Any] | None = None,
        resource: str | None = None,
        action: str | None = None,
    ) -> BehaviorAssessment:
        """Analyze behavioral indicators, calculate heuristic anomaly score, and identify risk factors."""
        context_dict = dict(context or {})
        normalized: dict[str, float] = {}
        for key, value in features.items():
            try:
                normalized[key] = float(value)
            except (ValueError, TypeError):
                logger.warning(
                    "Non-numeric feature value for %r: %r; treating as 0.0", key, value
                )
                normalized[key] = 0.0

        indicators_present: dict[str, bool] = {}
        anomalous_indicators: list[str] = []
        risk_factors: list[str] = []
        weighted_score = 0.0
        total_weight = 0.0

        for indicator in CORE_INDICATORS:
            val = normalized.get(indicator, 0.0)
            is_active = val > 0.0
            indicators_present[indicator] = is_active
            weight = self._weights.get(indicator, 0.1)
            total_weight += weight

            if is_active:
                anomalous_indicators.append(indicator)
                desc = self._descriptions.get(indicator, f"Active {indicator}")
                risk_factors.append(desc)
                contribution = min(1.0, val if val <= 1.0 else (val / 10.0))
                weighted_score += weight * contribution

        # Check contextual risks (e.g., off-hours or sensitive operations)
        if context_dict.get("off_hours") is True:
            risk_factors.append(
                "Off-hours access attempted outside authorized business hours"
            )
            weighted_score += 0.15
            total_weight += 0.15

        if action in {"export", "bulk_download", "delete", "admin_query"}:
            risk_factors.append(f"High-privilege data operation requested: {action}")
            weighted_score += 0.10
            total_weight += 0.10

        anomaly_score = (
            min(1.0, weighted_score / total_weight) if total_weight > 0.0 else 0.0
        )

        logger.info(
            "Behavior analyzed: subject=%r resource=%r action=%r anomaly_score=%.3f "
            "anomalies=%d",
            subject_id,
            resource,
            action,
            anomaly_score,
            len(anomalous_indicators),
        )

        return BehaviorAssessment(
            anomaly_score=round(anomaly_score, 4),
            anomalous_indicators=tuple(anomalous_indicators),
            risk_factors=tuple(risk_factors),
            indicators_present=indicators_present,
            normalized_features=normalized,
            context_metadata=context_dict,
        )
