$PgDir = "C:\Users\shrey\Desktop\SCHOOL\Projects\PULSETWIN\postgres"
$BinDir = "$PgDir\extracted\pgsql\bin"
$DataDir = "$PgDir\data"
$LogFile = "$PgDir\pg.log"

# Add PG bin to path for local process
$env:PATH = "$BinDir;" + $env:PATH

# Initialize DB if data folder doesn't exist
if (-not (Test-Path $DataDir)) {
    Write-Host "Initializing PostgreSQL data directory..."
    & "$BinDir\initdb.exe" -D $DataDir -U pulsetwin -A trust
}

# Start PostgreSQL server
Write-Host "Starting PostgreSQL server..."
& "$BinDir\pg_ctl.exe" -D $DataDir -l $LogFile start

# Wait for startup
Start-Sleep -Seconds 3

# Create pulsetwin database if it doesn't exist
Write-Host "Checking for pulsetwin database..."
$dbExists = & "$BinDir\psql.exe" -U pulsetwin -h localhost -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='pulsetwin'"
if ($dbExists -ne "1") {
    Write-Host "Creating pulsetwin database..."
    & "$BinDir\createdb.exe" -U pulsetwin -h localhost pulsetwin
    Write-Host "Database created successfully."
} else {
    Write-Host "Database already exists."
}
