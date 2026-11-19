"""Add asynchronous lifecycle fields to scans.

Revision ID: 20261108_0002
Revises: 20261108_0001
Create Date: 2026-11-08
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision = "20261108_0002"
down_revision = "20261108_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Make scan results nullable and add lifecycle state fields."""
    with op.batch_alter_table("scans") as batch:
        batch.alter_column("prediction", existing_type=sa.JSON(), nullable=True)
        batch.alter_column("confidence", existing_type=sa.Float(), nullable=True)
        batch.alter_column(
            "risk_level", existing_type=sa.String(length=16), nullable=True
        )
        batch.add_column(
            sa.Column(
                "status",
                sa.String(length=16),
                nullable=False,
                server_default="COMPLETED",
            )
        )
        batch.add_column(sa.Column("completed_at", sa.DateTime(timezone=True)))
        batch.add_column(sa.Column("error", sa.String(length=4096)))


def downgrade() -> None:
    """Remove asynchronous lifecycle state fields."""
    with op.batch_alter_table("scans") as batch:
        batch.drop_column("error")
        batch.drop_column("completed_at")
        batch.drop_column("status")
        batch.alter_column(
            "risk_level", existing_type=sa.String(length=16), nullable=False
        )
        batch.alter_column("confidence", existing_type=sa.Float(), nullable=False)
        batch.alter_column("prediction", existing_type=sa.JSON(), nullable=False)
