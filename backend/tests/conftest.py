"""Global pytest configuration and fixtures for backend testing."""

import os
from pathlib import Path

# Keep the default experiment dataset path valid in clean CI checkouts.
Path(__file__).resolve().parents[1].joinpath("data", "raw", "cert_r4.2_subset").mkdir(
    parents=True, exist_ok=True
)

# Ensure tests use an isolated SQLite test database if not explicitly set to a running database
if "DATABASE_URL" not in os.environ or "postgresql" in os.environ.get(
    "DATABASE_URL", ""
):
    db_path = Path(__file__).resolve().parents[1] / "test-runtime.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

# Re-initialize the test database schema if running with SQLite
from app.db.engine import engine
from app.models import orm

if engine.dialect.name == "sqlite":
    orm.Base.metadata.create_all(bind=engine)
