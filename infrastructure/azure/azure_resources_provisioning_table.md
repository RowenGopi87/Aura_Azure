# 🔵 Azure Resources Provisioning Table for AURA

## 📋 **COMPLETE AZURE RESOURCES LIST**

| **Category** | **Resource Name** | **Azure Service** | **SKU/Tier** | **Configuration** | **Purpose** | **Dependencies** |
|---|---|---|---|---|---|---|
| **Resource Management** | `aura-prod-rg` | Resource Group | N/A | Location: East US 2 | Container for all resources | None |
| **Resource Management** | `aura-dev-rg` | Resource Group | N/A | Location: East US 2 | Development environment | None |
| **Security & Identity** | `aura-keyvault` | Azure Key Vault | Standard | Soft delete enabled, Purge protection | API keys, connection strings | Resource Group |
| **Security & Identity** | `aura-entra-app` | Microsoft Entra ID App Registration | N/A | Web app, API permissions | SSO authentication | Entra ID tenant |
| **Frontend Hosting** | `aura-frontend` | Azure Static Web Apps | Standard | Custom domain, CI/CD | Next.js React frontend | Resource Group |
| **Backend Services** | `aura-backend` | Azure App Service | B2 (Basic) | Linux, Node.js 18 LTS | Next.js API routes | Resource Group, Key Vault |
| **Backend Services** | `aura-backend-plan` | App Service Plan | B2 (Basic) | Linux, 2 cores, 3.5GB RAM | Hosting plan for backend | Resource Group |
| **AI Bridge Service** | `aura-mcp-bridge` | Azure Container Instances | 1 vCPU, 1.5GB RAM | Linux, Python 3.11 | MCP Bridge FastAPI server | Resource Group, Container Registry |
| **Container Registry** | `auracr` | Azure Container Registry | Basic | Admin user enabled | Store Docker images | Resource Group |
| **Database** | `aura-mariadb` | Azure Database for MariaDB | B_Gen5_1 (Burstable) | 2 vCores, 4GB RAM, 32GB storage | SDLC data storage | Resource Group, VNet |
| **AI Services** | `aura-openai` | Azure OpenAI Service | S0 (Standard) | GPT-4o, text-embedding-3-small | LLM operations | Resource Group |
| **Search & Vector** | `aura-search` | Azure AI Search | Basic | 1 search unit, 2GB storage | Vector search, RAG | Resource Group |
| **Storage** | `aurastorage` | Azure Storage Account | Standard_LRS | Hot tier, Blob storage | Document storage | Resource Group |
| **Integration** | `aura-jira-logic` | Azure Logic Apps | Consumption | Standard connectors | JIRA integration | Resource Group |
| **AI Services** | `aura-doc-intelligence` | Azure AI Document Intelligence | F0 (Free) / S0 (Standard) | Form recognition | PDF/Word processing | Resource Group |
| **Networking** | `aura-vnet` | Virtual Network | N/A | Address space: 10.0.0.0/16 | Network isolation | Resource Group |
| **Networking** | `aura-subnet-backend` | Subnet | N/A | Address range: 10.0.1.0/24 | Backend services subnet | VNet |
| **Networking** | `aura-subnet-data` | Subnet | N/A | Address range: 10.0.2.0/24 | Database subnet | VNet |
| **Networking** | `aura-nsg-backend` | Network Security Group | N/A | HTTP/HTTPS inbound rules | Backend security | Subnet |
| **Networking** | `aura-nsg-data` | Network Security Group | N/A | MySQL inbound rules | Database security | Subnet |
| **Monitoring** | `aura-insights` | Application Insights | Per GB | Retention: 90 days | Application monitoring | Resource Group |
| **DevOps** | `aura-devops` | Azure DevOps Organization | Basic | 5 users included | CI/CD pipelines | N/A |
| **Testing** | `aura-test-vm` | Azure Virtual Machine | B2s (Burstable) | Linux, 2 vCPUs, 4GB RAM | Playwright testing | Resource Group, VNet |
| **Analytics** | `aura-powerbi` | Power BI Embedded | A1 | 1GB memory | Business dashboards | Resource Group |
| **Backup** | `aura-backup-vault` | Recovery Services Vault | N/A | GRS (Geo-redundant) | Database backups | Resource Group |

