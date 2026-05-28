from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.permission_names import MANAGE_BRANDS
from app.auth.permissions import permission_required
from app.core.database import SessionLocal , get_db
from app.core.password import hash_password
from app.models.user import User
from app.schemas.brand_schema import BrandCreate, BrandStatusPatch, BrandUpdate
from app.services.audit_service import create_audit_log
from app.services.brand_service import (
    apply_search,
    apply_sort,
    apply_status_filter,
    base_brand_query,
    serialize_brand_detail,
    serialize_brand_list,
    touch_updated_at,
)

router = APIRouter(
    prefix="/admin",
    tags=["Brand Management"],
)



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


def get_actor_id(current_user: dict) -> int:
    actor_id = current_user.get("user_id")
    if not actor_id:
        raise HTTPException(status_code=401, detail="Invalid session")
    return int(actor_id)


@router.get("/brands")
def list_brands(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query("all"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    sort_by: Literal[
        "company_name", "email", "created_at", "is_active", "package"
    ] = Query("created_at"),
    sort_dir: Literal["asc", "desc"] = Query("desc"),
    current_user: dict = Depends(permission_required(MANAGE_BRANDS)),
    db: Session = Depends(get_db),
):
    query = base_brand_query(db)
    query = apply_search(query, search)
    query = apply_status_filter(query, status)
    query = apply_sort(query, sort_by, sort_dir)

    total = query.count()
    brands = (
        query.offset((page - 1) * page_size).limit(page_size).all()
    )
    total_pages = max(1, (total + page_size - 1) // page_size) if total else 1

    return {
        "brands": [serialize_brand_list(b) for b in brands],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "sort_by": sort_by,
        "sort_dir": sort_dir,
    }


@router.get("/brands/{brand_id}")
def get_brand(
    brand_id: int,
    current_user: dict = Depends(permission_required(MANAGE_BRANDS)),
    db: Session = Depends(get_db),
):
    brand = get_brand_or_404(db, brand_id)
    return {"brand": serialize_brand_detail(brand)}


@router.post("/brands", status_code=201)
def create_brand(
    payload: BrandCreate,
    current_user: dict = Depends(permission_required(MANAGE_BRANDS)),
    db: Session = Depends(get_db),
):
    try:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        brand = User(
            company_name=payload.company_name.strip(),
            email=str(payload.email).lower(),
            password_hash=hash_password(payload.password),
            role="brand",
            is_active=payload.is_active,
            is_deleted=False,
            phone_number=payload.phone_number,
            business_type=payload.business_type,
            package=payload.package,
        )
        db.add(brand)
       
        create_audit_log(
            db,
            action_by=get_actor_id(current_user),
            action_type="brand_create",
            target_user_id=brand.user_id,
            description="Admin created brand",
        )
        db.commit()
        db.refresh(brand)
        return {
            "message": "Brand created successfully",
            "brand": serialize_brand_list(brand),
        }
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Could not create brand: {str(e)}"
        )


@router.put("/brands/{brand_id}")
def update_brand(
    brand_id: int,
    payload: BrandUpdate,
    current_user: dict = Depends(permission_required(MANAGE_BRANDS)),
    db: Session = Depends(get_db),
):
    try:
        brand = get_brand_or_404(db, brand_id)
        data = payload.model_dump(exclude_unset=True)

        if "email" in data:
            email = str(data["email"]).lower()
            duplicate = (
                db.query(User)
                .filter(User.email == email, User.user_id != brand_id)
                .first()
            )
            if duplicate:
                raise HTTPException(
                    status_code=400, detail="Email already registered"
                )
            brand.email = email

        if "company_name" in data:
            brand.company_name = data["company_name"].strip()
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

        touch_updated_at(brand)
        create_audit_log(
            db,
            action_by=get_actor_id(current_user),
            action_type="brand_update",
            target_user_id=brand.user_id,
            description="Admin updated brand",
        )
        db.commit()
        db.refresh(brand)
        return {
            "message": "Brand updated successfully",
            "brand": serialize_brand_list(brand),
        }
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")


@router.delete("/brands/{brand_id}")
def delete_brand(
    brand_id: int,
    current_user: dict = Depends(permission_required(MANAGE_BRANDS)),
    db: Session = Depends(get_db),
):
    try:
        brand = get_brand_or_404(db, brand_id)

        brand.is_deleted = True
        brand.is_active = False
        touch_updated_at(brand)

        create_audit_log(
            db,
            action_by=get_actor_id(current_user),
            action_type="brand_deleted",
            target_user_id=brand.user_id,
            description="Admin deleted brand",
        )

        db.commit()

        return {"message": "Brand deleted successfully"}

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Could not delete brand: {str(e)}"
        )

@router.patch("/brands/{brand_id}/status")
def update_brand_status(
    brand_id: int,
    payload: BrandStatusPatch,
    current_user: dict = Depends(permission_required(MANAGE_BRANDS)),
    db: Session = Depends(get_db),
):
    try:
        brand = get_brand_or_404(db, brand_id)

        brand.is_active = payload.is_active
        touch_updated_at(brand)

        description = (
            "Admin activated brand"
            if payload.is_active
            else "Admin deactivated brand"
        )

        create_audit_log(
            db,
            action_by=get_actor_id(current_user),
            action_type="brand_status_updated",
            target_user_id=brand.user_id,
            description=description,
        )

        db.commit()
        db.refresh(brand)

        return {
            "message": "Brand status updated",
            "brand": serialize_brand_list(brand),
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Could not update brand status: {str(e)}"
        )