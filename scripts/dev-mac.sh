#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
FRONTEND="$ROOT/frontend"
PYTHON="$ROOT/.venv/bin/python"

if [ ! -f "$ROOT/.env" ]; then
  echo "Missing .env. Copy .env.example to .env and fill in local secrets." >&2
  exit 1
fi

if [ ! -x "$PYTHON" ]; then
  echo "Missing Python virtual environment. Run: python3 -m venv .venv && . .venv/bin/activate && python -m pip install -r requirements.txt" >&2
  exit 1
fi

if [ ! -d "$FRONTEND/node_modules" ]; then
  echo "Missing frontend node_modules. Run: cd frontend && npm install" >&2
  exit 1
fi

cleanup() {
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Starting backend at http://localhost:8000"
(cd "$ROOT" && "$PYTHON" -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload) &
BACKEND_PID="$!"

echo "Starting frontend at http://localhost:3000"
cd "$FRONTEND"
npm run dev
