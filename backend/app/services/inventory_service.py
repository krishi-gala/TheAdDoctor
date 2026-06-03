from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List

from app.models.ad_format import AdFormat
from app.models.weekly_inventory import WeeklyInventory
from app.schemas.inventory_schema import AdminInventoryResponse

def get_current_week_dates():
    today = date.today()
    # 0 is Monday, 6 is Sunday
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    return monday, sunday

def ensure_inventory_for_current_week(db: Session):
    monday, sunday = get_current_week_dates()
    
    # Check if inventory exists for this week
    existing_inventory = db.query(WeeklyInventory).filter(
        WeeklyInventory.week_start == monday
    ).all()
    
    existing_format_ids = {inv.format_id for inv in existing_inventory}
    
    # Get all active formats
    active_formats = db.query(AdFormat).filter(AdFormat.is_active == True).all()
    
    new_inventories = []
    for format in active_formats:
        if format.format_id not in existing_format_ids:
            new_inventory = WeeklyInventory(
                format_id=format.format_id,
                week_start=monday,
                week_end=sunday,
                weekly_limit=format.weekly_limit,
                booked_slots=0,
                remaining_slots=format.weekly_limit,
                is_sold_out=format.weekly_limit <= 0
            )
            db.add(new_inventory)
            new_inventories.append(new_inventory)
            
    if new_inventories:
        db.commit()

def get_admin_inventory(db: Session) -> List[AdminInventoryResponse]:
    ensure_inventory_for_current_week(db)
    
    monday, sunday = get_current_week_dates()
    
    inventories = db.query(WeeklyInventory).join(AdFormat).filter(
        WeeklyInventory.week_start == monday,
        AdFormat.is_active == True
    ).all()
    
    response = []
    for inv in inventories:
        response.append(AdminInventoryResponse(
            format=inv.format.name,
            weekly_limit=inv.weekly_limit,
            booked_slots=inv.booked_slots,
            remaining_slots=inv.remaining_slots,
            sold_out=inv.is_sold_out,
            week_start=inv.week_start,
            week_end=inv.week_end
        ))
        
    return response

def get_remaining_inventory_for_format(db: Session, format_id: int) -> int:
    ensure_inventory_for_current_week(db)
    monday, _ = get_current_week_dates()
    
    inv = db.query(WeeklyInventory).filter(
        WeeklyInventory.format_id == format_id,
        WeeklyInventory.week_start == monday
    ).first()
    
    if inv:
        return inv.remaining_slots
    return 0

def get_sold_out_status_for_format(db: Session, format_id: int) -> bool:
    ensure_inventory_for_current_week(db)
    monday, _ = get_current_week_dates()
    
    inv = db.query(WeeklyInventory).filter(
        WeeklyInventory.format_id == format_id,
        WeeklyInventory.week_start == monday
    ).first()
    
    if inv:
        return inv.is_sold_out
    return True
