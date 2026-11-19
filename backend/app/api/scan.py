"""Authenticated scan API routes."""

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.core.config import get_settings
from app.schemas.scan import ScanNotFoundResponse, ScanRequest, ScanResponse
from app.services.auth_service import UserRecord
from app.services.scan_service import ScanService

router = APIRouter(prefix="/scan", tags=["scans"])
scan_service = ScanService(
    enforce_firewall=not get_settings().allow_only_logging,
)
_direct_call_background_tasks = BackgroundTasks()


@router.post(
    "",
    response_model=ScanResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Queue a prediction scan (Deprecated: use /api/v1/firewall/evaluate or /enforce)",
    deprecated=True,
)
def create_scan(
    request: ScanRequest,
    user: Annotated[UserRecord, Depends(get_current_user)],
    background_tasks: BackgroundTasks = _direct_call_background_tasks,
) -> ScanResponse:
    """Create a pending scan and queue prediction in the background.

    .. deprecated::
        Use ``POST /api/v1/firewall/evaluate`` or ``POST /api/v1/firewall/enforce`` instead.
    """
    if scan_service.enforcement_enabled:
        return scan_service.create_scan(request, user_id=user.username)
    pending = scan_service.create_pending_scan(request, user_id=user.username)
    if background_tasks is _direct_call_background_tasks:
        scan_service.process_scan(pending.scan_id, request)
        return scan_service.get_scan(pending.scan_id) or pending
    background_tasks.add_task(scan_service.process_scan, pending.scan_id, request)
    return pending


@router.get(
    "/{scan_id}",
    response_model=ScanResponse,
    responses={status.HTTP_404_NOT_FOUND: {"model": ScanNotFoundResponse}},
    summary="Get a stored scan (Deprecated: use /api/v1/firewall/audit)",
    deprecated=True,
)
def get_scan(
    scan_id: str,
    _: Annotated[UserRecord, Depends(get_current_user)],
) -> ScanResponse:
    """Return a previously persisted scan for an authenticated request.

    .. deprecated::
        Use ``GET /api/v1/firewall/audit`` instead.
    """
    scan = scan_service.get_scan(scan_id)
    if scan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found",
        )
    return scan
