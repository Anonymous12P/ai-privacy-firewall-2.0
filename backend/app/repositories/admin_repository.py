"""Read-only repository adapters for administrative views."""

import json
from pathlib import Path

from app.auth.dependencies import auth_service
from app.models.factory import ModelFactory
from app.models.registry import ModelRegistry
from app.repositories.scan_repository import (
    ScanRepository,
    StoredScan,
    default_scan_repository,
)
from app.services.auth_service import AuthService, UserRecord


class AdminRepository:
    """Read shared application state without duplicating persisted data."""

    def __init__(
        self,
        scan_repository: ScanRepository | None = None,
        model_registry: ModelRegistry | None = None,
        user_service: AuthService | None = None,
    ) -> None:
        """Create an administrative read boundary."""
        self._scan_repository = scan_repository or default_scan_repository
        self._model_registry = model_registry or ModelRegistry()
        ModelFactory(registry=self._model_registry)
        self._user_service: AuthService | None
        if user_service is not None:
            self._user_service = user_service
        elif scan_repository is None:
            self._user_service = auth_service
        else:
            self._user_service = None

    def scans(self) -> tuple[StoredScan, ...]:
        """Return the shared scan snapshot."""
        return self._scan_repository.list()

    def users(self) -> tuple[UserRecord, ...]:
        """Return the shared authentication user snapshot."""
        if self._user_service is not None:
            return self._user_service.list_users()
        return tuple(
            UserRecord(username=user_id, password_hash="")
            for user_id in sorted(
                {scan.user_id for scan in self.scans() if scan.user_id is not None}
            )
        )

    def models(self) -> tuple[tuple[str, bool], ...]:
        """Return registered model names and implementation availability."""
        return tuple(
            (spec.name, spec.implemented) for spec in self._model_registry.list_models()
        )

    def model_metadata(
        self,
        model_name: str,
        model_directory: Path,
    ) -> tuple[bool, dict[str, object] | None]:
        """Return persisted status and optional sidecar metadata."""
        filename = _model_filename(model_name)
        artifact = model_directory / filename
        sidecar = artifact.with_name(f"{artifact.name}.metadata.json")
        if not artifact.is_file():
            return False, None
        if not sidecar.is_file():
            return True, None
        try:
            data = json.loads(sidecar.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return True, None
        return True, data if isinstance(data, dict) else None

    def experiment_artifacts(self, output_directory: Path) -> tuple[Path, ...]:
        """Return files generated beneath the configured experiment directory."""
        if not output_directory.is_dir():
            return ()
        return tuple(
            sorted(path for path in output_directory.rglob("*") if path.is_file())
        )


def _model_filename(model_name: str) -> str:
    return {
        "LogisticRegression": "logistic_regression.joblib",
        "DecisionTree": "decision_tree.joblib",
        "RandomForest": "random_forest.joblib",
        "XGBoost": "xgboost.joblib",
        "LightGBM": "lightgbm.joblib",
        "CatBoost": "catboost.joblib",
    }[model_name]
