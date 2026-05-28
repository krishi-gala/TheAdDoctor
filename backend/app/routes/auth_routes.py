from fastapi import APIRouter, HTTPException , Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.schemas.auth_schema import LoginRequest
from app.core.security import create_access_token
from app.core.password import verify_password
from app.services.permission_service import resolve_user_permissions
from app.core.database import get_db

router = APIRouter()


@router.post("/login")
def login(user: LoginRequest,

    db: Session = Depends(get_db)):

    query = text("""
        SELECT * FROM users
        WHERE email = :email
    """)

    result = db.execute(
        query,
        {"email": user.email}
    ).fetchone()



    if not result:
        raise HTTPException(
            status_code=401,
            detail="Invalid Credentials"
        )

    if getattr(result, "is_deleted", False):
        raise HTTPException(
            status_code=401,
            detail="Account is deactivated"
        )

    if not result.is_active:
        raise HTTPException(
            status_code=401,
            detail="Account is inactive"
        )

    if not verify_password(user.password, result.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid Credentials"
        )

    role_id = getattr(result, "role_id", None)
    permissions = resolve_user_permissions(result.role, role_id)

    token = create_access_token(
        {
            "user_id": result.user_id,
            "email": result.email,
            "role": result.role,
            "role_id": role_id,
            "permissions": permissions,
        }
    )

    return {
        "message": "Login Successful",
        "access_token": token,
        "token_type": "bearer",
        "role": result.role,
        "permissions": permissions,
    }