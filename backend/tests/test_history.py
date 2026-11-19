"""Tests for scan history persistence, filtering, and API handlers."""

from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException, status

from app.api.history import delete_history_scan, get_history_scan, list_history
from app.auth.dependencies import get_current_user
from app.repositories.history_repository import HistoryRepository
from app.repositories.scan_repository import ScanRepository, StoredScan
from app.services.auth_service import UserRecord
from app.services.history_service import HistoryService


def stored(
    scan_id: str,
    *,
    offset: int,
    risk_level: str = "low",
    prediction: str = "normal",
) -> StoredScan:
    return StoredScan(
        scan_id=scan_id,
        prediction=prediction,
        confidence=0.8,
        risk_level=risk_level,
        timestamp=datetime(2026, 1, 1, tzinfo=UTC) + timedelta(minutes=offset),
    )


def service_with_scans() -> tuple[ScanRepository, HistoryService]:
    scan_repository = ScanRepository()
    for scan in (
        stored("scan-1", offset=1),
        stored("scan-2", offset=2, risk_level="high", prediction="insider"),
        stored("scan-3", offset=3, risk_level="medium"),
    ):
        scan_repository.save(scan)
    return scan_repository, HistoryService(HistoryRepository(scan_repository))


def test_history_service_lists_sorted_and_paginated() -> None:
    _, service = service_with_scans()

    result = service.list_history(page=2, page_size=1)

    assert result.total == 3
    assert [item.scan_id for item in result.items] == ["scan-2"]
    assert result.sort_order == "desc"


def test_history_service_filters_by_risk_and_prediction() -> None:
    _, service = service_with_scans()

    result = service.list_history(
        page=1,
        page_size=20,
        risk_level="high",
        prediction="insider",
    )

    assert result.total == 1
    assert result.items[0].scan_id == "scan-2"


def test_history_service_supports_ascending_sort_and_empty_history() -> None:
    repository = ScanRepository()
    service = HistoryService(HistoryRepository(repository))

    empty = service.list_history(page=1, page_size=20)
    assert empty.items == []
    assert empty.total == 0

    repository.save(stored("scan-1", offset=1))
    repository.save(stored("scan-2", offset=2))
    ascending = service.list_history(page=1, page_size=20, sort_order="asc")
    assert [item.scan_id for item in ascending.items] == ["scan-1", "scan-2"]


def test_history_service_retrieves_and_deletes_shared_scan() -> None:
    repository, service = service_with_scans()

    retrieved = service.get_scan("scan-1")
    deleted = service.delete_scan("scan-1")

    assert retrieved is not None
    assert deleted is not None
    assert repository.get("scan-1") is None
    assert service.get_scan("scan-1") is None


def test_api_history_routes_use_service_and_return_404() -> None:
    import app.api.history as history_api

    _, service = service_with_scans()
    original = history_api.history_service
    history_api.history_service = service
    try:
        user = UserRecord("alice", "hash")
        listed = list_history(
            user,
            page=1,
            page_size=2,
            sort_order="desc",
            risk_level=None,
            prediction=None,
        )
        retrieved = get_history_scan("scan-1", user)
        delete_response = delete_history_scan("scan-1", user)
        assert listed.total == 3
        assert len(listed.items) == 2
        assert retrieved.scan_id == "scan-1"
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
        with pytest.raises(HTTPException) as missing:
            get_history_scan("scan-1", user)
        assert missing.value.status_code == status.HTTP_404_NOT_FOUND
    finally:
        history_api.history_service = original


def test_unauthorized_history_access_is_rejected() -> None:
    with pytest.raises(HTTPException) as error:
        get_current_user("invalid-token")

    assert error.value.status_code == status.HTTP_401_UNAUTHORIZED
