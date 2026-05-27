from typing import Optional

from pydantic import BaseModel, Field


class TransactionListParams(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=50)
