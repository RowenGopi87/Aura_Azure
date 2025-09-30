# Deploy Aura Services Locally for Testing
# Uses pre-built production images for validation

param(
    [switch]$Clean,
    [switch]$SkipLoad
)

Write-Host "🚀 Aura Local Deployment for Testing" -ForegroundColor Green
Write-Host "Using pre-built production images" -ForegroundColor Yellow

# Clean up if requested
if ($Clean) {
    Write-Host "🧹 Cleaning up existing deployment..." -ForegroundColor Cyan
    .\cleanup-local.ps1
}

# Load images if not skipped
if (-not $SkipLoad) {
    Write-Host "📦 Loading Docker images..." -ForegroundColor Cyan
    .\load-local-images.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Failed to load images"
        exit 1
    }
}

# Create screenshots directory
if (-not (Test-Path "local-test-screenshots")) {
    mkdir local-test-screenshots | Out-Null
    Write-Host "📁 Created screenshots directory" -ForegroundColor Gray
}

# Deploy services
Write-Host "🚀 Starting services with Docker Compose..." -ForegroundColor Cyan
docker-compose -f docker-compose.local-test.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Failed to start services"
    exit 1
}

# Wait for services to initialize
Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host "📋 Service Status:" -ForegroundColor Cyan
docker-compose -f docker-compose.local-test.yml ps

# Test connectivity
Write-Host "🔍 Testing Service Connectivity:" -ForegroundColor Cyan

# Test database
try {
    $dbTest = curl -s http://localhost:3000/api/database/health 2>$null
    if ($dbTest -match "healthy") {
        Write-Host "✅ Database: Connected" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database: Response received but may not be fully ready" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Database: Connection failed" -ForegroundColor Red
}

# Test MCP services
try {
    $mcpTest = curl -s http://localhost:8000/health 2>$null
    if ($mcpTest -match "healthy") {
        Write-Host "✅ MCP Services: Healthy" -ForegroundColor Green
    } else {
        Write-Host "❌ MCP Services: Not responding" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ MCP Services: Connection failed" -ForegroundColor Red
}

# Test application
try {
    $appTest = curl -s http://localhost:3000 2>$null
    if ($appTest) {
        Write-Host "✅ Application: Responding" -ForegroundColor Green
    } else {
        Write-Host "❌ Application: Not responding" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Application: Connection failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Local deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Service URLs:" -ForegroundColor Cyan
Write-Host "  • Application: http://localhost:3000" -ForegroundColor White
Write-Host "  • Database: localhost:3306" -ForegroundColor White
Write-Host "  • MCP Services: http://localhost:8000" -ForegroundColor White
Write-Host "  • Playwright MCP: http://localhost:8931" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test the application manually at http://localhost:3000" -ForegroundColor White
Write-Host "  2. Verify AI features and design generation work" -ForegroundColor White
Write-Host "  3. Run .\cleanup-local.ps1 when testing complete" -ForegroundColor White
Write-Host "  4. If tests pass, proceed with Azure deployment" -ForegroundColor White
