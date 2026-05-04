$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Frontend = Join-Path $Root "frontend"
$Python = Join-Path $Root ".venv\Scripts\python.exe"

if (!(Test-Path (Join-Path $Root ".env"))) {
    Write-Error "Missing .env. Copy .env.example to .env and fill in local secrets."
}

if (!(Test-Path $Python)) {
    Write-Error "Missing Python virtual environment. Run: python -m venv .venv; .\.venv\Scripts\python.exe -m pip install -r requirements.txt"
}

if (!(Test-Path (Join-Path $Frontend "node_modules"))) {
    Write-Error "Missing frontend node_modules. Run: cd frontend; npm install"
}

Write-Host "Starting backend at http://localhost:8000"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd `"$Root`"; .\.venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload"
)

Write-Host "Starting frontend at http://localhost:3000"
Set-Location $Frontend
npm run dev
