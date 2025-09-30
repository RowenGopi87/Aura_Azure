# Azure Key Vault Setup for Aura Application
# Configures secrets for OpenAI, Google, and Anthropic APIs in your existing Key Vault

param(
    [string]$KeyVaultName = "aura1-devtest-be-kv-maen",
    [string]$ResourceGroupName = "maen-rg-devtest-aura1-fw-001"
)

Write-Host "🔐 Azure Key Vault Configuration for Aura" -ForegroundColor Green
Write-Host "Key Vault: $KeyVaultName" -ForegroundColor Yellow

# Verify Key Vault access
Write-Host "🔍 Verifying Key Vault access..." -ForegroundColor Cyan
try {
    $kv = Get-AzKeyVault -VaultName $KeyVaultName -ResourceGroupName $ResourceGroupName
    Write-Host "✅ Key Vault found: $($kv.VaultName)" -ForegroundColor Green
} catch {
    Write-Error "Cannot access Key Vault '$KeyVaultName'. Please check permissions."
    exit 1
}

# Function to safely set secret
function Set-SafeSecret {
    param($VaultName, $SecretName, $SecretValue, $Description)
    
    if ($SecretValue -and $SecretValue.Length -gt 0) {
        try {
            Set-AzKeyVaultSecret -VaultName $VaultName -Name $SecretName -SecretValue $SecretValue
            Write-Host "✅ $Description stored successfully" -ForegroundColor Green
        } catch {
            Write-Warning "Failed to store $Description`: $($_.Exception.Message)"
        }
    }
}

Write-Host ""
Write-Host "🔑 Configure API Keys for Aura Services" -ForegroundColor Cyan
Write-Host "Leave empty to skip any key you don't have" -ForegroundColor Gray
Write-Host ""

# OpenAI API Key (Required for most functionality)
Write-Host "1️⃣ OpenAI Configuration:" -ForegroundColor Cyan
$openAiKey = Read-Host -Prompt "  Enter OpenAI API Key (required for AI features)" -AsSecureString
Set-SafeSecret -VaultName $KeyVaultName -SecretName "OPENAI-API-KEY" -SecretValue $openAiKey -Description "OpenAI API Key"

# Google API Key (For Google AI integration)
Write-Host ""
Write-Host "2️⃣ Google AI Configuration:" -ForegroundColor Cyan
$googleKey = Read-Host -Prompt "  Enter Google API Key (for Google AI features)" -AsSecureString
Set-SafeSecret -VaultName $KeyVaultName -SecretName "GOOGLE-API-KEY" -SecretValue $googleKey -Description "Google API Key"

# Anthropic API Key (For Claude integration)
Write-Host ""
Write-Host "3️⃣ Anthropic Configuration:" -ForegroundColor Cyan
$anthropicKey = Read-Host -Prompt "  Enter Anthropic API Key (for Claude features)" -AsSecureString
Set-SafeSecret -VaultName $KeyVaultName -SecretName "ANTHROPIC-API-KEY" -SecretValue $anthropicKey -Description "Anthropic API Key"

# Database secrets (if not using existing Azure Database)
Write-Host ""
Write-Host "4️⃣ Database Configuration:" -ForegroundColor Cyan
Write-Host "  Current setup uses container database" -ForegroundColor Gray
Write-Host "  To use Azure Database for MySQL instead, update the Bicep template" -ForegroundColor Gray

# Application secrets
Write-Host ""
Write-Host "5️⃣ Application Configuration:" -ForegroundColor Cyan

# Generate random JWT secret if needed
$jwtSecret = Read-Host -Prompt "  Enter JWT Secret (or press Enter to generate)" -AsSecureString
if (-not $jwtSecret -or $jwtSecret.Length -eq 0) {
    $randomSecret = [System.Web.Security.Membership]::GeneratePassword(32, 8)
    $jwtSecret = ConvertTo-SecureString $randomSecret -AsPlainText -Force
    Write-Host "  Generated random JWT secret" -ForegroundColor Gray
}
Set-SafeSecret -VaultName $KeyVaultName -SecretName "JWT-SECRET" -SecretValue $jwtSecret -Description "JWT Secret"

# Display current secrets (names only, not values)
Write-Host ""
Write-Host "📋 Key Vault Secrets Summary:" -ForegroundColor Green
try {
    $secrets = Get-AzKeyVaultSecret -VaultName $KeyVaultName
    $secrets | Where-Object { $_.Name -like "*API*" -or $_.Name -like "*SECRET*" -or $_.Name -like "*KEY*" } | 
        ForEach-Object { Write-Host "  • $($_.Name)" -ForegroundColor White }
} catch {
    Write-Warning "Could not list secrets: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "🎉 Key Vault configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Run azure-push-images.ps1 to push Docker images" -ForegroundColor White
Write-Host "  2. Run azure-deploy.ps1 to deploy the application" -ForegroundColor White
Write-Host "  3. Test the deployed application" -ForegroundColor White
Write-Host ""
Write-Host "💡 To integrate with your Azure OpenAI service:" -ForegroundColor Yellow
Write-Host "  Update the MCP container environment to use:" -ForegroundColor White
Write-Host "  AZURE_OPENAI_ENDPOINT = https://api-genai-devtest-maen.azure-api.net/openai/deployments/gpt-4.1/chat/completions" -ForegroundColor Gray
