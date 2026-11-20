# ==============================================================================
# Multi-Stage Dockerfile for Rainwater Harvesting Potential Calculator
# Stage 1: Build React/Vite Frontend
# Stage 2: Production Python/FastAPI Server serving API & static frontend
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Copy dependency manifests
COPY frontend/package.json frontend/package-lock.json ./

# Install frontend dependencies
RUN npm ci --no-audit

# Copy frontend source files
COPY frontend/ ./

# Build production bundle (outputs to /build/dist)
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Python/FastAPI Runner
# ------------------------------------------------------------------------------
FROM python:3.10-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080 \
    FRONTEND_DIST=/app/frontend/dist

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application source
COPY backend/ ./backend/

# Copy compiled frontend from Stage 1
COPY --from=frontend-builder /build/dist ./frontend/dist

# Switch to backend directory for uvicorn app discovery
WORKDIR /app/backend

# Cloud Run uses container port 8080 by default
EXPOSE 8080

# Launch FastAPI on 0.0.0.0 and dynamically bind to $PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
