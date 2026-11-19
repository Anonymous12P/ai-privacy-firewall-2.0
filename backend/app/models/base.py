"""Abstract model interface for future trainable and predictive implementations."""

from abc import ABC, abstractmethod

from app.ml.schemas import MLDataset
from app.models.schemas import ModelPrediction, ModelTrainingConfig


class Model(ABC):
    """Define the fit and prediction operations for a model implementation."""

    @abstractmethod
    def fit(
        self,
        training_dataset: MLDataset,
        config: ModelTrainingConfig,
    ) -> None:
        """Fit model state from training data and declared configuration."""
        raise NotImplementedError

    @abstractmethod
    def predict(self, dataset: MLDataset) -> ModelPrediction:
        """Return ordered predictions for all records in a dataset."""
        raise NotImplementedError
