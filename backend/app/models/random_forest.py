"""Scikit-learn RandomForestClassifier model adapter."""

import math
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Literal, Protocol, cast

import numpy as np
from numpy.typing import NDArray
from sklearn.ensemble import RandomForestClassifier  # type: ignore[import-untyped]

from app.ml.schemas import MLDataset, MLLabel
from app.models.base import Model
from app.models.classification_utils import as_label, feature_matrix, validate_dataset
from app.models.exceptions import ModelTrainingError
from app.models.schemas import ModelPrediction, ModelTrainingConfig


class _CSRMatrix(Protocol):
    """Describe sparse matrix members used to expose row-wise paths."""

    indices: NDArray[np.int32]
    indptr: NDArray[np.int32]

    def tocsr(self) -> "_CSRMatrix": ...


@dataclass(frozen=True, slots=True)
class RandomForestConfig:
    """Configure supported scikit-learn random forest parameters."""

    n_estimators: int = 100
    criterion: Literal["gini", "entropy", "log_loss"] = "gini"
    max_depth: int | None = None
    min_samples_split: int | float = 2
    min_samples_leaf: int | float = 1
    max_features: Literal["sqrt", "log2"] | int | float | None = "sqrt"
    bootstrap: bool = True
    oob_score: bool = False
    class_weight: (
        Literal["balanced", "balanced_subsample"] | Mapping[MLLabel, float] | None
    ) = None
    random_state: int | None = 42
    n_jobs: int | None = None

    def __post_init__(self) -> None:
        """Reject invalid forest settings before constructing the estimator."""
        if (
            isinstance(self.n_estimators, bool)
            or not isinstance(self.n_estimators, int)
            or self.n_estimators < 1
        ):
            raise ModelTrainingError("n_estimators must be a positive integer.")
        if not isinstance(self.criterion, str) or self.criterion not in {
            "gini",
            "entropy",
            "log_loss",
        }:
            raise ModelTrainingError(
                f"Unsupported random forest criterion: {self.criterion!r}."
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
        _validate_max_features(self.max_features)
        if not isinstance(self.bootstrap, bool):
            raise ModelTrainingError("bootstrap must be a boolean.")
        if not isinstance(self.oob_score, bool):
            raise ModelTrainingError("oob_score must be a boolean.")
        if self.oob_score and not self.bootstrap:
            raise ModelTrainingError("oob_score requires bootstrap=True.")
        _validate_class_weight(self.class_weight)
        if self.random_state is not None and (
            isinstance(self.random_state, bool)
            or not isinstance(self.random_state, int)
        ):
            raise ModelTrainingError("random_state must be an integer or None.")
        if self.n_jobs is not None and (
            isinstance(self.n_jobs, bool)
            or not isinstance(self.n_jobs, int)
            or self.n_jobs == 0
        ):
            raise ModelTrainingError("n_jobs must be a nonzero integer or None.")


class RandomForestModel(Model):
    """Implement the project model contract with a random forest classifier."""

    model_name = "RandomForest"

    def __init__(self, config: RandomForestConfig | None = None) -> None:
        """Create an unfitted random forest with validated parameters."""
        self.config = config or RandomForestConfig()
        self._estimator: RandomForestClassifier | None = None
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
    def shap_estimator(self) -> RandomForestClassifier:
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
    def out_of_bag_score(self) -> float | None:
        """Return the fitted OOB score, when it was enabled and is finite."""
        estimator = self._require_estimator()
        score = getattr(estimator, "oob_score_", None)
        if score is None or not math.isfinite(float(score)):
            return None
        return float(score)

    @property
    def ensemble_statistics(self) -> Mapping[str, int | float | None]:
        """Summarize tree count, node counts, and tree-depth distribution."""
        estimators = self._require_estimator().estimators_
        depths = tuple(int(tree.get_depth()) for tree in estimators)
        node_counts = tuple(int(tree.tree_.node_count) for tree in estimators)
        return {
            "tree_count": len(estimators),
            "mean_tree_depth": float(np.mean(depths)),
            "max_tree_depth": max(depths),
            "mean_node_count": float(np.mean(node_counts)),
            "total_node_count": sum(node_counts),
        }

    @property
    def parameter_count(self) -> int:
        """Return the total learned scalar values across all forest trees."""
        return sum(
            sum(
                int(getattr(tree.tree_, attribute).size)
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
            for tree in self._require_estimator().estimators_
        )

    def fit(self, training_dataset: MLDataset, config: ModelTrainingConfig) -> None:
        """Fit the forest after validating numeric data and class labels."""
        validate_dataset(training_dataset, require_labels=True)
        if len({record.label for record in training_dataset.records}) < 2:
            raise ModelTrainingError(
                "Random forest classification requires at least two classes."
            )

        matrix = feature_matrix(training_dataset)
        labels = np.asarray(
            [record.label for record in training_dataset.records],
            dtype=object,
        )
        selected = _config_from_training(config, self.config)
        parameters: dict[str, object] = {
            "n_estimators": selected.n_estimators,
            "criterion": selected.criterion,
            "max_depth": selected.max_depth,
            "min_samples_split": selected.min_samples_split,
            "min_samples_leaf": selected.min_samples_leaf,
            "max_features": selected.max_features,
            "bootstrap": selected.bootstrap,
            "oob_score": selected.oob_score,
            "class_weight": (
                dict(selected.class_weight)
                if isinstance(selected.class_weight, Mapping)
                else selected.class_weight
            ),
            "random_state": selected.random_state,
            "n_jobs": selected.n_jobs,
        }
        try:
            estimator = RandomForestClassifier(**parameters)
            self._estimator = cast(
                "RandomForestClassifier",
                estimator.fit(matrix, labels),
            )
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(f"Unable to fit random forest: {exc}") from exc

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

    def predict_log_proba(self, dataset: MLDataset) -> tuple[tuple[float, ...], ...]:
        """Return per-class log-probabilities for each input row."""
        estimator = self._require_fitted(dataset)
        try:
            probabilities = estimator.predict_log_proba(feature_matrix(dataset))
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(
                f"Unable to calculate log probabilities: {exc}"
            ) from exc
        return tuple(tuple(float(value) for value in row) for row in probabilities)

    def apply(self, dataset: MLDataset) -> tuple[tuple[int, ...], ...]:
        """Return the leaf node reached by each row in every tree."""
        estimator = self._require_fitted(dataset)
        try:
            leaves = estimator.apply(feature_matrix(dataset))
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(f"Unable to apply random forest: {exc}") from exc
        return tuple(tuple(int(leaf) for leaf in row) for row in leaves)

    def decision_path(self, dataset: MLDataset) -> tuple[tuple[int, ...], ...]:
        """Return flattened node indices traversed across all trees per row."""
        estimator = self._require_fitted(dataset)
        try:
            paths, _ = estimator.decision_path(feature_matrix(dataset))
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(
                f"Unable to calculate random forest decision path: {exc}"
            ) from exc
        indicators = cast("_CSRMatrix", paths).tocsr()
        return tuple(
            tuple(int(node) for node in indicators.indices[start:end])
            for start, end in zip(
                indicators.indptr[:-1],
                indicators.indptr[1:],
                strict=True,
            )
        )

    def _require_fitted(self, dataset: MLDataset) -> RandomForestClassifier:
        """Validate fitted state and input schema before model operations."""
        estimator = self._require_estimator()
        validate_dataset(dataset, require_labels=False)
        if dataset.feature_names != self._feature_names:
            raise ModelTrainingError(
                "Prediction feature names and order must match the training schema."
            )
        return estimator

    def _require_estimator(self) -> RandomForestClassifier:
        """Return the fitted estimator or raise a typed training error."""
        if self._estimator is None:
            raise ModelTrainingError("Random forest has not been fitted.")
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


def _validate_max_features(value: str | float | None) -> None:
    """Validate the feature sampling setting accepted by scikit-learn."""
    if value is None:
        return
    if isinstance(value, bool):
        valid = False
    elif isinstance(value, int):
        valid = value > 0
    elif isinstance(value, float):
        valid = math.isfinite(value) and 0.0 < value <= 1.0
    elif isinstance(value, str):
        valid = value in {"sqrt", "log2"}
    else:
        valid = False
    if not valid:
        raise ModelTrainingError(
            "max_features must be a positive integer, a fraction in (0, 1], "
            "'sqrt', 'log2', or None."
        )


def _validate_class_weight(
    value: Literal["balanced", "balanced_subsample"] | Mapping[MLLabel, float] | None,
) -> None:
    """Validate class-weight keywords or finite nonnegative class weights."""
    if value is None or (
        isinstance(value, str) and value in {"balanced", "balanced_subsample"}
    ):
        return
    if not isinstance(value, Mapping) or any(
        isinstance(weight, bool)
        or not isinstance(weight, (int, float))
        or not math.isfinite(weight)
        or weight < 0
        for weight in value.values()
    ):
        raise ModelTrainingError(
            "class_weight must be 'balanced', 'balanced_subsample', a mapping "
            "of finite nonnegative weights, or None."
        )


def _config_from_training(
    training: ModelTrainingConfig,
    defaults: RandomForestConfig,
) -> RandomForestConfig:
    """Resolve named forest hyperparameters and training seed."""
    values = _validated_parameter_mapping(training.model.hyperparameters)
    resolved: dict[str, object] = {
        "n_estimators": defaults.n_estimators,
        "criterion": defaults.criterion,
        "max_depth": defaults.max_depth,
        "min_samples_split": defaults.min_samples_split,
        "min_samples_leaf": defaults.min_samples_leaf,
        "max_features": defaults.max_features,
        "bootstrap": defaults.bootstrap,
        "oob_score": defaults.oob_score,
        "class_weight": defaults.class_weight,
        "random_state": training.random_seed,
        "n_jobs": defaults.n_jobs,
    }
    resolved.update(values)
    if "random_state" not in values:
        resolved["random_state"] = training.random_seed
    try:
        return RandomForestConfig(**resolved)  # type: ignore[arg-type]
    except TypeError as exc:
        raise ModelTrainingError(f"Invalid random forest configuration: {exc}") from exc


def random_forest_config_from_mapping(
    parameters: Mapping[str, object],
) -> RandomForestConfig:
    """Validate a generic model hyperparameter mapping as forest options."""
    try:
        return RandomForestConfig(**_validated_parameter_mapping(parameters))  # type: ignore[arg-type]
    except TypeError as exc:
        raise ModelTrainingError(f"Invalid random forest configuration: {exc}") from exc


def _validated_parameter_mapping(parameters: Mapping[str, object]) -> dict[str, object]:
    """Reject unsupported forest configuration keys."""
    allowed = {
        "n_estimators",
        "criterion",
        "max_depth",
        "min_samples_split",
        "min_samples_leaf",
        "max_features",
        "bootstrap",
        "oob_score",
        "class_weight",
        "random_state",
        "n_jobs",
    }
    unknown = set(parameters) - allowed
    if unknown:
        raise ModelTrainingError(
            f"Unsupported random forest parameters: {', '.join(sorted(unknown))}."
        )
    return dict(parameters)
