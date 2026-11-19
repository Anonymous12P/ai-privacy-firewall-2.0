"""Tests for the public API routes."""

from app.api.health import health_check
from app.api.router import root
from app.main import app


def test_root_returns_application_metadata() -> None:
    response = root()

    assert response["application_name"] == app.title
    assert response["version"] == app.version
    assert response["documentation_url"] == "/docs"
    assert response["health_endpoint_url"] == "/api/v1/health"


def test_versioned_health_endpoint_returns_ok() -> None:
    assert health_check() == {"status": "ok"}


def test_legacy_health_endpoint_remains_available() -> None:
    route_paths = set(app.openapi()["paths"])

    assert "/" in route_paths
    assert "/api/v1/health" in route_paths
    assert "/health" in route_paths
