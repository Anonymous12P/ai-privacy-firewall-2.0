"""Administrative read models and deterministic status calculations."""

import platform
from pathlib import Path

from app.core.config import Settings, get_settings
from app.repositories.admin_repository import AdminRepository
from app.schemas.admin import (
    AdminExperimentInfo,
    AdminExperimentsResponse,
    AdminModelInfo,
    AdminModelsResponse,
    AdminUserInfo,
    AdminUsersResponse,
    SystemAdminResponse,
)


class AdminService:
    """Build administrative views from shared repositories and configuration."""

    def __init__(
        self,
        repository: AdminRepository | None = None,
        settings: Settings | None = None,
        model_directory: Path | None = None,
    ) -> None:
        """Create an administrative service with injectable read boundaries."""
        self._repository = repository or AdminRepository()
        self._settings = settings or get_settings()
        self._model_directory = model_directory or self._settings.model_directory

    def system(
        self,
        registered_api_routes: int,
        uptime_seconds: float | None = None,
    ) -> SystemAdminResponse:
        """Return application, runtime, and storage status."""
        return SystemAdminResponse(
            app_name=self._settings.app_name,
            version=self._settings.app_version,
            environment=self._settings.app_env,
            python_version=platform.python_version(),
            database_mode="in-memory",
            total_scans=len(self._repository.scans()),
            registered_api_routes=registered_api_routes,
            authentication_enabled=True,
            uptime_seconds=uptime_seconds,
        )

    def models(self) -> AdminModelsResponse:
        """Return registered models and persisted artifact metadata."""
        models = []
        for name, available in self._repository.models():
            persisted, metadata = self._repository.model_metadata(
                name,
                self._model_directory,
            )
            models.append(
                AdminModelInfo(
                    name=name,
                    available=available,
                    persisted=persisted,
                    metadata=metadata,
                )
            )
        return AdminModelsResponse(models=models)

    def users(self) -> AdminUsersResponse:
        """Return registered users and scan activity summaries."""
        scans = self._repository.scans()
        users = []
        for user in sorted(self._repository.users(), key=lambda item: item.username):
            user_scans = [scan for scan in scans if scan.user_id == user.username]
            latest = max((scan.timestamp for scan in user_scans), default=None)
            users.append(
                AdminUserInfo(
                    username=user.username,
                    scan_count=len(user_scans),
                    last_activity=latest.isoformat() if latest else None,
                )
            )
        return AdminUsersResponse(total_users=len(users), users=users)

    def experiments(self) -> AdminExperimentsResponse:
        """Return discovered default experiment artifact status."""
        output = (
            Path(__file__).resolve().parents[2] / "data" / "experiments" / "default"
        )
        artifacts = self._repository.experiment_artifacts(output)
        return AdminExperimentsResponse(
            experiments=(
                [
                    AdminExperimentInfo(
                        experiment_name="cert-r4.2-experiment",
                        dataset_path=str(
                            Path(__file__).resolve().parents[2]
                            / "data"
                            / "raw"
                            / "cert_r4.2_subset"
                        ),
                        selected_models=[
                            "LogisticRegression",
                            "DecisionTree",
                            "RandomForest",
                            "XGBoost",
                        ],
                        feature_count=None,
                        explainability_enabled=True,
                        output_directory=str(output),
                        generated_artifact_count=len(artifacts),
                    )
                ]
                if artifacts
                else []
            ),
        )
