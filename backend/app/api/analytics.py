"""Authenticated analytics API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    ModelAnalyticsResponse,
    RiskAnalyticsResponse,
)
from app.services.analytics_service import AnalyticsService
from app.services.auth_service import UserRecord

router = APIRouter(prefix="/analytics", tags=["analytics"])
analytics_service = AnalyticsService()


@router.get(
    "",
    response_model=AnalyticsSummaryResponse,
    summary="Get scan analytics summary",
)
def get_analytics(
    _: Annotated[UserRecord, Depends(get_current_user)],
) -> AnalyticsSummaryResponse:
    """Return aggregate scan analytics."""
    return analytics_service.summary()


@router.get(
    "/risk",
    response_model=RiskAnalyticsResponse,
    summary="Get risk and prediction distributions",
)
def get_risk_analytics(
    _: Annotated[UserRecord, Depends(get_current_user)],
) -> RiskAnalyticsResponse:
    """Return risk-level and prediction distributions."""
    return analytics_service.risk()


@router.get(
    "/models",
    response_model=ModelAnalyticsResponse,
    summary="Get model usage statistics",
)
def get_model_analytics(
    _: Annotated[UserRecord, Depends(get_current_user)],
) -> ModelAnalyticsResponse:
    """Return model usage counts."""
    return analytics_service.models()
