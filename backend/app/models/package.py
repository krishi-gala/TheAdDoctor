from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, Numeric, String, Text

from app.core.database import Base


class Package(Base):
    __tablename__ = "packages"

    package_id = Column(Integer, primary_key=True, index=True)
    package_name = Column(String(255), nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    credits = Column(Integer, nullable=False)
    validity_days = Column(Integer, nullable=False, default=30)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
