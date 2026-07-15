from datetime import datetime
from app.core.database import Base
from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    String,
    Text,
    ForeignKey,
    JSON,
    Boolean
)

from datetime import datetime, timezone


class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(Integer, primary_key=True, index=True)
    action_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )
    action_type = Column(String(50), nullable=False)
    target_user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=True
    )
    description = Column(Text, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
    target_type = Column(String(50), nullable=True)
    target_id = Column(Integer, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    severity = Column(String(20), default="info")
    is_notification = Column(Boolean, default=False)
    notification_read = Column(Boolean, default=False)
