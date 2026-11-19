"""Abstract evaluation interface without metric computation logic."""

from abc import ABC, abstractmethod
from collections.abc import Mapping
from typing import cast

import numpy as np
from numpy.typing import NDArray
from sklearn.metrics import (  # type: ignore[import-untyped]
    accuracy_score,
    average_precision_score,
    classification_report,
    confusion_matrix,
    f1_score,
    log_loss,
    precision_score,
    recall_score,
    roc_auc_score,
)

from app.ml.schemas import MLDataset
from app.models.base import Model
from app.models.decision_tree import DecisionTreeModel
from app.models.exceptions import ModelEvaluationError
from app.models.logistic_regression import LogisticRegressionModel
from app.models.random_forest import RandomForestModel
from app.models.schemas import ClassificationMetrics, EvaluationResult
from app.models.xgboost_model import XGBoostModel


class ModelEvaluator(ABC):
    """Define evaluation of model predictions against a labeled dataset."""

    @abstractmethod
    def evaluate(self, model: Model, dataset: MLDataset) -> EvaluationResult:
        """Return typed evaluation metrics for a model and held-out dataset."""
        raise NotImplementedError


class ClassificationEvaluator(ModelEvaluator):
    """Compute deterministic classification metrics for labeled partitions."""

    def evaluate(
        self,
        model: Model,
        dataset: MLDataset,
    ) -> EvaluationResult:
        """Return all required classification metrics in a generic result map."""
        metrics = self.evaluate_classification(model, dataset)
        values: dict[str, float] = {
            "accuracy": metrics.accuracy,
            "precision": metrics.precision,
            "recall": metrics.recall,
            "f1_score": metrics.f1_score,
            "log_loss": metrics.log_loss,
        }
        if metrics.roc_auc is not None:
            values["roc_auc"] = metrics.roc_auc
        if metrics.pr_auc is not None:
            values["pr_auc"] = metrics.pr_auc
        if metrics.oob_score is not None:
            values["oob_score"] = metrics.oob_score
        return EvaluationResult(
            model_name=metrics.model_name,
            metrics=values,
            evaluated_row_count=metrics.evaluated_row_count,
        )

    def evaluate_classification(
        self,
        model: Model,
        dataset: MLDataset,
    ) -> ClassificationMetrics:
        """Calculate accuracy, weighted metrics, AUC, confusion, report, and loss."""
        if not isinstance(
            model,
            (
                LogisticRegressionModel,
                DecisionTreeModel,
                RandomForestModel,
                XGBoostModel,
            ),
        ):
            raise ModelEvaluationError(
                "ClassificationEvaluator supports LogisticRegressionModel and "
                "DecisionTreeModel, RandomForestModel, and XGBoostModel."
            )
        if dataset.label_name is None:
            raise ModelEvaluationError("Evaluation dataset has no target column.")
        if not dataset.records:
            raise ModelEvaluationError("Evaluation dataset must contain rows.")
        if any(record.label is None for record in dataset.records):
            raise ModelEvaluationError("Evaluation dataset contains missing labels.")
        if dataset.feature_names != model.feature_names:
            raise ModelEvaluationError(
                "Evaluation feature schema does not match the trained model."
            )

        labels = np.asarray([record.label for record in dataset.records], dtype=object)
        predictions = np.asarray(
            model.predict(dataset).predictions,
            dtype=object,
        )
        probabilities = np.asarray(model.predict_proba(dataset), dtype=np.float64)
        classes = model.classes
        class_labels = np.asarray(classes, dtype=object)
        if probabilities.shape != (len(dataset.records), len(classes)):
            raise ModelEvaluationError(
                "Probability output does not match evaluation rows and model classes."
            )

        try:
            if len(classes) < 2:
                raise ModelEvaluationError(
                    "At least two model classes are required for classification metrics."
                )
            matrix = confusion_matrix(labels, predictions, labels=class_labels)
            report = cast(
                "dict[str, float | dict[str, float]]",
                classification_report(
                    labels,
                    predictions,
                    labels=class_labels,
                    output_dict=True,
                    zero_division=0,
                ),
            )
            loss = float(log_loss(labels, probabilities, labels=class_labels))
            roc_auc, pr_auc = _auc_scores(labels, probabilities, class_labels)
        except (ValueError, TypeError) as exc:
            raise ModelEvaluationError(
                f"Unable to calculate classification metrics: {exc}"
            ) from exc

        report_payload: dict[str, Mapping[str, float] | float] = {}
        for key, value in report.items():
            if isinstance(value, dict):
                report_payload[str(key)] = {
                    str(metric): float(score) for metric, score in value.items()
                }
            else:
                report_payload[str(key)] = float(value)
        return ClassificationMetrics(
            model_name=model.model_name,
            accuracy=float(accuracy_score(labels, predictions)),
            precision=float(
                precision_score(
                    labels,
                    predictions,
                    labels=class_labels,
                    average="weighted",
                    zero_division=0,
                )
            ),
            recall=float(
                recall_score(
                    labels,
                    predictions,
                    labels=class_labels,
                    average="weighted",
                    zero_division=0,
                )
            ),
            f1_score=float(
                f1_score(
                    labels,
                    predictions,
                    labels=class_labels,
                    average="weighted",
                    zero_division=0,
                )
            ),
            roc_auc=roc_auc,
            pr_auc=pr_auc,
            confusion_matrix=tuple(
                tuple(int(value) for value in row) for row in matrix
            ),
            classification_report=report_payload,
            log_loss=loss,
            evaluated_row_count=len(dataset.records),
            class_labels=classes,
            oob_score=(
                model.out_of_bag_score if isinstance(model, RandomForestModel) else None
            ),
        )


def _auc_scores(
    labels: NDArray[np.object_],
    probabilities: NDArray[np.float64],
    classes: NDArray[np.object_],
) -> tuple[float | None, float | None]:
    """Compute binary or multiclass ROC-AUC and PR-AUC when defined."""
    try:
        if len(classes) == 2:
            positive = classes[1]
            binary_labels = (labels == positive).astype(np.int8)
            return (
                float(roc_auc_score(binary_labels, probabilities[:, 1])),
                float(average_precision_score(binary_labels, probabilities[:, 1])),
            )
        one_hot = np.column_stack(
            [(labels == class_label).astype(np.int8) for class_label in classes]
        )
        precision_scores = [
            average_precision_score(one_hot[:, index], probabilities[:, index])
            for index in range(len(classes))
            if np.any(one_hot[:, index])
        ]
        pr_auc = (
            float(sum(precision_scores) / len(precision_scores))
            if precision_scores
            else None
        )
        return (
            float(
                roc_auc_score(
                    one_hot,
                    probabilities,
                    average="weighted",
                    multi_class="ovr",
                )
            ),
            pr_auc,
        )
    except ValueError:
        return None, None
