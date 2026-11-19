"""Pydantic response contracts for scan analytics."""

from pydantic import BaseModel, Field


class AnalyticsSummaryResponse(BaseModel):
    """Aggregate scan analytics."""

    total_scans: int = Field(ge=0)
    total_high_risk_predictions: int = Field(ge=0)
    average_confidence: float = Field(ge=0.0, le=1.0)
    daily_scan_counts: dict[str, int]
    top_risky_users: list[str]


class RiskAnalyticsResponse(BaseModel):
    """Risk and prediction distributions."""

    risk_level_distribution: dict[str, int]
    prediction_distribution: dict[str, int]


class ModelAnalyticsResponse(BaseModel):
    """Model usage distribution."""

    model_usage: dict[str, int]
