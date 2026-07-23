from pydantic import BaseModel, EmailStr, Field

from app.core.password import PASSWORD_MIN_LENGTH


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1, max_length=255)
    new_password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=128)