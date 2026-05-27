from datetime import datetime
from typing import Optional

from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session

from app.models.user import User

SORTABLE_FIELDS = {
    "company_name": User.company_name,
    "email": User.email,
    "created_at": User.created_at,
    "is_active": User.is_active,
    "package": User.package,
}


def base_brand_query(db: Session):
    return db.query(User).filter(
        User.role == "brand",
        User.is_deleted == False,
    )


def apply_search(query, search: Optional[str]):
    if not search:
        return query
    term = f"%{search.strip()}%"
    return query.filter(
        or_(
            User.company_name.like(term),
            User.email.like(term),
        )
    )


def apply_status_filter(query, status: Optional[str]):
    if status == "active":
        return query.filter(User.is_active == True)
    if status == "inactive":
        return query.filter(User.is_active == False)
    return query


def apply_sort(query, sort_by: str, sort_dir: str):
    column = SORTABLE_FIELDS.get(sort_by, User.created_at)
    direction = asc if sort_dir == "asc" else desc
    return query.order_by(direction(column))


def serialize_brand_list(user: User) -> dict:
    return {
        "user_id": user.user_id,
        "company_name": user.company_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "business_type": user.business_type,
        "package": user.package,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def serialize_brand_detail(user: User) -> dict:
    return {
        "user_id": user.user_id,
        "company_name": user.company_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "business_type": user.business_type,
        "package": user.package,
        "status": "active" if user.is_active else "inactive",
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "wallet_balance": None,
        "purchased_packages": [],
        "campaign_count": 0,
    }


def touch_updated_at(brand: User) -> None:
    brand.updated_at = datetime.utcnow()
