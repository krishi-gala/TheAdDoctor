from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class AuditLogResponse(BaseModel):
    audit_id: int
    action_by: int
    action_type: str
    target_user_id: Optional[int] = None
    description: Optional[str] = None
    created_at: datetime
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    metadata_: Optional[Dict[str, Any]] = None
    severity: Optional[str] = None
    is_notification: bool = False
    notification_read: Optional[bool] = None

    class Config:
        from_attributes = True

class AuditLogUnreadCountResponse(BaseModel):
    unread_count: int
