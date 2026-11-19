"""AI threat detection engine for Privacy Firewall inference."""

import json
import logging
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol

from app.core.config import get_settings
from app.core.constants import APP_LOGGER_NAME
from app.ml.schemas import DatasetMetadata, MLDataset, MLRecord
from app.models.base import Model
from app.models.persistence import JoblibModelPersistence
from app.schemas.firewall import FirewallModelName

logger = logging.getLogger(f"{APP_LOGGER_NAME}.services.ai")

SUPPORTED_MODELS: tuple[FirewallModelName, ...] = (
    "LogisticRegression",
    "DecisionTree",
    "RandomForest",
    "XGBoost",
)

MODEL_FILENAMES: dict[str, str] = {
    "LogisticRegression": "logistic_regression.joblib",
    "DecisionTree": "decision_tree.joblib",
    "RandomForest": "random_forest.joblib",
    "XGBoost": "xgboost.joblib",
}


class AIEngineError(RuntimeError):
    """Raised when the AI engine fails to execute inference."""


@dataclass(frozen=True, slots=True)
class AIPrediction:
    """Standardized prediction outcome from the AI threat detection engine."""

    prediction: str | int | float | bool
    confidence: float
    model_name: str
    explanation_summary: str | None = None
    probabilities: dict[str, float] = field(default_factory=dict)


class AIPredictorProtocol(Protocol):
    """Injectable boundary for AI model predictions."""

    def predict(
        self,
        features: Mapping[str, float],
        model_name: str = "LogisticRegression",
        subject_id: str | None = None,
    ) -> AIPrediction:
        """Run threat inference against normalized behavioral features."""
        ...


class AIEngine:
    """Manages machine learning model loading and threat inference execution."""

    def __init__(
        self,
        model_directory: Path | None = None,
        predictor: AIPredictorProtocol | None = None,
    ) -> None:
        """Initialize the AI engine with injectable storage directory or mock predictor."""
        self._model_directory = model_directory or get_settings().model_directory
        self._persistence = JoblibModelPersistence()
        self._custom_predictor = predictor
        self._loaded_models: dict[str, Model] = {}

    @property
    def model_directory(self) -> Path:
        """Return the active model directory path."""
        return self._model_directory

    def available_models(self) -> list[str]:
        """Return list of models available in the configured model directory."""
        available: list[str] = []
        for name, filename in MODEL_FILENAMES.items():
            model_file = self._model_directory / filename
            meta_file = self._model_directory / f"{filename}.metadata.json"
            if model_file.is_file() and meta_file.is_file():
                available.append(name)
        return available or list(SUPPORTED_MODELS)

    def predict(
        self,
        features: Mapping[str, float],
        model_name: str = "LogisticRegression",
        subject_id: str | None = None,
    ) -> AIPrediction:
        """Execute threat detection inference using the specified model architecture."""
        if self._custom_predictor is not None:
            return self._custom_predictor.predict(
                features, model_name=model_name, subject_id=subject_id
            )

        if model_name not in MODEL_FILENAMES:
            raise AIEngineError(
                f"Unsupported model {model_name!r}. Supported models: {list(MODEL_FILENAMES.keys())}"
            )

        model_path = self._model_directory / MODEL_FILENAMES[model_name]
        try:
            model = self._load_model(model_path)
            feature_names = self._resolve_feature_names(model)
            normalized_vector = self._vectorize_features(
                features, feature_names, subject_id
            )

            dataset = MLDataset(
                feature_names=feature_names,
                records=(
                    MLRecord(
                        subject_id=subject_id or "firewall-subject",
                        values=normalized_vector,
                    ),
                ),
                metadata=DatasetMetadata(
                    feature_names=feature_names,
                    column_names=feature_names,
                    row_count=1,
                    column_count=len(feature_names),
                ),
            )

            result = model.predict(dataset)
            raw_prediction = result.predictions[0]
            if raw_prediction is None:
                raise AIEngineError(f"Model {model_name} returned no prediction.")

            confidence, prob_dict = self._compute_confidence(
                model, dataset, raw_prediction
            )

            logger.info(
                "AI threat inference succeeded: model=%s subject=%s prediction=%r "
                "confidence=%.3f",
                model_name,
                subject_id,
                raw_prediction,
                confidence,
            )

            return AIPrediction(
                prediction=raw_prediction,
                confidence=confidence,
                model_name=model_name,
                probabilities=prob_dict,
                explanation_summary=f"Evaluated with {model_name} (confidence: {confidence:.2%})",
            )
        except AIEngineError:
            raise
        except Exception as error:
            logger.exception("AI threat inference failed for model %s", model_name)
            raise AIEngineError(
                f"Unable to run {model_name} prediction from {model_path}: {error}"
            ) from error

    def _load_model(self, model_path: Path) -> Model:
        path_str = str(model_path)
        if path_str not in self._loaded_models:
            self._loaded_models[path_str] = self._persistence.load(model_path)
        return self._loaded_models[path_str]

    def _resolve_feature_names(self, model: Model) -> tuple[str, ...]:
        model_names = getattr(model, "feature_names", None)
        if not isinstance(model_names, tuple) or not all(
            isinstance(name, str) for name in model_names
        ):
            raise AIEngineError("Model does not expose valid feature names.")

        metadata_path = self._model_directory / "features" / "feature_metadata.json"
        if not metadata_path.is_file():
            return model_names

        try:
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            metadata_names = metadata.get("feature_names")
            if (
                isinstance(metadata_names, list)
                and all(isinstance(n, str) for n in metadata_names)
                and tuple(metadata_names) == model_names
            ):
                return tuple(metadata_names)
        except (OSError, ValueError, TypeError) as err:
            logger.debug("Failed reading feature metadata JSON: %s", err)

        return model_names

    def _vectorize_features(
        self,
        features: Mapping[str, float],
        feature_names: tuple[str, ...],
        subject_id: str | None,
    ) -> tuple[float, ...]:
        subject_feature = (
            f"categorical.subject_id=={subject_id}" if subject_id else None
        )
        return tuple(
            float(
                features.get(
                    name,
                    (
                        1.0
                        if name == subject_feature
                        or name == "categorical.window==daily"
                        else 0.0
                    ),
                )
            )
            for name in feature_names
        )

    def _compute_confidence(
        self,
        model: Model,
        dataset: MLDataset,
        prediction: str | float | bool,
    ) -> tuple[float, dict[str, float]]:
        predict_proba = getattr(model, "predict_proba", None)
        if not callable(predict_proba):
            return 1.0, {str(prediction): 1.0}

        probabilities = predict_proba(dataset)[0]
        classes = tuple(getattr(model, "classes", ()))
        prob_dict: dict[str, float] = {
            str(cls_name): float(prob)
            for cls_name, prob in zip(classes, probabilities, strict=False)
        }

        try:
            index = classes.index(prediction)
            conf = float(probabilities[index])
        except ValueError:
            conf = float(max(probabilities)) if probabilities else 1.0

        return conf, prob_dict
