import logging
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.password import set_password
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.services.audit_service import create_audit_log
from app.services.email_service import send_password_reset_email

logger = logging.getLogger(__name__)
RESET_MESSAGE = "If an account exists for this email, a reset link has been sent."


def _utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def request_password_reset(db: Session, email: str) -> None:
    user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if not user:
        return

    now = _utc_now()
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.user_id,
        PasswordResetToken.used == False,
    ).update({PasswordResetToken.used: True}, synchronize_session=False)

    token_value = secrets.token_urlsafe(32)
    db.add(PasswordResetToken(
        user_id=user.user_id,
        token=token_value,
        expires_at=now + timedelta(minutes=15),
    ))
    db.commit()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    try:
        send_password_reset_email(user.email, f"{frontend_url}/reset-password/{token_value}")
    except Exception:
        logger.exception("Password reset email could not be sent")

    create_audit_log(
        db,
        action_by=user.user_id,
        action_type="forgot_password_requested",
        target_user_id=user.user_id,
        target_type="user",
        target_id=user.user_id,
        description="Password reset email requested",
        severity="info",
        is_notification=False,
    )


def get_valid_reset_token(db: Session, token_value: str) -> PasswordResetToken:
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token_value,
        PasswordResetToken.used == False,
    ).first()
    if not reset_token or reset_token.expires_at <= _utc_now():
        raise HTTPException(status_code=400, detail="Reset token is invalid or expired")
    return reset_token


def reset_password(db: Session, token_value: str, new_password: str) -> None:
    reset_token = get_valid_reset_token(db, token_value)
    user = db.query(User).filter(User.user_id == reset_token.user_id).first()
    if not user or user.is_deleted:
        raise HTTPException(status_code=400, detail="Reset token is invalid or expired")

    set_password(user, new_password)
    reset_token.used = True
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.user_id,
        PasswordResetToken.used == False,
        PasswordResetToken.id != reset_token.id,
    ).update({PasswordResetToken.used: True}, synchronize_session=False)
    db.commit()

    create_audit_log(
        db,
        action_by=user.user_id,
        action_type="password_reset_completed",
        target_user_id=user.user_id,
        target_type="user",
        target_id=user.user_id,
        description="Password reset completed",
        severity="info",
        is_notification=False,
    )