"""Audit logging and historical query service for Privacy Firewall events."""

import logging
from collections.abc import Mapping, Sequence
from datetime import UTC, datetime
from typing import Any, Protocol
from uuid import uuid4

from app.core.constants import APP_LOGGER_NAME
from app.schemas.firewall import FirewallAction, FirewallAuditRecord, FirewallRiskLevel

logger = logging.getLogger(f"{APP_LOGGER_NAME}.services.audit")


class AuditRepositoryProtocol(Protocol):
    """Protocol for persisting and querying firewall audit records."""

    def record(self, entry: FirewallAuditRecord) -> FirewallAuditRecord:
        """Persist a single audit record."""
        ...

    def list(
        self,
        *,
        subject_id: str | None = None,
        action: str | None = None,
        risk_level: str | None = None,
        enforced_only: bool | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> tuple[tuple[FirewallAuditRecord, ...], int]:
        """Return a slice of filtered audit records and the total match count."""
        ...


class InMemoryAuditRepository:
    """Thread-safe in-memory audit repository providing fast querying and filtering."""

    def __init__(self) -> None:
        self._records: list[FirewallAuditRecord] = []

    def record(self, entry: FirewallAuditRecord) -> FirewallAuditRecord:
        """Store an audit entry."""
        self._records.append(entry)
        return entry

    def list(
        self,
        *,
        subject_id: str | None = None,
        action: str | None = None,
        risk_level: str | None = None,
        enforced_only: bool | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> tuple[tuple[FirewallAuditRecord, ...], int]:
        """Query stored audit records with sorting (newest first) and filtering."""
        filtered = self._records

        if subject_id is not None:
            filtered = [r for r in filtered if r.subject_id == subject_id]
        if action is not None:
            filtered = [
                r for r in filtered if r.decision == action or r.action == action
            ]
        if risk_level is not None:
            filtered = [
                r for r in filtered if r.risk_level.lower() == risk_level.lower()
            ]
        if enforced_only is True:
            filtered = [r for r in filtered if r.enforced is True]

        sorted_records = sorted(filtered, key=lambda r: r.timestamp, reverse=True)
        total = len(sorted_records)
        slice_items = sorted_records[offset : offset + limit]
        return tuple(slice_items), total


class AuditServiceProtocol(Protocol):
    """Protocol defining the audit service boundary."""

    def record(
        self,
        evaluation_id: str,
        action: str,
        decision: FirewallAction,
        risk_level: FirewallRiskLevel,
        risk_score: float,
        policy_name: str,
        enforced: bool,
        reasons: Sequence[str],
        subject_id: str | None = None,
        resource: str | None = None,
        metadata: Mapping[str, Any] | None = None,
        timestamp: datetime | None = None,
    ) -> FirewallAuditRecord:
        """Record an immutable firewall audit event."""
        ...

    def query(
        self,
        page: int = 1,
        page_size: int = 20,
        subject_id: str | None = None,
        action: str | None = None,
        risk_level: str | None = None,
        enforced_only: bool | None = None,
    ) -> tuple[tuple[FirewallAuditRecord, ...], int]:
        """Query audit events with pagination and filters."""
        ...

    def metrics(self) -> dict[str, int]:
        """Return aggregate audit event metrics."""
        ...


default_audit_repository = InMemoryAuditRepository()


class AuditService:
    """Manages audit trail ingestion, searching, and metric calculations."""

    def __init__(self, repository: AuditRepositoryProtocol | None = None) -> None:
        """Initialize the audit service with an injectable audit repository."""
        self._repository = repository or default_audit_repository

    def record(
        self,
        evaluation_id: str,
        action: str,
        decision: FirewallAction,
        risk_level: FirewallRiskLevel,
        risk_score: float,
        policy_name: str,
        enforced: bool,
        reasons: Sequence[str],
        subject_id: str | None = None,
        resource: str | None = None,
        metadata: Mapping[str, Any] | None = None,
        timestamp: datetime | None = None,
    ) -> FirewallAuditRecord:
        """Record a structured audit log entry."""
        audit_id = str(uuid4())
        event_time = timestamp or datetime.now(UTC)
        record = FirewallAuditRecord(
            audit_id=audit_id,
            evaluation_id=evaluation_id,
            timestamp=event_time,
            subject_id=subject_id,
            resource=resource,
            action=action,
            decision=decision,
            risk_level=risk_level,
            risk_score=round(risk_score, 4),
            policy_name=policy_name,
            enforced=enforced,
            reasons=list(reasons),
            metadata=dict(metadata or {}),
        )
        saved = self._repository.record(record)
        logger.info(
            "Audit event logged: audit_id=%s evaluation_id=%s decision=%s enforced=%s "
            "subject=%s",
            audit_id,
            evaluation_id,
            decision,
            enforced,
            subject_id,
        )
        return saved

    def query(
        self,
        page: int = 1,
        page_size: int = 20,
        subject_id: str | None = None,
        action: str | None = None,
        risk_level: str | None = None,
        enforced_only: bool | None = None,
    ) -> tuple[tuple[FirewallAuditRecord, ...], int]:
        """Query audit trail with pagination and filter criteria."""
        offset = max(0, (page - 1) * page_size)
        return self._repository.list(
            subject_id=subject_id,
            action=action,
            risk_level=risk_level,
            enforced_only=enforced_only,
            limit=page_size,
            offset=offset,
        )

    def metrics(self) -> dict[str, int]:
        """Calculate counts of evaluations, blocks, warnings, and restrictions."""
        all_records, total = self._repository.list(limit=100000, offset=0)
        blocks = sum(1 for r in all_records if r.decision == "BLOCK")
        warnings = sum(1 for r in all_records if r.decision == "WARN")
        restrictions = sum(1 for r in all_records if r.decision == "RESTRICT")
        return {
            "total_evaluations": total,
            "total_blocks": blocks,
            "total_warnings": warnings,
            "total_restrictions": restrictions,
        }
