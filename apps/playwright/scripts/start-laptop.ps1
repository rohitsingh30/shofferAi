#!/usr/bin/env pwsh
# ShofferAI Laptop Relay Starter (PowerShell)
# Starts: Chrome Debug (CDP) → Relay Server → Optional Cloudflare Tunnel
#
# Usage:
#   pwsh start-laptop.ps1              # Dev mode (local relay on port 8765)
#   pwsh start-laptop.ps1 -Prod        # Prod mode (outbound to Cloud Run, no tunnel)
#   pwsh start-laptop.ps1 -PoolSize 5  # Custom Chrome Pool size

param(
    [switch]$Prod,
    [int]$CdpPort = 9222,
    [int]$RelayPort = 8765,
    [int]$PoolSize = 3
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "../../..")
$CloudUrl = "wss://shofferai-27188185100.asia-south1.run.app/api/relay/ws"

# --- Helpers ---

function Write-Banner {
    Write-Host ""
    Write-Host "=== ShofferAI Laptop Relay ===" -ForegroundColor Cyan
    Write-Host "  Mode      : $(if ($Prod) {'Production (outbound to Cloud Run)'} else {'Development (local relay)'})" -ForegroundColor Gray
    Write-Host "  CDP Port  : $CdpPort" -ForegroundColor Gray
    Write-Host "  Pool Size : $PoolSize" -ForegroundColor Gray
    Write-Host ""
}

function Load-EnvFile {
    $envPath = Join-Path $ProjectRoot ".env"
    if (Test-Path $envPath) {
        Get-Content $envPath | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
                $key = $Matches[1].Trim()
                $val = $Matches[2].Trim()
                if (-not [Environment]::GetEnvironmentVariable($key)) {
                    [Environment]::SetEnvironmentVariable($key, $val, "Process")
                }
            }
        }
        Write-Host "✓ Loaded .env" -ForegroundColor Green
    } else {
        Write-Host "⚠ No .env file found at $envPath" -ForegroundColor Yellow
    }
}

function Test-CdpRunning {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:$CdpPort/json/version" -TimeoutSec 3
        return $true
    } catch {
        return $false
    }
}

function Start-ChromeDebug {
    $chromeApp = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    $userDataDir = Join-Path $env:HOME "Library/Application Support/Google/Chrome-Debug"

    if (-not (Test-Path $chromeApp)) {
        Write-Host "ERROR: Chrome not found at $chromeApp" -ForegroundColor Red
        exit 1
    }

    Write-Host "Starting Chrome Debug on port $CdpPort..." -ForegroundColor Yellow

    $chromeArgs = @(
        "--remote-debugging-port=$CdpPort"
        "--user-data-dir=$userDataDir"
        '--profile-directory=Profile 3'
        '--no-first-run'
        '--no-default-browser-check'
        '--disable-sync'
        '--disable-default-apps'
    )

    Start-Process -FilePath $chromeApp -ArgumentList $chromeArgs -WindowStyle Normal
    
    # Wait for CDP to come up
    $retries = 10
    for ($i = 0; $i -lt $retries; $i++) {
        Start-Sleep -Seconds 1
        if (Test-CdpRunning) {
            Write-Host "✓ Chrome Debug is running (port $CdpPort, Profile 3)" -ForegroundColor Green
            return
        }
        Write-Host "  Waiting for CDP... ($($i+1)/$retries)" -ForegroundColor Gray
    }

    Write-Host "ERROR: Chrome Debug failed to start on port $CdpPort" -ForegroundColor Red
    exit 1
}

