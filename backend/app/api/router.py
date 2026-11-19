"""Central API router."""

from fastapi import APIRouter

from app.api.admin import router as admin_router
from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router
from app.api.firewall import router as firewall_router
from app.api.health import router as health_router
from app.api.history import router as history_router
from app.api.scan import router as scan_router
from app.core.config import get_settings

settings = get_settings()

router = APIRouter()
v1_router = APIRouter()
v1_router.include_router(health_router)
v1_router.include_router(auth_router)
v1_router.include_router(firewall_router)
v1_router.include_router(scan_router)
v1_router.include_router(history_router)
v1_router.include_router(analytics_router)
v1_router.include_router(admin_router)


@router.get("/")
def root() -> dict[str, str]:
    """Return application metadata and service URLs."""
    return {
        "application_name": settings.app_name,
        "version": settings.app_version,
        "documentation_url": "/docs",
        "health_endpoint_url": "/api/v1/health",
    }
