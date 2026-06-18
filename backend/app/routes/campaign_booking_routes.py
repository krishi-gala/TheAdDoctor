from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.services.campaign_booking_service import CampaignBookingService
from app.schemas.campaign_booking_schema import (
    CampaignBookingCreate,
    CampaignBookingResponse,
    CampaignBookingStatusUpdate,
    CampaignBookingQueryUpdate
)
from app.core.security import get_current_user
from app.auth.permissions import permission_required
from app.auth.permission_names import APPROVE_CAMPAIGNS, MANAGE_BOOKINGS

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

@router.patch("/{booking_id}/query", response_model=CampaignBookingResponse)
def submit_brand_query(
    booking_id: int,
    data: CampaignBookingQueryUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return CampaignBookingService.submit_brand_query(
        db,
        booking_id,
        current_user["user_id"],
        data.brand_query,
    )

@router.get("/{booking_id}/query", response_model=CampaignBookingResponse)
def fetch_brand_query(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return CampaignBookingService.get_brand_query(db, booking_id, current_user)

# --- Admin Routes ---

@router.get("/admin/all", response_model=List[CampaignBookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(APPROVE_CAMPAIGNS))
):
    return CampaignBookingService.get_all_bookings(db)

@router.get("/admin/approved", response_model=List[CampaignBookingResponse])
def get_approved_bookings(
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return CampaignBookingService.get_approved_bookings(db)

@router.patch("/admin/{booking_id}/status", response_model=CampaignBookingResponse)
def update_booking_status(
    booking_id: int,
    data: CampaignBookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(APPROVE_CAMPAIGNS))
):
    return CampaignBookingService.update_booking_status(db, booking_id, data)

@router.patch("/admin/{booking_id}/manage", response_model=CampaignBookingResponse)
def manage_booking(
    booking_id: int,
    data: CampaignBookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return CampaignBookingService.update_booking_status(db, booking_id, data)

@router.patch("/admin/{booking_id}/query/resolve", response_model=CampaignBookingResponse)
def resolve_brand_query(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    permissions = current_user.get("permissions", [])
    if MANAGE_BOOKINGS not in permissions and APPROVE_CAMPAIGNS not in permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied",
        )
    return CampaignBookingService.resolve_brand_query(db, booking_id)

@router.get("/admin/pending-count")
def get_pending_count(
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(APPROVE_CAMPAIGNS))
):
    from app.models.campaign_booking import CampaignBooking
    count = db.query(CampaignBooking).filter(CampaignBooking.booking_status == "pending").count()
    return {"count": count}
# Trigger hot reload 3
