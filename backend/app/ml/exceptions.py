"""Custom exceptions defining machine-learning architecture boundaries."""


class MLError(Exception):
    """Base exception for future machine-learning module failures."""


class MLDatasetError(MLError):
    """Base error for ML dataset loading and schema failures."""


class MLDatasetNotFoundError(MLDatasetError, FileNotFoundError):
    """Raised when the configured dataset file does not exist."""


class MLUnsupportedFormatError(MLDatasetError, ValueError):
    """Raised when a file extension or configured format is unsupported."""


class MLInvalidSchemaError(MLDatasetError, ValueError):
    """Raised when a loaded dataset schema is invalid or incompatible."""


class MLTargetColumnError(MLInvalidSchemaError):
    """Raised when the configured target column is absent or invalid."""


class MLSplitError(MLError):
    """Raised when dataset splitting configuration or inputs are invalid."""


class MLStratificationError(MLSplitError):
    """Raised when target-stratified splitting cannot preserve all classes."""


class MLBalancingError(MLError, ValueError):
    """Raised when class balancing configuration or input is invalid."""


class MLDependencyError(MLError, ImportError):
    """Raised when an optional dependency is required but unavailable."""


class MLPreprocessingError(MLError, ValueError):
    """Raised when preprocessing configuration or feature schemas are invalid."""


class MLValidationError(MLError, ValueError):
    """Raised when prepared dataset partitions fail integrity validation."""


class MLExportError(MLError, OSError):
    """Raised when an ML dataset artifact cannot be generated or verified."""


class MLPipelineError(MLError):
    """Raised when an ML workflow orchestration stage cannot complete."""
