# Azure Container Registry Image Push Script
# This script pushes the exported Docker images to your Azure Container Registry

param(
    [Parameter(Mandatory=$true)]
    [string]$RegistryName = "aura1devtestbeacrmaen",
    
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup = "maen-rg-devtest-aura1-fw-001",
    
    [string]$Version = "latest"
)

Write-Host "🚀 Azure Aura Deployment - Image Push Script" -ForegroundColor Green
Write-Host "Registry: $RegistryName" -ForegroundColor Yellow
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Yellow

# Login to Azure (if not already logged in)
Write-Host "📋 Checking Azure login..." -ForegroundColor Cyan
$context = Get-AzContext
if (-not $context) {
    Write-Host "Please login to Azure..." -ForegroundColor Yellow
    Connect-AzAccount
}

# Login to ACR
Write-Host "🔐 Logging into Azure Container Registry..." -ForegroundColor Cyan
az acr login --name $RegistryName

# Load and tag images
$images = @(
    @{ name = "aura-database"; file = "aura-database.tar" },
    @{ name = "aura-application"; file = "aura-application.tar" },
    @{ name = "aura-mcp-services"; file = "aura-mcp-services.tar" }
)

foreach ($image in $images) {
    Write-Host "📦 Processing $($image.name)..." -ForegroundColor Cyan
    
    # Load image from tar file
    Write-Host "  Loading image from $($image.file)..." -ForegroundColor Gray
    docker load -i $image.file
    
    # Tag for ACR
    $acrTag = "$RegistryName.azurecr.io/aura/$($image.name):$Version"
    Write-Host "  Tagging as: $acrTag" -ForegroundColor Gray
    docker tag "local-$($image.name):latest" $acrTag
    
    # Push to ACR
    Write-Host "  Pushing to Azure Container Registry..." -ForegroundColor Gray
    docker push $acrTag
    
    Write-Host "✅ $($image.name) pushed successfully!" -ForegroundColor Green
}

Write-Host "🎉 All images pushed to Azure Container Registry!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run azure-deploy.ps1 to deploy container instances" -ForegroundColor White
Write-Host "  2. Configure Key Vault secrets for OpenAI keys" -ForegroundColor White
Write-Host "  3. Update database connection strings" -ForegroundColor White
