"""Analytics calculations over shared scan history."""

from collections import Counter

from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    ModelAnalyticsResponse,
    RiskAnalyticsResponse,
)


class AnalyticsService:
    """Compute deterministic analytics without duplicating scan persistence."""

    def __init__(self, repository: AnalyticsRepository | None = None) -> None:
        """Create an analytics service with an injectable repository."""
        self._repository = repository or AnalyticsRepository()

    def summary(self) -> AnalyticsSummaryResponse:
        """Return aggregate counts, confidence, daily totals, and risky users."""
        scans = self._repository.list_scans()
        high_risk = sum(scan.risk_level == "high" for scan in scans)
        confidences = [scan.confidence for scan in scans if scan.confidence is not None]
        confidence = sum(confidences) / len(confidences) if confidences else 0.0
        daily = Counter(scan.timestamp.date().isoformat() for scan in scans)
        risky_users = Counter(
            scan.user_id
            for scan in scans
            if scan.user_id is not None and scan.risk_level == "high"
        )
        top_users = [
            user
            for user, _ in sorted(
                risky_users.items(),
                key=lambda item: (-item[1], item[0]),
            )
        ]
        return AnalyticsSummaryResponse(
            total_scans=len(scans),
            total_high_risk_predictions=high_risk,
            average_confidence=confidence,
            daily_scan_counts=dict(sorted(daily.items())),
            top_risky_users=top_users,
        )

    def risk(self) -> RiskAnalyticsResponse:
        """Return deterministic risk-level and prediction distributions."""
        scans = self._repository.list_scans()
        return RiskAnalyticsResponse(
            risk_level_distribution=dict(
                sorted(
                    Counter(
                        scan.risk_level for scan in scans if scan.risk_level is not None
                    ).items()
                )
            ),
            prediction_distribution=dict(
                sorted(
                    Counter(
                        str(scan.prediction)
                        for scan in scans
                        if scan.prediction is not None
                    ).items()
                )
            ),
        )

    def models(self) -> ModelAnalyticsResponse:
        """Return usage counts for models recorded with each scan."""
        scans = self._repository.list_scans()
        usage = Counter(scan.model_name or "unknown" for scan in scans)
        return ModelAnalyticsResponse(model_usage=dict(sorted(usage.items())))
