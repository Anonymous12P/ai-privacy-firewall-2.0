"""Scan orchestration and integration with existing model prediction APIs."""

import json
import logging
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Protocol
from uuid import uuid4

from app.core.config import get_settings
from app.ml.schemas import DatasetMetadata, MLDataset, MLRecord
from app.models.base import Model
from app.models.persistence import JoblibModelPersistence
from app.repositories.scan_repository import (
    ScanRepository,
    StoredScan,
    default_scan_repository,
)
from app.schemas.scan import ScanModelName, ScanRequest, ScanResponse
from app.services.firewall_service import FirewallDecision, PrivacyFirewall


@dataclass(frozen=True, slots=True)
class PredictionOutcome:
    """Normalized prediction result produced by an existing model."""

    prediction: str | int | float | bool
    confidence: float
    explanation_summary: str | None = None


class ScanPredictionError(RuntimeError):
    """Raised when a configured model cannot produce a scan prediction."""


class ScanPredictor(Protocol):
    """Prediction boundary injected into the scan service."""

    def predict(self, request: ScanRequest) -> PredictionOutcome:
        """Predict one validated scan request."""


class PersistedModelPredictor:
    """Adapt persisted application models to the scan prediction contract."""

    def __init__(self, model_directory: Path) -> None:
        self._model_directory = model_directory
        self._persistence = JoblibModelPersistence()

    def predict(self, request: ScanRequest) -> PredictionOutcome:
        """Load the selected model and delegate prediction to it."""
        model_path = self._model_directory / _model_filename(request.model_name)
        try:
            model = self._persistence.load(model_path)
            feature_names = _feature_names(model, self._model_directory)
            normalized_features = normalize_scan_features(request, feature_names)
            dataset = MLDataset(
                feature_names=feature_names,
                records=(
                    MLRecord(
                        subject_id=request.subject_id or "scan",
                        values=normalized_features,
                    ),
                ),
                metadata=DatasetMetadata(
                    feature_names=feature_names,
                    column_names=feature_names,
                    row_count=1,
                    column_count=len(feature_names),
                ),
            )
            prediction = model.predict(dataset).predictions[0]
            if prediction is None:
                raise ScanPredictionError("The model returned no prediction.")
            confidence = _confidence(model, dataset, prediction)
        except ScanPredictionError:
            raise
        except Exception as error:
            raise ScanPredictionError(
                f"Unable to run {request.model_name} prediction from "
                f"{model_path}: {error}"
            ) from error
        return PredictionOutcome(prediction=prediction, confidence=confidence)


class ScanService:
    """Coordinate validation, prediction, risk normalization, and persistence."""

    def __init__(
        self,
        repository: ScanRepository | None = None,
        predictor: ScanPredictor | None = None,
        model_directory: Path | None = None,
        firewall: PrivacyFirewall | None = None,
        enforce_firewall: bool = False,
    ) -> None:
        """Create a scan service with injectable repository and prediction boundary."""
        self._repository = repository or default_scan_repository
        self._predictor = predictor or PersistedModelPredictor(
            model_directory or get_settings().model_directory
        )
        self._firewall = firewall or PrivacyFirewall()
        self._enforce_firewall = enforce_firewall
        self._firewall_decisions: dict[str, FirewallDecision] = {}

    @property
    def enforcement_enabled(self) -> bool:
        """Return whether this service actively enforces firewall decisions."""
        return self._enforce_firewall

    def create_scan(
        self,
        request: ScanRequest,
        *,
        user_id: str | None = None,
    ) -> ScanResponse:
        """Run one prediction, persist it, and return its public response."""
        outcome = self._predictor.predict(request)
        if not 0.0 <= outcome.confidence <= 1.0:
            raise ScanPredictionError("Prediction confidence must be between 0 and 1.")
        decision = self._firewall.evaluate(
            outcome.prediction,
            outcome.confidence,
            request.features,
        )
        self._firewall.enforce(decision, enabled=self._enforce_firewall)
        stored = StoredScan(
            scan_id=str(uuid4()),
            prediction=outcome.prediction,
            confidence=outcome.confidence,
            risk_level=_risk_level(outcome.prediction, outcome.confidence),
            timestamp=datetime.now(UTC),
            explanation_summary=outcome.explanation_summary,
            model_name=request.model_name,
            user_id=user_id,
            url=request.url,
        )
        saved = self._repository.save(stored)
        self._firewall_decisions[saved.scan_id] = decision
        return _response(saved, decision, self._firewall.notice(decision))

    def create_pending_scan(
        self,
        request: ScanRequest,
        *,
        user_id: str | None = None,
    ) -> ScanResponse:
        """Create a pending scan without blocking on model execution."""
        now = datetime.now(UTC)
        stored = StoredScan(
            scan_id=str(uuid4()),
            prediction=None,
            confidence=None,
            risk_level=None,
            timestamp=now,
            model_name=request.model_name,
            user_id=user_id,
            url=request.url,
            status="PENDING",
        )
        return _response(self._repository.save(stored))

    def process_scan(self, scan_id: str, request: ScanRequest) -> None:
        """Execute a queued scan and persist its terminal state."""
        repository_scan = self._repository.get(scan_id)
        if repository_scan is None:
            return
        self._repository.update(scan_id, status="RUNNING", error=None)
        try:
            outcome = self._predictor.predict(request)
            if not 0.0 <= outcome.confidence <= 1.0:
                raise ScanPredictionError(
                    "Prediction confidence must be between 0 and 1."
                )
            decision = self._firewall.evaluate(
                outcome.prediction,
                outcome.confidence,
                request.features,
            )
            self._firewall.enforce(decision, enabled=self._enforce_firewall)
            self._firewall_decisions[scan_id] = decision
            self._repository.update(
                scan_id,
                prediction=outcome.prediction,
                confidence=outcome.confidence,
                risk_level=_risk_level(outcome.prediction, outcome.confidence),
                explanation_summary=outcome.explanation_summary,
                status="COMPLETED",
                completed_at=datetime.now(UTC),
                error=None,
            )
        except Exception as error:  # noqa: BLE001
            self._repository.update(
                scan_id,
                status="FAILED",
                completed_at=datetime.now(UTC),
                error=str(error),
            )

    def get_scan(self, scan_id: str) -> ScanResponse | None:
        """Return a stored scan when it exists."""
        stored = self._repository.get(scan_id)
        return (
            _response(
                stored,
                self._firewall_decisions.get(scan_id),
                self._notice_for_scan(scan_id),
            )
            if stored is not None
            else None
        )

    def _notice_for_scan(self, scan_id: str) -> str | None:
        decision = self._firewall_decisions.get(scan_id)
        return self._firewall.notice(decision) if decision is not None else None


