# Cleanup Local Aura Test Deployment

Write-Host "🧹 Cleaning up Aura Local Test Environment" -ForegroundColor Yellow

# Stop and remove services
Write-Host "⏹️  Stopping services..." -ForegroundColor Cyan
docker-compose -f docker-compose.local-test.yml down --volumes --remove-orphans

# Remove test images (optional - uncomment if you want to clean images too)
# Write-Host "🗑️  Removing test images..." -ForegroundColor Cyan
# docker rmi local-aura-database:latest local-aura-application:latest local-aura-mcp-services:latest 2>$null

# Clean up screenshots directory
if (Test-Path "local-test-screenshots") {
    Write-Host "📁 Cleaning screenshots directory..." -ForegroundColor Cyan
    Remove-Item "local-test-screenshots\*" -Force -ErrorAction SilentlyContinue
}

# Show final status
Write-Host "📋 Remaining containers:" -ForegroundColor Cyan
docker ps -a --filter "name=aura"

Write-Host ""
Write-Host "✅ Local test environment cleaned up!" -ForegroundColor Green
Write-Host "Images preserved for future testing" -ForegroundColor Gray
