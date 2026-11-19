"""Typed exceptions reserved for experimental evaluation contracts."""


class ExperimentError(Exception):
    """Base exception for future experimental evaluation failures."""


class ExperimentConfigurationError(ExperimentError, ValueError):
    """Represent an invalid experimental evaluation configuration."""


class ExperimentDatasetError(ExperimentError):
    """Represent a future experiment dataset loading or validation failure."""


class ExperimentDatasetNotFoundError(ExperimentDatasetError, FileNotFoundError):
    """Raised when the configured experiment dataset directory is unavailable."""


class ExperimentDatasetReadError(ExperimentDatasetError, OSError):
    """Raised when a source CSV cannot be read safely."""


class ExperimentDatasetValidationError(ExperimentDatasetError, ValueError):
    """Raised when a source CSV does not satisfy its supported schema."""


class ExperimentUnsupportedDatasetError(ExperimentDatasetValidationError):
    """Raised when an unsupported root-level CERT dataset CSV is present."""


class ExperimentExecutionError(ExperimentError):
    """Represent a future experiment orchestration failure."""
