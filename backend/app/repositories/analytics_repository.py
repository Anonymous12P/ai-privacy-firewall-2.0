"""Read-only repository adapter for analytics."""

from app.repositories.scan_repository import (
    ScanRepository,
    StoredScan,
    default_scan_repository,
)


class AnalyticsRepository:
    """Read analytics inputs from the shared scan repository."""

    def __init__(self, scan_repository: ScanRepository | None = None) -> None:
        """Use the shared scan repository by default."""
        self._scan_repository = scan_repository or default_scan_repository

    def list_scans(self) -> tuple[StoredScan, ...]:
        """Return an immutable snapshot of all stored scans."""
        return self._scan_repository.list()
