from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session

from app.models.package import Package

SORTABLE_FIELDS = {
    "package_name": Package.package_name,
    "price": Package.price,
    "credits": Package.credits,
    "validity_days": Package.validity_days,
    "is_active": Package.is_active,
    "created_at": Package.created_at,
}

DEFAULT_PACKAGES = [
    {
        "package_name": "Starter Pack",
        "price": Decimal("7500.00"),
        "credits": 60,
        "validity_days": 30,
        "description": "Ideal for small businesses starting with digital advertising.",
    },
    {
        "package_name": "Growth Pack",
        "price": Decimal("15000.00"),
        "credits": 150,
        "validity_days": 30,
        "description": "Scale campaigns with more credits and consistent reach.",
    },
    {
        "package_name": "Scale Pack",
        "price": Decimal("30000.00"),
        "credits": 320,
        "validity_days": 30,
        "description": "High-volume brands running multiple concurrent campaigns.",
    },
    {
        "package_name": "Power Pack",
        "price": Decimal("60000.00"),
        "credits": 700,
        "validity_days": 30,
        "description": "Enterprise-grade credit pool for aggressive growth targets.",
    },
]


def base_package_query(db: Session):
    return db.query(Package)


def apply_search(query, search: Optional[str]):
    if not search:
        return query
    term = f"%{search.strip()}%"
    return query.filter(
        or_(
            Package.package_name.like(term),
            Package.description.like(term),
        )
    )


def apply_status_filter(query, status: Optional[str]):
    if status == "active":
        return query.filter(Package.is_active == True)
    if status == "inactive":
        return query.filter(Package.is_active == False)
    return query


def apply_sort(query, sort_by: str, sort_dir: str):
    column = SORTABLE_FIELDS.get(sort_by, Package.created_at)
    direction = asc if sort_dir == "asc" else desc
    return query.order_by(direction(column))


def serialize_package(pkg: Package) -> dict:
    return {
        "package_id": pkg.package_id,
        "package_name": pkg.package_name,
        "price": float(pkg.price) if pkg.price is not None else 0,
        "credits": pkg.credits,
        "validity_days": pkg.validity_days,
        "description": pkg.description,
        "is_active": bool(pkg.is_active),
        "created_at": pkg.created_at.isoformat() if pkg.created_at else None,
        
    }


def serialize_package_catalog(pkg: Package) -> dict:
    return {
        "package_id": pkg.package_id,
        "package_name": pkg.package_name,
        "price": float(pkg.price) if pkg.price is not None else 0,
        "credits": pkg.credits,
        "validity_days": pkg.validity_days,
        "description": pkg.description,
    }


def touch_updated_at(pkg: Package) -> None:
    pkg.updated_at = datetime.utcnow()


def seed_default_packages(db: Session) -> None:
    if db.query(Package).count() > 0:
        return

    for item in DEFAULT_PACKAGES:
        db.add(
            Package(
                package_name=item["package_name"],
                price=item["price"],
                credits=item["credits"],
                validity_days=item["validity_days"],
                description=item["description"],
                is_active=True,
            )
        )
    db.commit()
