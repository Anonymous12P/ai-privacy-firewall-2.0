"""Scikit-learn LogisticRegression model adapter."""

from collections.abc import Mapping
from typing import Protocol, cast

import numpy as np
from numpy.typing import NDArray
from sklearn.linear_model import LogisticRegression  # type: ignore[import-untyped]
from sklearn.multiclass import OneVsRestClassifier  # type: ignore[import-untyped]

from app.ml.schemas import MLDataset, MLLabel
from app.models.base import Model
from app.models.classification_utils import as_label, feature_matrix, validate_dataset
from app.models.exceptions import ModelTrainingError
from app.models.schemas import (
    LogisticRegressionConfig,
    ModelPrediction,
    ModelTrainingConfig,
)


class _Classifier(Protocol):
    """Describe the fitted estimator operations used by this model adapter."""

    classes_: NDArray[np.object_]
    n_features_in_: int

    def fit(
        self,
        features: NDArray[np.float64],
        labels: NDArray[np.object_],
    ) -> object: ...

    def predict(self, features: NDArray[np.float64]) -> NDArray[np.object_]: ...

    def predict_proba(self, features: NDArray[np.float64]) -> NDArray[np.float64]: ...

    def decision_function(
        self,
        features: NDArray[np.float64],
    ) -> NDArray[np.float64]: ...


class LogisticRegressionModel(Model):
    """Implement the project model contract with scikit-learn logistic regression."""

    model_name = "LogisticRegression"

    def __init__(self, config: LogisticRegressionConfig | None = None) -> None:
        """Create an unfitted classifier with validated parameters."""
        self.config = config or LogisticRegressionConfig()
        self._estimator: _Classifier | None = None
        self._feature_names: tuple[str, ...] = ()
        self._classes: tuple[MLLabel, ...] = ()

    @property
    def feature_names(self) -> tuple[str, ...]:
        """Return the feature schema learned during fit."""
        return self._feature_names

    @property
    def classes(self) -> tuple[MLLabel, ...]:
        """Return class labels in the estimator's stable class order."""
        return self._classes

    @property
    def shap_estimator(self) -> object:
        """Return the fitted estimator for the SHAP integration boundary."""
        if self._estimator is None:
            raise ModelTrainingError("Logistic regression has not been fitted.")
        return self._estimator

    @property
    def parameter_count(self) -> int | None:
        """Return the number of learned linear coefficients and intercepts."""
        if self._estimator is None:
            raise ModelTrainingError("Logistic regression has not been fitted.")
        coefficient_arrays: list[object] = []
        coefficients = getattr(self._estimator, "coef_", None)
        intercepts = getattr(self._estimator, "intercept_", None)
        if coefficients is not None and intercepts is not None:
            coefficient_arrays.extend((coefficients, intercepts))
        else:
            estimators = getattr(self._estimator, "estimators_", None)
            if estimators is None:
                return None
            for estimator in estimators:
                coefficient_arrays.extend((estimator.coef_, estimator.intercept_))
        return sum(int(np.asarray(values).size) for values in coefficient_arrays)

    def fit(self, training_dataset: MLDataset, config: ModelTrainingConfig) -> None:
        """Fit logistic regression after validating numeric data and labels."""
        validate_dataset(training_dataset, require_labels=True)
        if not training_dataset.records:
            raise ModelTrainingError("Training dataset must contain at least one row.")
        if len({record.label for record in training_dataset.records}) < 2:
            raise ModelTrainingError(
                "Logistic regression requires at least two classes."
            )

        matrix = feature_matrix(training_dataset)
        labels = np.asarray(
            [record.label for record in training_dataset.records],
            dtype=object,
        )
        selected = _config_from_training(config, self.config)
        parameters: dict[str, object] = {
            "C": selected.C,
            "class_weight": selected.class_weight,
            "max_iter": selected.max_iter,
            "random_state": selected.random_state,
            "solver": selected.solver,
        }
        if selected.penalty != "l2":
            parameters["penalty"] = selected.penalty

        try:
            estimator = LogisticRegression(**parameters)
            if selected.multi_class == "ovr" and len(set(labels.tolist())) > 2:
                estimator = OneVsRestClassifier(estimator)
            self._estimator = cast("_Classifier", estimator.fit(matrix, labels))
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(
                f"Unable to fit logistic regression: {exc}"
            ) from exc

        self._feature_names = training_dataset.feature_names
        self._classes = tuple(as_label(value) for value in self._estimator.classes_)

    def predict(self, dataset: MLDataset) -> ModelPrediction:
        """Return model predictions in the input record order."""
        estimator = self._require_fitted(dataset)
        try:
            predictions = estimator.predict(feature_matrix(dataset))
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(f"Unable to predict: {exc}") from exc
        return ModelPrediction(
            model_name="LogisticRegression",
            predictions=tuple(as_label(value) for value in predictions),
            subject_ids=tuple(record.subject_id for record in dataset.records),
        )

    def predict_proba(self, dataset: MLDataset) -> tuple[tuple[float, ...], ...]:
        """Return per-class probability estimates for each input row."""
        estimator = self._require_fitted(dataset)
        try:
            probabilities = estimator.predict_proba(feature_matrix(dataset))
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(
                f"Unable to calculate class probabilities: {exc}"
            ) from exc
        return tuple(tuple(float(value) for value in row) for row in probabilities)

    def decision_function(
        self, dataset: MLDataset
    ) -> tuple[float, ...] | tuple[tuple[float, ...], ...]:
        """Return class decision scores when supported by the fitted estimator."""
        estimator = self._require_fitted(dataset)
        decision = getattr(estimator, "decision_function", None)
        if not callable(decision):
            raise ModelTrainingError(
                "The configured estimator does not provide decision_function."
            )
        try:
            scores = decision(feature_matrix(dataset))
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(
                f"Unable to calculate decision scores: {exc}"
            ) from exc
        values = np.asarray(scores, dtype=np.float64)
        if values.ndim == 1:
            return tuple(float(value) for value in values)
        return tuple(tuple(float(value) for value in row) for row in values)

    def _require_fitted(self, dataset: MLDataset) -> _Classifier:
        """Validate fitted state and input schema before prediction."""
        if self._estimator is None:
            raise ModelTrainingError("Logistic regression has not been fitted.")
        validate_dataset(dataset, require_labels=False)
        if dataset.feature_names != self._feature_names:
            raise ModelTrainingError(
                "Prediction feature names and order must match the training schema."
            )
        return self._estimator


