"""Authenticated administrative API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, Request

from app.auth.dependencies import get_current_user
from app.schemas.admin import (
    AdminExperimentsResponse,
    AdminModelsResponse,
    AdminUsersResponse,
    SystemAdminResponse,
)
from app.services.admin_service import AdminService
from app.services.auth_service import UserRecord

router = APIRouter(prefix="/admin", tags=["admin"])
admin_service = AdminService()


@router.get(
    "/system",
    response_model=SystemAdminResponse,
    summary="Get system status",
)
def get_system(
    request: Request,
    _: Annotated[UserRecord, Depends(get_current_user)],
) -> SystemAdminResponse:
    """Return application and runtime status."""
    return admin_service.system(len(request.app.routes))


@router.get(
    "/models",
    response_model=AdminModelsResponse,
    summary="List registered models",
)
def get_models(
    _: Annotated[UserRecord, Depends(get_current_user)],
) -> AdminModelsResponse:
    """Return model availability and persisted metadata."""
    return admin_service.models()


@router.get(
    "/users",
    response_model=AdminUsersResponse,
    summary="List users and activity",
)
def get_users(
    _: Annotated[UserRecord, Depends(get_current_user)],
) -> AdminUsersResponse:
    """Return registered user activity summaries."""
    return admin_service.users()


@router.get(
    "/experiments",
    response_model=AdminExperimentsResponse,
    summary="List experiment runs",
)
def get_experiments(
    _: Annotated[UserRecord, Depends(get_current_user)],
) -> AdminExperimentsResponse:
    """Return discovered experiment configuration and artifacts."""
    return admin_service.experiments()
