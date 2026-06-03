from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.auth.permissions import permission_required
from app.auth.permission_names import MANAGE_BOOKINGS, PURCHASE_PACKAGE
from app.schemas.ad_format_schema import (
    AdFormatPaginatedResponse,
    AdFormatUpdate,
    AdFormatStatusUpdate,
    AdFormatResponse,
    AdFormatBrandResponse
)
from app.schemas.inventory_schema import AdminInventoryResponse
from app.services.ad_format_service import (
    get_admin_ad_formats,
    update_ad_format,
    update_ad_format_status,
    get_brand_ad_formats
)
from app.services.inventory_service import get_admin_inventory

router = APIRouter(tags=["Ad Formats & Inventory"])

# Admin Routes

@router.get("/admin/ad-formats", response_model=AdFormatPaginatedResponse)
def api_get_admin_ad_formats(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    search: Optional[str] = None,
    status: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return get_admin_ad_formats(db, skip, limit, search, status)

@router.put("/admin/ad-formats/{format_id}", response_model=AdFormatResponse)
def api_update_ad_format(
    format_id: int,
    ad_format_data: AdFormatUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return update_ad_format(db, format_id, ad_format_data, current_user["user_id"])

@router.patch("/admin/ad-formats/{format_id}/status", response_model=AdFormatResponse)
def api_update_ad_format_status(
    format_id: int,
    status_data: AdFormatStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return update_ad_format_status(db, format_id, status_data, current_user["user_id"])

@router.get("/admin/inventory", response_model=List[AdminInventoryResponse])
def api_get_admin_inventory(
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(MANAGE_BOOKINGS))
):
    return get_admin_inventory(db)


# Brand Routes

@router.get("/brand/ad-formats", response_model=List[AdFormatBrandResponse])
def api_get_brand_ad_formats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(permission_required(PURCHASE_PACKAGE))
):
    return get_brand_ad_formats(db)
