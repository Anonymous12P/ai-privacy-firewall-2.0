"""Create users and scans tables.

Revision ID: 20261108_0001
Revises:
Create Date: 2026-11-08
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision = "20261108_0001"
down_revision = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create persisted authentication and scan tables."""
    op.create_table(
        "users",
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("username"),
    )
    op.create_table(
        "scans",
        sa.Column("scan_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=50), nullable=True),
        sa.Column("url", sa.String(length=2048), nullable=True),
        sa.Column("prediction", sa.JSON(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("risk_level", sa.String(length=16), nullable=False),
        sa.Column("model_name", sa.String(length=64), nullable=True),
        sa.Column("explanation_summary", sa.String(length=4096), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.username"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("scan_id"),
    )
    op.create_index("ix_scans_user_id", "scans", ["user_id"])
    op.create_index("ix_scans_timestamp", "scans", ["timestamp"])
    op.create_index("ix_scans_risk_level", "scans", ["risk_level"])


def downgrade() -> None:
    """Drop persisted scan and user tables."""
    op.drop_index("ix_scans_risk_level", table_name="scans")
    op.drop_index("ix_scans_timestamp", table_name="scans")
    op.drop_index("ix_scans_user_id", table_name="scans")
    op.drop_table("scans")
    op.drop_table("users")
