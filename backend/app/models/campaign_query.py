from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class CampaignQuery(Base):
    __tablename__ = "campaign_queries"

    query_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("campaign_bookings.booking_id"), nullable=False, index=True)
    brand_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="open", nullable=False)   # open | resolved
    
    admin_reply = Column(Text, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    booking = relationship("CampaignBooking", back_populates="queries")
    brand = relationship("User", foreign_keys=[brand_id])
