from datetime import datetime

from sqlalchemy import Column, DateTime, Integer

from app.core.database import Base


class BrandWallet(Base):
    __tablename__ = "brand_wallet"

    wallet_id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, nullable=False, index=True)
    active_package_id = Column(Integer, nullable=True)
    total_credits = Column(Integer, default=0)
    used_credits = Column(Integer, default=0)
    remaining_credits = Column(Integer, default=0)
    package_expiry = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
