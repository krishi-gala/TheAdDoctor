from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class PackageCreate(BaseModel):
    package_name: str = Field(..., min_length=2, max_length=255)
    price: Decimal = Field(..., gt=0)
    credits: int = Field(..., gt=0)
    validity_days: int = Field(30, gt=0, le=365)
    description: Optional[str] = Field(None, max_length=2000)
    is_active: bool = True

    @field_validator("package_name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        return value.strip()


class PackageUpdate(BaseModel):
    package_name: Optional[str] = Field(None, min_length=2, max_length=255)
    price: Optional[Decimal] = Field(None, gt=0)
    credits: Optional[int] = Field(None, gt=0)
    validity_days: Optional[int] = Field(None, gt=0, le=365)
    description: Optional[str] = Field(None, max_length=2000)
    is_active: Optional[bool] = None

    @field_validator("package_name")
    @classmethod
    def strip_name(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value else value


class PackageStatusPatch(BaseModel):
    is_active: bool
