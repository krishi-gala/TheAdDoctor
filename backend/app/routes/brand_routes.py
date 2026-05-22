from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import SessionLocal
from app.core.security import admin_required
from app.core.password import hash_password
from app.models.user import User
from app.schemas.brand_schema import BrandCreate, BrandUpdate, BrandStatusPatch

router = APIRouter(
    prefix="/admin",
    tags=["Brand Management"],
)


def serialize_brand(user: User) -> dict:
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


def get_brand_or_404(db: Session, brand_id: int) -> User:
    brand = (
        db.query(User)
        .filter(
            User.user_id == brand_id,
            User.role == "brand",
            User.is_deleted == False,
        )
        .first()
    )
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.get("/brands")
def list_brands(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query("all"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(admin_required),
):
    db = SessionLocal()
    try:
        query = db.query(User).filter(
            User.role == "brand",
            User.is_deleted == False,
        )

        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    User.company_name.like(term),
                    User.email.like(term),
                    User.phone_number.like(term),
                )
            )

        if status == "active":
            query = query.filter(User.is_active == True)
        elif status == "inactive":
            query = query.filter(User.is_active == False)

        total = query.count()
        brands = (
            query.order_by(User.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        total_pages = max(1, (total + page_size - 1) // page_size) if total else 1

        return {
            "brands": [serialize_brand(b) for b in brands],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }
    finally:
        db.close()


@router.post("/brands", status_code=201)
def create_brand(
    payload: BrandCreate,
    current_user: dict = Depends(admin_required),
):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        brand = User(
            company_name=payload.company_name,
            email=payload.email,
            password_hash=hash_password(payload.password),
            role="brand",
            is_active=payload.is_active,
            is_deleted=False,
            phone_number=payload.phone_number,
            business_type=payload.business_type,
            package=payload.package,
        )
        db.add(brand)
        db.commit()
        db.refresh(brand)
        return {
            "message": "Brand created successfully",
            "brand": serialize_brand(brand),
        }
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        db.close()


@router.put("/brands/{brand_id}")
def update_brand(
    brand_id: int,
    payload: BrandUpdate,
    current_user: dict = Depends(admin_required),
):
    db = SessionLocal()
    try:
        brand = get_brand_or_404(db, brand_id)
        data = payload.model_dump(exclude_unset=True)

        if "email" in data:
            duplicate = (
                db.query(User)
                .filter(User.email == data["email"], User.user_id != brand_id)
                .first()
            )
            if duplicate:
                raise HTTPException(status_code=400, detail="Email already registered")
            brand.email = data["email"]

        if "company_name" in data:
            brand.company_name = data["company_name"]
        if "phone_number" in data:
            brand.phone_number = data["phone_number"]
        if "business_type" in data:
            brand.business_type = data["business_type"]
        if "package" in data:
            brand.package = data["package"]
        if "is_active" in data:
            brand.is_active = data["is_active"]
        if "password" in data and data["password"]:
            brand.password_hash = hash_password(data["password"])

        db.commit()
        db.refresh(brand)
        return {
            "message": "Brand updated successfully",
            "brand": serialize_brand(brand),
        }
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        db.close()


@router.delete("/brands/{brand_id}")
def delete_brand(
    brand_id: int,
    current_user: dict = Depends(admin_required),
):
    db = SessionLocal()
    try:
        brand = get_brand_or_404(db, brand_id)
        brand.is_deleted = True
        brand.is_active = False
        db.commit()
        return {"message": "Brand deleted successfully"}
    finally:
        db.close()


@router.patch("/brands/{brand_id}/status")
def update_brand_status(
    brand_id: int,
    payload: BrandStatusPatch,
    current_user: dict = Depends(admin_required),
):
    db = SessionLocal()
    try:
        brand = get_brand_or_404(db, brand_id)
        brand.is_active = payload.is_active
        db.commit()
        db.refresh(brand)
        return {
            "message": "Brand status updated",
            "brand": serialize_brand(brand),
        }
    finally:
        db.close()
