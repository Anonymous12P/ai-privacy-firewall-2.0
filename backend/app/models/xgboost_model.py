"""Optional XGBoost classifier adapter with deterministic label handling."""

import importlib
import json
import math
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Literal, Protocol, cast

import numpy as np
from numpy.typing import NDArray
from sklearn.preprocessing import LabelEncoder  # type: ignore[import-untyped]

from app.ml.schemas import MLDataset, MLLabel
from app.models.base import Model
from app.models.classification_utils import feature_matrix, validate_dataset
from app.models.exceptions import ModelDependencyError, ModelTrainingError
from app.models.schemas import ModelPrediction, ModelTrainingConfig

_INSTALL_MESSAGE = (
    "XGBoost support requires the optional dependency. Install it with "
    '`pip install -e ".[xgboost]"` from the backend directory.'
)


@dataclass(frozen=True, slots=True)
class XGBoostConfig:
    """Configure supported XGBoost classifier parameters."""

    n_estimators: int = 100
    learning_rate: float = 0.1
    max_depth: int = 6
    min_child_weight: float = 1.0
    subsample: float = 1.0
    colsample_bytree: float = 1.0
    gamma: float = 0.0
    reg_alpha: float = 0.0
    reg_lambda: float = 1.0
    objective: Literal["auto", "binary:logistic", "multi:softprob"] = "auto"
    eval_metric: str | None = None
    random_state: int | None = 42
    n_jobs: int | None = None

    def __post_init__(self) -> None:
        """Reject invalid XGBoost parameters before estimator construction."""
        for name, value in (
            ("n_estimators", self.n_estimators),
            ("max_depth", self.max_depth),
        ):
            if isinstance(value, bool) or not isinstance(value, int) or value < 1:
                raise ModelTrainingError(f"{name} must be a positive integer.")
        for numeric_name, numeric_value in (
            ("learning_rate", self.learning_rate),
            ("min_child_weight", self.min_child_weight),
            ("subsample", self.subsample),
            ("colsample_bytree", self.colsample_bytree),
            ("gamma", self.gamma),
            ("reg_alpha", self.reg_alpha),
            ("reg_lambda", self.reg_lambda),
        ):
            if (
                isinstance(numeric_value, bool)
                or not isinstance(numeric_value, (int, float))
                or not math.isfinite(numeric_value)
                or numeric_value < 0
            ):
                raise ModelTrainingError(
                    f"{numeric_name} must be a finite nonnegative number."
                )
        if self.learning_rate <= 0:
            raise ModelTrainingError("learning_rate must be greater than zero.")
        if not 0 < self.subsample <= 1:
            raise ModelTrainingError("subsample must be in (0, 1].")
        if not 0 < self.colsample_bytree <= 1:
            raise ModelTrainingError("colsample_bytree must be in (0, 1].")
        if self.objective not in {"auto", "binary:logistic", "multi:softprob"}:
            raise ModelTrainingError(
                f"Unsupported XGBoost objective: {self.objective!r}."
            )
        if self.eval_metric is not None and (
            not isinstance(self.eval_metric, str) or not self.eval_metric.strip()
        ):
            raise ModelTrainingError("eval_metric must be a non-empty string or None.")
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


class _XGBEstimator(Protocol):
    """Describe the fitted estimator API used by this adapter."""

    classes_: NDArray[np.int64]
    feature_importances_: NDArray[np.float32]
    n_classes_: int

    def fit(
        self, features: NDArray[np.float64], labels: NDArray[np.int64]
    ) -> object: ...

    def predict(self, features: NDArray[np.float64]) -> NDArray[np.int64]: ...

    def predict_proba(self, features: NDArray[np.float64]) -> NDArray[np.float64]: ...

    def apply(self, features: NDArray[np.float64]) -> NDArray[np.float64]: ...

    def get_booster(self) -> object: ...


