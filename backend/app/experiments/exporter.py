"""Abstract artifact export boundary for future experiment implementations."""

from abc import ABC, abstractmethod

from app.experiments.schemas import ExperimentArtifacts, ExperimentResult


class ExperimentExporter(ABC):
    """Define the contract for exporting experiment artifacts."""

    @abstractmethod
    def export(self, result: ExperimentResult) -> ExperimentArtifacts:
        """Return references to artifacts exported for an experiment result."""
