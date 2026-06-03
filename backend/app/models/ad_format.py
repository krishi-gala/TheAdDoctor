from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class AdFormat(Base):
    __tablename__ = "ad_formats"

    format_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    format_category = Column(String(50), nullable=True)
    weekly_limit = Column(Integer, default=5, nullable=False)
    standard_credits = Column(Integer, nullable=False)
    prime_credits = Column(Integer, nullable=False)
    estimated_performance = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )
