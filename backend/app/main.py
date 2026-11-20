import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path regardless of execution root
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# Resolve static directory for React production build
possible_dist_dirs = [
    Path(os.environ.get("FRONTEND_DIST", "")),
    backend_dir.parent / "frontend" / "dist",
    backend_dir / "static",
    Path("/app/frontend/dist"),
]
STATIC_DIR = next((p for p in possible_dist_dirs if p and p.exists() and (p / "index.html").exists()), None)

if STATIC_DIR and (STATIC_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")


@app.api_route("/health", methods=["GET", "HEAD"], status_code=status.HTTP_200_OK)
def root_health():
    """Top-level health check endpoint for Cloud Run."""
    return {
        "status": "healthy",
        "service": "Rainwater Harvesting Potential Calculator",
        "version": "1.0.0",
    }


@app.api_route("/", methods=["GET", "HEAD"])
def root(request: Request):
    """
    Serve React production build for browser requests,
    or API discovery JSON for programmatic requests and tests.
    """
    accept = request.headers.get("accept", "")
    if STATIC_DIR:
        index_file = STATIC_DIR / "index.html"
        if "text/html" in accept and index_file.is_file():
            return FileResponse(index_file)

    return {
        "message": "Welcome to the Rainwater Harvesting Potential Calculator API",
        "documentation": "/docs",
        "health_check": "/api/health",
        "version": "1.0.0",
    }


@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
def spa_fallback(full_path: str, request: Request):
    """Fallback route for SPA client-side routing and static assets."""
    if full_path.startswith("api/") or full_path in ("api", "docs", "redoc", "openapi.json"):
        raise HTTPException(status_code=404, detail="API endpoint not found")

    if STATIC_DIR:
        candidate_file = STATIC_DIR / full_path
        if candidate_file.is_file():
            return FileResponse(candidate_file)
        index_file = STATIC_DIR / "index.html"
        if index_file.is_file():
            return FileResponse(index_file)

    raise HTTPException(status_code=404, detail="Resource not found")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
