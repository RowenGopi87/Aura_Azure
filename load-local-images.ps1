# Load Pre-built Aura Docker Images for Local Testing
# This script loads the exported production images into local Docker

Write-Host "🐳 Loading Aura Docker Images for Local Testing" -ForegroundColor Green
Write-Host "Loading from: $(Get-Location)" -ForegroundColor Yellow

# Verify tar files exist
$images = @(
    @{ file = "aura-database.tar"; name = "aura-database" },
    @{ file = "aura-application.tar"; name = "aura-application" },
    @{ file = "aura-mcp-services.tar"; name = "aura-mcp-services" }
)

foreach ($image in $images) {
    if (-not (Test-Path $image.file)) {
        Write-Error "❌ Image file not found: $($image.file)"
        exit 1
    }
}

# Load images into Docker
foreach ($image in $images) {
    Write-Host "📦 Loading $($image.name) from $($image.file)..." -ForegroundColor Cyan
    docker load -i $image.file
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $($image.name) loaded successfully" -ForegroundColor Green
    } else {
        Write-Error "❌ Failed to load $($image.name)"
        exit 1
    }
}

# Verify images are loaded
Write-Host "📋 Verifying loaded images:" -ForegroundColor Cyan
docker images --filter "reference=local-aura-*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

Write-Host "🎉 All images loaded successfully!" -ForegroundColor Green
Write-Host "Next step: Run .\deploy-local.ps1 to start services" -ForegroundColor Yellow
