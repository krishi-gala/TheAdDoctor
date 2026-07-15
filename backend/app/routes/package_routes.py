from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.auth.permissions import permission_required

from app.models.brand_wallet import BrandWallet
from app.models.package import Package
from app.models.user import User

from app.schemas.package_schema import (
    PackageCreate,
    PackageUpdate,
    PackageStatusPatch,
)

from app.services.package_service import (
    base_package_query,
    apply_search,
    apply_status_filter,
    apply_sort,
    serialize_package,
)

from app.services.transaction_service import (
    purchase_package,
    list_transactions,
)

from app.services.wallet_service import (
    get_wallet_by_brand,
    serialize_wallet,
)

from app.services.audit_service import create_audit_log

router = APIRouter(tags=["Packages"])


# ==========================
# ADMIN PACKAGE MANAGEMENT
# ==========================

@router.get(
    "/admin/packages",
    dependencies=[Depends(permission_required("manage_packages"))]
)
def get_packages(
    search: str = "",
    status: str = "all",
    page: int = 1,
    page_size: int = 10,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    db: Session = Depends(get_db),
):

    query = base_package_query(db)

    query = apply_search(query, search)
    query = apply_status_filter(query, status)
    query = apply_sort(query, sort_by, sort_dir)

    total = query.count()

    packages = (
        query.offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "packages": [
            serialize_package(pkg)
            for pkg in packages
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (
            total + page_size - 1
        ) // page_size,
    }


@router.post(
    "/admin/packages",
    dependencies=[Depends(permission_required("manage_packages"))]
)
def create_package(
    payload: PackageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        existing = db.query(Package).filter(
            Package.package_name == payload.package_name
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Package already exists"
            )

        package = Package(**payload.model_dump())
        db.add(package)
        db.flush()

        create_audit_log(
            db,
            action_by=current_user["user_id"],
            action_type="package_created",
            description=f'Admin created package "{package.package_name}"',
            target_type="package",
            target_id=package.package_id,
            metadata={"package_name": package.package_name},
            severity="success",
            is_notification=False
        )

        db.commit()
        db.refresh(package)

        return {
            "message": "Package created successfully",
            "package": serialize_package(package)
        }

    except HTTPException:
        db.rollback()
        raise

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Package already exists"
        )

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Could not create package: {str(exc)}"
        )


@router.put(
    "/admin/packages/{package_id}",
    dependencies=[Depends(permission_required("manage_packages"))]
)
def update_package(
    package_id: int,
    payload: PackageUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        package = db.query(Package).filter(
            Package.package_id == package_id
        ).first()

        if not package:
            raise HTTPException(
                status_code=404,
                detail="Package not found"
            )

        old_package_name = package.package_name

        for key, value in payload.model_dump(
            exclude_unset=True
        ).items():
            setattr(package, key, value)

        db.flush()

        if payload.package_name and payload.package_name != old_package_name:
            (
                db.query(User)
                .join(BrandWallet, BrandWallet.brand_id == User.user_id)
                .filter(BrandWallet.active_package_id == package.package_id)
                .update(
                    {User.package: package.package_name},
                    synchronize_session=False,
                )
            )

        db.commit()
        db.refresh(package)

        create_audit_log(
            db,
            action_by=current_user["user_id"],
            action_type="package_updated",
            description=f'Admin updated package "{package.package_name}"',
            target_type="package",
            target_id=package.package_id,
            metadata={"package_name": package.package_name},
            severity="success",
            is_notification=False
        )

        return {
            "message": "Package updated successfully",
            "package": serialize_package(package)
        }

    except HTTPException:
        db.rollback()
        raise

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not update package"
        )

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Could not update package: {str(exc)}"
        )


@router.patch(
    "/admin/packages/{package_id}/status",
    dependencies=[Depends(permission_required("manage_packages"))]
)
def toggle_package_status(
    package_id: int,
    payload: PackageStatusPatch,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    package = db.query(Package).filter(
        Package.package_id == package_id
    ).first()

    if not package:
        raise HTTPException(
            status_code=404,
            detail="Package not found"
        )

    package.is_active = payload.is_active

    db.commit()

    create_audit_log(
        db,
        action_by=current_user["user_id"],
        action_type="package_status_changed",
        description=f'Admin {"activated" if payload.is_active else "disabled"} package "{package.package_name}"',
        target_type="package",
        target_id=package.package_id,
        metadata={"package_name": package.package_name, "is_active": payload.is_active},
        severity="info",
        is_notification=False
    )

    return {
        "message": "Status updated successfully"
    }


