"""create farms, soil_reports, crop_history tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-01-02 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "farms",
        sa.Column("farm_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("region", sa.String(255), nullable=True),
        sa.Column("area_hectares", sa.Float(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("current_crop", sa.String(100), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("farm_id"),
    )
    op.create_index("idx_farms_user", "farms", ["user_id"])

    op.create_table(
        "soil_reports",
        sa.Column("report_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("farm_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ph_level", sa.Float(), nullable=True),
        sa.Column("moisture_percent", sa.Float(), nullable=True),
        sa.Column("nitrogen_ppm", sa.Float(), nullable=True),
        sa.Column("phosphorus_ppm", sa.Float(), nullable=True),
        sa.Column("potassium_ppm", sa.Float(), nullable=True),
        sa.Column("organic_matter_percent", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "reported_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["farm_id"], ["farms.farm_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("report_id"),
    )
    op.create_index("idx_soil_reports_farm", "soil_reports", ["farm_id"])

    op.create_table(
        "crop_history",
        sa.Column("history_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("farm_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("crop_name", sa.String(100), nullable=False),
        sa.Column("sown_date", sa.Date(), nullable=True),
        sa.Column("harvest_date", sa.Date(), nullable=True),
        sa.Column("yield_tons", sa.Float(), nullable=True),
        sa.Column("season", sa.String(50), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["farm_id"], ["farms.farm_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("history_id"),
    )
    op.create_index("idx_crop_history_farm", "crop_history", ["farm_id"])


def downgrade() -> None:
    op.drop_index("idx_crop_history_farm", table_name="crop_history")
    op.drop_table("crop_history")
    op.drop_index("idx_soil_reports_farm", table_name="soil_reports")
    op.drop_table("soil_reports")
    op.drop_index("idx_farms_user", table_name="farms")
    op.drop_table("farms")
