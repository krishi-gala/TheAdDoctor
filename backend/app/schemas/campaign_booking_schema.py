from typing import Optional, Union
from datetime import datetime, date, time
from pydantic import BaseModel, Field

class CampaignBookingCreate(BaseModel):
    format_slug: str = Field(..., max_length=50)
    business_type: str = Field(..., max_length=50)
    booking_date: Optional[str] = Field(None, max_length=50)
    booking_time: str = Field(..., max_length=50)
    timing_type: str = Field(..., max_length=20)
    credit_type: str = Field(..., pattern="^(standard|prime)$")
    additional_notes: Optional[str] = Field(None, max_length=500)

class CampaignBookingResponse(BaseModel):
    booking_id: int
    brand_id: int
    brand_name: Optional[str] = None
    format_slug: str
    business_type: str
    booking_date: Optional[Union[str, date]]
    booking_time: Union[str, time]
    timing_type: str
    additional_notes: Optional[str]
    admin_notes: Optional[str]
    credit_type: Optional[str]
    credits_used: int
    booking_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class CampaignBookingStatusUpdate(BaseModel):
    booking_status: str = Field(..., pattern="^(approved|rejected)$")
    admin_notes: Optional[str] = Field(None, max_length=500)
    final_date: Optional[str] = Field(None, max_length=50)
    final_time: Optional[str] = Field(None, max_length=50)
