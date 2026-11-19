"""SQLAlchemy repository for authentication users."""

from __future__ import annotations

import time
from typing import TYPE_CHECKING, ClassVar

from sqlalchemy import select
from sqlalchemy.exc import (
    DatabaseError,
    IntegrityError,
    InterfaceError,
    OperationalError,
    ProgrammingError,
)
from sqlalchemy.orm import Session, sessionmaker

from app.db.session import SessionLocal
from app.models.orm import User

if TYPE_CHECKING:
    from app.services.auth_service import UserRecord

DB_CONNECT_ERRORS = (OperationalError, InterfaceError, ProgrammingError, DatabaseError)


class UserRepository:
    """Persist users through request-scoped SQLAlchemy sessions with in-memory fallback."""

    _memory_users: ClassVar[dict[str, UserRecord]] = {}
    _db_available: ClassVar[bool] = True
    _last_db_failure: ClassVar[float] = 0.0
    _COOLDOWN_SECONDS: ClassVar[float] = 15.0

    def __init__(
        self,
        session_factory: sessionmaker[Session] | None = None,
    ) -> None:
        """Create a repository using the configured database session factory."""
        self._session_factory = session_factory or SessionLocal

    @classmethod
    def _is_db_usable(cls) -> bool:
        """Check whether database connection attempts should be attempted."""
        return cls._db_available or (
            time.time() - cls._last_db_failure >= cls._COOLDOWN_SECONDS
        )

    @classmethod
    def _mark_db_failure(cls) -> None:
        cls._db_available = False
        cls._last_db_failure = time.time()

    @classmethod
    def _mark_db_success(cls) -> None:
        cls._db_available = True

    def create(self, user: UserRecord) -> UserRecord:
        """Insert a user and preserve the service-level contract."""
        if self._is_db_usable():
            try:
                with self._session_factory() as session:
                    session.add(
                        User(username=user.username, password_hash=user.password_hash)
                    )
                    try:
                        session.commit()
                        self._mark_db_success()
                        return user
                    except IntegrityError as error:
                        session.rollback()
                        raise ValueError("User already exists") from error
            except DB_CONNECT_ERRORS:
                self._mark_db_failure()

        if user.username in self._memory_users:
            raise ValueError("User already exists")
        self._memory_users[user.username] = user
        return user

    def get(self, username: str) -> UserRecord | None:
        """Fetch one user by normalized username."""
        if self._is_db_usable():
            try:
                with self._session_factory() as session:
                    model = session.get(User, username)
                    self._mark_db_success()
                    return _to_record(model) if model is not None else None
            except DB_CONNECT_ERRORS:
                self._mark_db_failure()

        return self._memory_users.get(username)

    def list(self) -> tuple[UserRecord, ...]:
        """Return users in deterministic username order."""
        if self._is_db_usable():
            try:
                with self._session_factory() as session:
                    models = session.scalars(select(User).order_by(User.username)).all()
                    self._mark_db_success()
                    return tuple(_to_record(model) for model in models)
            except DB_CONNECT_ERRORS:
                self._mark_db_failure()

        return tuple(sorted(self._memory_users.values(), key=lambda u: u.username))

    def clear(self) -> None:
        """Remove all users for compatibility with isolated test fixtures."""
        self._memory_users.clear()
        if self._is_db_usable():
            try:
                with self._session_factory() as session:
                    for model in session.scalars(select(User)).all():
                        session.delete(model)
                    session.commit()
                    self._mark_db_success()
            except DB_CONNECT_ERRORS:
                self._mark_db_failure()


def _to_record(model: User) -> UserRecord:
    from app.services.auth_service import UserRecord

    return UserRecord(username=model.username, password_hash=model.password_hash)
