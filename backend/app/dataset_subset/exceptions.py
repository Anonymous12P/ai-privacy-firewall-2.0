"""Typed errors raised during dataset subsetting."""


class DatasetSubsetError(Exception):
    """Base class for dataset subsetting failures."""


class DatasetDirectoryError(DatasetSubsetError):
    """Raised when a source directory is missing or invalid."""


class MissingDatasetFileError(DatasetSubsetError):
    """Raised when a required CERT dataset file is missing."""


class InvalidSubsetPercentageError(DatasetSubsetError, ValueError):
    """Raised when a requested subset percentage is outside (0, 100]."""


class UnsafeOutputDirectoryError(DatasetSubsetError):
    """Raised when the output directory overlaps the source dataset."""


class UserColumnNotFoundError(DatasetSubsetError):
    """Raised when a CSV does not contain a recognized user identifier."""


class DatasetCSVError(DatasetSubsetError):
    """Raised when a dataset CSV cannot be parsed or read."""
