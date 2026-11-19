"""Typed result models for dataset inventory and read-only analysis."""

from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path


@dataclass(frozen=True, slots=True)
class DatasetFileRecord:
    """Inventory metadata and CSV structure for one source file."""

    filename: str
    relative_path: str
    size_bytes: int
    rows: int
    columns: tuple[str, ...]
    encoding: str
    delimiter: str
    sha256: str
    modified_at: datetime

    @property
    def column_count(self) -> int:
        """Return the number of columns in the CSV header."""
        return len(self.columns)


@dataclass(frozen=True, slots=True)
class DatasetInventoryResult:
    """Complete immutable inventory for a dataset directory."""

    dataset_root: Path
    files: tuple[DatasetFileRecord, ...]
    scanned_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    @property
    def total_rows(self) -> int:
        """Return the sum of record counts across inventoried CSV files."""
        return sum(file_record.rows for file_record in self.files)

    @property
    def total_size_bytes(self) -> int:
        """Return the total size in bytes of inventoried CSV files."""
        return sum(file_record.size_bytes for file_record in self.files)


@dataclass(frozen=True, slots=True)
class FileDatasetStatistics:
    """Read-only descriptive statistics for one CSV file."""

    relative_path: str
    row_count: int
    column_count: int
    missing_values: dict[str, int]
    duplicate_rows: int
    memory_estimate_bytes: int
    date_columns: tuple[str, ...]
    categorical_columns: tuple[str, ...]
    numeric_columns: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class DatasetStatisticsResult:
    """Aggregate per-file statistics for one dataset directory."""

    dataset_root: Path
    files: tuple[FileDatasetStatistics, ...]
    analyzed_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    @property
    def total_rows(self) -> int:
        """Return the sum of analyzed row counts."""
        return sum(file_statistics.row_count for file_statistics in self.files)

    @property
    def total_columns(self) -> int:
        """Return the sum of column counts across analyzed files."""
        return sum(file_statistics.column_count for file_statistics in self.files)