## 🔧 **DETAILED RESOURCE SPECIFICATIONS**

### **🏗️ Core Infrastructure**

#### **Resource Groups**
```yaml
Production Resource Group:
  Name: aura-prod-rg
  Location: East US 2
  Tags:
    Environment: Production
    Project: AURA
    Owner: SRE Team

Development Resource Group:
  Name: aura-dev-rg
  Location: East US 2
  Tags:
    Environment: Development
    Project: AURA
    Owner: Development Team
```

#### **Virtual Network Configuration**
```yaml
Virtual Network:
  Name: aura-vnet
  Address Space: 10.0.0.0/16
  Subnets:
    - Name: aura-subnet-backend
      Address Range: 10.0.1.0/24
      Purpose: App Service, Container Instances
    - Name: aura-subnet-data
      Address Range: 10.0.2.0/24
      Purpose: Database, Storage
    - Name: aura-subnet-test
      Address Range: 10.0.3.0/24
      Purpose: Test VMs, DevOps agents
```

### **🔐 Security & Identity**

#### **Key Vault Configuration**
```yaml
Azure Key Vault:
  Name: aura-keyvault
  SKU: Standard
  Features:
    - Soft Delete: Enabled (90 days)
    - Purge Protection: Enabled
    - RBAC: Enabled
  Secrets to Store:
    - OpenAI API Keys
    - Database Connection Strings
    - JIRA API Tokens
    - External LLM API Keys
```

#### **Entra ID App Registration**
```yaml
App Registration:
  Name: aura-entra-app
  Type: Web Application
  Redirect URIs:
    - https://aura-frontend.azurestaticapps.net/auth/callback
    - https://your-custom-domain.com/auth/callback
  API Permissions:
    - Microsoft Graph: User.Read
    - Microsoft Graph: Directory.Read.All
  Authentication:
    - Implicit Grant: Disabled
    - Authorization Code Flow: Enabled
```

### **🌐 Frontend & Backend Services**

#### **Static Web Apps Configuration**
```yaml
Static Web App:
  Name: aura-frontend
  SKU: Standard
  Features:
    - Custom Domain: Enabled
    - SSL Certificate: Auto-managed
    - CI/CD: GitHub Actions / Azure DevOps
  Build Configuration:
    App Location: /
    API Location: (empty - using separate App Service)
    Output Location: .next
```

#### **App Service Configuration**
```yaml
App Service:
  Name: aura-backend
  App Service Plan: aura-backend-plan
  Runtime: Node.js 18 LTS
  Operating System: Linux
  Features:
    - Always On: Enabled
    - HTTPS Only: Enabled
    - Managed Identity: System-assigned
  Application Settings:
    - AURA_DB_HOST: aura-mariadb.mariadb.database.azure.com
    - AZURE_OPENAI_ENDPOINT: https://aura-openai.openai.azure.com/
    - AZURE_SEARCH_ENDPOINT: https://aura-search.search.windows.net
```

#### **Container Instances Configuration**
```yaml
Container Instance:
  Name: aura-mcp-bridge
  Container Image: auracr.azurecr.io/aura-mcp-bridge:latest
  CPU: 1 vCPU
  Memory: 1.5 GB
  OS Type: Linux
  Restart Policy: Always
  Network Profile: aura-vnet/aura-subnet-backend
  Environment Variables:
    - AZURE_OPENAI_ENDPOINT: (from Key Vault)
    - AZURE_SEARCH_ENDPOINT: (from Key Vault)
```

### **💾 Database & Storage**

#### **MariaDB Configuration**
```yaml
Azure Database for MariaDB:
  Name: aura-mariadb
  SKU: B_Gen5_1 (Burstable)
  Compute: 2 vCores
  Memory: 4 GB
  Storage: 32 GB (auto-grow enabled)
  Backup Retention: 7 days
  Geo-Redundant Backup: Disabled (for cost)
  SSL Enforcement: Enabled
  Firewall Rules:
    - Allow Azure Services: Yes
    - VNet Rule: aura-subnet-backend
```

