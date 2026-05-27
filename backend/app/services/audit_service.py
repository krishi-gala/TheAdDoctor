from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    *,
    action_by: int,
    action_type: str,
    target_user_id: int | None = None,
    description: str | None = None,
) -> None:
    db.add(
        AuditLog(
            action_by=action_by,
            action_type=action_type,
            target_user_id=target_user_id,
            description=description,
        )
    )
