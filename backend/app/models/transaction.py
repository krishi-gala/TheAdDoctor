from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    Numeric,
    String,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    brand_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    package_id = Column(
        Integer,
        ForeignKey("packages.package_id"),
        nullable=False
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    credits_added = Column(
        Integer,
        nullable=False
    )

    payment_status = Column(
        String(50),
        nullable=False
    )

    transaction_reference = Column(
        String(100),
        nullable=True
    )

    purchased_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    expiry_date = Column(
        DateTime,
        nullable=True
    )

    # Relationships
    brand = relationship(
        "User",
        back_populates="transactions"
    )

    package = relationship(
        "Package",
        back_populates="transactions"
    )