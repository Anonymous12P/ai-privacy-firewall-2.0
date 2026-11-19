"""Authentication service backed by an in-memory user repository."""

from dataclasses import dataclass

from app.auth.password import hash_password, verify_password
from app.repositories.user_repository import UserRepository


@dataclass(frozen=True)
class UserRecord:
    """Stored user data."""

    username: str
    password_hash: str


class UserAlreadyExistsError(Exception):
    """Raised when a username is already registered."""


class InvalidCredentialsError(Exception):
    """Raised when login credentials are invalid."""


class AuthService:
    """Coordinate registration and authentication operations."""

    def __init__(self, repository: UserRepository | None = None) -> None:
        self._repository = repository or UserRepository()

    @property
    def _users(self) -> "_UserStoreCompatibility":
        """Expose the legacy clear-only test hook without storing users in memory."""
        return _UserStoreCompatibility(self._repository)

    def register(self, username: str, password: str) -> UserRecord:
        """Register a user in the temporary in-memory repository."""
        normalized_username = username.strip().lower()
        if self._repository.get(normalized_username) is not None:
            raise UserAlreadyExistsError(normalized_username)
        user = UserRecord(
            username=normalized_username,
            password_hash=hash_password(password),
        )
        try:
            self._repository.create(user)
        except ValueError as error:
            raise UserAlreadyExistsError(normalized_username) from error
        return user

    def authenticate(self, username: str, password: str) -> UserRecord:
        """Validate credentials and return the authenticated user."""
        normalized_username = username.strip().lower()
        user = self._repository.get(normalized_username)
        if user is None or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError
        return user

    def get_user(self, username: str) -> UserRecord | None:
        """Return a stored user by username."""
        return self._repository.get(username.strip().lower())

    def list_users(self) -> tuple[UserRecord, ...]:
        """Return all registered users."""
        return self._repository.list()


class _UserStoreCompatibility:
    """Compatibility adapter for the former in-memory clear hook."""

    def __init__(self, repository: UserRepository) -> None:
        self._repository = repository

    def clear(self) -> None:
        self._repository.clear()
