from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models.brand_wallet import BrandWallet
from app.models.package import Package
from app.models.user import User


def is_wallet_expired(wallet: BrandWallet) -> bool:
    if not wallet.package_expiry:
        return True
    return wallet.package_expiry.replace(tzinfo=None) < datetime.utcnow()


def get_wallet_by_brand(db: Session, brand_id: int) -> Optional[BrandWallet]:
    return db.query(BrandWallet).filter(BrandWallet.brand_id == brand_id).first()


def get_active_package(db: Session, package_id: Optional[int]) -> Optional[Package]:
    if not package_id:
        return None
    return db.query(Package).filter(Package.package_id == package_id).first()


def serialize_wallet(db: Session, wallet: Optional[BrandWallet], user: User) -> dict:
    if not wallet:
        return {
            "active_package": user.package,
            "active_package_id": None,
            "total_credits": 0,
            "used_credits": 0,
            "remaining_credits": 0,
            "expiry_date": None,
            "is_expired": True,
        }

    expired = is_wallet_expired(wallet)
    active_pkg = get_active_package(db, wallet.active_package_id)
    remaining = 0 if expired else (wallet.remaining_credits or 0)

    return {
        "active_package": active_pkg.package_name if active_pkg else user.package,
        "active_package_id": wallet.active_package_id,
        "total_credits": wallet.total_credits or 0,
        "used_credits": wallet.used_credits or 0,
        "remaining_credits": remaining,
        "expiry_date": (
            wallet.package_expiry.isoformat() if wallet.package_expiry else None
        ),
        "is_expired": expired,
    }


def apply_purchase_to_wallet(
    db: Session,
    *,
    brand_id: int,
    package: Package,
    expiry_date: datetime,
) -> BrandWallet:
    wallet = get_wallet_by_brand(db, brand_id)
    credits = package.credits

    if wallet:
        wallet.active_package_id = package.package_id
        wallet.total_credits = credits
        wallet.used_credits = 0
        wallet.remaining_credits = credits
        wallet.package_expiry = expiry_date
        wallet.updated_at = datetime.utcnow()
    else:
        wallet = BrandWallet(
            brand_id=brand_id,
            active_package_id=package.package_id,
            total_credits=credits,
            used_credits=0,
            remaining_credits=credits,
            package_expiry=expiry_date,
        )
        db.add(wallet)

    return wallet


def calculate_expiry(validity_days: int) -> datetime:
    return datetime.utcnow() + timedelta(days=validity_days)
