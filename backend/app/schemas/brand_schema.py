from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class BrandCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    phone_number: Optional[str] = Field(None, max_length=20)
    business_type: Optional[str] = Field(None, max_length=100)
    package: Optional[str] = Field(None, max_length=100)
    is_active: bool = True


class BrandUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=128)
    phone_number: Optional[str] = Field(None, max_length=20)
    business_type: Optional[str] = Field(None, max_length=100)
    package: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None


class BrandStatusPatch(BaseModel):
    is_active: bool
