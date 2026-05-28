from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class BrandWallet(Base):
    __tablename__ = "brand_wallet"

    wallet_id = Column(Integer, primary_key=True, index=True)

    brand_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    active_package_id = Column(
        Integer,
        ForeignKey("packages.package_id"),
        nullable=True
    )

    total_credits = Column(Integer, default=0)
    used_credits = Column(Integer, default=0)

    package_expiry = Column(DateTime, nullable=True)

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    brand = relationship(
        "User",
        back_populates="wallet"
    )

    # Computed field
    @property
    def remaining_credits(self):
        return self.total_credits - self.used_credits