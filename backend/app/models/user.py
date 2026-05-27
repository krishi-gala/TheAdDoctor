from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    role = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)

    phone_number = Column(String(20), nullable=True)
    business_type = Column(String(100), nullable=True)
    package = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
