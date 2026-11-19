"""Abstract model persistence interface without serialization implementation."""

import hashlib
import json
import logging
import pickle
import tempfile
from abc import ABC, abstractmethod
from pathlib import Path

import joblib  # type: ignore[import-untyped]

from app.core.constants import APP_LOGGER_NAME
from app.models.base import Model
from app.models.exceptions import ModelPersistenceError
from app.models.schemas import ModelArtifactMetadata

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.models.persistence")


class ModelPersistence(ABC):
    """Define save/load boundaries for model implementations."""

    @abstractmethod
    def save(
        self,
        model: Model,
        destination: Path,
        metadata: ModelArtifactMetadata,
    ) -> ModelArtifactMetadata:
        """Persist a model and metadata, returning the final integrity metadata."""
        raise NotImplementedError

    @abstractmethod
    def load(self, source: Path) -> Model:
        """Load a persisted model artifact."""
        raise NotImplementedError


class JoblibModelPersistence(ModelPersistence):
    """Persist trusted local models with joblib and a hash-verified JSON sidecar."""

    def save(
        self,
        model: Model,
        destination: Path,
        metadata: ModelArtifactMetadata,
    ) -> ModelArtifactMetadata:
        """Write a joblib model and JSON metadata with its SHA-256 digest."""
        try:
            destination.parent.mkdir(parents=True, exist_ok=True)
            temporary_model = _temporary_path(destination)
            try:
                joblib.dump(model, temporary_model)
                temporary_model.replace(destination)
            finally:
                temporary_model.unlink(missing_ok=True)
            final_metadata = ModelArtifactMetadata(
                model_name=metadata.model_name,
                configuration=metadata.configuration,
                feature_count=metadata.feature_count,
                feature_names=metadata.feature_names,
                target_classes=metadata.target_classes,
                sklearn_version=metadata.sklearn_version,
                validation_metrics=metadata.validation_metrics,
                test_metrics=metadata.test_metrics,
                sha256=_sha256_file(destination),
                model_details=metadata.model_details,
                library_version=metadata.library_version,
            )
            sidecar = _metadata_path(destination)
            temporary_sidecar = _temporary_path(sidecar)
            try:
                temporary_sidecar.write_text(
                    json.dumps(
                        _metadata_payload(final_metadata),
                        ensure_ascii=False,
                        allow_nan=False,
                        sort_keys=True,
                        indent=2,
                    )
                    + "\n",
                    encoding="utf-8",
                    newline="",
                )
                temporary_sidecar.replace(sidecar)
            finally:
                temporary_sidecar.unlink(missing_ok=True)
        except (
            OSError,
            ValueError,
            TypeError,
            pickle.PicklingError,
            json.JSONDecodeError,
        ) as exc:
            raise ModelPersistenceError(
                f"Unable to persist model artifact {destination}: {exc}"
            ) from exc
        logger.info(
            "Model persisted: path=%s, sha256=%s",
            destination,
            final_metadata.sha256,
        )
        return final_metadata

    def load(self, source: Path) -> Model:
        """Verify the saved model digest before loading trusted joblib content."""
        sidecar = _metadata_path(source)
        if not source.is_file() or not sidecar.is_file():
            raise ModelPersistenceError(
                f"Model artifact or metadata sidecar is missing: {source}."
            )
        try:
            metadata = json.loads(sidecar.read_text(encoding="utf-8"))
            actual_hash = _sha256_file(source)
            if metadata.get("sha256") != actual_hash:
                raise ModelPersistenceError(f"Model artifact hash mismatch: {source}.")
            loaded = joblib.load(source)
        except ModelPersistenceError:
            raise
        except (OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
            raise ModelPersistenceError(
                f"Unable to load model artifact {source}: {exc}"
            ) from exc
        if not isinstance(loaded, Model):
            raise ModelPersistenceError(
                f"Artifact does not contain a registered Model implementation: {source}."
            )
        return loaded


def _metadata_path(model_path: Path) -> Path:
    """Return the deterministic JSON sidecar filename."""
    return model_path.with_name(f"{model_path.name}.metadata.json")


def _temporary_path(destination: Path) -> Path:
    """Create a unique, closed temporary sibling file path."""
    with tempfile.NamedTemporaryFile(
        dir=destination.parent,
        prefix=f".{destination.name}.",
        suffix=".tmp",
        delete=False,
    ) as temporary_file:
        return Path(temporary_file.name)


def _sha256_file(path: Path) -> str:
    """Compute an artifact digest with bounded-memory reads."""
    digest = hashlib.sha256()
    with path.open("rb") as artifact_file:
        for chunk in iter(lambda: artifact_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _metadata_payload(metadata: ModelArtifactMetadata) -> dict[str, object]:
    """Convert model metadata to a JSON-compatible mapping."""
    return {
        "model_name": metadata.model_name,
        "configuration": _json_value(metadata.configuration),
        "feature_count": metadata.feature_count,
        "feature_names": list(metadata.feature_names),
        "target_classes": list(metadata.target_classes),
        "sklearn_version": metadata.sklearn_version,
        "validation_metrics": _json_value(metadata.validation_metrics),
        "test_metrics": _json_value(metadata.test_metrics),
        "sha256": metadata.sha256,
        "model_details": _json_value(metadata.model_details),
        "library_version": metadata.library_version,
    }


def _json_value(value: object) -> object:
    """Normalize nested mappings and sequences for JSON sidecar encoding."""
    if isinstance(value, dict):
        return {str(key): _json_value(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [_json_value(item) for item in value]
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    raise ModelPersistenceError(
        f"Metadata contains unsupported JSON value: {type(value).__name__}."
    )
