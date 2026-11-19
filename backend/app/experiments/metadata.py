"""Abstract reproducibility metadata contract for future experiments."""

from abc import ABC, abstractmethod

from app.experiments.config import ExperimentConfig
from app.experiments.schemas import ExperimentMetadata


class ExperimentMetadataProvider(ABC):
    """Define the contract for describing experiment reproducibility inputs."""

    @abstractmethod
    def build(self, config: ExperimentConfig) -> ExperimentMetadata:
        """Return reproducibility metadata for an experiment configuration."""
