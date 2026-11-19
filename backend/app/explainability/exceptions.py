"""Typed exceptions for the explainability architecture."""


class ExplainabilityError(Exception):
    """Base exception for explainability contracts and future implementations."""


class ExplainerNotSupportedError(ExplainabilityError, ValueError):
    """Raised when an explainer name is not registered."""


class ExplainerNotImplementedError(ExplainabilityError, NotImplementedError):
    """Raised when a recognized explainer does not yet have an implementation."""


class ExplainerDependencyError(ExplainabilityError, ImportError):
    """Raised when the selected explainer's optional dependency is unavailable."""


class ExplainerRegistrationError(ExplainabilityError, ValueError):
    """Raised when an explainer registration is invalid or duplicated."""
