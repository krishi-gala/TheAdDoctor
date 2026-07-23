from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from app.models.campaign_query import CampaignQuery
from app.models.campaign_booking import CampaignBooking
from app.models.user import User
from app.services.audit_service import create_audit_log
from fastapi import HTTPException

def raise_campaign_query(db: Session, brand_id: int, booking_id: int, subject: str, message: str) -> CampaignQuery:
    booking = db.query(CampaignBooking).filter(
        CampaignBooking.booking_id == booking_id,
        CampaignBooking.brand_id == brand_id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or not owned by you.")
    
    if booking.booking_status != "approved":
        raise HTTPException(status_code=400, detail="You can only raise queries for approved campaigns.")

    query = CampaignQuery(
        booking_id=booking_id,
        brand_id=brand_id,
        subject=subject,
        message=message
    )
    db.add(query)
    db.commit()
    db.refresh(query)

    # Notify admins
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        create_audit_log(
            db,
            action_by=brand_id,
            action_type="campaign_query_raised",
            target_user_id=admin.user_id,
            description=f"New query raised on booking #{booking_id}: {subject}",
            target_type="campaign_booking",
            target_id=booking_id,
            is_notification=True,
            severity="info"
        )
        
    return query

def get_queries_by_booking(db: Session, booking_id: int, brand_id: Optional[int] = None) -> List[CampaignQuery]:
    q = db.query(CampaignQuery).filter(CampaignQuery.booking_id == booking_id)
    if brand_id:
        q = q.filter(CampaignQuery.brand_id == brand_id)
    return q.order_by(CampaignQuery.created_at.asc()).all()

def reply_to_campaign_query(db: Session, admin_id: int, query_id: int, admin_reply: str, status: str) -> CampaignQuery:
    query = db.query(CampaignQuery).filter(CampaignQuery.query_id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found.")

    query.admin_reply = admin_reply
    query.status = status
    query.replied_at = datetime.now(timezone.utc)
    db.commit()

    # Notify the brand
    create_audit_log(
        db,
        action_by=admin_id,
        action_type="campaign_query_replied",
        target_user_id=query.brand_id,
        description=f"Admin replied to your query on booking #{query.booking_id}",
        target_type="campaign_query",
        target_id=query.query_id,
        is_notification=True,
        severity="success" if status == "resolved" else "info"
    )

    return query
