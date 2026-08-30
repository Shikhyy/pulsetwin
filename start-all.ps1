$Root = "C:\Users\shrey\Desktop\SCHOOL\Projects\PULSETWIN"
$PgBin = "$Root\postgres\extracted\pgsql\bin"
$PgData = "$Root\postgres\data"
$PgLog  = "$Root\postgres\pg.log"

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  PulseTwin - Starting All Services"   -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# 1. PostgreSQL
Write-Host "`n[1/5] Starting PostgreSQL..." -ForegroundColor Yellow
& "$PgBin\pg_ctl.exe" -D $PgData -l $PgLog start | Out-Null
$timeout = 30; $elapsed = 0
do {
  Start-Sleep -Milliseconds 500; $elapsed += 0.5
  $ok = (Test-NetConnection localhost -Port 5432 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue).TcpTestSucceeded
} while (-not $ok -and $elapsed -lt $timeout)
if (-not $ok) { Write-Host "FATAL: Postgres did not start" -ForegroundColor Red; exit 1 }
Write-Host "  Postgres up on :5432" -ForegroundColor Green

# 2. Migrations + seed (idempotent)
Write-Host "`n[2/5] DB migrations..." -ForegroundColor Yellow
Push-Location "$Root\backend"; npm run db:migrate; npm run db:seed; Pop-Location
Write-Host "  DB ready" -ForegroundColor Green

# 3. ML Service
Write-Host "`n[3/5] ML Service (port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit","-Command",
  "cd '$Root\ml'; & '$Root\python-embed\Scripts\uvicorn.exe' src.main:app --host 0.0.0.0 --port 8000"
Start-Sleep 3; Write-Host "  ML started" -ForegroundColor Green

# 4. Backend
Write-Host "`n[4/5] Backend (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$Root\backend'; npm run dev"
Start-Sleep 5; Write-Host "  Backend started" -ForegroundColor Green

# 5. Simulator
Write-Host "`n[5/5] Simulator (port 3002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$Root\simulator'; npm run dev"
Start-Sleep 3; Write-Host "  Simulator started" -ForegroundColor Green

# 6. Frontend
Write-Host "`n[6/6] Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$Root\frontend'; npm run dev"
Start-Sleep 5

Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "  ALL SERVICES UP" -ForegroundColor Green
Write-Host "  Frontend   -> http://localhost:5173"
Write-Host "  Backend    -> http://localhost:3001/health"
Write-Host "  ML Service -> http://localhost:8000/health"
Write-Host "=======================================" -ForegroundColor Cyan

Start-Process "http://localhost:5173"
