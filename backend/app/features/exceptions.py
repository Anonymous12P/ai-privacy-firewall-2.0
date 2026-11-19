"""Typed exceptions for feature architecture boundaries."""


class FeatureError(Exception):
    """Base exception for feature-contract failures."""


class FeatureExtractionError(FeatureError):
    """Raised when a future feature extraction stage cannot complete."""


class FeatureInputError(FeatureExtractionError, ValueError):
    """Raised when a validated-row input is incompatible with its extractor."""


class FeatureColumnError(FeatureInputError):
    """Raised when a source CSV is missing required columns."""

    def __init__(
        self,
        message: str,
        row_number: int = 1,
    ) -> None:
        """Create a column error associated with the CSV header row."""
        self.row_number = row_number
        super().__init__(f"Row {row_number}: {message}")


class FeatureRowError(FeatureInputError):
    """Raised when a source row does not contain valid required values."""

    def __init__(self, row_number: int, message: str) -> None:
        """Create a malformed-row error with its one-based CSV line number."""
        self.row_number = row_number
        super().__init__(f"Row {row_number}: {message}")


class FeatureTimestampError(FeatureRowError):
    """Raised when an event timestamp is empty or malformed."""


class FeatureAggregationError(FeatureError, ValueError):
    """Raised when records cannot be consistently grouped into windows."""


class FeatureRiskError(FeatureError, ValueError):
    """Raised when risk feature configuration or inputs are invalid."""


class FeatureEncodingError(FeatureError, ValueError):
    """Raised when feature encoding configuration or data is invalid."""


class FeatureValidationError(FeatureError, ValueError):
    """Raised when encoded feature records fail output validation."""


class FeatureExportError(FeatureError, OSError):
    """Raised when feature artifacts cannot be serialized or written."""


class FeatureSchemaError(FeatureError, ValueError):
    """Raised when feature data violates its declared schema."""


class FeaturePipelineError(FeatureError):
    """Raised when a future feature pipeline orchestration stage fails."""
