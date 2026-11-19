"""Reusable FastAPI dependency providers for core infrastructure and firewall services."""

import logging
from typing import Annotated

from fastapi import Depends

from app.core.config import Settings, get_settings
from app.core.constants import APP_LOGGER_NAME
from app.services.ai_engine import AIEngine
from app.services.audit_service import AuditService
from app.services.behavior_service import BehaviorService
from app.services.enforcement_engine import EnforcementEngine
from app.services.explainability_engine import ExplainabilityEngine
from app.services.firewall_service import FirewallService
from app.services.policy_engine import PolicyEngine


def get_settings_dependency() -> Settings:
    """Provide the cached application settings."""
    return get_settings()


def get_application_logger() -> logging.Logger:
    """Provide the centralized application logger."""
    return logging.getLogger(APP_LOGGER_NAME)


def get_behavior_service() -> BehaviorService:
    """Dependency provider for BehaviorService."""
    return BehaviorService()


def get_ai_engine(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> AIEngine:
    """Dependency provider for AIEngine."""
    return AIEngine(model_directory=settings.model_directory)


def get_explainability_engine() -> ExplainabilityEngine:
    """Dependency provider for ExplainabilityEngine."""
    return ExplainabilityEngine()


def get_policy_engine() -> PolicyEngine:
    """Dependency provider for PolicyEngine."""
    return PolicyEngine()


def get_enforcement_engine() -> EnforcementEngine:
    """Dependency provider for EnforcementEngine."""
    return EnforcementEngine()


def get_audit_service() -> AuditService:
    """Dependency provider for AuditService."""
    return AuditService()


def get_firewall_service(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
    behavior_service: Annotated[BehaviorService, Depends(get_behavior_service)],
    ai_engine: Annotated[AIEngine, Depends(get_ai_engine)],
    explainability_engine: Annotated[
        ExplainabilityEngine, Depends(get_explainability_engine)
    ],
    policy_engine: Annotated[PolicyEngine, Depends(get_policy_engine)],
    enforcement_engine: Annotated[EnforcementEngine, Depends(get_enforcement_engine)],
    audit_service: Annotated[AuditService, Depends(get_audit_service)],
) -> FirewallService:
    """Dependency provider for the orchestrating FirewallService."""
    return FirewallService(
        behavior_service=behavior_service,
        ai_engine=ai_engine,
        explainability_engine=explainability_engine,
        policy_engine=policy_engine,
        enforcement_engine=enforcement_engine,
        audit_service=audit_service,
        enforce_firewall=not settings.allow_only_logging,
    )
