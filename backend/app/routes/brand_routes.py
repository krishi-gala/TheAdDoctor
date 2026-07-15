from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload


from datetime import datetime, timedelta

from app.models.brand_wallet import BrandWallet
from app.models.package import Package
from app.auth.permission_names import MANAGE_BRANDS
from app.auth.permissions import permission_required
from app.core.database import SessionLocal , get_db
from app.models.audit_log import AuditLog
from app.core.password import hash_password
from app.models.user import User
from app.schemas.brand_schema import BrandCreate, BrandStatusPatch, BrandUpdate, BrandCreditsUpdate, BrandPasswordReset
from app.services.audit_service import create_audit_log
from app.services.brand_service import (
    apply_search,
    apply_sort,
    apply_status_filter,
    base_brand_query,
    serialize_brand_detail,
    serialize_brand_list,
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
    return {"brand": serialize_brand_detail(db, brand)}


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
            description=f'Admin created brand "{brand.company_name}"',
            target_type="brand",
            target_id=brand.user_id,
            metadata={"brand_name": brand.company_name, "email": brand.email},
            severity="success",
            is_notification=False
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
                .filter(
                    User.email == email,
                    User.user_id != brand_id
                )
                .first()
            )

            if duplicate:
                raise HTTPException(
                    status_code=400,
                    detail="Email already registered"
                )

            brand.email = email

        if "company_name" in data:
            brand.company_name = data["company_name"].strip()

        if "phone_number" in data:
            brand.phone_number = data["phone_number"]

        if "business_type" in data:
            brand.business_type = data["business_type"]

        # Package update (REAL source = wallet)
        if "package" in data:
            package_name = data["package"]

            package = (
                db.query(Package)
                .filter(
                    Package.package_name == package_name
                )
                .first()
            )

            if not package:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid package selected"
                )

            wallet = brand.wallet

            expiry_date = datetime.utcnow() + timedelta(
                days=package.validity_days
            )

            if wallet:
                wallet.active_package_id = package.package_id
                wallet.total_credits = package.credits
                wallet.used_credits = 0
                wallet.package_expiry = expiry_date
            else:
                wallet = BrandWallet(
                    brand_id=brand.user_id,
                    active_package_id=package.package_id,
                    total_credits=package.credits,
                    used_credits=0,
                    package_expiry=expiry_date,
                )
                db.add(wallet)

            # temporary sync
            brand.package = package.package_name

        if "is_active" in data:
            brand.is_active = data["is_active"]

        if "password" in data and data["password"]:
            brand.password_hash = hash_password(
                data["password"]
            )

        create_audit_log(
            db,
            action_by=get_actor_id(current_user),
            action_type="brand_update",
            target_user_id=brand.user_id,
            description=f'Admin updated brand "{brand.company_name}"',
            target_type="brand",
            target_id=brand.user_id,
            metadata={"brand_name": brand.company_name},
            severity="success",
            is_notification=False
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
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Could not update brand: {str(e)}"
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
            description=f'Admin {"activated" if payload.is_active else "deactivated"} brand "{brand.company_name}"',
            target_type="brand",
            target_id=brand.user_id,
            metadata={"brand_name": brand.company_name, "is_active": payload.is_active},
            severity="info",
            is_notification=False
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

@router.patch("/brands/{brand_id}/credits")
def update_brand_credits(
    brand_id: int,
    payload: BrandCreditsUpdate,
    current_user: dict = Depends(permission_required(MANAGE_BRANDS)),
    db: Session = Depends(get_db),
):
    try:
        brand = get_brand_or_404(db, brand_id)
        wallet = brand.wallet

        if not wallet:
            raise HTTPException(status_code=400, detail="Brand has no active wallet/package to update credits.")

        remaining = wallet.total_credits - (wallet.used_credits or 0)

        if payload.action == "deduct":
            if remaining < payload.amount:
                raise HTTPException(status_code=400, detail="Cannot deduct more than available credits")
            wallet.used_credits = (wallet.used_credits or 0) + payload.amount
        elif payload.action == "add":
            wallet.total_credits = (wallet.total_credits or 0) + payload.amount

        description = f"Admin {payload.action}ed {payload.amount} credits"
        create_audit_log(
            db,
            action_by=get_actor_id(current_user),
            action_type="brand_credits_updated",
            target_user_id=brand.user_id,
            description=f'Admin {payload.action}ed {payload.amount} credits for brand "{brand.company_name}"',
            target_type="brand",
            target_id=brand.user_id,
            metadata={"brand_name": brand.company_name, "action": payload.action, "amount": payload.amount},
            severity="success",
            is_notification=True
        )

        db.commit()
        db.refresh(brand)

        return {
            "message": f"{payload.amount} credits {payload.action}ed successfully",
            "brand": serialize_brand_list(brand),
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Could not update brand credits: {str(e)}"
        )


@router.patch("/brands/{brand_id}/reset-password")
def reset_brand_password(
    brand_id: int,
    payload: BrandPasswordReset,
    current_user: dict = Depends(permission_required(MANAGE_BRANDS)),
    db: Session = Depends(get_db),
):
    try:
        brand = get_brand_or_404(db, brand_id)

        brand.password_hash = hash_password(payload.password)

        create_audit_log(
            db,
            action_by=get_actor_id(current_user),
            action_type="brand_password_reset",
            target_user_id=brand.user_id,
            description=f'Admin reset password for brand "{brand.company_name}"',
            target_type="brand",
            target_id=brand.user_id,
            metadata={"brand_name": brand.company_name},
            severity="warning",
            is_notification=False
        )

        db.commit()

        return {"message": "Password reset successfully"}

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Could not reset password: {str(e)}"
        )

@router.get("/brands/{brand_id}/history")
def get_brand_history(
    brand_id: int,
    current_user: dict = Depends(permission_required(MANAGE_BRANDS)),
    db: Session = Depends(get_db),
):
    brand = get_brand_or_404(db, brand_id)
    logs = db.query(AuditLog).filter(
        AuditLog.target_user_id == brand.user_id
    ).order_by(AuditLog.created_at.desc()).all()

    return {
        "history": [
            {
                "audit_id": log.audit_id,
                "action_type": log.action_type,
                "description": log.description,
                "severity": log.severity,
                "created_at": log.created_at.isoformat() if log.created_at else None,
                "metadata": log.metadata_
            }
            for log in logs
        ]
    }