def _response(
    scan: StoredScan,
    decision: FirewallDecision | None = None,
    notice: str | None = None,
) -> ScanResponse:
    return ScanResponse(
        scan_id=scan.scan_id,
        status=scan.status,  # type: ignore[arg-type]
        prediction=scan.prediction,
        confidence=scan.confidence,
        risk_level=scan.risk_level,  # type: ignore[arg-type]
        firewall_action=decision.firewall_action if decision is not None else None,
        policy_name=decision.policy_name if decision is not None else None,
        reasons=list(decision.reasons) if decision is not None else [],
        warning=(
            notice
            if decision is not None and decision.firewall_action == "WARN"
            else None
        ),
        restriction_notice=(
            notice
            if decision is not None and decision.firewall_action == "RESTRICT"
            else None
        ),
        timestamp=scan.timestamp,
        created_at=scan.timestamp,
        explanation_summary=scan.explanation_summary,
        completed_at=scan.completed_at,
        error=scan.error,
    )


def _risk_level(
    prediction: str | float | bool,
    confidence: float,
) -> str:
    if isinstance(prediction, str) and prediction.lower() in {"insider", "high", "1"}:
        return "high"
    return "medium" if confidence < 0.7 else "low"


def _model_filename(model_name: ScanModelName) -> str:
    return {
        "LogisticRegression": "logistic_regression.joblib",
        "DecisionTree": "decision_tree.joblib",
        "RandomForest": "random_forest.joblib",
        "XGBoost": "xgboost.joblib",
    }[model_name]


def validate_model_artifacts(model_directory: Path) -> tuple[str, ...]:
    """Return missing model artifacts and log actionable startup diagnostics."""
    model_names: tuple[ScanModelName, ...] = (
        "LogisticRegression",
        "DecisionTree",
        "RandomForest",
        "XGBoost",
    )
    missing = tuple(
        model_name
        for model_name in model_names
        if not (
            (model_directory / _model_filename(model_name)).is_file()
            and (
                model_directory / f"{_model_filename(model_name)}.metadata.json"
            ).is_file()
        )
    )
    if missing:
        logging.getLogger(__name__).warning(
            "Missing model artifacts in %s: %s. Run the experiment pipeline "
            "or set MODEL_DIRECTORY to the trained artifact directory.",
            model_directory,
            ", ".join(missing),
        )
    else:
        logging.getLogger(__name__).info(
            "Validated model artifacts in %s.", model_directory
        )
    return missing


def _model_feature_names(model: Model) -> tuple[str, ...]:
    feature_names = getattr(model, "feature_names", None)
    if not isinstance(feature_names, tuple) or not all(
        isinstance(name, str) for name in feature_names
    ):
        raise ScanPredictionError("Persisted model does not expose feature names.")
    return feature_names


def _feature_names(model: Model, model_directory: Path) -> tuple[str, ...]:
    """Resolve the ordered feature schema from metadata, then the model."""
    model_names = _model_feature_names(model)
    metadata_path = model_directory / "features" / "feature_metadata.json"
    if not metadata_path.is_file():
        return model_names
    try:
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        metadata_names = metadata.get("feature_names")
    except (OSError, ValueError, TypeError):
        return model_names
    if not isinstance(metadata_names, list) or not all(
        isinstance(name, str) for name in metadata_names
    ):
        return model_names
    resolved_names = tuple(metadata_names)
    if resolved_names != model_names:
        raise ScanPredictionError(
            "Feature metadata does not match the persisted model schema."
        )
    return resolved_names


def normalize_scan_features(
    request: ScanRequest,
    feature_names: tuple[str, ...],
) -> tuple[float, ...]:
    """Build an ordered model vector from sparse request features."""
    supplied = request.features
    subject_feature = (
        f"categorical.subject_id=={request.subject_id}" if request.subject_id else None
    )
    return tuple(
        float(
            supplied.get(
                name,
                (
                    1.0
                    if name == subject_feature or name == "categorical.window==daily"
                    else 0.0
                ),
            )
        )
        for name in feature_names
    )


def _confidence(
    model: Model,
    dataset: MLDataset,
    prediction: str | float | bool,
) -> float:
    predict_proba = getattr(model, "predict_proba", None)
    if not callable(predict_proba):
        return 1.0
    probabilities = predict_proba(dataset)[0]
    classes = getattr(model, "classes", ())
    try:
        index = tuple(classes).index(prediction)
    except ValueError:
        return max(probabilities)
    return float(probabilities[index])
