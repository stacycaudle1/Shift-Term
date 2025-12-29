param(
    [switch]$Cleanup
)

# Run this from the project root in PowerShell:
# .\run_test.ps1        # run and keep the DB
# .\run_test.ps1 -Cleanup   # run and delete test_shiftterm.db afterwards

Write-Host "Ensuring virtualenv exists..."
if (-not (Test-Path .venv)) {
    python -m venv .venv
}

Write-Host "Activating virtualenv..."
. .\.venv\Scripts\Activate

if (Test-Path requirements.txt) {
    Write-Host "Installing requirements..."
    pip install -r requirements.txt
}

if (-not (Test-Path .\test_shiftterm_run.py)) {
    Write-Host "test_shiftterm_run.py not found in current directory. Ensure you're in the project root." -ForegroundColor Yellow
    exit 1
}

Write-Host "Running test_shiftterm_run.py..."
python .\test_shiftterm_run.py

if ($Cleanup) {
    Write-Host "Cleaning up: removing test_shiftterm.db"
    Remove-Item -Force .\test_shiftterm.db -ErrorAction SilentlyContinue
}

Write-Host "Done."
