from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.auth.permissions import permission_required
from app.auth.permission_names import VIEW_DASHBOARD
from app.core.database import SessionLocal

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def admin_dashboard(
    current_user: dict = Depends(permission_required(VIEW_DASHBOARD)),
):
    db: Session = SessionLocal()

    total_brands = db.execute(
        text("""
            SELECT COUNT(*) 
            FROM users
            WHERE role = 'brand'
            AND (is_deleted = 0 OR is_deleted IS NULL)
        """)
    ).scalar()

    db.close()

    return {
        "total_brands": total_brands
    }