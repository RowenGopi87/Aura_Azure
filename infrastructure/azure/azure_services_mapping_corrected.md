# 🔵 Azure Services Mapping for AURA Architecture (Corrected)

## ✅ **CORRECTED AZURE SERVICES MAPPING**

| AURA Component | Azure Service | Rationale & Notes |
|---|---|---|
| **Frontend (Next.js React)** | **Azure Static Web Apps** | ✅ Perfect for Next.js with built-in CI/CD, global CDN, and serverless functions |
| **Backend API (Next.js API Routes)** | **Azure App Service (Linux)** | ✅ Supports Node.js, auto-scaling, integrated with Azure ecosystem |
| **MCP Bridge (Python FastAPI)** | **Azure Container Instances (ACI)** or **Azure App Service** | ✅ Better than AKS for single service; ACI for cost-effectiveness |
| **Database (MariaDB)** | **Azure Database for MariaDB** | ✅ Fully managed, but **NOTE**: No native vector support |
| **Vector Storage** | **Azure AI Search** | ✅ Purpose-built for vector search with hybrid search capabilities |
| **AI/LLM Services** | **Azure OpenAI Service** | ✅ GPT-4o, embeddings, content filtering, enterprise security |
| **File Storage & Processing** | **Azure Blob Storage** + **Azure AI Document Intelligence** | ✅ Scalable storage + intelligent document parsing |
| **Authentication & RBAC** | **Microsoft Entra ID (Azure AD)** | ✅ Enterprise SSO, role-based access, security |
| **Test Automation (Playwright)** | **Azure DevOps Agents** + **Azure Container Instances** | ✅ Self-hosted agents for browser testing |
| **JIRA Integration** | **Azure Logic Apps** | ✅ No-code integration with enterprise systems |
| **CI/CD Pipeline** | **Azure DevOps** or **GitHub Actions** | ✅ Full DevOps lifecycle management |
| **Monitoring & Analytics** | **Azure Application Insights** + **Power BI Embedded** | ✅ Application telemetry + business dashboards |
| **Secrets Management** | **Azure Key Vault** | ✅ Secure API key and connection string management |

## ⚠️ **CORRECTIONS TO ORIGINAL MAPPING**

### **🔧 1. Database Strategy Correction**
**ISSUE**: Azure Database for MariaDB doesn't support vector extensions like pgvector.

**SOLUTION**: 
- **Primary Database**: Azure Database for MariaDB (SDLC data)
- **Vector Database**: Azure AI Search (embeddings, RAG)
- **Alternative**: Azure Database for PostgreSQL with pgvector extension

### **🔧 2. Container Strategy Refinement**
**ISSUE**: AKS is overkill for a single MCP Bridge service.

**SOLUTION**: 
- **Azure Container Instances (ACI)**: Cost-effective for single container
- **Azure App Service**: If you prefer PaaS with auto-scaling

### **🔧 3. AI Services Consolidation**
**ISSUE**: Multiple AI providers create complexity in Azure.

**SOLUTION**: 
- **Primary**: Azure OpenAI Service (GPT-4o, embeddings)
- **Fallback**: Keep external APIs (Gemini, Claude) as backup

### **🔧 4. Test Automation Architecture**
**ISSUE**: Azure DevTest Labs is deprecated for new scenarios.

**SOLUTION**: 
- **Azure DevOps Self-Hosted Agents** running in **Azure VMs**
- **Azure Container Instances** for on-demand test execution

## 🔑 **REQUIRED AZURE PERMISSIONS (Corrected)**

| Service | Required Role | Purpose |
|---|---|---|
| **Azure OpenAI** | `Cognitive Services OpenAI Contributor` | LLM operations, embeddings |
| **Azure AI Search** | `Search Service Contributor` | Vector search, indexing |
| **Azure Database for MariaDB** | `MySQL DB Contributor` | Database operations |
| **Azure App Service** | `App Service Contributor` | Deploy and manage apps |
| **Azure Static Web Apps** | `Static Web Apps Contributor` | Frontend deployment |
| **Microsoft Entra ID** | `Application Administrator` | SSO, RBAC setup |
| **Azure Key Vault** | `Key Vault Secrets Officer` | Manage API keys |
| **Azure Blob Storage** | `Storage Blob Data Contributor` | File operations |
| **Azure Logic Apps** | `Logic Apps Contributor` | JIRA integration |
| **Azure DevOps** | `Project Administrator` | CI/CD pipelines |

## 🏗️ **RECOMMENDED AZURE ARCHITECTURE PATTERN**

### **Resource Group Structure**
```
aura-production-rg
├── aura-frontend (Static Web App)
├── aura-backend (App Service)  
├── aura-mcp-bridge (Container Instance)
├── aura-database (MariaDB)
├── aura-search (AI Search)
├── aura-openai (OpenAI Service)
├── aura-storage (Storage Account)
├── aura-keyvault (Key Vault)
└── aura-insights (Application Insights)
```

### **Network Security**
- **Virtual Network**: Isolate backend services
- **Private Endpoints**: Secure database and storage access
- **Application Gateway**: Web application firewall
- **Managed Identity**: Service-to-service authentication



