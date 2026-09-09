import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.engine import Base


class SoilReport(Base):
    __tablename__ = "soil_reports"

    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    farm_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("farms.farm_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ph_level: Mapped[float | None] = mapped_column(Float, nullable=True)
    moisture_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    nitrogen_ppm: Mapped[float | None] = mapped_column(Float, nullable=True)
    phosphorus_ppm: Mapped[float | None] = mapped_column(Float, nullable=True)
    potassium_ppm: Mapped[float | None] = mapped_column(Float, nullable=True)
    organic_matter_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    farm: Mapped["Farm"] = relationship("Farm", back_populates="soil_reports")  # noqa: F821

    __table_args__ = (Index("idx_soil_reports_farm", "farm_id"),)
