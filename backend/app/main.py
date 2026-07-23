from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router
from app.routes.admin_routes import router as admin_router
from app.routes.brand_routes import router as brand_router
from app.routes.package_routes import router as package_router
from app.routes.brand_package_routes import (
    router as brand_package_router
)
from app.routes import ad_format_routes, smart_timing_routes, campaign_booking_routes, audit_routes
from app.routes import reports_routes, campaign_query_routes

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(brand_router)
app.include_router(package_router)
app.include_router(brand_package_router)
app.include_router(ad_format_routes.router)
app.include_router(smart_timing_routes.router)
app.include_router(campaign_booking_routes.router)
app.include_router(audit_routes.router)
app.include_router(reports_routes.router)
app.include_router(campaign_query_routes.router)


@app.get("/")
def home():
    return {
        "message": "The Ad Doctor Backend Running"
    }