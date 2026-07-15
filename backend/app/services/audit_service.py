from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    *,
    action_by: int,
    action_type: str,
    target_user_id: Optional[int] = None,
    description: Optional[str] = None,
    target_type: Optional[str] = None,
    target_id: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
    severity: str = "info",
    is_notification: bool = False,
) -> AuditLog:
    new_log = AuditLog(
        action_by=action_by,
        action_type=action_type,
        target_user_id=target_user_id,
        description=description,
        target_type=target_type,
        target_id=target_id,
        metadata_=metadata,
        severity=severity,
        is_notification=is_notification,
        notification_read=False if is_notification else None
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


def get_recent_activity(db: Session, limit: int = 10) -> List[AuditLog]:
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()


def get_notifications(db: Session, user_id: int, limit: int = 20) -> List[AuditLog]:
    return db.query(AuditLog).filter(
        AuditLog.is_notification == True,
        AuditLog.target_user_id == user_id
    ).order_by(AuditLog.created_at.desc()).limit(limit).all()


def get_unread_notification_count(db: Session, user_id: int) -> int:
    return db.query(AuditLog).filter(
        AuditLog.is_notification == True,
        AuditLog.notification_read == False,
        AuditLog.target_user_id == user_id
    ).count()


def mark_notification_read(db: Session, audit_id: int, user_id: int) -> bool:
    log = db.query(AuditLog).filter(
        AuditLog.audit_id == audit_id,
        AuditLog.target_user_id == user_id
    ).first()
    
    if log:
        log.notification_read = True
        db.commit()
        return True
    return False


def mark_all_notifications_read(db: Session, user_id: int) -> bool:
    logs = db.query(AuditLog).filter(
        AuditLog.is_notification == True,
        AuditLog.notification_read == False,
        AuditLog.target_user_id == user_id
    ).all()
    
    for log in logs:
        log.notification_read = True
        
    if logs:
        db.commit()
    return True
