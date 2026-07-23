from pydantic import BaseModel, Field

from app.core.password import PASSWORD_MIN_LENGTH


class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=128)
