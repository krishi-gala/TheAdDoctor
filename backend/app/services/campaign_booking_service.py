import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.campaign_booking import CampaignBooking
from app.models.ad_format import AdFormat
from app.models.user import User
from app.schemas.campaign_booking_schema import CampaignBookingCreate, CampaignBookingStatusUpdate
from app.services.inventory_service import get_remaining_inventory_for_format, deduct_inventory_slot
from app.services.wallet_service import deduct_credits, get_wallet_by_brand, is_wallet_expired

class CampaignBookingService:
    @staticmethod
    def create_booking(db: Session, brand_id: int, data: CampaignBookingCreate):
        # 1. Fetch format
        format = db.query(AdFormat).filter(AdFormat.slug == data.format_slug).first()
        if not format:
            raise HTTPException(status_code=404, detail="Ad Format not found")

        # 2. Check inventory
        remaining = get_remaining_inventory_for_format(db, format.format_id)
        if remaining <= 0:
            raise HTTPException(status_code=400, detail="Inventory sold out for this week")

        # 3. Calculate and deduct credits
        credits_required = format.prime_credits if data.credit_type == "prime" else format.standard_credits
        wallet = get_wallet_by_brand(db, brand_id)
        
        if not wallet or is_wallet_expired(wallet):
            raise HTTPException(status_code=400, detail="No active package or package expired")
            
        remaining_credits = wallet.total_credits - (wallet.used_credits or 0)
        if remaining_credits < credits_required:
            raise HTTPException(status_code=400, detail="Insufficient credits")

        # Deduct credits and inventory
        deducted = deduct_credits(db, brand_id, credits_required)
        if not deducted:
            raise HTTPException(status_code=400, detail="Failed to deduct credits")
            
        inv_deducted = deduct_inventory_slot(db, format.format_id)
        if not inv_deducted:
            raise HTTPException(status_code=400, detail="Failed to deduct inventory slot")

        # 4. Create booking record
        booking = CampaignBooking(
            brand_id=brand_id,
            format_slug=data.format_slug,
            business_type=data.business_type,
            booking_date=data.booking_date,
            booking_time=data.booking_time,
            timing_type=data.timing_type,
            additional_notes=data.additional_notes,
            credit_type=data.credit_type,
            credits_used=credits_required,
            booking_status="pending"
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def _enrich_with_brand_name(db: Session, bookings):
        """Attach brand company_name to each booking as brand_name."""
        result = []
        for booking in bookings:
            user = db.query(User).filter(User.user_id == booking.brand_id).first()
            booking.__dict__["brand_name"] = user.company_name if user else None
            result.append(booking)
        return result

    @staticmethod
    def get_brand_bookings(db: Session, brand_id: int):
        bookings = db.query(CampaignBooking).filter(CampaignBooking.brand_id == brand_id).order_by(CampaignBooking.created_at.desc()).all()
        return CampaignBookingService._enrich_with_brand_name(db, bookings)

    @staticmethod
    def get_all_bookings(db: Session):
        bookings = db.query(CampaignBooking).order_by(CampaignBooking.created_at.desc()).all()
        return CampaignBookingService._enrich_with_brand_name(db, bookings)

    @staticmethod
    def get_approved_bookings(db: Session):
        bookings = (
            db.query(CampaignBooking)
            .filter(CampaignBooking.booking_status == "approved")
            .order_by(CampaignBooking.created_at.desc())
            .all()
        )
        return CampaignBookingService._enrich_with_brand_name(db, bookings)

    @staticmethod
    def update_booking_status(db: Session, booking_id: int, update_data: CampaignBookingStatusUpdate):
        booking = db.query(CampaignBooking).filter(CampaignBooking.booking_id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        previous_status = booking.booking_status
        new_status = update_data.booking_status
        
        booking.booking_status = new_status
        if update_data.admin_notes is not None:
            booking.admin_notes = update_data.admin_notes
            
        if update_data.final_date is not None:
            booking.booking_date = update_data.final_date
        if update_data.final_time is not None:
            booking.booking_time = update_data.final_time
        if update_data.format_slug is not None:
            booking.format_slug = update_data.format_slug
        if update_data.business_type is not None:
            booking.business_type = update_data.business_type
        if update_data.timing_type is not None:
            booking.timing_type = update_data.timing_type
        if update_data.additional_notes is not None:
            booking.additional_notes = update_data.additional_notes
        if update_data.credits_used is not None:
            booking.credits_used = update_data.credits_used
            
        if new_status == "rejected" and previous_status != "rejected":
            from app.services.wallet_service import restore_credits
            from app.services.inventory_service import restore_inventory_slot
            
            print(f"DEBUG: Restoring {booking.credits_used} credits for brand {booking.brand_id} from previous status {previous_status}")
            # Restore credits
            res_cred = restore_credits(db, booking.brand_id, booking.credits_used)
            print(f"DEBUG: restore_credits result: {res_cred}")
            
            # Restore inventory slot
            format = db.query(AdFormat).filter(AdFormat.slug == booking.format_slug).first()
            if format:
                res_inv = restore_inventory_slot(db, format.format_id)
                print(f"DEBUG: restore_inventory_slot result: {res_inv}")
            
        db.commit()
        db.refresh(booking)
        user = db.query(User).filter(User.user_id == booking.brand_id).first()
        booking.__dict__["brand_name"] = user.company_name if user else None
        return booking


