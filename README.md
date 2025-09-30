# 🚀 Aura Azure Deployment Images

This repository contains the production-ready Docker images and deployment scripts for the Aura SDLC application, specifically configured for Azure enterprise deployment.

## 📦 Contents

### Docker Images (Production Ready)
- **aura-database.tar** (100MB) - MariaDB database with initialization scripts
- **aura-application.tar** (465MB) - Next.js application with all fixes applied
- **aura-mcp-services.tar** (701MB) - Python MCP services with Playwright integration

### Azure Deployment Scripts
- **azure-push-images.ps1** - Pushes images to Azure Container Registry
- **azure-deploy.ps1** - Deploys containers to Azure Container Instances  
- **azure-deploy.bicep** - Infrastructure as Code template
- **keyvault-setup.ps1** - Configures API keys in Azure Key Vault

## 🏗️ Deployment Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Aura Application  │    │   MCP Services       │    │   Database          │
│   (Next.js)         │───▶│   (Python + AI)      │    │   (MariaDB)         │
│   Port: 3000        │    │   Ports: 8000, 8931  │    │   Port: 3306        │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
           │                          │                          │
           └────────────────┬─────────┴──────────────────────────┘
                           │
                  ┌─────────────────────┐
                  │   Azure VNet        │
                  │   Private Network   │
                  └─────────────────────┘
```

## 🎯 Quick Start

### Prerequisites
- Azure CLI installed and logged in
- PowerShell 5.1+ or PowerShell Core
- Docker installed
- Access to your Azure subscription

### 1. Configure API Keys
```powershell
.\keyvault-setup.ps1
```
This will prompt you to enter:
- OpenAI API Key (required)
- Google API Key (optional) 
- Anthropic API Key (optional)

### 2. Push Images to Azure Container Registry
```powershell
.\azure-push-images.ps1 -RegistryName "aura1devtestbeacrmaen" -ResourceGroup "maen-rg-devtest-aura1-fw-001"
```

### 3. Deploy to Azure Container Instances
```powershell
.\azure-deploy.ps1 -ResourceGroupName "maen-rg-devtest-aura1-fw-001" -EnvironmentPrefix "aura1-prod"
```

## 🔧 Configuration

### Existing Azure Resources (Pre-configured)
- **Resource Group**: maen-rg-devtest-aura1-fw-001
- **Virtual Network**: maen-vnet-devtest-aura1-nw-001  
- **Container Registry**: aura1devtestbeacrmaen
- **Key Vault**: aura1-devtest-be-kv-maen
- **Azure OpenAI**: api-genai-devtest-maen
- **Database**: Azure Database for MySQL (if migrating from container DB)

### Environment Variables
The deployment automatically configures:
- Database connections
- Service-to-service networking  
- OpenAI API integration
- Security credentials from Key Vault

## 🌐 Azure OpenAI Integration

Your existing Azure OpenAI endpoint:
```
https://api-genai-devtest-maen.azure-api.net/openai/deployments/gpt-4.1/chat/completions
```

The deployment scripts automatically configure the MCP services to use this endpoint with your stored API keys.

## 📋 Post-Deployment Steps

1. **Test Application**: Visit the deployed URL (provided after deployment)
2. **Verify AI Features**: Test design generation and AI-powered features
3. **Monitor**: Use App Insights and Log Analytics for monitoring
4. **Scale**: Adjust container resources based on usage

## 🔒 Security Features

- **Private Networking**: All containers deployed in existing VNet
- **Key Vault Integration**: Secure storage of API keys
- **Container Registry**: Private image storage
- **Network Security Groups**: Controlled access

## 🚢 GitLab Migration

To transfer these images to your work GitLab repository:

1. Clone this repository
2. Add your GitLab remote:
   ```bash
   git remote add gitlab <your-gitlab-repo-url>
   ```
3. Push images and scripts:
   ```bash
   git push gitlab main
   ```

## 📊 Resource Requirements

### Container Specifications
- **Database**: 1 CPU, 2GB RAM
- **MCP Services**: 2 CPU, 4GB RAM  
- **Application**: 2 CPU, 4GB RAM

### Network Requirements
- **Inbound**: Port 3000 (HTTPS recommended)
- **Internal**: Ports 3306, 8000, 8931 (private network)

## 🆘 Troubleshooting

### Common Issues

**Images not found in ACR**
```powershell
# Verify images were pushed
az acr repository list --name aura1devtestbeacrmaen
```

**Container startup failures**
```powershell
# Check container logs
az container logs --resource-group maen-rg-devtest-aura1-fw-001 --name aura1-prod-application-cg
```

**Database connection issues**
- Verify network security group rules
- Check Key Vault secret access permissions
- Ensure subnet has available IP addresses

## 📞 Support

For deployment issues:
1. Check Azure Activity Log for detailed error messages
2. Verify all resource names match your environment
3. Ensure sufficient permissions for resource creation
4. Check network security group rules

## 📄 License

Enterprise Internal Use - All Rights Reserved