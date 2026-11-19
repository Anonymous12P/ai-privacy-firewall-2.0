"""Typed errors for model-training architecture and future implementations."""


class ModelError(Exception):
    """Base exception for the model-training module."""


class ModelNotSupportedError(ModelError, ValueError):
    """Raised when a requested model name is not registered."""


class ModelNotImplementedError(ModelError, NotImplementedError):
    """Raised when a recognized model has no implementation yet."""


class ModelRegistrationError(ModelError, ValueError):
    """Raised when a model constructor cannot be registered safely."""


class ModelTrainingError(ModelError):
    """Raised when model training cannot complete."""


class ModelDependencyError(ModelError, ImportError):
    """Raised when an optional model dependency is not installed."""


class ModelEvaluationError(ModelError):
    """Raised when model evaluation inputs or metric calculations are invalid."""


class ModelComparisonError(ModelError, ValueError):
    """Raised when a model comparison request or ranking metric is invalid."""


class ModelPersistenceError(ModelError):
    """Raised when a future model persistence operation fails."""
