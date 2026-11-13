import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path regardless of execution root
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.calculator import router as calculator_router

app = FastAPI(
    title="Rainwater Harvesting Potential Calculator API",
    description=(
        "Production-ready calculation engine for estimating rainwater collection potential, "
        "storage requirements, financial savings, and environmental SDG impacts."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calculator_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to the Rainwater Harvesting Potential Calculator API",
        "documentation": "/docs",
        "health_check": "/api/health",
        "version": "1.0.0",
    }
