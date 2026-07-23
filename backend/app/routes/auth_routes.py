from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.schemas.auth_schema import LoginRequest, ChangePasswordRequest
from app.schemas.password_reset_schema import ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import create_access_token, get_current_user
from app.core.password import verify_password, set_password
from app.services.password_reset_service import (
    RESET_MESSAGE,
    get_valid_reset_token,
    request_password_reset,
    reset_password,
)
from app.services.permission_service import resolve_user_permissions
from app.core.database import get_db
from app.models.user import User

router = APIRouter()


@router.post("/auth/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    try:
        request_password_reset(db, request.email)
    except Exception:
        db.rollback()
    return {"message": RESET_MESSAGE}


@router.get("/auth/reset-password/{token}")
def validate_reset_password_token(token: str, db: Session = Depends(get_db)):
    get_valid_reset_token(db, token)
    return {"valid": True}


@router.post("/auth/reset-password")
def complete_reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_password(db, request.token, request.new_password)
    return {"message": "Password reset successfully"}


@router.post("/login")
def login(
    user: LoginRequest,
    db: Session = Depends(get_db),
):

    query = text("""
        SELECT *
        FROM users
        WHERE email = :email
    """)

    user_record = db.execute(
        query,
        {"email": user.email}
    ).fetchone()

    if not user_record:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if getattr(user_record, "is_deleted", False):
        raise HTTPException(
            status_code=401,
            detail="Account is deactivated"
        )

    if not user_record.is_active:
        raise HTTPException(
            status_code=401,
            detail="Account is inactive"
        )

    if not verify_password(
        user.password,
        user_record.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    role_id = getattr(user_record, "role_id", None)

    permissions = resolve_user_permissions(
        role_name=user_record.role,
        role_id=role_id,
        db=db,
    )

    token = create_access_token({
        "user_id": user_record.user_id,
        "email": user_record.email,
        "role": user_record.role,
        "role_id": role_id,
        "permissions": permissions,
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "role": user_record.role,
        "permissions": permissions,
    }


@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.user_id == current_user.user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(request.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid current password")
        
    set_password(user, request.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}
