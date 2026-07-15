from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.ad_format import AdFormat
from app.schemas.ad_format_schema import (
    AdFormatUpdate,
    AdFormatStatusUpdate,
    AdFormatBrandResponse,
    AdFormatPaginatedResponse
)
from app.services.inventory_service import (
    ensure_inventory_for_current_week,
    get_remaining_inventory_for_format,
    get_sold_out_status_for_format
)
from app.services.audit_service import create_audit_log

def get_admin_ad_formats(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    status_filter: bool = None
) -> AdFormatPaginatedResponse:
    query = db.query(AdFormat)
    
    if search:
        query = query.filter(AdFormat.name.ilike(f"%{search}%"))
        
    if status_filter is not None:
        query = query.filter(AdFormat.is_active == status_filter)
        
    total = query.count()
    items = query.order_by(AdFormat.format_id.asc()).offset(skip).limit(limit).all()
    
    return AdFormatPaginatedResponse(
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        size=limit,
        items=items
    )

def update_ad_format(
    db: Session,
    format_id: int,
    ad_format_data: AdFormatUpdate,
    admin_id: int
) -> AdFormat:
    ad_format = db.query(AdFormat).filter(AdFormat.format_id == format_id).first()
    if not ad_format:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ad format not found")
        
    update_data = ad_format_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(ad_format, key, value)
        
    db.commit()
    db.refresh(ad_format)
    
    create_audit_log(
        db=db,
        action_by=admin_id,
        action_type="format_update",
        description=f'Admin updated Ad Format "{ad_format.name}"',
        target_type="ad_format",
        target_id=ad_format.format_id,
        metadata={"format_name": ad_format.name},
        severity="info",
        is_notification=False
    )
    
    return ad_format

def update_ad_format_status(
    db: Session,
    format_id: int,
    status_data: AdFormatStatusUpdate,
    admin_id: int
) -> AdFormat:
    ad_format = db.query(AdFormat).filter(AdFormat.format_id == format_id).first()
    if not ad_format:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ad format not found")
        
    ad_format.is_active = status_data.is_active
    db.commit()
    db.refresh(ad_format)
    
    create_audit_log(
        db=db,
        action_by=admin_id,
        action_type="format_status_change",
        description=f'Admin {"activated" if status_data.is_active else "deactivated"} Ad Format "{ad_format.name}"',
        target_type="ad_format",
        target_id=ad_format.format_id,
        metadata={"format_name": ad_format.name, "is_active": status_data.is_active},
        severity="info",
        is_notification=False
    )
    
    return ad_format

def get_brand_ad_formats(db: Session) -> list[AdFormatBrandResponse]:
    ensure_inventory_for_current_week(db)
    
    formats = db.query(AdFormat).filter(AdFormat.is_active == True).all()
    
    response = []
    for f in formats:
        remaining = get_remaining_inventory_for_format(db, f.format_id)
        sold_out = get_sold_out_status_for_format(db, f.format_id)
        
        response.append(AdFormatBrandResponse(
            format_id=f.format_id,
            name=f.name,
            slug=f.slug,
            standard_credits=f.standard_credits,
            prime_credits=f.prime_credits,
            estimated_performance=f.estimated_performance,
            remaining_inventory=remaining,
            weekly_limit=f.weekly_limit,
            sold_out=sold_out
        ))
        
    return response
