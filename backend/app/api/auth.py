"""Authentication API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import auth_service, get_current_user
from app.auth.jwt import create_access_token
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import (
    InvalidCredentialsError,
    UserAlreadyExistsError,
    UserRecord,
)

router = APIRouter(prefix="/auth", tags=["authentication"])
direct_router = APIRouter(tags=["authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a user",
)
@router.post(
    "/register/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
@direct_router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a user (direct alias)",
)
@direct_router.post(
    "/register/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def register(request: RegisterRequest) -> UserResponse:
    """Register a user in the repository."""
    try:
        user = auth_service.register(request.username, request.password)
    except UserAlreadyExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already registered",
        ) from error
    return UserResponse(username=user.username)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in and obtain an access token",
)
@router.post(
    "/login/",
    response_model=TokenResponse,
    include_in_schema=False,
)
@direct_router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in and obtain an access token (direct alias)",
)
@direct_router.post(
    "/login/",
    response_model=TokenResponse,
    include_in_schema=False,
)
def login(request: LoginRequest) -> TokenResponse:
    """Authenticate a user and issue a bearer access token."""
    try:
        user = auth_service.authenticate(request.username, request.password)
    except InvalidCredentialsError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error
    return TokenResponse(access_token=create_access_token(user.username))


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the current authenticated user",
)
@router.get(
    "/me/",
    response_model=UserResponse,
    include_in_schema=False,
)
@direct_router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the current authenticated user (direct alias)",
)
@direct_router.get(
    "/me/",
    response_model=UserResponse,
    include_in_schema=False,
)
def current_user(
    user: Annotated[UserRecord, Depends(get_current_user)],
) -> UserResponse:
    """Return the user represented by the bearer token."""
    return UserResponse(username=user.username)
