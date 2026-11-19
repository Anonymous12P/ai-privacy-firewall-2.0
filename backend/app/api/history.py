"""Authenticated scan history API routes."""

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.auth.dependencies import get_current_user
from app.schemas.history import HistoryNotFoundResponse, HistoryResponse
from app.schemas.scan import ScanResponse
from app.services.auth_service import UserRecord
from app.services.history_service import HistoryService

router = APIRouter(prefix="/history", tags=["history"])
history_service = HistoryService()


@router.get(
    "",
    response_model=HistoryResponse,
    summary="List scan history",
)
def list_history(
    _: Annotated[UserRecord, Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_order: Literal["asc", "desc"] = Query(default="desc"),
    risk_level: Literal["low", "medium", "high"] | None = Query(default=None),
    prediction: str | None = Query(default=None, min_length=1),
) -> HistoryResponse:
    """List authenticated user's stored scans with filters and pagination."""
    return history_service.list_history(
        page=page,
        page_size=page_size,
        sort_order=sort_order,
        risk_level=risk_level,
        prediction=prediction,
    )


@router.get(
    "/{scan_id}",
    response_model=ScanResponse,
    responses={status.HTTP_404_NOT_FOUND: {"model": HistoryNotFoundResponse}},
    summary="Retrieve a history entry",
)
def get_history_scan(
    scan_id: str,
    _: Annotated[UserRecord, Depends(get_current_user)],
) -> ScanResponse:
    """Return one stored scan history entry."""
    scan = history_service.get_scan(scan_id)
    if scan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found",
        )
    return scan


@router.delete(
    "/{scan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={status.HTTP_404_NOT_FOUND: {"model": HistoryNotFoundResponse}},
    summary="Delete a history entry",
)
def delete_history_scan(
    scan_id: str,
    _: Annotated[UserRecord, Depends(get_current_user)],
) -> Response:
    """Delete one stored scan history entry."""
    if history_service.delete_scan(scan_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
