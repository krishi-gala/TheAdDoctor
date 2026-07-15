from datetime import datetime
from typing import Optional

from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session , joinedload

from app.models.user import User
from app.models.campaign_booking import CampaignBooking
from app.models.transaction import Transaction
from app.models.package import Package

SORTABLE_FIELDS = {
    "company_name": User.company_name,
    "email": User.email,
    "created_at": User.created_at,
    "is_active": User.is_active,
}

def base_brand_query(db: Session):
    return (
        db.query(User)
        .options(joinedload(User.wallet))
        .filter(
            User.role == "brand",
            User.is_deleted == False,
        )
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
def get_package_name(user: User) -> str:
    wallet = user.wallet

    if not wallet:
        return "No Package"

    # expired package
    if wallet.package_expiry:
        expiry = wallet.package_expiry.replace(tzinfo=None)

        if expiry < datetime.utcnow():
            return "Expired"

    # active package
    if wallet.active_package:
        return wallet.active_package.package_name

    return "No Package"

def serialize_brand_list(user: User) -> dict:
    wallet = user.wallet
    is_expired = False
    remaining_credits = None

    if wallet:
        if wallet.package_expiry:
            expiry = wallet.package_expiry.replace(tzinfo=None)
            is_expired = expiry < datetime.utcnow()
        else:
            is_expired = True

        if not is_expired:
            remaining_credits = wallet.total_credits - (wallet.used_credits or 0)

    return {
        "user_id": user.user_id,
        "company_name": user.company_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "business_type": user.business_type,
        "package": get_package_name(user),
        "is_active": user.is_active,
        "remaining_credits": remaining_credits,
        "created_at": (
            user.created_at.isoformat()
            if user.created_at
            else None
        ),
    }


def serialize_brand_detail(db: Session, user: User) -> dict:
    wallet = user.wallet
    package_expiry = None
    is_expired = False

    if wallet and wallet.package_expiry:
        package_expiry = wallet.package_expiry.isoformat()
        is_expired = wallet.package_expiry.replace(tzinfo=None) < datetime.utcnow()

    wallet_balance = None
    if wallet and not is_expired:
        wallet_balance = f"{wallet.total_credits - (wallet.used_credits or 0)} Credits"

    purchased_pkgs_rows = db.query(Package.package_name).join(
        Transaction, Transaction.package_id == Package.package_id
    ).filter(
        Transaction.brand_id == user.user_id,
        Transaction.payment_status.in_(["completed", "success"]),
        Transaction.expiry_date > datetime.utcnow()
    ).distinct().all()
    purchased_packages = [r[0] for r in purchased_pkgs_rows]

    campaign_count = db.query(CampaignBooking).filter(
        CampaignBooking.brand_id == user.user_id
    ).count()

    return {
        "user_id": user.user_id,
        "company_name": user.company_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "business_type": user.business_type,
        "package": get_package_name(user),
        "package_expiry": package_expiry,
        "is_package_expired": is_expired,
        "status": "active" if user.is_active else "inactive",
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "wallet_balance": wallet_balance,
        "purchased_packages": purchased_packages,
        "campaign_count": campaign_count,
    }



