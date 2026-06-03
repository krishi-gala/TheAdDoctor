from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class AdFormatBase(BaseModel):
    name: str
    slug: str
    format_category: Optional[str] = None
    weekly_limit: int = 5
    standard_credits: int
    prime_credits: int
    estimated_performance: Optional[str] = None
    is_active: bool = True

class AdFormatCreate(AdFormatBase):
    pass

class AdFormatUpdate(BaseModel):
    weekly_limit: Optional[int] = None
    standard_credits: Optional[int] = None
    prime_credits: Optional[int] = None
    estimated_performance: Optional[str] = None
    is_active: Optional[bool] = None

class AdFormatStatusUpdate(BaseModel):
    is_active: bool

class AdFormatResponse(AdFormatBase):
    format_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AdFormatBrandResponse(BaseModel):
    format_id: int
    name: str
    slug: str
    standard_credits: int
    prime_credits: int
    estimated_performance: Optional[str]
    remaining_inventory: int
    weekly_limit: int
    sold_out: bool

class AdFormatPaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[AdFormatResponse]
