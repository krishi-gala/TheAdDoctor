from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router
from app.routes.admin_routes import router as admin_router
from app.routes.brand_routes import router as brand_router
from app.routes.package_routes import router as package_router
from app.routes.brand_package_routes import (
    router as brand_package_router
)

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


@app.get("/")
def home():
    return {
        "message": "The Ad Doctor Backend Running"
    }