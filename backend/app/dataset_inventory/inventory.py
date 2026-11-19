"""Inventory orchestration for recursively discovered local CSV files."""

from app.dataset_inventory.scanner import DatasetScanner
from app.dataset_inventory.schemas import DatasetInventoryResult


class DatasetInventory:
    """Build typed inventory snapshots using a streaming dataset scanner."""

    def __init__(self, scanner: DatasetScanner | None = None) -> None:
        """Initialize inventory generation with an injectable scanner."""
        self.scanner = scanner or DatasetScanner()

    def build(self) -> DatasetInventoryResult:
        """Return the current dataset directory inventory."""
        return DatasetInventoryResult(
            dataset_root=self.scanner.dataset_dir.resolve(),
            files=self.scanner.scan(),
        )
