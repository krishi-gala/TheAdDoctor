from sqlalchemy import text
from app.core.database import engine


MIGRATIONS = [
    ("phone_number", "ALTER TABLE users ADD phone_number NVARCHAR(20) NULL"),
    ("business_type", "ALTER TABLE users ADD business_type NVARCHAR(100) NULL"),
    ("package", "ALTER TABLE users ADD package NVARCHAR(100) NULL"),
    ("is_deleted", "ALTER TABLE users ADD is_deleted BIT NOT NULL DEFAULT 0"),
    ("updated_at", "ALTER TABLE users ADD updated_at DATETIME NULL"),
]


def column_exists(conn, column_name: str) -> bool:
    result = conn.execute(
        text(
            """
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'users' AND COLUMN_NAME = :column_name
            """
        ),
        {"column_name": column_name},
    ).scalar()
    return result > 0


def run_migrations():
    with engine.begin() as conn:
        for column_name, ddl in MIGRATIONS:
            if not column_exists(conn, column_name):
                conn.execute(text(ddl))
