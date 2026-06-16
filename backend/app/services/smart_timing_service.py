from sqlalchemy.orm import Session
from app.models.smart_timing import SmartTiming
from app.models.user import User
from app.schemas.smart_timing_schema import SmartTimingAdminCreate, SmartTimingAdminUpdate
from fastapi import HTTPException

class SmartTimingService:
    @staticmethod
    def get_recommendation(db: Session, user_id: int, format_slug: str):
        # 1. Fetch logged-in brand to get business_type
        brand = db.query(User).filter(User.user_id == user_id).first()
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
        
        business_type = brand.business_type
        if not business_type:
            # Fallback if brand has no business_type
            return SmartTimingService._get_generic_fallback_list(format_slug)

        # 2. Fetch ALL active timings for this business_type + format
        recommendations = db.query(SmartTiming).filter(
            SmartTiming.business_type == business_type,
            SmartTiming.format_slug == format_slug,
            SmartTiming.is_active == True
        ).all()

        if recommendations:
            return [
                {
                    "recommendation_id": rec.recommendation_id,
                    "business_type": business_type,
                    "format_slug": format_slug,
                    "best_day": rec.best_day,
                    "prime_time": f"{rec.prime_time_start} - {rec.prime_time_end}",
                    "high_engagement_window": rec.high_engagement_window,
                    "source": "smart_timing"
                }
                for rec in recommendations
            ]

        # 3. Return generic fallback as a single-item list
        return SmartTimingService._get_generic_fallback_list(format_slug, business_type)

    @staticmethod
    def _get_generic_fallback_list(format_slug: str, business_type: str = "Generic"):
        return [
            {
                "recommendation_id": None,
                "business_type": business_type,
                "format_slug": format_slug,
                "best_day": "Wednesday",
                "prime_time": "12 PM - 3 PM",
                "high_engagement_window": "Tuesday–Thursday Afternoon",
                "source": "fallback"
            }
        ]

    # --- Admin Methods ---

    @staticmethod
    def get_timings_by_business(db: Session, business_type: str, include_inactive: bool = False):
        query = db.query(SmartTiming).filter(SmartTiming.business_type == business_type)
        if not include_inactive:
            query = query.filter(SmartTiming.is_active == True)
        return query.all()

    @staticmethod
    def get_timings_by_business_and_format(db: Session, format_slug: str, business_type: str, include_inactive: bool = False):
        query = db.query(SmartTiming).filter(
            SmartTiming.business_type == business_type,
            SmartTiming.format_slug == format_slug
        )
        if not include_inactive:
            query = query.filter(SmartTiming.is_active == True)
        return query.all()

    @staticmethod
    def create_timing(db: Session, format_slug: str, business_type: str, data: SmartTimingAdminCreate):
        new_timing = SmartTiming(
            format_slug=format_slug,
            business_type=business_type,
            best_day=data.best_day,
            prime_time_start=data.prime_time_start,
            prime_time_end=data.prime_time_end,
            high_engagement_window=data.high_engagement_window,
            is_active=data.is_active
        )
        db.add(new_timing)
        db.commit()
        db.refresh(new_timing)
        return new_timing

    @staticmethod
    def update_timing(db: Session, recommendation_id: int, data: SmartTimingAdminUpdate):
        timing = db.query(SmartTiming).filter(SmartTiming.recommendation_id == recommendation_id).first()
        if not timing:
            raise HTTPException(status_code=404, detail="Timing not found")
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(timing, key, value)
            
        db.commit()
        db.refresh(timing)
        return timing

    @staticmethod
    def toggle_timing_status(db: Session, recommendation_id: int, is_active: bool):
        timing = db.query(SmartTiming).filter(SmartTiming.recommendation_id == recommendation_id).first()
        if not timing:
            raise HTTPException(status_code=404, detail="Timing not found")
            
        timing.is_active = is_active
        db.commit()
        db.refresh(timing)
        return timing

    @staticmethod
    def delete_timing(db: Session, recommendation_id: int):
        timing = db.query(SmartTiming).filter(SmartTiming.recommendation_id == recommendation_id).first()
        if not timing:
            raise HTTPException(status_code=404, detail="Timing not found")
            
        timing.is_active = False
        db.commit()
        return {"detail": "Timing deleted"}
