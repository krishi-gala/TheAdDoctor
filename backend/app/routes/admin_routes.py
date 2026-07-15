from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.permissions import permission_required
from app.auth.permission_names import VIEW_DASHBOARD
from app.core.database import get_db
from app.services.dashboard_service import get_dashboard_stats

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


from app.services.search_service import global_search

@router.get("/dashboard")
def admin_dashboard(
    current_user: dict = Depends(permission_required(VIEW_DASHBOARD)),
    db: Session = Depends(get_db)
):
    return get_dashboard_stats(db)

@router.get("/search")
def search_global(
    q: str,
    current_user: dict = Depends(permission_required(VIEW_DASHBOARD)),
    db: Session = Depends(get_db)
):
    return global_search(db, q)