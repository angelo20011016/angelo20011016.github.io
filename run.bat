@echo off
setlocal
title Angelo's Portfolio Runner

echo ==========================================
echo Project Runner: Angelo's Portfolio
echo ==========================================

:: 1. Backend Environment Check
if exist .venv (
    echo [v] Backend environment found
) else (
    echo [!] Backend virtual environment not found. Starting setup
    python -m venv .venv
    call .venv\Scripts\activate
    echo Installing backend dependencies
    pip install -r requirements.txt
)

:: 2. Frontend Environment Check
if exist frontend\node_modules (
    echo [v] Frontend environment found
) else (
    echo [!] Frontend dependencies not found. Starting setup
    pushd frontend
    echo Installing frontend dependencies (this may take a while)
    call npm install
    popd
)

:: 3. Start Services
echo.
echo [1/2] Launching Backend (FastAPI)
start "Backend (FastAPI)" cmd /k "echo Backend is running on http://localhost:8000 && .venv\Scripts\activate && python app.py"

echo [2/2] Launching Frontend (Next.js)
start "Frontend (Next.js)" cmd /k "echo Frontend is running on http://localhost:3000 && cd frontend && npm run dev"

echo.
echo ==========================================
echo All services are starting in separate windows.
echo - Backend API: http://localhost:8000
echo - Frontend: http://localhost:3000
echo ==========================================
timeout /t 5
