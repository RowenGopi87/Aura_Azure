# Setup Aura Azure Images Repository
# Initializes the repository and prepares for GitHub/GitLab deployment

param(
    [string]$GitHubRepo = "https://github.com/RowenGopi87/Aura_Azure_Images.git",
    [string]$GitLabRepo = "",
    [switch]$SkipGitLFS
)

Write-Host "📦 Setting up Aura Azure Images Repository" -ForegroundColor Green

# Initialize Git repository if not already done
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Initializing Git repository..." -ForegroundColor Cyan
    git init
    
    # Set up Git LFS for large files unless skipped
    if (-not $SkipGitLFS) {
        Write-Host "📁 Setting up Git LFS for large files..." -ForegroundColor Cyan
        git lfs install
        git lfs track "*.tar"
        git lfs track "*.tar.gz"
        Write-Host "✅ Git LFS configured for Docker images" -ForegroundColor Green
    }
} else {
    Write-Host "ℹ️ Git repository already initialized" -ForegroundColor Yellow
}

# Add GitHub remote
if ($GitHubRepo) {
    Write-Host "🔗 Adding GitHub remote..." -ForegroundColor Cyan
    try {
        git remote add origin $GitHubRepo
        Write-Host "✅ GitHub remote added: $GitHubRepo" -ForegroundColor Green
    } catch {
        # Remote might already exist
        Write-Host "ℹ️ GitHub remote already configured" -ForegroundColor Yellow
    }
}

# Add GitLab remote if provided
if ($GitLabRepo) {
    Write-Host "🔗 Adding GitLab remote..." -ForegroundColor Cyan
    try {
        git remote add gitlab $GitLabRepo  
        Write-Host "✅ GitLab remote added: $GitLabRepo" -ForegroundColor Green
    } catch {
        Write-Host "ℹ️ GitLab remote already configured" -ForegroundColor Yellow
    }
}

# Check file sizes and Git LFS status
Write-Host ""
Write-Host "📊 Repository Contents:" -ForegroundColor Cyan
Get-ChildItem -File | ForEach-Object {
    $size = if ($_.Length -gt 1MB) { 
        "{0:N1} MB" -f ($_.Length / 1MB) 
    } else { 
        "{0:N0} KB" -f ($_.Length / 1KB) 
    }
    $lfsStatus = if ($_.Extension -eq ".tar" -and -not $SkipGitLFS) { " (Git LFS)" } else { "" }
    Write-Host "  $($_.Name): $size$lfsStatus" -ForegroundColor White
}

# Stage all files
Write-Host ""
Write-Host "➕ Staging files..." -ForegroundColor Cyan
git add .

# Create initial commit
Write-Host "📝 Creating initial commit..." -ForegroundColor Cyan
$commitMessage = "feat: Add production-ready Aura Docker images and Azure deployment scripts

- Docker images: database (100MB), application (465MB), MCP services (701MB)
- Azure Container Registry push scripts  
- Azure Container Instances deployment (Bicep)
- Key Vault configuration for API keys
- Integration with existing Azure infrastructure
- Comprehensive deployment documentation"

git commit -m $commitMessage

Write-Host "✅ Initial commit created!" -ForegroundColor Green

# Display next steps
Write-Host ""
Write-Host "🎉 Repository setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣ Push to GitHub:" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor White
if (-not $SkipGitLFS) {
    Write-Host "   (Git LFS will handle the large Docker images)" -ForegroundColor Gray
}
Write-Host ""

if ($GitLabRepo) {
    Write-Host "2️⃣ Push to GitLab (for work environment):" -ForegroundColor Yellow
    Write-Host "   git push gitlab main" -ForegroundColor White
    Write-Host ""
}

Write-Host "3️⃣ Deploy to Azure:" -ForegroundColor Yellow  
Write-Host "   .\keyvault-setup.ps1" -ForegroundColor White
Write-Host "   .\azure-push-images.ps1" -ForegroundColor White
Write-Host "   .\azure-deploy.ps1" -ForegroundColor White
Write-Host ""

Write-Host "📋 Repository Information:" -ForegroundColor Cyan
Write-Host "  • Total size: ~1.27GB (compressed Docker images)" -ForegroundColor White
Write-Host "  • Git LFS: $(if (-not $SkipGitLFS) { 'Enabled' } else { 'Disabled' })" -ForegroundColor White
Write-Host "  • Remotes configured: $(git remote | ForEach-Object { $_ }) " -ForegroundColor White

# Show current git status
Write-Host ""
Write-Host "📊 Git Status:" -ForegroundColor Cyan
git status --short
