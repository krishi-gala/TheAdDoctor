from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Enum
from sqlalchemy.sql import func
from app.core.database import Base

class CampaignBooking(Base):
    __tablename__ = "campaign_bookings"

    booking_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    brand_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    format_slug = Column(String(50), ForeignKey("ad_formats.slug"), nullable=False)
    business_type = Column(String(50), nullable=False)
    booking_date = Column(String(50), nullable=True)
    booking_time = Column(String(50), nullable=False)
    timing_type = Column(String(20), nullable=False) # 'recommended' or 'custom'
    additional_notes = Column(String(500), nullable=True)
    admin_notes = Column(String(500), nullable=True)
    credit_type = Column(String(20), nullable=True)
    credits_used = Column(Integer, nullable=False)
    booking_status = Column(String(20), default="pending", nullable=False) # 'pending', 'approved', 'rejected', 'completed'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
