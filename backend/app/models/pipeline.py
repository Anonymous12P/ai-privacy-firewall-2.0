"""Abstract and concrete model-training workflow orchestration."""

from abc import ABC, abstractmethod
from dataclasses import replace
from pathlib import Path

import sklearn  # type: ignore[import-untyped]

from app.ml.schemas import MLDataset, PreprocessedSplitResult
from app.models.comparison import (
    EvaluationPartition,
    ModelComparisonResult,
)
from app.models.comparison import (
    compare_models as run_model_comparison,
)
from app.models.decision_tree import DecisionTreeModel
from app.models.evaluator import ClassificationEvaluator, ModelEvaluator
from app.models.exceptions import ModelTrainingError
from app.models.factory import ModelFactory
from app.models.logistic_regression import LogisticRegressionModel
from app.models.persistence import JoblibModelPersistence, ModelPersistence
from app.models.random_forest import RandomForestModel
from app.models.ranking import RankingMetric
from app.models.schemas import (
    ClassificationMetrics,
    ModelArtifactMetadata,
    ModelConfig,
    ModelPipelineResult,
    ModelTrainingRequest,
)
from app.models.trainer import (
    DecisionTreeTrainer,
    LogisticRegressionTrainer,
    ModelTrainer,
    RandomForestTrainer,
    XGBoostTrainer,
)
from app.models.xgboost_model import XGBoostModel


class ModelTrainingPipeline(ABC):
    """Define the model-training workflow orchestration boundary."""

    @abstractmethod
    def run(self, request: ModelTrainingRequest) -> ModelPipelineResult:
        """Orchestrate configured model training and return its typed result."""
        raise NotImplementedError


class ModelPipeline(ModelTrainingPipeline):
    """Train, evaluate, and persist supported classification baselines."""

    def __init__(
        self,
        factory: ModelFactory | None = None,
        trainer: ModelTrainer | None = None,
        evaluator: ModelEvaluator | None = None,
        persistence: ModelPersistence | None = None,
        artifact_directory: Path | None = None,
    ) -> None:
        """Create a pipeline with injectable model-training stage boundaries."""
        self._factory = factory or ModelFactory()
        self._trainer = trainer
        self._evaluator = evaluator or ClassificationEvaluator()
        self._persistence = persistence or JoblibModelPersistence()
        self._artifact_directory = artifact_directory or (
            Path(__file__).resolve().parents[2] / "data" / "models"
        )

    def compare_models(
        self,
        partitions: PreprocessedSplitResult,
        output_directory: Path | None = None,
        *,
        model_configs: tuple[ModelConfig, ...] | None = None,
        primary_metric: RankingMetric = "f1_score",
        evaluation_partition: EvaluationPartition = "test",
        random_seed: int = 42,
        generate_chart: bool = True,
    ) -> ModelComparisonResult:
        """Compare implemented models on common partitions and write reports."""
        destination = output_directory or self._artifact_directory / "comparison"
        return run_model_comparison(
            partitions,
            destination,
            model_configs=model_configs,
            primary_metric=primary_metric,
            evaluation_partition=evaluation_partition,
            random_seed=random_seed,
            generate_chart=generate_chart,
            factory=self._factory,
        )

    def run(self, request: ModelTrainingRequest) -> ModelPipelineResult:
        """Dispatch prepared data to the requested implemented baseline."""
        if request.config.model.name == "LogisticRegression":
            return self.train_logistic_regression(request)
        if request.config.model.name == "DecisionTree":
            return self.train_decision_tree(request)
        if request.config.model.name == "RandomForest":
            return self.train_random_forest(request)
        if request.config.model.name == "XGBoost":
            return self.train_xgboost(request)
        raise ModelTrainingError(
            "ModelPipeline.run requires model name 'LogisticRegression', "
            "'DecisionTree', 'RandomForest', or 'XGBoost'."
        )

    def train_logistic_regression(
        self,
        request: ModelTrainingRequest,
    ) -> ModelPipelineResult:
        """Fit logistic regression, evaluate validation/test, and persist it."""
        config = request.config
        partitions = request.dataset
        target_column = config.target_column or partitions.train.label_name
        if config.model.name != "LogisticRegression":
            raise ModelTrainingError(
                "train_logistic_regression requires model name 'LogisticRegression'."
            )
        if target_column is None or any(
            dataset.label_name != target_column
            for dataset in (
                partitions.train,
                partitions.validation,
                partitions.test,
            )
        ):
            raise ModelTrainingError(
                "Training, validation, and test datasets must share a target column."
            )
        if partitions.metadata.feature_names != partitions.train.feature_names:
            raise ModelTrainingError(
                "Preprocessing metadata feature schema does not match training data."
            )

        model_config = ModelConfig(
            name=config.model.name,
            hyperparameters={
                **config.model.hyperparameters,
                "random_state": config.model.hyperparameters.get(
                    "random_state",
                    config.random_seed,
                ),
            },
        )
        model = self._factory.create(model_config)
        if not isinstance(model, LogisticRegressionModel):
            raise ModelTrainingError(
                "The LogisticRegression factory entry must create "
                "LogisticRegressionModel."
            )
        model_training_config = replace(
            config,
            model=model_config,
            target_column=target_column,
        )
        trainer = self._trainer or LogisticRegressionTrainer()
        training_result = trainer.train(
            model,
            partitions.train,
            model_training_config,
        )
        trained_model = training_result.trained_model
        if not isinstance(trained_model, LogisticRegressionModel):
            raise ModelTrainingError(
                "The configured trainer did not return a trained logistic model."
            )

        validation_metrics = self._evaluate(trained_model, partitions.validation)
        test_metrics = self._evaluate(trained_model, partitions.test)
        artifact_path = config.artifact_path or (
            self._artifact_directory / "logistic_regression.joblib"
        )
        artifact_metadata = ModelArtifactMetadata(
            model_name="LogisticRegression",
            configuration={
                "random_seed": config.random_seed,
                "target_column": target_column,
                "hyperparameters": dict(model_training_config.model.hyperparameters),
            },
            feature_count=len(trained_model.feature_names),
            feature_names=trained_model.feature_names,
            target_classes=trained_model.classes,
            sklearn_version=sklearn.__version__,
            validation_metrics=_metrics_payload(validation_metrics),
            test_metrics=_metrics_payload(test_metrics),
        )
        persisted_metadata = self._persistence.save(
            trained_model,
            artifact_path,
            artifact_metadata,
        )
        completed_training = replace(
            training_result,
            artifact_path=artifact_path,
            trained_model=trained_model,
        )
        return ModelPipelineResult(
            training=completed_training,
            validation_metrics=validation_metrics,
            test_metrics=test_metrics,
            metadata_path=artifact_path.with_name(
                f"{artifact_path.name}.metadata.json"
            ),
            artifact_metadata=persisted_metadata,
        )

    def train_decision_tree(
        self,
        request: ModelTrainingRequest,
    ) -> ModelPipelineResult:
        """Fit decision tree, evaluate validation/test, and persist the model."""
        config = request.config
        if config.model.name != "DecisionTree":
            raise ModelTrainingError(
                "train_decision_tree requires model name 'DecisionTree'."
            )
        partitions = request.dataset
        target_column = config.target_column or partitions.train.label_name
        if target_column is None or any(
            dataset.label_name != target_column
            for dataset in (
                partitions.train,
                partitions.validation,
                partitions.test,
            )
        ):
            raise ModelTrainingError(
                "Training, validation, and test datasets must share a target column."
            )
        if partitions.metadata.feature_names != partitions.train.feature_names:
            raise ModelTrainingError(
                "Preprocessing metadata feature schema does not match training data."
            )

        model_config = ModelConfig(
            name="DecisionTree",
            hyperparameters={
                **config.model.hyperparameters,
                "random_state": config.model.hyperparameters.get(
                    "random_state",
                    config.random_seed,
                ),
            },
        )
        model = self._factory.create(model_config)
        if not isinstance(model, DecisionTreeModel):
            raise ModelTrainingError(
                "The DecisionTree factory entry must create DecisionTreeModel."
            )
        model_training_config = replace(
            config,
            model=model_config,
            target_column=target_column,
        )
        trainer = self._trainer or DecisionTreeTrainer()
        training_result = trainer.train(
            model,
            partitions.train,
            model_training_config,
        )
        trained_model = training_result.trained_model
        if not isinstance(trained_model, DecisionTreeModel):
            raise ModelTrainingError(
                "The configured trainer did not return a trained decision tree."
            )

        validation_metrics = self._evaluate(trained_model, partitions.validation)
        test_metrics = self._evaluate(trained_model, partitions.test)
        artifact_path = config.artifact_path or (
            self._artifact_directory / "decision_tree.joblib"
        )
        artifact_metadata = ModelArtifactMetadata(
            model_name="DecisionTree",
            configuration={
                "random_seed": config.random_seed,
                "target_column": target_column,
                "hyperparameters": dict(model_training_config.model.hyperparameters),
            },
            feature_count=len(trained_model.feature_names),
            feature_names=trained_model.feature_names,
            target_classes=trained_model.classes,
            sklearn_version=sklearn.__version__,
            validation_metrics=_metrics_payload(validation_metrics),
            test_metrics=_metrics_payload(test_metrics),
            model_details={
                "criterion": trained_model.config.criterion,
                "feature_importances": dict(trained_model.feature_importances),
                "tree_depth": trained_model.tree_depth,
                "number_of_leaves": trained_model.number_of_leaves,
                "number_of_nodes": trained_model.number_of_nodes,
            },
        )
        persisted_metadata = self._persistence.save(
            trained_model,
            artifact_path,
            artifact_metadata,
        )
        completed_training = replace(
            training_result,
            artifact_path=artifact_path,
            trained_model=trained_model,
        )
        return ModelPipelineResult(
            training=completed_training,
            validation_metrics=validation_metrics,
            test_metrics=test_metrics,
            metadata_path=artifact_path.with_name(
                f"{artifact_path.name}.metadata.json"
            ),
            artifact_metadata=persisted_metadata,
        )

    def train_random_forest(
        self,
        request: ModelTrainingRequest,
    ) -> ModelPipelineResult:
        """Fit random forest, evaluate validation/test, and persist the model."""
        config = request.config
        if config.model.name != "RandomForest":
            raise ModelTrainingError(
                "train_random_forest requires model name 'RandomForest'."
            )
        partitions = request.dataset
        target_column = config.target_column or partitions.train.label_name
        if target_column is None or any(
            dataset.label_name != target_column
            for dataset in (
                partitions.train,
                partitions.validation,
                partitions.test,
            )
        ):
            raise ModelTrainingError(
                "Training, validation, and test datasets must share a target column."
            )
        if partitions.metadata.feature_names != partitions.train.feature_names:
            raise ModelTrainingError(
                "Preprocessing metadata feature schema does not match training data."
            )

        model_config = ModelConfig(
            name="RandomForest",
            hyperparameters={
                **config.model.hyperparameters,
                "random_state": config.model.hyperparameters.get(
                    "random_state",
                    config.random_seed,
                ),
            },
        )
        model = self._factory.create(model_config)
        if not isinstance(model, RandomForestModel):
            raise ModelTrainingError(
                "The RandomForest factory entry must create RandomForestModel."
            )
        model_training_config = replace(
            config,
            model=model_config,
            target_column=target_column,
        )
        trainer = self._trainer or RandomForestTrainer()
        training_result = trainer.train(
            model,
            partitions.train,
            model_training_config,
        )
        trained_model = training_result.trained_model
        if not isinstance(trained_model, RandomForestModel):
            raise ModelTrainingError(
                "The configured trainer did not return a trained random forest."
            )

        validation_metrics = self._evaluate(trained_model, partitions.validation)
        test_metrics = self._evaluate(trained_model, partitions.test)
        artifact_path = config.artifact_path or (
            self._artifact_directory / "random_forest.joblib"
        )
        artifact_metadata = ModelArtifactMetadata(
            model_name="RandomForest",
            configuration={
                "random_seed": config.random_seed,
                "target_column": target_column,
                "hyperparameters": dict(model_training_config.model.hyperparameters),
            },
            feature_count=len(trained_model.feature_names),
            feature_names=trained_model.feature_names,
            target_classes=trained_model.classes,
            sklearn_version=sklearn.__version__,
            validation_metrics=_metrics_payload(validation_metrics),
            test_metrics=_metrics_payload(test_metrics),
            model_details={
                "criterion": trained_model.config.criterion,
                "feature_importances": dict(trained_model.feature_importances),
                "ensemble_statistics": dict(trained_model.ensemble_statistics),
                "oob_score": trained_model.out_of_bag_score,
            },
        )
        persisted_metadata = self._persistence.save(
            trained_model,
            artifact_path,
            artifact_metadata,
        )
        completed_training = replace(
            training_result,
            artifact_path=artifact_path,
            trained_model=trained_model,
        )
        return ModelPipelineResult(
            training=completed_training,
            validation_metrics=validation_metrics,
            test_metrics=test_metrics,
            metadata_path=artifact_path.with_name(
                f"{artifact_path.name}.metadata.json"
            ),
            artifact_metadata=persisted_metadata,
        )

    def train_xgboost(
        self,
        request: ModelTrainingRequest,
    ) -> ModelPipelineResult:
        """Fit XGBoost, evaluate validation/test, and persist the model."""
        config = request.config
        if config.model.name != "XGBoost":
            raise ModelTrainingError("train_xgboost requires model name 'XGBoost'.")
        partitions = request.dataset
        target_column = config.target_column or partitions.train.label_name
        if target_column is None or any(
            dataset.label_name != target_column
            for dataset in (
                partitions.train,
                partitions.validation,
                partitions.test,
            )
        ):
            raise ModelTrainingError(
                "Training, validation, and test datasets must share a target column."
            )
        if partitions.metadata.feature_names != partitions.train.feature_names:
            raise ModelTrainingError(
                "Preprocessing metadata feature schema does not match training data."
            )

        model_config = ModelConfig(
            name="XGBoost",
            hyperparameters={
                **config.model.hyperparameters,
                "random_state": config.model.hyperparameters.get(
                    "random_state",
                    config.random_seed,
                ),
            },
        )
        model = self._factory.create(model_config)
        if not isinstance(model, XGBoostModel):
            raise ModelTrainingError(
                "The XGBoost factory entry must create XGBoostModel."
            )
        model_training_config = replace(
            config,
            model=model_config,
            target_column=target_column,
        )
        trainer = self._trainer or XGBoostTrainer()
        training_result = trainer.train(
            model,
            partitions.train,
            model_training_config,
        )
        trained_model = training_result.trained_model
        if not isinstance(trained_model, XGBoostModel):
            raise ModelTrainingError(
                "The configured trainer did not return a trained XGBoost model."
            )

        validation_metrics = self._evaluate(trained_model, partitions.validation)
        test_metrics = self._evaluate(trained_model, partitions.test)
        artifact_path = config.artifact_path or (
            self._artifact_directory / "xgboost.joblib"
        )
        artifact_metadata = ModelArtifactMetadata(
            model_name="XGBoost",
            configuration={
                "random_seed": config.random_seed,
                "target_column": target_column,
                "hyperparameters": dict(model_training_config.model.hyperparameters),
            },
            feature_count=len(trained_model.feature_names),
            feature_names=trained_model.feature_names,
            target_classes=trained_model.classes,
            sklearn_version=sklearn.__version__,
            validation_metrics=_metrics_payload(validation_metrics),
            test_metrics=_metrics_payload(test_metrics),
            model_details={
                "feature_importances": dict(trained_model.feature_importances),
                "xgboost_version": trained_model.xgboost_version,
                "booster_type": trained_model.booster_type,
                "objective": trained_model.objective,
            },
            library_version=trained_model.xgboost_version,
        )
        persisted_metadata = self._persistence.save(
            trained_model,
            artifact_path,
            artifact_metadata,
        )
        completed_training = replace(
            training_result,
            artifact_path=artifact_path,
            trained_model=trained_model,
        )
        return ModelPipelineResult(
            training=completed_training,
            validation_metrics=validation_metrics,
            test_metrics=test_metrics,
            metadata_path=artifact_path.with_name(
                f"{artifact_path.name}.metadata.json"
            ),
            artifact_metadata=persisted_metadata,
        )

    def _evaluate(
        self,
        model: (
            LogisticRegressionModel
            | DecisionTreeModel
            | RandomForestModel
            | XGBoostModel
        ),
        dataset: MLDataset,
    ) -> ClassificationMetrics:
        """Use classification evaluator for one held-out partition."""
        evaluate_classification = getattr(
            self._evaluator,
            "evaluate_classification",
            None,
        )
        if not callable(evaluate_classification):
            raise ModelTrainingError(
                "The configured evaluator must provide classification metrics."
            )
        result = evaluate_classification(model, dataset)
        if not isinstance(result, ClassificationMetrics):
            raise ModelTrainingError(
                "The evaluator returned an invalid classification result."
            )
        return result


def _metrics_payload(metrics: ClassificationMetrics) -> dict[str, object]:
    """Convert all requested validation metrics into JSON-compatible values."""
    return {
        "accuracy": metrics.accuracy,
        "precision": metrics.precision,
        "recall": metrics.recall,
        "f1_score": metrics.f1_score,
        "roc_auc": metrics.roc_auc,
        "pr_auc": metrics.pr_auc,
        "confusion_matrix": [list(row) for row in metrics.confusion_matrix],
        "classification_report": {
            key: dict(value) if isinstance(value, dict) else value
            for key, value in metrics.classification_report.items()
        },
        "log_loss": metrics.log_loss,
        "oob_score": metrics.oob_score,
        "evaluated_row_count": metrics.evaluated_row_count,
        "class_labels": list(metrics.class_labels),
    }
