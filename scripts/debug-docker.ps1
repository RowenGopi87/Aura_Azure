# PowerShell script for Docker debugging utilities
# Usage: .\scripts\debug-docker.ps1 [command] [options]

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "logs", "shell", "status", "clean", "help")]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [ValidateSet("application", "database", "mcp", "all")]
    [string]$Service = "all",
    
    [switch]$Follow,
    [switch]$Tail = $false,
    [int]$Lines = 100
)

$ComposeFile = "deployment/local/docker-compose.debug.yml"

function Show-Help {
    Write-Host "🐳 Aura Docker Debug Utilities" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  start [service]    - Start debug containers (default: all)"
    Write-Host "  stop [service]     - Stop debug containers (default: all)"
    Write-Host "  logs [service]     - View container logs (default: all)"
    Write-Host "  shell [service]    - Open shell in container"
    Write-Host "  status            - Show container status"
    Write-Host "  clean             - Clean up containers and volumes"
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Yellow
    Write-Host "  application       - Next.js application container"
    Write-Host "  database         - MariaDB database container"
    Write-Host "  mcp              - MCP services container"
    Write-Host "  all              - All services (default)"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Follow          - Follow log output (for logs command)"
    Write-Host "  -Tail            - Show only tail of logs"
    Write-Host "  -Lines <number>  - Number of lines to show (default: 100)"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\scripts\debug-docker.ps1 start"
    Write-Host "  .\scripts\debug-docker.ps1 logs application -Follow"
    Write-Host "  .\scripts\debug-docker.ps1 shell application"
    Write-Host "  .\scripts\debug-docker.ps1 logs mcp -Lines 50"
    Write-Host ""
    Write-Host "🌐 Web Interfaces:" -ForegroundColor Magenta
    Write-Host "  Application:      http://localhost:3000"
    Write-Host "  Log Viewer:       http://localhost:9999"
    Write-Host "  Node Debugger:    chrome://inspect (localhost:9229)"
}

function Get-ServiceName {
    param([string]$Service)
    
    switch ($Service) {
        "application" { return "aura-application-debug" }
        "database" { return "aura-database-debug" }
        "mcp" { return "aura-mcp-services-debug" }
        "all" { return "" }
        default { return "" }
    }
}

function Start-Services {
    param([string]$Service)
    
    Write-Host "🚀 Starting debug containers..." -ForegroundColor Green
    
    if ($Service -eq "all") {
        docker-compose -f $ComposeFile up -d --build
    } else {
        $serviceName = Get-ServiceName $Service
        docker-compose -f $ComposeFile up -d --build $serviceName
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Containers started successfully!" -ForegroundColor Green
        Write-Host ""
        Show-WebInterfaces
    } else {
        Write-Host "❌ Failed to start containers" -ForegroundColor Red
    }
}

function Stop-Services {
    param([string]$Service)
    
    Write-Host "🛑 Stopping debug containers..." -ForegroundColor Yellow
    
    if ($Service -eq "all") {
        docker-compose -f $ComposeFile down
    } else {
        $serviceName = Get-ServiceName $Service
        docker-compose -f $ComposeFile stop $serviceName
    }
    
    Write-Host "✅ Containers stopped" -ForegroundColor Green
}

function Show-Logs {
    param([string]$Service, [bool]$Follow, [bool]$Tail, [int]$Lines)
    
    $logArgs = @()
    
    if ($Follow) {
        $logArgs += "-f"
    }
    
    if ($Tail -and $Lines -gt 0) {
        $logArgs += "--tail", $Lines
    }
    
    if ($Service -eq "all") {
        Write-Host "📋 Showing logs for all services..." -ForegroundColor Cyan
        docker-compose -f $ComposeFile logs @logArgs
    } else {
        $serviceName = Get-ServiceName $Service
        Write-Host "📋 Showing logs for $Service..." -ForegroundColor Cyan
        docker-compose -f $ComposeFile logs @logArgs $serviceName
    }
}

function Open-Shell {
    param([string]$Service)
    
    if ($Service -eq "all") {
        Write-Host "❌ Please specify a specific service for shell access" -ForegroundColor Red
        return
    }
    
    $serviceName = Get-ServiceName $Service
    Write-Host "🐚 Opening shell in $serviceName..." -ForegroundColor Cyan
    
    # Try to use bash first, then sh
    docker exec -it $serviceName /bin/bash 2>$null
    if ($LASTEXITCODE -ne 0) {
        docker exec -it $serviceName /bin/sh
    }
}

function Show-Status {
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker-compose -f $ComposeFile ps
    Write-Host ""
    Write-Host "🔍 Resource Usage:" -ForegroundColor Cyan
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

function Clean-Environment {
    Write-Host "🧹 Cleaning up debug environment..." -ForegroundColor Yellow
    
    # Stop and remove containers
    docker-compose -f $ComposeFile down -v --remove-orphans
    
    # Remove debug images
    docker image prune -f --filter label=aura-debug
    
    Write-Host "✅ Environment cleaned up" -ForegroundColor Green
}

function Show-WebInterfaces {
    Write-Host "🌐 Available Web Interfaces:" -ForegroundColor Magenta
    Write-Host "  📱 Application:      http://localhost:3000" -ForegroundColor White
    Write-Host "  📋 Log Viewer:       http://localhost:9999" -ForegroundColor White
    Write-Host "  🔍 Node Debugger:    chrome://inspect (localhost:9229)" -ForegroundColor White
    Write-Host ""
}

# Main execution
switch ($Command) {
    "start" { Start-Services $Service }
    "stop" { Stop-Services $Service }
    "logs" { Show-Logs $Service $Follow $Tail $Lines }
    "shell" { Open-Shell $Service }
    "status" { Show-Status }
    "clean" { Clean-Environment }
    "help" { Show-Help }
    default { Show-Help }
}







