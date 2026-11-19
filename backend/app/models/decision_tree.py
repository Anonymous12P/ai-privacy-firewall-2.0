"""Scikit-learn DecisionTreeClassifier model adapter."""

import math
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Literal, cast

import numpy as np
from sklearn.tree import DecisionTreeClassifier  # type: ignore[import-untyped]

from app.ml.schemas import MLDataset, MLLabel
from app.models.base import Model
from app.models.classification_utils import as_label, feature_matrix, validate_dataset
from app.models.exceptions import ModelTrainingError
from app.models.schemas import ModelPrediction, ModelTrainingConfig


@dataclass(frozen=True, slots=True)
class DecisionTreeConfig:
    """Configure supported scikit-learn decision-tree parameters."""

    criterion: Literal["gini", "entropy", "log_loss"] = "gini"
    max_depth: int | None = None
    min_samples_split: int | float = 2
    min_samples_leaf: int | float = 1
    max_features: Literal["sqrt", "log2"] | int | float | None = None
    class_weight: Literal["balanced"] | Mapping[MLLabel, float] | None = None
    random_state: int | None = 42
    ccp_alpha: float = 0.0

    def __post_init__(self) -> None:
        """Reject invalid tree settings before constructing the estimator."""
        if self.criterion not in {"gini", "entropy", "log_loss"}:
            raise ModelTrainingError(
                f"Unsupported decision tree criterion: {self.criterion!r}."
            )
        if self.max_depth is not None and (
            isinstance(self.max_depth, bool)
            or not isinstance(self.max_depth, int)
            or self.max_depth < 1
        ):
            raise ModelTrainingError("max_depth must be a positive integer or None.")
        _validate_sample_parameter(
            "min_samples_split",
            self.min_samples_split,
            minimum_integer=2,
            maximum_fraction=1.0,
        )
        _validate_sample_parameter(
            "min_samples_leaf",
            self.min_samples_leaf,
            minimum_integer=1,
            maximum_fraction=0.5,
        )
        if self.max_features is not None:
            if isinstance(self.max_features, bool):
                raise ModelTrainingError(
                    "max_features must be a positive integer, a fraction in (0, 1], "
                    "'sqrt', 'log2', or None."
                )
            if isinstance(self.max_features, int):
                valid_features = self.max_features > 0
            elif isinstance(self.max_features, float):
                valid_features = math.isfinite(self.max_features) and (
                    0.0 < self.max_features <= 1.0
                )
            else:
                valid_features = self.max_features in {"sqrt", "log2"}
            if not valid_features:
                raise ModelTrainingError(
                    "max_features must be a positive integer, a fraction in (0, 1], "
                    "'sqrt', 'log2', or None."
                )
        if self.random_state is not None and (
            isinstance(self.random_state, bool)
            or not isinstance(self.random_state, int)
        ):
            raise ModelTrainingError("random_state must be an integer or None.")
        if (
            isinstance(self.ccp_alpha, bool)
            or not isinstance(self.ccp_alpha, (int, float))
            or not math.isfinite(self.ccp_alpha)
            or self.ccp_alpha < 0
        ):
            raise ModelTrainingError("ccp_alpha must be a finite nonnegative number.")
        if isinstance(self.class_weight, Mapping) and any(
            isinstance(weight, bool)
            or not isinstance(weight, (int, float))
            or not math.isfinite(weight)
            or weight < 0
            for weight in self.class_weight.values()
        ):
            raise ModelTrainingError(
                "class_weight values must be finite nonnegative numbers."
            )
        if self.class_weight is not None and not (
            self.class_weight == "balanced" or isinstance(self.class_weight, Mapping)
        ):
            raise ModelTrainingError(
                "class_weight must be 'balanced', a class-weight mapping, or None."
            )


