from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CampaignQueryCreate(BaseModel):
    subject: str
    message: str

class AdminCampaignQueryReply(BaseModel):
    admin_reply: str
    status: str = "resolved"   # open | resolved

class CampaignQueryResponse(BaseModel):
    query_id: int
    booking_id: int
    brand_id: int
    subject: str
    message: str
    status: str
    admin_reply: Optional[str] = None
    replied_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
