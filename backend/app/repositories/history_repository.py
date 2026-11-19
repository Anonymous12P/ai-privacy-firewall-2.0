"""Repository adapter for querying the shared scan store."""

from app.repositories.scan_repository import (
    ScanRepository,
    StoredScan,
    default_scan_repository,
)


class HistoryRepository:
    """Read and delete history entries without duplicating scan persistence."""

    def __init__(self, scan_repository: ScanRepository | None = None) -> None:
        """Use the shared scan repository by default."""
        self._scan_repository = scan_repository or default_scan_repository

    def list(
        self,
        *,
        risk_level: str | None = None,
        prediction: str | None = None,
        sort_order: str = "desc",
    ) -> tuple[StoredScan, ...]:
        """Return filtered scans sorted by timestamp."""
        scans = self._scan_repository.list()
        if risk_level is not None:
            scans = tuple(scan for scan in scans if scan.risk_level == risk_level)
        if prediction is not None:
            scans = tuple(scan for scan in scans if str(scan.prediction) == prediction)
        return tuple(
            sorted(
                scans,
                key=lambda scan: (scan.timestamp, scan.scan_id),
                reverse=sort_order == "desc",
            )
        )

    def get(self, scan_id: str) -> StoredScan | None:
        """Return one shared scan entry."""
        return self._scan_repository.get(scan_id)

    def delete(self, scan_id: str) -> StoredScan | None:
        """Delete one shared scan entry."""
        return self._scan_repository.delete(scan_id)
