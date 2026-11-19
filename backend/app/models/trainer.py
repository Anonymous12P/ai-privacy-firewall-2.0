"""Abstract interface for training model implementations."""

from abc import ABC, abstractmethod

from app.ml.schemas import MLDataset
from app.models.base import Model
from app.models.schemas import (
    ModelTrainingConfig,
    ModelTrainingResult,
    TrainingMetadata,
)


class ModelTrainer(ABC):
    """Define the orchestration boundary for fitting a configured model."""

    @abstractmethod
    def train(
        self,
        model: Model,
        training_dataset: MLDataset,
        config: ModelTrainingConfig,
    ) -> ModelTrainingResult:
        """Fit the supplied model and return typed training metadata."""
        raise NotImplementedError


class EstimatorTrainer(ModelTrainer):
    """Fit a configured model and retain its typed model handle in the result."""

    def train(
        self,
        model: Model,
        training_dataset: MLDataset,
        config: ModelTrainingConfig,
    ) -> ModelTrainingResult:
        """Fit a classifier and return configuration/input metadata."""
        model.fit(training_dataset, config)
        metadata = TrainingMetadata(
            model_name=config.model.name,
            training_row_count=len(training_dataset.records),
            feature_names=training_dataset.feature_names,
            target_column=config.target_column or training_dataset.label_name,
            random_seed=config.random_seed,
            hyperparameters=dict(config.model.hyperparameters),
        )
        return ModelTrainingResult(metadata=metadata, trained_model=model)


class LogisticRegressionTrainer(EstimatorTrainer):
    """Provide the trainer service for logistic-regression models."""


class DecisionTreeTrainer(EstimatorTrainer):
    """Provide the trainer service for decision-tree models."""


class RandomForestTrainer(EstimatorTrainer):
    """Provide the trainer service for random-forest models."""


class XGBoostTrainer(EstimatorTrainer):
    """Provide the trainer service for XGBoost models."""
