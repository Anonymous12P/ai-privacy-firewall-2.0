"""Application settings loaded from environment variables and backend/.env."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.constants import (
    DEFAULT_APP_ENV,
    DEFAULT_APP_NAME,
    DEFAULT_APP_VERSION,
    DEFAULT_DEBUG,
    DEFAULT_LOG_LEVEL,
)

BACKEND_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
DEFAULT_DATA_ROOT = Path(__file__).resolve().parents[2] / "data"
DEFAULT_MODEL_DIRECTORY = DEFAULT_DATA_ROOT / "experiments" / "default"


class Settings(BaseSettings):
    """Validated application settings."""

    app_name: str = DEFAULT_APP_NAME
    app_version: str = DEFAULT_APP_VERSION
    app_env: str = DEFAULT_APP_ENV
    debug: bool = DEFAULT_DEBUG
    log_level: str = DEFAULT_LOG_LEVEL

    @field_validator("debug", mode="before")
    @classmethod
    def _parse_debug(cls, value: object) -> bool:
        if isinstance(value, str):
            return value.strip().lower() in (
                "true",
                "1",
                "t",
                "yes",
                "y",
                "debug",
                "dev",
                "development",
            )
        return bool(value)

    cors_origins: str = Field(
        default="http://localhost,http://127.0.0.1,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173,http://localhost:8000",
        alias="CORS_ORIGINS",
    )
    allow_only_logging: bool = Field(default=False, alias="ALLOW_ONLY_LOGGING")
    jwt_secret_key: str = Field(
        default="development-only-change-this-secret",
        alias="JWT_SECRET_KEY",
    )
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=30,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES",
        gt=0,
    )
    data_root: Path = Field(default=DEFAULT_DATA_ROOT, alias="DATA_ROOT")
    raw_data_dir: Path = Field(default=DEFAULT_DATA_ROOT / "raw", alias="RAW_DATA_DIR")
    interim_data_dir: Path = Field(
        default=DEFAULT_DATA_ROOT / "interim",
        alias="INTERIM_DATA_DIR",
    )
    processed_data_dir: Path = Field(
        default=DEFAULT_DATA_ROOT / "processed",
        alias="PROCESSED_DATA_DIR",
    )
    model_directory: Path = Field(
        default=DEFAULT_MODEL_DIRECTORY,
        alias="MODEL_DIRECTORY",
    )
    external_data_dir: Path = Field(
        default=DEFAULT_DATA_ROOT / "external",
        alias="EXTERNAL_DATA_DIR",
    )
    database_url: str = Field(
        ...,
        alias="DATABASE_URL",
    )

    @model_validator(mode="after")
    def derive_dataset_directories(self) -> "Settings":
        """Default dataset folders beneath the configured data root."""
        for field_name, folder_name in (
            ("raw_data_dir", "raw"),
            ("interim_data_dir", "interim"),
            ("processed_data_dir", "processed"),
            ("external_data_dir", "external"),
        ):
            if field_name not in self.model_fields_set:
                setattr(self, field_name, self.data_root / folder_name)
        if "model_directory" not in self.model_fields_set:
            self.model_directory = self.data_root / "experiments" / "default"
        return self

    model_config = SettingsConfigDict(
        env_file=BACKEND_ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return the cached application settings instance."""
    return Settings()  # type: ignore[call-arg]
