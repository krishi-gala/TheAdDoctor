from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.services.campaign_booking_service import CampaignBookingService
from app.schemas.campaign_booking_schema import (
    CampaignBookingCreate,
    CampaignBookingResponse,
    CampaignBookingStatusUpdate
)
from app.core.security import get_current_user
from app.auth.permissions import permission_required
from app.auth.permission_names import APPROVE_CAMPAIGNS

router = APIRouter(prefix="/bookings", tags=["Campaign Bookings"])

@router.post("/", response_model=CampaignBookingResponse)
def create_booking(
    data: CampaignBookingCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return CampaignBookingService.create_booking(db, current_user["user_id"], data)

@router.get("/my-bookings", response_model=List[CampaignBookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return CampaignBookingService.get_brand_bookings(db, current_user["user_id"])

# --- Admin Routes ---

@router.get("/admin/all", response_model=List[CampaignBookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(APPROVE_CAMPAIGNS))
):
    return CampaignBookingService.get_all_bookings(db)

@router.patch("/admin/{booking_id}/status", response_model=CampaignBookingResponse)
def update_booking_status(
    booking_id: int,
    data: CampaignBookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(APPROVE_CAMPAIGNS))
):
    return CampaignBookingService.update_booking_status(db, booking_id, data)

@router.get("/admin/pending-count")
def get_pending_count(
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(APPROVE_CAMPAIGNS))
):
    from app.models.campaign_booking import CampaignBooking
    count = db.query(CampaignBooking).filter(CampaignBooking.booking_status == "pending").count()
    return {"count": count}
# Trigger hot reload 3


