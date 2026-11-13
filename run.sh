#!/bin/bash

# ==============================================================================
# AquaHarvest — Unified Start Script
# Runs both FastAPI Backend and Vite Frontend concurrently
# ==============================================================================

# Ensure Homebrew and standard system binaries are in PATH
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "💧 Starting AquaHarvest Application..."

# Cleanup child processes on exit (Ctrl+C)
cleanup() {
  echo ""
  echo "🛑 Stopping services..."
  kill $(jobs -p) 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend
echo "🚀 Starting FastAPI Backend on http://127.0.0.1:8000 ..."
cd "$PROJECT_DIR/backend"
if [ -f ".venv/bin/activate" ]; then
  source .venv/bin/activate
fi
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &

# Wait briefly for backend to initialize
sleep 2

# 2. Start Frontend
echo "🌐 Starting Vite Frontend on http://localhost:5173 ..."
cd "$PROJECT_DIR/frontend"
npm run dev &

echo ""
echo "=============================================================="
echo "✨ AquaHarvest is running!"
echo "👉 Web App:         http://localhost:5173"
echo "👉 Backend API:     http://127.0.0.1:8000"
echo "👉 API Docs:        http://127.0.0.1:8000/docs"
echo "=============================================================="
echo "Press Ctrl+C to stop both servers."
echo ""

wait
