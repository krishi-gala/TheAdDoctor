from sqlalchemy import text
from app.core.database import engine


USER_MIGRATIONS = [
    ("phone_number", "ALTER TABLE users ADD phone_number NVARCHAR(20) NULL"),
    ("business_type", "ALTER TABLE users ADD business_type NVARCHAR(100) NULL"),
    ("package", "ALTER TABLE users ADD package NVARCHAR(100) NULL"),
    ("is_deleted", "ALTER TABLE users ADD is_deleted BIT NOT NULL DEFAULT 0"),
    ("updated_at", "ALTER TABLE users ADD updated_at DATETIME NULL"),
]

CAMPAIGN_BOOKING_MIGRATIONS = [
    ("brand_query", "ALTER TABLE campaign_bookings ADD brand_query NVARCHAR(500) NULL"),
    ("brand_query_resolved", "ALTER TABLE campaign_bookings ADD brand_query_resolved BIT NOT NULL DEFAULT 0"),
]


def column_exists(conn, table_name: str, column_name: str) -> bool:
    result = conn.execute(
        text(
            """
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = :table_name AND COLUMN_NAME = :column_name
            """
        ),
        {"table_name": table_name, "column_name": column_name},
    ).scalar()
    return result > 0


def run_migrations():
    with engine.begin() as conn:
        for column_name, ddl in USER_MIGRATIONS:
            if not column_exists(conn, "users", column_name):
                conn.execute(text(ddl))

        for column_name, ddl in CAMPAIGN_BOOKING_MIGRATIONS:
            if not column_exists(conn, "campaign_bookings", column_name):
                conn.execute(text(ddl))
