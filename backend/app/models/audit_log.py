from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(Integer, primary_key=True, index=True)
    action_by = Column(Integer, nullable=False)
    action_type = Column(String(50), nullable=False)
    target_user_id = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
