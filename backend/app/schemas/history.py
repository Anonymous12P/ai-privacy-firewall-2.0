"""Pydantic contracts for scan history endpoints."""

from typing import Literal

from pydantic import BaseModel

from app.schemas.scan import ScanResponse


class HistoryResponse(BaseModel):
    """Paginated scan history response."""

    items: list[ScanResponse]
    total: int
    page: int
    page_size: int
    sort_order: Literal["asc", "desc"]


class HistoryNotFoundResponse(BaseModel):
    """Document a missing history entry response."""

    detail: str