function Kill-OrphanChromes {
    Write-Host "Cleaning orphan Chrome-Pool instances..." -ForegroundColor Gray
    $portRange = $CdpPort..($CdpPort + $PoolSize - 1)
    foreach ($port in $portRange) {
        try {
            $pid = (lsof -ti ":$port" 2>$null | Select-Object -First 1)
            if ($pid) {
                Write-Host "  Killing orphan Chrome on port $port (PID $pid)" -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        } catch { }
    }
    Start-Sleep -Seconds 1
}

# --- Main ---

Write-Banner
Load-EnvFile

# Ensure RELAY_AUTH_TOKEN exists
if (-not $env:RELAY_AUTH_TOKEN) {
    $env:RELAY_AUTH_TOKEN = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    Write-Host "⚠ Generated RELAY_AUTH_TOKEN: $($env:RELAY_AUTH_TOKEN)" -ForegroundColor Yellow
    Write-Host "  >>> Set this in Cloud Run env vars <<<" -ForegroundColor Yellow
    Write-Host ""
}

# Check prerequisites
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npx not found. Install Node.js 20+" -ForegroundColor Red
    exit 1
}

# Step 1: Ensure Chrome Debug is running
Write-Host "Checking Chrome Debug on port $CdpPort..." -ForegroundColor Gray
if (-not (Test-CdpRunning)) {
    Start-ChromeDebug
} else {
    Write-Host "✓ Chrome Debug already running on port $CdpPort" -ForegroundColor Green
}

# Step 2: Set environment for the relay
$env:CHROME_CDP_ENDPOINT = "http://127.0.0.1:$CdpPort"
$env:POOL_SIZE = "$PoolSize"

# Track child processes for cleanup
$childPids = @()

# Cleanup handler
$cleanup = {
    Write-Host ""
    Write-Host "Shutting down..." -ForegroundColor Yellow
    foreach ($pid in $script:childPids) {
        try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch { }
    }
    Write-Host "Done." -ForegroundColor Green
}

try {
    if ($Prod) {
        # --- Production Mode: Outbound to Cloud Run ---
        Kill-OrphanChromes

        $env:RELAY_CLOUD_URL = $CloudUrl

        Write-Host ""
        Write-Host "Starting relay (outbound to Cloud Run)..." -ForegroundColor Cyan
        Write-Host "  Cloud URL  : $CloudUrl" -ForegroundColor Gray
        Write-Host "  Auth Token : $(if ($env:RELAY_AUTH_TOKEN) {'SET'} else {'EMPTY'})" -ForegroundColor Gray
        Write-Host "  Pool Size  : $PoolSize" -ForegroundColor Gray
        Write-Host ""

        # Run relay (blocks — exec equivalent)
        Set-Location $ProjectRoot
        npx tsx apps/playwright/src/index.ts

    } else {
        # --- Development Mode: Local relay server ---
        Write-Host ""
        Write-Host "Starting relay server on port $RelayPort..." -ForegroundColor Cyan

        Set-Location $ProjectRoot
        $relayJob = Start-Process -FilePath "npm" `
            -ArgumentList "run","start","--workspace=@shofferai/playwright" `
            -PassThru -NoNewWindow
        $childPids += $relayJob.Id

        Start-Sleep -Seconds 3

        # Step 3: Start Cloudflare Tunnel (if available)
        if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
            Write-Host ""
            Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Cyan
            Write-Host "  Copy the tunnel URL below → set as RELAY_LAPTOP_URL in Cloud Run" -ForegroundColor Gray
            Write-Host ""

            $tunnelJob = Start-Process -FilePath "cloudflared" `
                -ArgumentList "tunnel","--url","http://localhost:$RelayPort" `
                -PassThru -NoNewWindow
            $childPids += $tunnelJob.Id
        } else {
            Write-Host ""
            Write-Host "⚠ cloudflared not found — skipping tunnel (install: brew install cloudflared)" -ForegroundColor Yellow
            Write-Host "  Relay is available locally at ws://localhost:$RelayPort" -ForegroundColor Gray
        }

        Write-Host ""
        Write-Host "Relay is running. Press Ctrl+C to stop." -ForegroundColor Green
        Write-Host ""

        # Wait for relay process
        $relayJob.WaitForExit()
    }
} finally {
    & $cleanup
}