class DecisionTreeModel(Model):
    """Implement the project model contract with a decision tree classifier."""

    model_name = "DecisionTree"

    def __init__(self, config: DecisionTreeConfig | None = None) -> None:
        """Create an unfitted decision tree with validated parameters."""
        self.config = config or DecisionTreeConfig()
        self._estimator: DecisionTreeClassifier | None = None
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
    def shap_estimator(self) -> DecisionTreeClassifier:
        """Return the fitted estimator for the SHAP integration boundary."""
        return self._require_estimator()

    @property
    def feature_importances(self) -> tuple[tuple[str, float], ...]:
        """Return impurity-based feature importance paired in schema order."""
        estimator = self._require_estimator()
        return tuple(
            (name, float(importance))
            for name, importance in zip(
                self._feature_names,
                estimator.feature_importances_,
                strict=True,
            )
        )

    @property
    def tree_depth(self) -> int:
        """Return the fitted tree depth."""
        return int(self._require_estimator().get_depth())

    @property
    def number_of_leaves(self) -> int:
        """Return the number of fitted leaf nodes."""
        return int(self._require_estimator().get_n_leaves())

    @property
    def number_of_nodes(self) -> int:
        """Return the number of nodes in the fitted tree."""
        return int(self._require_estimator().tree_.node_count)

    @property
    def parameter_count(self) -> int:
        """Return the number of learned scalar values stored in the tree."""
        tree = self._require_estimator().tree_
        return sum(
            int(getattr(tree, attribute).size)
            for attribute in (
                "children_left",
                "children_right",
                "feature",
                "threshold",
                "impurity",
                "n_node_samples",
                "weighted_n_node_samples",
                "value",
            )
        )

    def fit(self, training_dataset: MLDataset, config: ModelTrainingConfig) -> None:
        """Fit a decision tree after validating numeric data and class labels."""
        validate_dataset(training_dataset, require_labels=True)
        if len({record.label for record in training_dataset.records}) < 2:
            raise ModelTrainingError(
                "Decision tree classification requires at least two classes."
            )

        matrix = feature_matrix(training_dataset)
        labels = np.asarray(
            [record.label for record in training_dataset.records],
            dtype=object,
        )
        selected = _config_from_training(config, self.config)
        parameters: dict[str, object] = {
            "criterion": selected.criterion,
            "max_depth": selected.max_depth,
            "min_samples_split": selected.min_samples_split,
            "min_samples_leaf": selected.min_samples_leaf,
            "max_features": selected.max_features,
            "class_weight": (
                dict(selected.class_weight)
                if isinstance(selected.class_weight, Mapping)
                else selected.class_weight
            ),
            "random_state": selected.random_state,
            "ccp_alpha": selected.ccp_alpha,
        }
        try:
            estimator = DecisionTreeClassifier(**parameters)
            self._estimator = cast(
                "DecisionTreeClassifier",
                estimator.fit(matrix, labels),
            )
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(f"Unable to fit decision tree: {exc}") from exc

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
            model_name=self.model_name,
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

    def decision_path(self, dataset: MLDataset) -> tuple[tuple[int, ...], ...]:
        """Return node indices traversed by each input row."""
        estimator = self._require_fitted(dataset)
        try:
            paths = estimator.decision_path(feature_matrix(dataset))
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(
                f"Unable to calculate decision path: {exc}"
            ) from exc
        return tuple(
            tuple(int(node) for node in paths.indices[start:end])
            for start, end in zip(paths.indptr[:-1], paths.indptr[1:], strict=True)
        )

    def apply(self, dataset: MLDataset) -> tuple[int, ...]:
        """Return the leaf node reached by each input row."""
        estimator = self._require_fitted(dataset)
        try:
            leaves = estimator.apply(feature_matrix(dataset))
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(f"Unable to apply decision tree: {exc}") from exc
        return tuple(int(leaf) for leaf in leaves)

    def _require_fitted(
        self,
        dataset: MLDataset,
    ) -> DecisionTreeClassifier:
        """Validate fitted state and input schema before model operations."""
        estimator = self._require_estimator()
        validate_dataset(dataset, require_labels=False)
        if dataset.feature_names != self._feature_names:
            raise ModelTrainingError(
                "Prediction feature names and order must match the training schema."
            )
        return estimator

    def _require_estimator(self) -> DecisionTreeClassifier:
        """Return the fitted estimator or raise a typed training error."""
        if self._estimator is None:
            raise ModelTrainingError("Decision tree has not been fitted.")
        return self._estimator


def _validate_sample_parameter(
    name: str,
    value: float,
    *,
    minimum_integer: int,
    maximum_fraction: float,
) -> None:
    """Validate scikit-learn integer-count and fractional sample settings."""
    if isinstance(value, bool):
        raise ModelTrainingError(
            f"{name} must be an integer >= {minimum_integer} or a fraction "
            f"in (0, {maximum_fraction}]."
        )
    if isinstance(value, int):
        valid = value >= minimum_integer
    elif isinstance(value, float):
        valid = math.isfinite(value) and 0.0 < value <= maximum_fraction
    else:
        valid = False
    if not valid:
        raise ModelTrainingError(
            f"{name} must be an integer >= {minimum_integer} or a fraction "
            f"in (0, {maximum_fraction}]."
        )


def _config_from_training(
    training: ModelTrainingConfig,
    defaults: DecisionTreeConfig,
) -> DecisionTreeConfig:
    """Resolve named tree hyperparameters and training seed."""
    allowed = {
        "criterion",
        "max_depth",
        "min_samples_split",
        "min_samples_leaf",
        "max_features",
        "class_weight",
        "random_state",
        "ccp_alpha",
    }
    unknown = set(training.model.hyperparameters) - allowed
    if unknown:
        raise ModelTrainingError(
            f"Unsupported decision tree parameters: {', '.join(sorted(unknown))}."
        )
    values: dict[str, object] = {
        "criterion": defaults.criterion,
        "max_depth": defaults.max_depth,
        "min_samples_split": defaults.min_samples_split,
        "min_samples_leaf": defaults.min_samples_leaf,
        "max_features": defaults.max_features,
        "class_weight": defaults.class_weight,
        "random_state": training.random_seed,
        "ccp_alpha": defaults.ccp_alpha,
    }
    values.update(training.model.hyperparameters)
    if "random_state" not in training.model.hyperparameters:
        values["random_state"] = training.random_seed
    try:
        return DecisionTreeConfig(**values)  # type: ignore[arg-type]
    except TypeError as exc:
        raise ModelTrainingError(f"Invalid decision tree configuration: {exc}") from exc


def decision_tree_config_from_mapping(
    parameters: Mapping[str, object],
) -> DecisionTreeConfig:
    """Validate a generic model hyperparameter mapping as tree options."""
    allowed = {
        "criterion",
        "max_depth",
        "min_samples_split",
        "min_samples_leaf",
        "max_features",
        "class_weight",
        "random_state",
        "ccp_alpha",
    }
    unknown = set(parameters) - allowed
    if unknown:
        raise ModelTrainingError(
            f"Unsupported decision tree parameters: {', '.join(sorted(unknown))}."
        )
    try:
        return DecisionTreeConfig(**dict(parameters))  # type: ignore[arg-type]
    except TypeError as exc:
        raise ModelTrainingError(f"Invalid decision tree configuration: {exc}") from exc
