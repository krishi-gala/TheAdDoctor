from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.permissions import permission_required
from app.core.database import get_db
from app.core.security import get_current_user

from app.models.package import Package
from app.models.user import User

from app.services.package_service import serialize_package
from app.services.transaction_service import (
    purchase_package,
    list_transactions,
)
from app.services.wallet_service import (
    get_wallet_by_brand,
    serialize_wallet,
)

router = APIRouter(
    prefix="/brand",
    tags=["Brand"]
)


@router.get(
    "/packages",
    dependencies=[Depends(permission_required("purchase_package"))]
)
def get_brand_packages(
    db: Session = Depends(get_db),
):

    packages = db.query(Package).filter(
        Package.is_active == True
    ).all()

    return {
        "packages": [
            serialize_package(pkg)
            for pkg in packages
        ]
    }


@router.post(
    "/purchase-package/{package_id}",
    dependencies=[Depends(permission_required("purchase_package"))]
)
def buy_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    brand = db.query(User).filter(
        User.user_id == current_user["user_id"]
    ).first()

    package = db.query(Package).filter(
        Package.package_id == package_id,
        Package.is_active == True
    ).first()

    if not package:
        raise HTTPException(
            status_code=404,
            detail="Package unavailable"
        )

    return purchase_package(
        db,
        brand=brand,
        package=package,
        actor_id=current_user["user_id"],
    )


@router.get(
    "/wallet",
    dependencies=[Depends(permission_required("purchase_package"))]
)
def get_wallet(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    user = db.query(User).filter(
        User.user_id == current_user["user_id"]
    ).first()

    wallet = get_wallet_by_brand(
        db,
        current_user["user_id"]
    )

    return serialize_wallet(
        db,
        wallet,
        user
    )


@router.get(
    "/transactions",
    dependencies=[Depends(permission_required("purchase_package"))]
)
def get_transactions(
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return list_transactions(
        db,
        current_user["user_id"],
        page=page,
        page_size=page_size,
    )