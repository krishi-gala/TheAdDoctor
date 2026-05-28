from datetime import datetime ,timezone
from sqlalchemy.orm import relationship


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
    transactions = relationship(
    "Transaction",
    back_populates="package"
)
    is_active = Column(Boolean, default=True)
    created_at = Column(
    DateTime,
    default=lambda: datetime.now(timezone.utc)
)   
   

updated_at = Column(
    DateTime,
    default=lambda: datetime.now(timezone.utc),
    onupdate=lambda: datetime.now(timezone.utc)
)