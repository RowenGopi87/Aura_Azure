# 🚀 Aura Azure Deployment Checklist

This checklist ensures a complete and successful deployment of the Aura SDLC application to Azure.

## 📋 Pre-Deployment Checklist

### ✅ Repository Contents Verification
- [ ] **Docker Images** (1.27GB total)
  - [ ] `aura-database.tar` (100MB) - MariaDB with initialization
  - [ ] `aura-application.tar` (465MB) - Next.js application with fixes
  - [ ] `aura-mcp-services.tar` (701MB) - Python MCP + Playwright services

- [ ] **Azure Deployment Scripts**
  - [ ] `azure-push-images.ps1` - Container Registry push script
  - [ ] `azure-deploy.ps1` - Main deployment orchestration
  - [ ] `azure-deploy.bicep` - Infrastructure as Code template
  - [ ] `keyvault-setup.ps1` - API keys configuration
  - [ ] `azure-deploy.bat` - Batch deployment wrapper

- [ ] **Configuration Files**
  - [ ] `config/azure/deployment-config.json` - Azure-specific configuration
  - [ ] `config/environments/azure-dev.env` - Environment variables
  - [ ] `docker-compose.azure.yml` - Azure-optimized compose file
  - [ ] `environment.template` - Environment configuration template

- [ ] **Documentation**
  - [ ] `README.md` - Main deployment guide
  - [ ] `DOCKER_WORKFLOW_README.md` - Docker workflow documentation
  - [ ] `ENTERPRISE_STRUCTURE_README.md` - Enterprise structure guide
  - [ ] `docs/deployment/` - Detailed deployment documentation
  - [ ] `docs/architecture/` - System architecture documentation
  - [ ] `infrastructure/azure/` - Azure infrastructure guides

### ✅ Azure Prerequisites
- [ ] **Azure Subscription Access**
  - [ ] Valid Azure subscription
  - [ ] Resource group: `maen-rg-devtest-aura1-fw-001`
  - [ ] Appropriate permissions (Contributor or Owner)

- [ ] **Existing Azure Resources**
  - [ ] Container Registry: `aura1devtestbeacrmaen`
  - [ ] Virtual Network: `maen-vnet-devtest-aura1-nw-001`
  - [ ] Key Vault: `aura1-devtest-be-kv-maen`
  - [ ] Azure OpenAI: `api-genai-devtest-maen`

- [ ] **Local Prerequisites**
  - [ ] Azure CLI installed and authenticated
  - [ ] PowerShell 5.1+ or PowerShell Core
  - [ ] Docker Desktop installed
  - [ ] Git with Git LFS

### ✅ API Keys and Secrets
- [ ] **OpenAI Configuration**
  - [ ] OpenAI API key available
  - [ ] Azure OpenAI endpoint configured: `https://api-genai-devtest-maen.azure-api.net`

- [ ] **Optional API Keys**
  - [ ] Google API key (for Google AI features)
  - [ ] Anthropic API key (for Claude features)

## 🚀 Deployment Steps

### Step 1: Repository Setup
```powershell
# Clone the repository
git clone https://github.com/RowenGopi87/Aura_Azure_Images.git
cd Aura_Azure_Images

# Verify Git LFS is working for large files
git lfs pull
```

### Step 2: Configure API Keys
```powershell
# Set up Azure Key Vault with API keys
.\keyvault-setup.ps1
```

### Step 3: Push Images to Azure Container Registry
```powershell
# Push Docker images to ACR
.\azure-push-images.ps1 -RegistryName "aura1devtestbeacrmaen" -ResourceGroup "maen-rg-devtest-aura1-fw-001"
```

### Step 4: Deploy to Azure Container Instances
```powershell
# Deploy the application
.\azure-deploy.ps1 -ResourceGroupName "maen-rg-devtest-aura1-fw-001" -EnvironmentPrefix "aura1-prod"
```

### Step 5: Verification
- [ ] Application URL accessible (provided in deployment output)
- [ ] Database connectivity test passes
- [ ] MCP services health checks pass
- [ ] AI features functional (design generation, etc.)

## 🔄 GitLab Migration Steps

### Transfer to Work Repository
```bash
# Add GitLab remote
git remote add gitlab <your-work-gitlab-repo-url>

# Push to GitLab (includes Git LFS files)
git push gitlab main

# Verify all files transferred correctly
```

### GitLab CI/CD Setup (Optional)
```yaml
# Example .gitlab-ci.yml for automated deployment
stages:
  - push-images
  - deploy

push_to_azure:
  stage: push-images
  script:
    - ./azure-push-images.ps1
  
deploy_to_azure:
  stage: deploy
  script:
    - ./azure-deploy.ps1
  when: manual
```

## 🔧 Troubleshooting

### Common Issues

**Docker Images Not Loading**
```powershell
# Verify Git LFS
git lfs ls-files
git lfs pull

# Check image integrity
docker load -i aura-database.tar
docker images | findstr aura
```

**Azure Authentication Issues**
```powershell
# Re-authenticate
az login
az account show
az acr login --name aura1devtestbeacrmaen
```

**Container Startup Failures**
```powershell
# Check container logs
az container logs --resource-group maen-rg-devtest-aura1-fw-001 --name aura1-prod-application-cg

# Verify network configuration
az network vnet subnet show --resource-group maen-rg-devtest-aura1-fw-001 --vnet-name maen-vnet-devtest-aura1-nw-001 --name "workload subnet"
```

**Key Vault Access Issues**
```powershell
# Verify Key Vault permissions
az keyvault show --name aura1-devtest-be-kv-maen
az keyvault secret list --vault-name aura1-devtest-be-kv-maen
```

## 📊 Resource Monitoring

### Post-Deployment Monitoring
- [ ] **Application Insights** configured for monitoring
- [ ] **Log Analytics** collecting container logs
- [ ] **Azure Monitor** alerts configured
- [ ] **Container health checks** passing

### Performance Verification
- [ ] Application load time < 3 seconds
- [ ] API response times < 500ms
- [ ] Database query performance acceptable
- [ ] AI feature response times reasonable

## 📞 Support Contacts

### Escalation Path
1. Check troubleshooting documentation in `docs/troubleshooting/`
2. Review Azure Activity Log for detailed errors
3. Contact Azure support for infrastructure issues
4. Check application logs in Azure Container Insights

### Important Links
- **Azure Portal**: [portal.azure.com](https://portal.azure.com)
- **Container Registry**: `aura1devtestbeacrmaen.azurecr.io`
- **Key Vault**: `aura1-devtest-be-kv-maen`
- **Azure OpenAI**: `api-genai-devtest-maen.azure-api.net`

---

## ✅ Deployment Sign-off

**Deployed by**: ________________  
**Date**: ________________  
**Application URL**: ________________  
**Version/Tag**: ________________  

**Verification completed by**: ________________  
**Date**: ________________  

**Production ready**: ☐ Yes ☐ No  
**Comments**: ________________
