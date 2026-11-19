"""Pydantic contracts for scan requests and responses."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

ScanModelName = Literal["LogisticRegression", "DecisionTree", "RandomForest", "XGBoost"]
ScanStatus = Literal["PENDING", "RUNNING", "COMPLETED", "FAILED"]


class ScanRequest(BaseModel):
    """Validated feature vector submitted for prediction."""

    features: dict[str, float] = Field(min_length=1)
    model_name: ScanModelName = "LogisticRegression"
    subject_id: str | None = Field(default=None, min_length=1, max_length=128)
    url: str | None = Field(default=None, max_length=2048)


class ScanResponse(BaseModel):
    """Stored scan prediction and explanation summary."""

    scan_id: str
    status: ScanStatus
    prediction: str | int | float | bool | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    risk_level: Literal["low", "medium", "high"] | None = None
    firewall_action: str | None = None
    policy_name: str | None = None
    reasons: list[str] = Field(default_factory=list)
    warning: str | None = None
    restriction_notice: str | None = None
    timestamp: datetime
    created_at: datetime
    explanation_summary: str | None = None
    completed_at: datetime | None = None
    error: str | None = None


class ScanNotFoundResponse(BaseModel):
    """Document the missing-scan response."""

    detail: str
