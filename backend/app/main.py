"""FastAPI application entry point."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.auth import direct_router
from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.router import router as api_router
from app.api.router import v1_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.services.firewall_service import FirewallBlockedError
from app.services.scan_service import validate_model_artifacts

settings = get_settings()
logger = configure_logging(settings.log_level)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    """Log application startup and shutdown."""
    logger.info("%s %s starting", settings.app_name, settings.app_version)
    validate_model_artifacts(settings.model_directory)
    yield
    logger.info("%s shutting down", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
)


@app.exception_handler(FirewallBlockedError)
async def firewall_blocked_handler(
    _: Request,
    exception: FirewallBlockedError,
) -> JSONResponse:
    """Return the firewall's stable HTTP 403 error contract."""
    return JSONResponse(status_code=403, content=exception.payload())


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(v1_router, prefix="/api/v1")
app.include_router(auth_router)
app.include_router(auth_router, prefix="/api")
app.include_router(direct_router)
app.include_router(direct_router, prefix="/api")
app.include_router(direct_router, prefix="/api/v1")
app.include_router(health_router)
