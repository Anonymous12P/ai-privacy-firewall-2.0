"""Typed configuration and results for user-based dataset subsets."""

from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from app.dataset_subset.selector import validate_percentage

BACKEND_DIRECTORY = Path(__file__).resolve().parents[2]


@dataclass(frozen=True, slots=True)
class DatasetSubsetConfig:
    """Configuration for selecting and writing a CERT dataset subset."""

    source_directory: Path = BACKEND_DIRECTORY / "data" / "raw" / "cert_r4.2"
    output_directory: Path = BACKEND_DIRECTORY / "data" / "raw" / "cert_r4.2_subset"
    subset_percentage: float = 10.0
    random_seed: int = 42

    def __post_init__(self) -> None:
        """Validate configuration values before any dataset files are accessed."""
        validate_percentage(self.subset_percentage)
        if isinstance(self.random_seed, bool) or not isinstance(self.random_seed, int):
            raise TypeError("random_seed must be an integer.")


@dataclass(frozen=True, slots=True)
class SubsetFileRecord:
    """Output metadata for one copied CSV file."""

    source_path: str
    output_path: str
    rows_copied: int
    sha256: str


@dataclass(frozen=True, slots=True)
class DatasetSubsetResult:
    """Completed subset metadata used by reports and the manifest."""

    config: DatasetSubsetConfig
    total_users: int
    selected_users: tuple[str, ...]
    files: tuple[SubsetFileRecord, ...]
    generated_at: datetime
    report_json_path: Path
    report_markdown_path: Path
    manifest_path: Path

    @property
    def selected_user_count(self) -> int:
        """Return the number of selected unique users."""
        return len(self.selected_users)

    @property
    def actual_percentage(self) -> float:
        """Return the share of unique source users in the subset."""
        if self.total_users == 0:
            return 0.0
        return self.selected_user_count / self.total_users * 100


def utc_now() -> datetime:
    """Return a timezone-aware UTC timestamp."""
    return datetime.now(UTC)
