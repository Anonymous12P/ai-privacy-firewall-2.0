"""Abstract contracts for future behavioral feature extraction."""

from abc import ABC, abstractmethod

from app.features.schemas import FeatureContext, FeatureGroup


class BehavioralFeatureExtractor(ABC):
    """Define a boundary for features describing behavioral patterns."""

    @abstractmethod
    def extract_behavioral(self, context: FeatureContext) -> FeatureGroup:
        """Return behavioral features for the supplied analysis context."""
        raise NotImplementedError
