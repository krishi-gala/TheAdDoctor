from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class SmartTiming(Base):
    __tablename__ = "smart_timing"

    recommendation_id = Column(Integer, primary_key=True, index=True)
    business_type = Column(String(100), nullable=False)
    format_slug = Column(String(100), nullable=False)
    prime_time_start = Column(String(50), nullable=True)
    prime_time_end = Column(String(50), nullable=True)
    best_day = Column(String(50), nullable=True)
    high_engagement_window = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )

