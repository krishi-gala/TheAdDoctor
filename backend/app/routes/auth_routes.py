from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.schemas.auth_schema import LoginRequest
from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.core.password import verify_password


router = APIRouter()


@router.post("/login")
def login(user: LoginRequest):

    db: Session = SessionLocal()

    query = text("""
        SELECT * FROM users
        WHERE email = :email
    """)

    result = db.execute(
        query,
        {"email": user.email}
    ).fetchone()

    db.close()

    if not result:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email"
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
            detail="Invalid Password"
        )

    token = create_access_token(
        {
            "user_id": result.user_id,
            "email": result.email,
            "role": result.role
        }
    )

    return {
        "message": "Login Successful",
        "access_token": token,
        "token_type": "bearer",
        "role": result.role
    }