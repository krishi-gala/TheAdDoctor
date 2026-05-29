from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.schemas.auth_schema import LoginRequest
from app.core.security import create_access_token
from app.core.password import verify_password
from app.services.permission_service import resolve_user_permissions
from app.core.database import get_db

router = APIRouter()


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