from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, Numeric, String

from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, nullable=False, index=True)
    package_id = Column(Integer, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    credits_added = Column(Integer, nullable=False)
    payment_status = Column(String(50), nullable=False)
    transaction_reference = Column(String(100), nullable=True)
    purchased_at = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
