from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.permissions import permission_required
from app.auth.permission_names import VIEW_REPORTS
from app.core.database import get_db
from app.services.reports_service import get_full_reports

router = APIRouter(
    prefix="/admin",
    tags=["Reports"]
)


@router.get("/reports")
def admin_reports(
    current_user: dict = Depends(permission_required(VIEW_REPORTS)),
    db: Session = Depends(get_db)
):
    return get_full_reports(db)
