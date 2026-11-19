"""Abstract interface for global and local explanation generators."""

from abc import ABC, abstractmethod

from app.explainability.schemas import (
    ExplainerConfig,
    GlobalExplanation,
    LocalExplanation,
)
from app.ml.schemas import MLDataset
from app.models.base import Model


class ExplanationGenerator(ABC):
    """Define explainability operations without implementing an algorithm."""

    @abstractmethod
    def explain_global(
        self,
        model: Model,
        dataset: MLDataset,
        config: ExplainerConfig,
    ) -> GlobalExplanation:
        """Return the contract for an aggregate explanation."""
        raise NotImplementedError

    @abstractmethod
    def explain_local(
        self,
        model: Model,
        dataset: MLDataset,
        subject_id: str,
        config: ExplainerConfig,
    ) -> LocalExplanation:
        """Return the contract for an individual-row explanation."""
        raise NotImplementedError
