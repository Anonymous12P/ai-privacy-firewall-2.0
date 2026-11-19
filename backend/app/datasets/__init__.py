"""Public interfaces for the dataset architecture."""

from app.datasets.exceptions import (
    DatasetDirectoryError,
    DatasetError,
    DatasetFileNotFoundError,
    DatasetPathError,
    DatasetProfileError,
    DatasetValidationError,
)
from app.datasets.loader import DatasetLoader
from app.datasets.pipeline import DatasetPipeline
from app.datasets.profiler import DatasetProfiler
from app.datasets.report_generator import ProfileReportGenerator
from app.datasets.schemas import (
    ColumnProfile,
    DatasetManifest,
    DatasetProfile,
    DatasetSchema,
    ProfileReport,
    ValidationIssue,
    ValidationResult,
)
from app.datasets.validator import DatasetValidator

# TODO: Expand the public API when concrete dataset requirements are defined.
__all__: tuple[str, ...] = (
    "ColumnProfile",
    "DatasetDirectoryError",
    "DatasetError",
    "DatasetFileNotFoundError",
    "DatasetLoader",
    "DatasetManifest",
    "DatasetPathError",
    "DatasetPipeline",
    "DatasetProfile",
    "DatasetProfileError",
    "DatasetProfiler",
    "DatasetSchema",
    "DatasetValidationError",
    "DatasetValidator",
    "ProfileReport",
    "ProfileReportGenerator",
    "ValidationIssue",
    "ValidationResult",
)
