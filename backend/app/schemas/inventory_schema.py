from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class WeeklyInventoryBase(BaseModel):
    format_id: int
    week_start: date
    week_end: date
    weekly_limit: int
    booked_slots: int
    remaining_slots: int
    is_sold_out: bool

class WeeklyInventoryResponse(WeeklyInventoryBase):
    inventory_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AdminInventoryResponse(BaseModel):
    format: str
    weekly_limit: int
    booked_slots: int
    remaining_slots: int
    sold_out: bool
    week_start: date
    week_end: date