class XGBoostModel(Model):
    """Implement the model contract using the optional XGBClassifier."""

    model_name = "XGBoost"

    def __init__(self, config: XGBoostConfig | None = None) -> None:
        """Create an unfitted adapter without importing optional XGBoost."""
        self.config = config or XGBoostConfig()
        self._estimator: _XGBEstimator | None = None
        self._feature_names: tuple[str, ...] = ()
        self._classes: tuple[MLLabel, ...] = ()
        self._label_encoder: LabelEncoder | None = None
        self._objective: str | None = None
        self._version: str | None = None

    @property
    def feature_names(self) -> tuple[str, ...]:
        """Return the feature schema learned during fit."""
        return self._feature_names

    @property
    def classes(self) -> tuple[MLLabel, ...]:
        """Return original class labels in the estimator's stable order."""
        return self._classes

    @property
    def shap_estimator(self) -> object:
        """Return the fitted estimator for the SHAP integration boundary."""
        return self._require_estimator()

    @property
    def objective(self) -> str:
        """Return the binary or multiclass objective selected during fit."""
        if self._objective is None:
            raise ModelTrainingError("XGBoost has not been fitted.")
        return self._objective

    @property
    def xgboost_version(self) -> str:
        """Return the installed XGBoost version used by the fitted estimator."""
        if self._version is None:
            raise ModelTrainingError("XGBoost has not been fitted.")
        return self._version

    @property
    def booster_type(self) -> str:
        """Return the configured XGBoost booster implementation name."""
        return "gbtree"

    @property
    def feature_importances(self) -> tuple[tuple[str, float], ...]:
        """Return feature importance values in training-schema order."""
        estimator = self._require_estimator()
        return tuple(
            (name, float(value))
            for name, value in zip(
                self._feature_names,
                estimator.feature_importances_,
                strict=True,
            )
        )

    @property
    def parameter_count(self) -> int | None:
        """Count numeric learned values exposed in the booster JSON dump."""
        booster = self._require_estimator().get_booster()
        get_dump = getattr(booster, "get_dump", None)
        if not callable(get_dump):
            return None
        try:
            dumps = get_dump(dump_format="json")
            return sum(_count_numeric_values(json.loads(tree)) for tree in dumps)
        except (TypeError, ValueError, json.JSONDecodeError):
            return None

    def fit(self, training_dataset: MLDataset, config: ModelTrainingConfig) -> None:
        """Fit XGBoost using encoded labels and a class-appropriate objective."""
        validate_dataset(training_dataset, require_labels=True)
        labels = [record.label for record in training_dataset.records]
        if any(label is None for label in labels):
            raise ModelTrainingError("Target label is missing from training data.")
        label_values = cast("list[MLLabel]", labels)
        if len(set(label_values)) < 2:
            raise ModelTrainingError(
                "XGBoost classification requires at least two classes."
            )
        if any(
            isinstance(label, float) and not math.isfinite(label)
            for label in label_values
        ):
            raise ModelTrainingError("Target labels must be finite values.")
        if len({type(label) for label in label_values}) > 1:
            raise ModelTrainingError(
                "XGBoost target labels must use one consistent primitive type."
            )

        selected = _config_from_training(config, self.config)
        objective = _objective_for_classes(selected.objective, len(set(label_values)))
        xgb_classifier, version = _load_xgboost_classifier()
        encoder = LabelEncoder()
        try:
            encoded_labels = cast(
                "NDArray[np.int64]",
                encoder.fit_transform(np.asarray(label_values)),
            )
            estimator = xgb_classifier(
                n_estimators=selected.n_estimators,
                learning_rate=selected.learning_rate,
                max_depth=selected.max_depth,
                min_child_weight=selected.min_child_weight,
                subsample=selected.subsample,
                colsample_bytree=selected.colsample_bytree,
                gamma=selected.gamma,
                reg_alpha=selected.reg_alpha,
                reg_lambda=selected.reg_lambda,
                objective=objective,
                eval_metric=selected.eval_metric
                or ("logloss" if len(encoder.classes_) == 2 else "mlogloss"),
                random_state=selected.random_state,
                n_jobs=selected.n_jobs,
                tree_method="hist",
            )
            self._estimator = cast(
                "_XGBEstimator",
                estimator.fit(feature_matrix(training_dataset), encoded_labels),
            )
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(
                f"Unable to fit XGBoost classifier: {exc}"
            ) from exc

        self._label_encoder = encoder
        self._classes = tuple(_label(value) for value in encoder.classes_)
        self._feature_names = training_dataset.feature_names
        self._objective = objective
        self._version = version

    def predict(self, dataset: MLDataset) -> ModelPrediction:
        """Return decoded predictions in input record order."""
        estimator = self._require_fitted(dataset)
        encoder = self._require_encoder()
        try:
            encoded = estimator.predict(feature_matrix(dataset))
            predictions = encoder.inverse_transform(np.asarray(encoded, dtype=np.int64))
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(f"Unable to predict with XGBoost: {exc}") from exc
        return ModelPrediction(
            model_name=self.model_name,
            predictions=tuple(_label(value) for value in predictions),
            subject_ids=tuple(record.subject_id for record in dataset.records),
        )

    def predict_proba(self, dataset: MLDataset) -> tuple[tuple[float, ...], ...]:
        """Return class probabilities in the original encoded class order."""
        estimator = self._require_fitted(dataset)
        try:
            probabilities = np.asarray(
                estimator.predict_proba(feature_matrix(dataset)),
                dtype=np.float64,
            )
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(
                f"Unable to calculate XGBoost probabilities: {exc}"
            ) from exc
        row_sums = probabilities.sum(axis=1, keepdims=True)
        if np.any(~np.isfinite(probabilities)) or np.any(row_sums <= 0):
            raise ModelTrainingError(
                "XGBoost returned invalid class probability values."
            )
        normalized = probabilities / row_sums
        return tuple(tuple(float(value) for value in row) for row in normalized)

    def apply(self, dataset: MLDataset) -> tuple[tuple[float, ...], ...]:
        """Return per-row leaf assignments for boosting rounds."""
        estimator = self._require_fitted(dataset)
        try:
            leaves = np.asarray(estimator.apply(feature_matrix(dataset)))
        except (ValueError, TypeError) as exc:
            raise ModelTrainingError(f"Unable to apply XGBoost model: {exc}") from exc
        if leaves.ndim == 1:
            leaves = leaves.reshape(-1, 1)
        elif leaves.ndim == 3:
            leaves = leaves.reshape(leaves.shape[0], -1)
        if leaves.ndim != 2:
            raise ModelTrainingError(
                "XGBoost returned an unsupported leaf-assignment shape."
            )
        return tuple(tuple(float(value) for value in row) for row in leaves)

    def _require_fitted(self, dataset: MLDataset) -> _XGBEstimator:
        """Validate fitted state and feature schema before model operations."""
        estimator = self._require_estimator()
        validate_dataset(dataset, require_labels=False)
        if dataset.feature_names != self._feature_names:
            raise ModelTrainingError(
                "Prediction feature names and order must match the training schema."
            )
        return estimator

    def _require_estimator(self) -> _XGBEstimator:
        """Return the fitted estimator or raise a typed training error."""
        if self._estimator is None:
            raise ModelTrainingError("XGBoost has not been fitted.")
        return self._estimator

    def _require_encoder(self) -> LabelEncoder:
        """Return the fitted class label encoder."""
        if self._label_encoder is None:
            raise ModelTrainingError("XGBoost has not been fitted.")
        return self._label_encoder


