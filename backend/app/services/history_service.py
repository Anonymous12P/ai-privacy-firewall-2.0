"""History query and deletion service."""

from app.repositories.history_repository import HistoryRepository
from app.repositories.scan_repository import StoredScan
from app.schemas.history import HistoryResponse
from app.schemas.scan import ScanResponse


class HistoryService:
    """Coordinate history filtering, pagination, and response mapping."""

    def __init__(self, repository: HistoryRepository | None = None) -> None:
        """Create a history service with an injectable repository."""
        self._repository = repository or HistoryRepository()

    def list_history(
        self,
        *,
        page: int,
        page_size: int,
        risk_level: str | None = None,
        prediction: str | None = None,
        sort_order: str = "desc",
    ) -> HistoryResponse:
        """Return a paginated, filtered history page."""
        scans = self._repository.list(
            risk_level=risk_level,
            prediction=prediction,
            sort_order=sort_order,
        )
        start = (page - 1) * page_size
        end = start + page_size
        return HistoryResponse(
            items=[_response(scan) for scan in scans[start:end]],
            total=len(scans),
            page=page,
            page_size=page_size,
            sort_order=sort_order,  # type: ignore[arg-type]
        )

    def get_scan(self, scan_id: str) -> ScanResponse | None:
        """Return one history entry when it exists."""
        scan = self._repository.get(scan_id)
        return _response(scan) if scan is not None else None

    def delete_scan(self, scan_id: str) -> ScanResponse | None:
        """Delete and return one history entry when it exists."""
        scan = self._repository.delete(scan_id)
        return _response(scan) if scan is not None else None


def _response(scan: StoredScan) -> ScanResponse:
    return ScanResponse(
        scan_id=scan.scan_id,
        status=scan.status,  # type: ignore[arg-type]
        prediction=scan.prediction,
        confidence=scan.confidence,
        risk_level=scan.risk_level,  # type: ignore[arg-type]
        timestamp=scan.timestamp,
        created_at=scan.timestamp,
        explanation_summary=scan.explanation_summary,
        completed_at=scan.completed_at,
        error=scan.error,
    )