def _config_from_training(
    training: ModelTrainingConfig,
    defaults: LogisticRegressionConfig,
) -> LogisticRegressionConfig:
    """Resolve named hyperparameters and training seed into typed options."""
    allowed = {
        "random_state",
        "max_iter",
        "penalty",
        "solver",
        "C",
        "class_weight",
        "multi_class",
    }
    unknown = set(training.model.hyperparameters) - allowed
    if unknown:
        raise ModelTrainingError(
            f"Unsupported logistic regression parameters: {', '.join(sorted(unknown))}."
        )
    values: dict[str, object] = {
        "random_state": training.random_seed,
        "max_iter": defaults.max_iter,
        "penalty": defaults.penalty,
        "solver": defaults.solver,
        "C": defaults.C,
        "class_weight": defaults.class_weight,
        "multi_class": defaults.multi_class,
    }
    values.update(training.model.hyperparameters)
    if "random_state" not in training.model.hyperparameters:
        values["random_state"] = training.random_seed
    try:
        return LogisticRegressionConfig(**values)  # type: ignore[arg-type]
    except TypeError as exc:
        raise ModelTrainingError(
            f"Invalid logistic regression configuration: {exc}"
        ) from exc


def logistic_hyperparameters(
    config: LogisticRegressionConfig,
) -> Mapping[str, object]:
    """Return all supported estimator options as a JSON-friendly mapping."""
    return {
        "random_state": config.random_state,
        "max_iter": config.max_iter,
        "penalty": config.penalty,
        "solver": config.solver,
        "C": config.C,
        "class_weight": (
            dict(config.class_weight)
            if isinstance(config.class_weight, Mapping)
            else config.class_weight
        ),
        "multi_class": config.multi_class,
    }


def logistic_config_from_mapping(
    parameters: Mapping[str, object],
) -> LogisticRegressionConfig:
    """Validate a generic model hyperparameter mapping as logistic options."""
    allowed = {
        "random_state",
        "max_iter",
        "penalty",
        "solver",
        "C",
        "class_weight",
        "multi_class",
    }
    unknown = set(parameters) - allowed
    if unknown:
        raise ModelTrainingError(
            f"Unsupported logistic regression parameters: {', '.join(sorted(unknown))}."
        )
    try:
        return LogisticRegressionConfig(**dict(parameters))  # type: ignore[arg-type]
    except TypeError as exc:
        raise ModelTrainingError(
            f"Invalid logistic regression configuration: {exc}"
        ) from exc
