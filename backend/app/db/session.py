"""Reusable SQLAlchemy session factory."""

from collections.abc import Generator

from sqlalchemy.orm import Session, sessionmaker

from app.db.engine import engine
from app.models import orm

SessionLocal: sessionmaker[Session] = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)

if engine.dialect.name == "sqlite":
    orm.Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Yield a request-scoped SQLAlchemy session."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
