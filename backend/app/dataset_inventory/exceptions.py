"""Typed errors raised while inspecting dataset files."""


class DatasetInventoryError(Exception):
    """Base class for dataset inventory failures."""


class DatasetNotFoundError(DatasetInventoryError):
    """Raised when the configured dataset directory does not exist."""


class DatasetDirectoryError(DatasetInventoryError):
    """Raised when the configured dataset path is not a directory."""


class DatasetEncodingError(DatasetInventoryError):
    """Raised when a CSV's text encoding cannot be safely identified."""


class DatasetCSVError(DatasetInventoryError):
    """Raised when a CSV cannot be parsed as a structured text file."""


class DatasetFileChangedError(DatasetInventoryError):
    """Raised when a dataset file changes while it is being inspected."""
