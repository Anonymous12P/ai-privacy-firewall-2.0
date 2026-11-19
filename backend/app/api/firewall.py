"""Firewall-centric REST API routes for evaluation, enforcement, policies, audit, and status."""

import logging
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query, status

from app.auth.dependencies import get_current_user
from app.core.constants import APP_LOGGER_NAME
from app.core.dependencies import get_firewall_service
from app.schemas.firewall import (
    FirewallAuditResponse,
    FirewallEnforceRequest,
    FirewallEnforceResponse,
    FirewallEvaluationRequest,
    FirewallEvaluationResponse,
    FirewallModelPipelineResponse,
    FirewallPoliciesResponse,
    FirewallStatusResponse,
)
from app.services.auth_service import UserRecord
from app.services.firewall_service import FirewallService

logger = logging.getLogger(f"{APP_LOGGER_NAME}.api.firewall")

router = APIRouter(prefix="/firewall", tags=["firewall"])


@router.post(
    "/evaluate",
    response_model=FirewallEvaluationResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate an access attempt against privacy firewall policies",
)
def evaluate_access(
    request: FirewallEvaluationRequest,
    user: Annotated[UserRecord, Depends(get_current_user)],
    service: Annotated[FirewallService, Depends(get_firewall_service)],
) -> FirewallEvaluationResponse:
    """Evaluate an access request through the complete Privacy Firewall pipeline without blocking.

    Pipeline stages:
    Behavior -> AI -> Explainability -> Policy -> Enforcement (inspect) -> Audit.
    """
    logger.info(
        "API evaluate request received: subject=%r resource=%r action=%r model=%s caller=%s",
        request.subject_id,
        request.resource,
        request.action,
        request.model_name,
        user.username,
    )
    return service.evaluate(request, user_id=user.username)


@router.post(
    "/enforce",
    response_model=FirewallEnforceResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate and actively enforce privacy firewall security policies",
)
def enforce_access(
    request: FirewallEnforceRequest,
    user: Annotated[UserRecord, Depends(get_current_user)],
    service: Annotated[FirewallService, Depends(get_firewall_service)],
) -> FirewallEnforceResponse:
    """Evaluate and enforce security policy on an access attempt.

    Pipeline stages:
    Behavior -> AI -> Explainability -> Policy -> Enforcement (active) -> Audit.
    Raises HTTP 403 Forbidden via FirewallBlockedError if the request is blocked.
    """
    logger.info(
        "API enforce request received: subject=%r resource=%r action=%r model=%s caller=%s",
        request.subject_id,
        request.resource,
        request.action,
        request.model_name,
        user.username,
    )
    return service.enforce(request, user_id=user.username)


@router.get(
    "/policies",
    response_model=FirewallPoliciesResponse,
    status_code=status.HTTP_200_OK,
    summary="List active firewall policies and rule definitions",
)
def list_policies(
    _: Annotated[UserRecord, Depends(get_current_user)],
    service: Annotated[FirewallService, Depends(get_firewall_service)],
) -> FirewallPoliciesResponse:
    """Return all configured privacy and security policy rules."""
    return service.get_policies()


@router.get(
    "/audit",
    response_model=FirewallAuditResponse,
    status_code=status.HTTP_200_OK,
    summary="Query historical firewall audit events",
)
def query_audit_logs(
    _: Annotated[UserRecord, Depends(get_current_user)],
    service: Annotated[FirewallService, Depends(get_firewall_service)],
    page: Annotated[int, Query(ge=1, description="Page number")] = 1,
    page_size: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
    subject_id: Annotated[
        str | None, Query(description="Filter by subject identifier")
    ] = None,
    action: Annotated[
        str | None,
        Query(description="Filter by action or decision (e.g. BLOCK, ALLOW)"),
    ] = None,
    risk_level: Annotated[
        Literal["Low", "Medium", "High", "Critical"] | None,
        Query(description="Filter by risk tier"),
    ] = None,
    enforced_only: Annotated[
        bool | None,
        Query(description="Filter to only actively enforced decisions"),
    ] = None,
) -> FirewallAuditResponse:
    """Query structured audit trail of firewall evaluation and enforcement events."""
    return service.get_audit(
        page=page,
        page_size=page_size,
        subject_id=subject_id,
        action=action,
        risk_level=risk_level,
        enforced_only=enforced_only,
    )


@router.get(
    "/status",
    response_model=FirewallStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Privacy Firewall platform operational health and status",
)
def get_firewall_status(
    _: Annotated[UserRecord, Depends(get_current_user)],
    service: Annotated[FirewallService, Depends(get_firewall_service)],
) -> FirewallStatusResponse:
    """Return real-time operational status, active mode, loaded models, and metrics."""
    return service.get_status()


@router.get(
    "/model-pipeline",
    response_model=FirewallModelPipelineResponse,
    status_code=status.HTTP_200_OK,
    summary="Get AI threat detection model pipeline metadata and benchmarks",
)
@router.get(
    "/pipeline",
    response_model=FirewallModelPipelineResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def get_model_pipeline(
    _: Annotated[UserRecord, Depends(get_current_user)],
    service: Annotated[FirewallService, Depends(get_firewall_service)],
) -> FirewallModelPipelineResponse:
    """Return real ML model benchmarks, global SHAP attributions, and dataset metadata."""
    return service.get_model_pipeline()

