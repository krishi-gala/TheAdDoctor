from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.auth.permissions import permission_required
from app.auth.permission_names import MANAGE_BOOKINGS
from app.schemas.campaign_query_schema import CampaignQueryCreate, AdminCampaignQueryReply, CampaignQueryResponse
from app.services import campaign_query_service

router = APIRouter(tags=["Campaign Queries"])

@router.post("/brand/campaign-queries/{booking_id}", response_model=CampaignQueryResponse, status_code=201)
def raise_query(
    booking_id: int,
    payload: CampaignQueryCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_query_service.raise_campaign_query(
        db, 
        brand_id=current_user["user_id"], 
        booking_id=booking_id, 
        subject=payload.subject, 
        message=payload.message
    )

@router.get("/brand/campaign-queries/{booking_id}", response_model=List[CampaignQueryResponse])
def get_queries_for_booking(
    booking_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return campaign_query_service.get_queries_by_booking(db, booking_id=booking_id, brand_id=current_user["user_id"])

@router.get("/admin/campaign-queries/{booking_id}", response_model=List[CampaignQueryResponse])
def admin_get_queries_for_booking(
    booking_id: int,
    current_user=Depends(permission_required(MANAGE_BOOKINGS)),
    db: Session = Depends(get_db),
):
    return campaign_query_service.get_queries_by_booking(db, booking_id=booking_id)

@router.patch("/admin/campaign-queries/{query_id}/reply", response_model=CampaignQueryResponse)
def admin_reply_to_query(
    query_id: int,
    payload: AdminCampaignQueryReply,
    current_user=Depends(permission_required(MANAGE_BOOKINGS)),
    db: Session = Depends(get_db),
):
    return campaign_query_service.reply_to_campaign_query(
        db,
        admin_id=current_user["user_id"],
        query_id=query_id,
        admin_reply=payload.admin_reply,
        status=payload.status
    )
