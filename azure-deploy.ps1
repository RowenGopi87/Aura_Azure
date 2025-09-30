# Azure Aura Application Deployment Script
# Deploys Aura containers to Azure Container Instances using existing infrastructure

param(
    [string]$SubscriptionId = "",
    [string]$ResourceGroupName = "maen-rg-devtest-aura1-fw-001",
    [string]$DeploymentName = "aura-deployment-$(Get-Date -Format 'yyyyMMddHHmm')",
    [string]$EnvironmentPrefix = "aura1-prod",
    [string]$ImageVersion = "latest"
)

Write-Host "🚀 Azure Aura Application Deployment" -ForegroundColor Green
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Yellow
Write-Host "Deployment: $DeploymentName" -ForegroundColor Yellow

# Login to Azure if needed
Write-Host "📋 Checking Azure login..." -ForegroundColor Cyan
$context = Get-AzContext
if (-not $context) {
    Write-Host "Please login to Azure..." -ForegroundColor Yellow
    Connect-AzAccount
}

if ($SubscriptionId -and $context.Subscription.Id -ne $SubscriptionId) {
    Write-Host "Setting subscription to: $SubscriptionId" -ForegroundColor Yellow
    Set-AzContext -SubscriptionId $SubscriptionId
}

# Verify resource group exists
Write-Host "🔍 Verifying resource group..." -ForegroundColor Cyan
$rg = Get-AzResourceGroup -Name $ResourceGroupName -ErrorAction SilentlyContinue
if (-not $rg) {
    Write-Error "Resource group '$ResourceGroupName' not found!"
    exit 1
}

# Configure Key Vault secrets for OpenAI
Write-Host "🔐 Setting up Key Vault secrets..." -ForegroundColor Cyan
$keyVaultName = "aura1-devtest-be-kv-maen"

# Prompt for OpenAI API key if needed
$openAiKey = Read-Host -Prompt "Enter your OpenAI API Key (or press Enter to skip)" -AsSecureString
if ($openAiKey -and $openAiKey.Length -gt 0) {
    Set-AzKeyVaultSecret -VaultName $keyVaultName -Name "OPENAI-API-KEY" -SecretValue $openAiKey
    Write-Host "✅ OpenAI API key stored in Key Vault" -ForegroundColor Green
}

# Optional: Google API Key
$googleKey = Read-Host -Prompt "Enter your Google API Key (or press Enter to skip)" -AsSecureString
if ($googleKey -and $googleKey.Length -gt 0) {
    Set-AzKeyVaultSecret -VaultName $keyVaultName -Name "GOOGLE-API-KEY" -SecretValue $googleKey
    Write-Host "✅ Google API key stored in Key Vault" -ForegroundColor Green
}

# Optional: Anthropic API Key  
$anthropicKey = Read-Host -Prompt "Enter your Anthropic API Key (or press Enter to skip)" -AsSecureString
if ($anthropicKey -and $anthropicKey.Length -gt 0) {
    Set-AzKeyVaultSecret -VaultName $keyVaultName -Name "ANTHROPIC-API-KEY" -SecretValue $anthropicKey
    Write-Host "✅ Anthropic API key stored in Key Vault" -ForegroundColor Green
}

# Deploy using Bicep template
Write-Host "🚧 Deploying Aura application..." -ForegroundColor Cyan
$deploymentParams = @{
    environmentPrefix = $EnvironmentPrefix
    imageVersion = $ImageVersion
}

try {
    $deployment = New-AzResourceGroupDeployment `
        -ResourceGroupName $ResourceGroupName `
        -Name $DeploymentName `
        -TemplateFile "azure-deploy.bicep" `
        -TemplateParameterObject $deploymentParams `
        -Verbose

    if ($deployment.ProvisioningState -eq "Succeeded") {
        Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Application URL: $($deployment.Outputs.applicationUrl.Value)" -ForegroundColor Green
        Write-Host "Database IP: $($deployment.Outputs.databaseIp.Value)" -ForegroundColor Yellow
        Write-Host "MCP Services IP: $($deployment.Outputs.mcpServicesIp.Value)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
        Write-Host "  1. Test the application at the URL above" -ForegroundColor White
        Write-Host "  2. Configure DNS if needed" -ForegroundColor White
        Write-Host "  3. Set up SSL certificates" -ForegroundColor White
        Write-Host "  4. Configure monitoring and alerts" -ForegroundColor White
    } else {
        Write-Error "Deployment failed with state: $($deployment.ProvisioningState)"
        Write-Host "Check the Azure portal for detailed error information." -ForegroundColor Red
    }
} catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    Write-Host "Common issues to check:" -ForegroundColor Yellow
    Write-Host "  - Container images pushed to ACR" -ForegroundColor White
    Write-Host "  - Resource names match your environment" -ForegroundColor White  
    Write-Host "  - Network security groups allow required ports" -ForegroundColor White
    Write-Host "  - Subnet has sufficient IP addresses" -ForegroundColor White
}
