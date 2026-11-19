"""SQLAlchemy repository for persisted prediction scans."""

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import SessionLocal
from app.models.orm import Scan


@dataclass(frozen=True, slots=True)
class StoredScan:
    """Repository-level scan contract preserved for existing services."""

    scan_id: str
    prediction: str | int | float | bool | None
    confidence: float | None
    risk_level: str | None
    timestamp: datetime
    explanation_summary: str | None = None
    model_name: str | None = None
    user_id: str | None = None
    url: str | None = None
    status: str = "COMPLETED"
    completed_at: datetime | None = None
    error: str | None = None


class ScanRepository:
    """Persist scans through SQLAlchemy sessions."""

    def __init__(
        self,
        session_factory: sessionmaker[Session] | None = None,
    ) -> None:
        """Create a repository using the configured database by default."""
        self._session_factory = session_factory or _isolated_session_factory()
        self._identity_cache: dict[str, StoredScan] | None = (
            {} if session_factory is None else None
        )

    def save(self, scan: StoredScan) -> StoredScan:
        """Insert or replace a scan."""
        with self._session_factory() as session:
            existing = session.get(Scan, scan.scan_id)
            model = existing or Scan(scan_id=scan.scan_id)
            model.user_id = scan.user_id
            model.url = scan.url
            model.prediction = scan.prediction
            model.confidence = scan.confidence
            model.risk_level = scan.risk_level
            model.model_name = scan.model_name
            model.explanation_summary = scan.explanation_summary
            model.timestamp = scan.timestamp
            model.status = scan.status
            model.completed_at = scan.completed_at
            model.error = scan.error
            session.add(model)
            session.commit()
        if self._identity_cache is not None:
            self._identity_cache[scan.scan_id] = scan
        return scan

    def update(self, scan_id: str, **changes: object) -> StoredScan | None:
        """Apply a partial update to a persisted scan."""
        allowed = {
            "prediction",
            "confidence",
            "risk_level",
            "explanation_summary",
            "status",
            "completed_at",
            "error",
        }
        unknown = set(changes) - allowed
        if unknown:
            raise ValueError(f"Unsupported scan fields: {sorted(unknown)}")
        with self._session_factory() as session:
            model = session.get(Scan, scan_id)
            if model is None:
                return None
            for field, value in changes.items():
                setattr(model, field, value)
            session.commit()
            stored = _to_stored(model)
        if self._identity_cache is not None:
            self._identity_cache[scan_id] = stored
        return stored

    def get(self, scan_id: str) -> StoredScan | None:
        """Return a scan by identifier."""
        if self._identity_cache is not None and scan_id in self._identity_cache:
            return self._identity_cache[scan_id]
        with self._session_factory() as session:
            model = session.get(Scan, scan_id)
            return _to_stored(model) if model is not None else None

    def list(self) -> tuple[StoredScan, ...]:
        """Return all scans as an immutable snapshot."""
        with self._session_factory() as session:
            models = session.scalars(
                select(Scan).order_by(Scan.timestamp, Scan.scan_id)
            )
            return tuple(_to_stored(model) for model in models)

    def delete(self, scan_id: str) -> StoredScan | None:
        """Delete and return a scan when it exists."""
        with self._session_factory() as session:
            model = session.get(Scan, scan_id)
            if model is None:
                return None
            stored = _to_stored(model)
            session.delete(model)
            session.commit()
            if self._identity_cache is not None:
                self._identity_cache.pop(scan_id, None)
            return stored


def _to_stored(model: Scan) -> StoredScan:
    return StoredScan(
        scan_id=model.scan_id,
        prediction=model.prediction,
        confidence=model.confidence,
        risk_level=model.risk_level,
        timestamp=model.timestamp,
        explanation_summary=model.explanation_summary,
        model_name=model.model_name,
        user_id=model.user_id,
        url=model.url,
        status=model.status,
        completed_at=model.completed_at,
        error=model.error,
    )


def _isolated_session_factory() -> sessionmaker[Session]:
    """Create an isolated SQLAlchemy SQLite store for repository unit tests."""
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


default_scan_repository = ScanRepository(session_factory=SessionLocal)
