"""Pydantic response contracts for administrative endpoints."""

from pydantic import BaseModel, Field


class SystemAdminResponse(BaseModel):
    """Application and runtime status."""

    app_name: str
    version: str
    environment: str
    python_version: str
    database_mode: str
    total_scans: int = Field(ge=0)
    registered_api_routes: int = Field(ge=0)
    authentication_enabled: bool
    uptime_seconds: float | None = Field(default=None, ge=0.0)


class AdminModelInfo(BaseModel):
    """Availability and persistence status for one model."""

    name: str
    available: bool
    persisted: bool
    metadata: dict[str, object] | None = None


class AdminModelsResponse(BaseModel):
    """Registered model inventory."""

    models: list[AdminModelInfo]


class AdminUserInfo(BaseModel):
    """Administrative user activity summary."""

    username: str
    scan_count: int = Field(ge=0)
    last_activity: str | None = None


class AdminUsersResponse(BaseModel):
    """Registered user inventory."""

    total_users: int = Field(ge=0)
    users: list[AdminUserInfo]


class AdminExperimentInfo(BaseModel):
    """Configured or discovered experiment summary."""

    experiment_name: str
    dataset_path: str
    selected_models: list[str]
    feature_count: int | None = Field(default=None, ge=0)
    explainability_enabled: bool
    output_directory: str
    generated_artifact_count: int = Field(ge=0)


class AdminExperimentsResponse(BaseModel):
    """Experiment inventory."""

    experiments: list[AdminExperimentInfo]
