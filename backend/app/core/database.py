from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SERVER_NAME = r".\SQLEXPRESS"
DATABASE_NAME = "TheAdDoctorDB"

DATABASE_URL = (
    f"mssql+pyodbc://@{SERVER_NAME}/{DATABASE_NAME}"
    "?driver=ODBC+Driver+17+for+SQL+Server"
    "&trusted_connection=yes"
    "&TrustServerCertificate=yes"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()