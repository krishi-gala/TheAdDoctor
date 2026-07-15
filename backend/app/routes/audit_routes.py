from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services import audit_service
from app.schemas.audit_schema import AuditLogResponse, AuditLogUnreadCountResponse

router = APIRouter(prefix="/audit", tags=["Audit & Notifications"])


@router.get("/live-activity", response_model=List[AuditLogResponse])
def get_live_activity(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get recent live activity (all logs).
    Admin only or platform wide. For now we assume admins use this dashboard.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return audit_service.get_recent_activity(db, limit=limit)


@router.get("/notifications", response_model=List[AuditLogResponse])
def get_notifications(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get notifications for the current user.
    """
    return audit_service.get_notifications(db, user_id=current_user.user_id, limit=limit)


@router.get("/notifications/unread-count", response_model=AuditLogUnreadCountResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get unread notifications count for the current user.
    """
    count = audit_service.get_unread_notification_count(db, user_id=current_user.user_id)
    return {"unread_count": count}


@router.patch("/notifications/{audit_id}/read")
def mark_notification_read(
    audit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark a specific notification as read.
    """
    success = audit_service.mark_notification_read(db, audit_id=audit_id, user_id=current_user.user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}


@router.patch("/notifications/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark all notifications as read for the current user.
    """
    audit_service.mark_all_notifications_read(db, user_id=current_user.user_id)
    return {"message": "All notifications marked as read"}
