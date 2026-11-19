"""Tests for authentication utilities and API handlers."""

import pytest
from app.api.auth import current_user, login, register
from app.auth.dependencies import auth_service, get_current_user
from app.auth.jwt import create_access_token
from app.auth.password import hash_password, verify_password
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.auth_service import UserAlreadyExistsError
from fastapi import HTTPException, status


@pytest.fixture(autouse=True)
def clear_users() -> None:
    auth_service._users.clear()


def test_password_hashing_uses_bcrypt() -> None:
    password_hash = hash_password("correct-password")

    assert password_hash.startswith("$2")
    assert verify_password("correct-password", password_hash)
    assert not verify_password("wrong-password", password_hash)


def test_register_creates_user_and_rejects_duplicate() -> None:
    response = register(RegisterRequest(username="Alice", password="correct-password"))

    assert response.username == "alice"
    with pytest.raises(HTTPException) as duplicate:
        register(RegisterRequest(username="alice", password="correct-password"))
    assert duplicate.value.status_code == status.HTTP_409_CONFLICT


def test_login_returns_access_token() -> None:
    register(RegisterRequest(username="alice", password="correct-password"))

    response = login(LoginRequest(username="alice", password="correct-password"))

    assert response.token_type == "bearer"
    assert get_current_user(response.access_token).username == "alice"


def test_login_rejects_invalid_password() -> None:
    register(RegisterRequest(username="alice", password="correct-password"))

    with pytest.raises(HTTPException) as error:
        login(LoginRequest(username="alice", password="wrong-password"))

    assert error.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert error.value.headers == {"WWW-Authenticate": "Bearer"}


def test_invalid_token_is_rejected() -> None:
    with pytest.raises(HTTPException) as error:
        get_current_user("not-a-valid-token")

    assert error.value.status_code == status.HTTP_401_UNAUTHORIZED


def test_protected_current_user_access() -> None:
    register(RegisterRequest(username="alice", password="correct-password"))
    token = create_access_token("alice")

    response = current_user(get_current_user(token))

    assert response.username == "alice"


def test_duplicate_service_registration_is_explicit() -> None:
    auth_service.register("alice", "correct-password")

    with pytest.raises(UserAlreadyExistsError):
        auth_service.register("alice", "correct-password")


def test_register_accepts_six_character_password() -> None:
    """Validate that 6-character passwords are accepted per the minimum requirement."""
    response = register(RegisterRequest(username="bob_user", password="secret"))
    assert response.username == "bob_user"

    token_response = login(LoginRequest(username="bob_user", password="secret"))
    assert token_response.access_token is not None


def test_register_accepts_email_username() -> None:
    """Validate that email-style usernames are accepted."""
    response = register(
        RegisterRequest(username="analyst@enterprise.com", password="Secure123")
    )
    assert response.username == "analyst@enterprise.com"


def test_direct_auth_router_handlers() -> None:
    """Verify that direct alias routes execute identically."""
    from app.api.auth import direct_router

    routes = [route.path for route in direct_router.routes]
    assert "/register" in routes
    assert "/login" in routes
    assert "/me" in routes


def test_auth_roundtrip_with_any_unique_username() -> None:
    """Verify that any unique username can register and authenticate."""
    for test_username in ("pj", "secops-99", "admin.user", "pavan_demo01"):
        reg = register(
            RegisterRequest(username=test_username, password="valid_password")
        )
        assert reg.username == test_username.lower()

        tok = login(LoginRequest(username=test_username, password="valid_password"))
        assert tok.token_type == "bearer"
        assert get_current_user(tok.access_token).username == test_username.lower()


def test_password_shorter_than_six_chars_rejected() -> None:
    """Verify that passwords under 6 characters fail Pydantic validation."""
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        RegisterRequest(username="valid_user", password="12345")


def test_backend_canonical_routes_mounted_in_fastapi() -> None:
    """Verify OpenAPI exposes the canonical versioned endpoints."""
    from app.main import app

    paths = app.openapi()["paths"]
    assert "/api/v1/auth/register" in paths
    assert "/api/v1/auth/login" in paths
    assert "/api/v1/auth/me" in paths
