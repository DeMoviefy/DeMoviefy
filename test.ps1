[CmdletBinding()]
param(
    [ValidatePattern('^(CT0[1-9]|SEC0[1-4])$')]
    [string]$Test,
    [switch]$All,
    [switch]$Frontend
)

$ErrorActionPreference = "Stop"
$repositoryRoot = $PSScriptRoot
$python = Join-Path $repositoryRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
    throw "Python virtual environment not found: $python. Run the project setup first."
}

function Invoke-TestPlan {
    param([string]$Scenario)

    Push-Location (Join-Path $repositoryRoot "demoviefy-backend")
    try {
        if ($Scenario) {
            Write-Host "Running $Scenario..." -ForegroundColor Cyan
            & $python -m unittest discover -s tests -p test_test_plan.py -k $Scenario.ToLower() -v
        }
        else {
            Write-Host "Running the complete test plan (CT01-CT09 and SEC01-SEC04)..." -ForegroundColor Cyan
            & $python -m unittest discover -s tests -p test_test_plan.py -v
        }

        if ($LASTEXITCODE -ne 0) {
            exit $LASTEXITCODE
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-FrontendBuild {
    Push-Location (Join-Path $repositoryRoot "demoviefy-frontend")
    try {
        Write-Host "Building the frontend..." -ForegroundColor Cyan
        npm run build
        if ($LASTEXITCODE -ne 0) {
            exit $LASTEXITCODE
        }
    }
    finally {
        Pop-Location
    }
}

# Parameters are intended for CI and scripts. Without them, show the simple menu.
if (-not $All -and -not $Test -and -not $Frontend) {
    Write-Host ""
    Write-Host "DeMoviefy Test Menu" -ForegroundColor Cyan
    Write-Host "1) Run the full test plan (CT01-CT09 and SEC01-SEC04)"
    Write-Host "2) Run one test scenario"
    Write-Host "3) Run the full plan and build the frontend"
    Write-Host "0) Exit"
    Write-Host ""

    switch (Read-Host "Choose an option") {
        "1" { $All = $true }
        "2" {
            $Test = (Read-Host "Enter CT01 through CT09 or SEC01 through SEC04").ToUpper()
            if ($Test -notmatch '^(CT0[1-9]|SEC0[1-4])$') {
                throw "Invalid scenario. Enter CT01 through CT09 or SEC01 through SEC04."
            }
        }
        "3" { $All = $true; $Frontend = $true }
        "0" { return }
        default { throw "Invalid option. Choose 0, 1, 2, or 3." }
    }
}

Invoke-TestPlan -Scenario $Test

if ($Frontend) {
    Invoke-FrontendBuild
}
