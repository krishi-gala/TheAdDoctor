from sqlalchemy import Column, Integer, Boolean, DateTime, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class WeeklyInventory(Base):
    __tablename__ = "weekly_inventory"

    inventory_id = Column(Integer, primary_key=True, index=True)
    format_id = Column(Integer, ForeignKey("ad_formats.format_id"), nullable=False)
    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)
    weekly_limit = Column(Integer, nullable=False)
    booked_slots = Column(Integer, default=0, nullable=False)
    remaining_slots = Column(Integer, nullable=False)
    is_sold_out = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint('format_id', 'week_start', name='uq_format_week_start'),
    )

    format = relationship("AdFormat")
