"""Tests for authenticated administrative views."""

from datetime import UTC, datetime

import pytest
from fastapi import HTTPException, status
from starlette.requests import Request

from app.api.admin import get_experiments, get_models, get_system, get_users
from app.auth.dependencies import auth_service, get_current_user
from app.main import app
from app.repositories.admin_repository import AdminRepository
from app.repositories.scan_repository import ScanRepository, StoredScan
from app.services.admin_service import AdminService
from app.services.auth_service import UserRecord


def test_admin_service_empty_views_are_deterministic() -> None:
    service = AdminService(repository=AdminRepository(ScanRepository()))

    assert service.users().model_dump() == {"total_users": 0, "users": []}
    assert service.system(registered_api_routes=12).database_mode == "in-memory"


def test_admin_service_reports_populated_users_and_models() -> None:
    scans = ScanRepository()
    auth_service._users.clear()
    auth_service.register("alice", "correct-password")
    scans.save(
        StoredScan(
            scan_id="scan-1",
            prediction="insider",
            confidence=0.9,
            risk_level="high",
            timestamp=datetime(2026, 1, 1, tzinfo=UTC),
            model_name="RandomForest",
            user_id="alice",
        )
    )
    service = AdminService(repository=AdminRepository(scans))

    users = service.users()
    models = service.models()

    assert users.total_users == 1
    assert users.users[0].scan_count == 1
    assert all(model.available for model in models.models[:4])


def test_admin_handlers_are_authenticated_and_return_typed_data() -> None:
    user = UserRecord("alice", "hash")
    request = Request({"type": "http", "method": "GET", "path": "/", "app": app})

    assert get_system(request, user).authentication_enabled
    assert get_models(user).models
    assert get_users(user).total_users >= 0
    assert get_experiments(user).experiments is not None


def test_unauthorized_admin_access_is_rejected() -> None:
    with pytest.raises(HTTPException) as error:
        get_current_user("invalid-token")

    assert error.value.status_code == status.HTTP_401_UNAUTHORIZED


def test_admin_routes_are_in_openapi() -> None:
    paths = app.openapi()["paths"]

    assert {
        "/api/v1/admin/system",
        "/api/v1/admin/models",
        "/api/v1/admin/users",
        "/api/v1/admin/experiments",
    }.issubset(paths)
