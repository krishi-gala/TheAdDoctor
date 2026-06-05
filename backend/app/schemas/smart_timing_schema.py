from datetime import time
from pydantic import BaseModel, field_validator
from typing import Optional, Union

class SmartTimingResponse(BaseModel):
    business_type: str
    format_slug: str
    best_day: str
    prime_time: str
    high_engagement_window: str
    source: str

class SmartTimingCreate(BaseModel):
    business_type: str
    format_slug: str
    prime_time_start: str
    prime_time_end: str
    best_day: str
    high_engagement_window: str
# Admin Schemas
class SmartTimingAdminCreate(BaseModel):
    best_day: str
    prime_time_start: str
    prime_time_end: str
    high_engagement_window: str
    is_active: bool = True

class SmartTimingAdminUpdate(BaseModel):
    best_day: Optional[str] = None
    prime_time_start: Optional[str] = None
    prime_time_end: Optional[str] = None
    high_engagement_window: Optional[str] = None

class SmartTimingStatusUpdate(BaseModel):
    is_active: bool

class SmartTimingAdminResponse(BaseModel):
    recommendation_id: int
    business_type: str
    format_slug: str
    prime_time_start: Union[str, time]
    prime_time_end: Union[str, time]
    best_day: str
    high_engagement_window: str
    is_active: bool

    @field_validator("prime_time_start", "prime_time_end", mode="before")
    def _coerce_time_to_string(cls, value):
        if isinstance(value, time):
            return value.strftime("%H:%M")
        return value

    class Config:
        from_attributes = True