def _load_xgboost_classifier() -> tuple[type, str]:
    """Import the optional official XGBoost classifier or explain installation."""
    try:
        module = importlib.import_module("xgboost")
        classifier = module.XGBClassifier
        version = module.__version__
    except (ImportError, AttributeError) as exc:
        raise ModelDependencyError(_INSTALL_MESSAGE) from exc
    return cast("type", classifier), cast("str", version)


def _label(value: object) -> MLLabel:
    """Convert NumPy label scalars back to supported Python primitive labels."""
    python_value = value.item() if isinstance(value, np.generic) else value
    if isinstance(python_value, (str, int, float, bool)):
        return python_value
    raise ModelTrainingError(
        f"Unsupported target label type: {type(python_value).__name__}."
    )


def _objective_for_classes(
    configured: str,
    class_count: int,
) -> Literal["binary:logistic", "multi:softprob"]:
    """Resolve or validate the binary/multiclass objective from target classes."""
    expected: Literal["binary:logistic", "multi:softprob"] = (
        "binary:logistic" if class_count == 2 else "multi:softprob"
    )
    if configured != "auto" and configured != expected:
        raise ModelTrainingError(
            f"Objective {configured!r} does not match {class_count}-class "
            f"classification; expected {expected!r}."
        )
    return expected


def _count_numeric_values(value: object) -> int:
    """Count scalar numeric values in a JSON-serializable booster tree."""
    if isinstance(value, bool) or value is None:
        return 0
    if isinstance(value, (int, float)):
        return 1
    if isinstance(value, dict):
        return sum(_count_numeric_values(item) for item in value.values())
    if isinstance(value, list):
        return sum(_count_numeric_values(item) for item in value)
    return 0


def _config_from_training(
    training: ModelTrainingConfig,
    defaults: XGBoostConfig,
) -> XGBoostConfig:
    """Resolve supported named parameters and training seed."""
    values = _validated_parameter_mapping(training.model.hyperparameters)
    resolved: dict[str, object] = {
        "n_estimators": defaults.n_estimators,
        "learning_rate": defaults.learning_rate,
        "max_depth": defaults.max_depth,
        "min_child_weight": defaults.min_child_weight,
        "subsample": defaults.subsample,
        "colsample_bytree": defaults.colsample_bytree,
        "gamma": defaults.gamma,
        "reg_alpha": defaults.reg_alpha,
        "reg_lambda": defaults.reg_lambda,
        "objective": defaults.objective,
        "eval_metric": defaults.eval_metric,
        "random_state": training.random_seed,
        "n_jobs": defaults.n_jobs,
    }
    resolved.update(values)
    if "random_state" not in values:
        resolved["random_state"] = training.random_seed
    try:
        return XGBoostConfig(**resolved)  # type: ignore[arg-type]
    except TypeError as exc:
        raise ModelTrainingError(f"Invalid XGBoost configuration: {exc}") from exc


def xgboost_config_from_mapping(parameters: Mapping[str, object]) -> XGBoostConfig:
    """Validate a generic model hyperparameter mapping as XGBoost options."""
    try:
        return XGBoostConfig(**_validated_parameter_mapping(parameters))  # type: ignore[arg-type]
    except TypeError as exc:
        raise ModelTrainingError(f"Invalid XGBoost configuration: {exc}") from exc


def _validated_parameter_mapping(parameters: Mapping[str, object]) -> dict[str, object]:
    """Reject unsupported XGBoost configuration keys."""
    allowed = {
        "n_estimators",
        "learning_rate",
        "max_depth",
        "min_child_weight",
        "subsample",
        "colsample_bytree",
        "gamma",
        "reg_alpha",
        "reg_lambda",
        "objective",
        "eval_metric",
        "random_state",
        "n_jobs",
    }
    unknown = set(parameters) - allowed
    if unknown:
        raise ModelTrainingError(
            f"Unsupported XGBoost parameters: {', '.join(sorted(unknown))}."
        )
    return dict(parameters)
