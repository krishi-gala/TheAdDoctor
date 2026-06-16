import re
from typing import Optional, Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

PHONE_PATTERN = re.compile(r"^[\d\s+\-()]{7,20}$")


def validate_phone_optional(value: Optional[str]) -> Optional[str]:
    if value is None:
        return value
    cleaned = value.strip()
    if not cleaned:
        return None
    if not PHONE_PATTERN.match(cleaned):
        raise ValueError("Enter a valid phone number (7–20 digits/symbols)")
    return cleaned


class BrandCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    phone_number: Optional[str] = Field(None, max_length=20)
    business_type: Optional[str] = Field(None, max_length=100)
    package: Optional[str] = Field(None, max_length=100)
    is_active: bool = True

    @field_validator("phone_number")
    @classmethod
    def phone_format(cls, value: Optional[str]) -> Optional[str]:
        return validate_phone_optional(value)


class BrandUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=128)
    phone_number: Optional[str] = Field(None, max_length=20)
    business_type: Optional[str] = Field(None, max_length=100)
    package: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

    @field_validator("phone_number")
    @classmethod
    def phone_format(cls, value: Optional[str]) -> Optional[str]:
        return validate_phone_optional(value)


class BrandStatusPatch(BaseModel):
    is_active: bool

class BrandCreditsUpdate(BaseModel):
    action: Literal["add", "deduct"]
    amount: int = Field(..., gt=0)
