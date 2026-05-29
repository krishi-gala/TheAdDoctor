from sqlalchemy.orm import Session
from app.models.user import User


def get_dashboard_stats(db: Session) -> dict:
    total_brands = db.query(User).filter(
        User.role == "brand",
        User.is_deleted == False
    ).count()

    return {
        "total_brands": total_brands
    }