#### **Storage Account Configuration**
```yaml
Storage Account:
  Name: aurastorage
  SKU: Standard_LRS
  Kind: StorageV2
  Access Tier: Hot
  Containers:
    - documents (Private)
    - uploads (Private)
    - exports (Private)
  Features:
    - Blob Versioning: Enabled
    - Soft Delete: 7 days
```

### **🤖 AI & Cognitive Services**

#### **Azure OpenAI Configuration**
```yaml
Azure OpenAI Service:
  Name: aura-openai
  SKU: S0 (Standard)
  Location: East US 2
  Models to Deploy:
    - gpt-4o (100K TPM)
    - text-embedding-3-small (350K TPM)
    - gpt-4o-mini (200K TPM)
  Features:
    - Content Filtering: Default policy
    - Network Access: Selected networks (VNet)
```

#### **AI Search Configuration**
```yaml
Azure AI Search:
  Name: aura-search
  SKU: Basic
  Capacity: 1 search unit
  Storage: 2 GB
  Features:
    - Semantic Search: Enabled
    - Vector Search: Enabled
    - Indexers: Enabled
  Network Access: Public (with IP restrictions)
```

## 💰 **ESTIMATED MONTHLY COSTS (USD)**

| **Service** | **Production** | **Development** | **Notes** |
|---|---|---|---|
| App Service (B2) | $54.75 | $27.38 | 50% dev usage |
| Container Instances | $46.72 | $23.36 | 1 vCPU, 1.5GB |
| Azure Database for MariaDB | $50.37 | $25.19 | Burstable tier |
| Azure OpenAI Service | $200-500 | $50-100 | Usage-based |
| Azure AI Search (Basic) | $250 | $125 | Basic tier |
| Storage Account | $5-20 | $2-5 | Based on usage |
| Static Web Apps (Standard) | $9 | $0 | Free tier for dev |
| Application Insights | $10-30 | $5-10 | Based on data |
| Key Vault | $3 | $1.50 | Per operation |
| Virtual Network | $0 | $0 | No charge |
| **TOTAL ESTIMATED** | **$629-933** | **$259-297** | **Per month** |

## 🚀 **DEPLOYMENT PRIORITY ORDER**

### **Phase 1: Foundation (Week 1)**
1. Create Resource Groups
2. Set up Virtual Network and Subnets
3. Configure Network Security Groups
4. Create Key Vault
5. Set up Entra ID App Registration

### **Phase 2: Core Services (Week 2)**
1. Deploy Azure Database for MariaDB
2. Create Storage Account
3. Set up Application Insights
4. Deploy Container Registry

### **Phase 3: Application Services (Week 3)**
1. Deploy Static Web Apps (Frontend)
2. Create App Service Plan and App Service
3. Deploy Container Instances (MCP Bridge)
4. Configure networking and security

### **Phase 4: AI Services (Week 4)**
1. Deploy Azure OpenAI Service
2. Set up Azure AI Search
3. Configure AI Document Intelligence
4. Test AI integrations

### **Phase 5: Integration & DevOps (Week 5)**
1. Set up Azure DevOps
2. Configure CI/CD pipelines
3. Deploy Logic Apps for JIRA
4. Set up monitoring and alerts

## 🔑 **REQUIRED AZURE PERMISSIONS FOR SRE**

| **Permission Level** | **Scope** | **Purpose** |
|---|---|---|
| **Contributor** | Subscription | Create and manage all resources |
| **User Access Administrator** | Subscription | Assign roles and permissions |
| **Application Administrator** | Entra ID | Create app registrations |
| **Global Administrator** | Entra ID | Configure SSO and RBAC |

## 📋 **POST-DEPLOYMENT CHECKLIST**

- [ ] All resources deployed successfully
- [ ] Network connectivity tested
- [ ] SSL certificates configured
- [ ] Secrets stored in Key Vault
- [ ] Monitoring and alerts configured
- [ ] Backup policies implemented
- [ ] Security policies applied
- [ ] Cost management alerts set up
- [ ] Documentation updated
- [ ] Team access configured

This comprehensive table provides your SRE team with all the information needed to provision the complete Azure infrastructure for hosting AURA in the cloud.


