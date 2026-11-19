"""Reusable SQLAlchemy engine configuration."""

from sqlalchemy import Engine, create_engine

from app.core.config import get_settings

settings = get_settings()
engine_options: dict[str, object] = {"pool_pre_ping": True}
if settings.database_url.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
elif "postgresql" in settings.database_url:
    engine_options["connect_args"] = {"connect_timeout": 1}
engine: Engine = create_engine(settings.database_url, **engine_options)
