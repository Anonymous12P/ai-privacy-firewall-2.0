"""Public contracts for the future model-training module."""

from app.models.base import Model
from app.models.comparison import (
    ModelComparisonEntry,
    ModelComparisonResult,
    compare_models,
)
from app.models.decision_tree import DecisionTreeConfig, DecisionTreeModel
from app.models.evaluator import ClassificationEvaluator, ModelEvaluator
from app.models.exceptions import (
    ModelDependencyError,
    ModelError,
    ModelEvaluationError,
    ModelNotImplementedError,
    ModelNotSupportedError,
    ModelPersistenceError,
    ModelRegistrationError,
    ModelTrainingError,
)
from app.models.factory import ModelFactory
from app.models.logistic_regression import LogisticRegressionModel
from app.models.orm import Scan, User
from app.models.persistence import JoblibModelPersistence, ModelPersistence
from app.models.pipeline import ModelPipeline, ModelTrainingPipeline
from app.models.random_forest import RandomForestConfig, RandomForestModel
from app.models.ranking import RankingConfig, RankingMetric, rank_models
from app.models.registry import ModelRegistry, ModelSpec
from app.models.schemas import (
    ClassificationMetrics,
    EvaluationResult,
    LogisticRegressionConfig,
    ModelArtifactMetadata,
    ModelConfig,
    ModelEvaluationRequest,
    ModelPipelineResult,
    ModelPrediction,
    ModelTrainingConfig,
    ModelTrainingRequest,
    ModelTrainingResult,
    TrainingMetadata,
)
from app.models.trainer import (
    DecisionTreeTrainer,
    EstimatorTrainer,
    LogisticRegressionTrainer,
    ModelTrainer,
    RandomForestTrainer,
    XGBoostTrainer,
)
from app.models.xgboost_model import XGBoostConfig, XGBoostModel

__all__ = [
    "ClassificationEvaluator",
    "ClassificationMetrics",
    "DecisionTreeConfig",
    "DecisionTreeModel",
    "DecisionTreeTrainer",
    "EstimatorTrainer",
    "EvaluationResult",
    "JoblibModelPersistence",
    "LogisticRegressionConfig",
    "LogisticRegressionModel",
    "LogisticRegressionTrainer",
    "Model",
    "ModelArtifactMetadata",
    "ModelComparisonEntry",
    "ModelComparisonResult",
    "ModelConfig",
    "ModelDependencyError",
    "ModelError",
    "ModelEvaluationError",
    "ModelEvaluationRequest",
    "ModelEvaluator",
    "ModelFactory",
    "ModelNotImplementedError",
    "ModelNotSupportedError",
    "ModelPersistence",
    "ModelPersistenceError",
    "ModelPipeline",
    "ModelPipelineResult",
    "ModelPrediction",
    "ModelRegistrationError",
    "ModelRegistry",
    "ModelSpec",
    "ModelTrainer",
    "ModelTrainingConfig",
    "ModelTrainingError",
    "ModelTrainingPipeline",
    "ModelTrainingRequest",
    "ModelTrainingResult",
    "RandomForestConfig",
    "RandomForestModel",
    "RandomForestTrainer",
    "RankingConfig",
    "RankingMetric",
    "Scan",
    "TrainingMetadata",
    "User",
    "XGBoostConfig",
    "XGBoostModel",
    "XGBoostTrainer",
    "compare_models",
    "rank_models",
]
