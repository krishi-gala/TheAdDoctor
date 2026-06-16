from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.services.smart_timing_service import SmartTimingService
from app.schemas.smart_timing_schema import (
    SmartTimingResponse,
    SmartTimingAdminCreate,
    SmartTimingAdminUpdate,
    SmartTimingStatusUpdate,
    SmartTimingAdminResponse
)
from app.core.security import get_current_user
from app.auth.permissions import permission_required
from app.auth.permission_names import MANAGE_BOOKINGS

router = APIRouter(prefix="/smart-timing", tags=["Smart Timing"])

@router.get("/recommendations/{format_slug}", response_model=List[SmartTimingResponse])
def get_recommendation(
    format_slug: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Returns ALL active timings for the brand's business type + format
    return SmartTimingService.get_recommendation(db, current_user["user_id"], format_slug)

# --- Admin Routes ---

@router.get("/admin/business/{business_type}", response_model=List[SmartTimingAdminResponse])
def get_admin_timings_by_business(
    business_type: str,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return SmartTimingService.get_timings_by_business(db, business_type, include_inactive)

@router.get("/admin/{format_slug}/{business_type}", response_model=List[SmartTimingAdminResponse])
def get_admin_timings(
    format_slug: str,
    business_type: str,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return SmartTimingService.get_timings_by_business_and_format(db, format_slug, business_type, include_inactive)

@router.post("/admin/{format_slug}/{business_type}", response_model=SmartTimingAdminResponse)
def create_admin_timing(
    format_slug: str,
    business_type: str,
    data: SmartTimingAdminCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return SmartTimingService.create_timing(db, format_slug, business_type, data)

@router.put("/admin/{recommendation_id}", response_model=SmartTimingAdminResponse)
def update_admin_timing(
    recommendation_id: int,
    data: SmartTimingAdminUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return SmartTimingService.update_timing(db, recommendation_id, data)

@router.patch("/admin/{recommendation_id}/status", response_model=SmartTimingAdminResponse)
def toggle_admin_timing_status(
    recommendation_id: int,
    data: SmartTimingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return SmartTimingService.toggle_timing_status(db, recommendation_id, data.is_active)

@router.delete("/admin/{recommendation_id}")
def delete_admin_timing(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return SmartTimingService.delete_timing(db, recommendation_id)
