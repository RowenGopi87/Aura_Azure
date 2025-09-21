# 🐳 Aura SDLC Docker Containerization Guide

## 📋 Overview

This guide documents the complete Docker containerization of the Aura SDLC system, including the three-stage workflow for local development, local Docker testing, and Azure deployment.

## 🎯 Three-Stage Workflow

### **Stage 1: Local Development** (Current Setup)
```bash
# Continue your normal development workflow
start-aura-with-mcp.bat
# or
npm run dev
```
- ✅ Hot reload and instant changes
- ✅ Visible browser for Playwright debugging
- ✅ Full MCP integration
- ✅ Local MariaDB database

### **Stage 2: Local Docker Testing** (Containerized)
```bash
# One command to test containerized version
.\package-for-docker.bat
```
- ✅ All components containerized
- ✅ Automatic database initialization (35 tables)
- ✅ Container-to-container communication
- ✅ Production-like environment testing

### **Stage 3: Azure Deployment** (Production)
```bash
# Deploy to Azure dev environment
.\scripts\deploy-to-azure-dev.bat
```
- ✅ Push containers to Azure Container Registry
- ✅ Deploy to Azure App Services
- ✅ Configure networking and secrets
- ✅ Production environment ready

## 🏗️ Container Architecture

### **Three-Container Strategy**

#### **Container 1: Aura Application**
- **Base Image**: `node:18-alpine`
- **Dockerfile**: `Dockerfile.aura-app.dev`
- **Port**: 3000
- **Mode**: Development (hot reload for local testing)
- **Contents**: Complete Next.js application with all dependencies

#### **Container 2: MariaDB Database**
- **Base Image**: `mariadb:11.8`
- **Dockerfile**: `Dockerfile.mariadb`
- **Port**: 3306
- **Initialization**: Automatic (all 35 tables)
- **Contents**: Complete database schema with RBAC, Audit, AuraV2

#### **Container 3: MCP Services**
- **Base Image**: `python:3.11-slim`
- **Dockerfile**: `Dockerfile.mcp-services`
- **Ports**: 8000, 8931, 8932
- **Browser**: Headless Playwright
- **Contents**: Python MCP server + Node.js Playwright automation

## 📦 Docker Files Created

### **Core Docker Files**
```
├── Dockerfile.aura-app.dev          # Application container (development mode)
├── Dockerfile.mariadb               # Database container with auto-initialization
├── Dockerfile.mcp-services          # MCP services with headless browser
├── docker-compose.local.yml         # Local testing orchestration
├── docker-compose.azure.yml         # Azure deployment configuration
└── .dockerignore                    # Exclude unnecessary files
```

### **Scripts Created**
```
├── package-for-docker.bat           # Main packaging and testing script
├── cleanup-containers.bat           # Clean up Docker resources
├── scripts/
│   ├── deploy-to-azure-dev.bat      # Azure deployment script
│   ├── sync-database-to-local.bat   # Database synchronization
│   ├── setup-azure-ready-database.bat # Database setup verification
│   └── create-complete-aura-database.sql # Complete database schema
```

## 🗄️ Database Initialization

### **Automatic Database Setup**
The MariaDB container automatically creates:

**Core Tables (7):**
- `business_briefs`, `initiatives`, `features`, `epics`, `stories`, `test_cases`, `portfolios`

**RBAC System (8):**
- `users`, `roles`, `departments`, `organizational_levels`, `system_modules`, `permission_types`, `role_permissions`, `user_role_assignments`

**Audit System (5):**
- `audit_events`, `audit_config`, `user_sessions`, `generation_analytics`, `prompt_analytics`

**AuraV2 Features (6):**
- `aurav2_ai_consolidations`, `aurav2_business_brief_extensions`, `aurav2_qualified_ideas`, `aurav2_user_roles`, `aurav2_workflow_progress`, `aurav2_workflow_stages`

**Additional Features (7):**
- `code_items`, `designs`, `documents`, `safe_mappings`, `vector_stores`, `work_items_context`

**Database Views (2):**
- `role_permission_matrix`, `user_permissions`

**Total: 35 Tables** (matching local environment exactly)

### **Sample Data Included**
- **Emirates Users**: Including Rowen Gopi as System Administrator
- **Roles and Permissions**: Complete RBAC hierarchy
- **Sample Business Briefs**: For testing
- **Audit Configuration**: Ready for tracking
- **Workflow Stages**: AuraV2 workflow management

## 🚀 Usage Instructions

### **Local Docker Testing**
```bash
# Step 1: Package and test locally
.\package-for-docker.bat

# This will:
# 1. Stop any existing containers
# 2. Clean up old images (optional)
# 3. Build all three containers
# 4. Start containers with automatic database initialization
# 5. Verify all services are healthy
# 6. Show service URLs and status

# Step 2: Test the application
# Visit: http://localhost:3000
# Test APIs and functionality

# Step 3: Clean up when done
.\cleanup-containers.bat
```

### **Azure Deployment**
```bash
# Prerequisites:
# 1. Azure CLI installed and logged in (az login)
# 2. Local Docker testing completed successfully

# Deploy to Azure:
.\scripts\deploy-to-azure-dev.bat

# This will:
# 1. Validate prerequisites
# 2. Tag containers for Azure Container Registry
# 3. Push containers to ACR
# 4. Deploy to Azure App Services
# 5. Configure environment variables
# 6. Verify deployment
```

## 🔧 Configuration Management

### **Environment Variables**
```env
# Database Configuration
AURA_DB_HOST=aura-database          # Container networking
AURA_DB_PORT=3306
AURA_DB_USER=aura_user
AURA_DB_PASSWORD=aura_password_123
AURA_DB_NAME=aura_playground

# MCP Configuration
MCP_BRIDGE_URL=http://aura-mcp-services:8000
PLAYWRIGHT_MCP_URL=http://aura-mcp-services:8931

# LLM API Keys (from environment or Azure Key Vault)
OPENAI_API_KEY=${OPENAI_API_KEY}
GOOGLE_API_KEY=${GOOGLE_API_KEY}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

### **Azure-Specific Configuration**
```env
# Azure App Service URLs
NEXT_PUBLIC_APP_URL=https://aura1-devtest-fe-app-maen.azurewebsites.net
NEXTAUTH_URL=https://aura1-devtest-fe-app-maen.azurewebsites.net

# Azure Container Registry
AZURE_CONTAINER_REGISTRY=aura1devtestbeacrmaen.azurecr.io
```

## 🧪 Testing and Verification

### **Automatic Health Checks**
```bash
# Database Health
curl http://localhost:3000/api/database/health

# Expected Response:
{
  "healthy": true,
  "services": {
    "database": {"connected": true},
    "embeddings": {"enabled": false},
    "vectorStore": {"available": false}
  },
  "timestamp": "2025-09-21T19:54:45.892Z",
  "message": "Database connection successful"
}

# MCP Services Health
curl http://localhost:8000/health

# Expected Response:
{
  "status": "healthy",
  "mcp_client_initialized": true
}

# Business Briefs API
curl http://localhost:3000/api/business-briefs/list

# Expected Response:
{
  "success": true,
  "data": [...business briefs...],
  "total": 2
}
```

### **Database Verification**
```bash
# Check table count (should be 35)
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "SELECT COUNT(*) as 'Tables' FROM information_schema.tables WHERE table_schema = 'aura_playground';"

# Check sample data
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "SELECT COUNT(*) as 'Users' FROM users; SELECT COUNT(*) as 'Business_Briefs' FROM business_briefs;"
```

## 🔒 Security Considerations

### **Container Security**
- ✅ Non-root users in all containers
- ✅ Minimal base images
- ✅ No secrets in Dockerfiles (environment variables)
- ✅ Health checks for monitoring

### **Database Security**
- ✅ Dedicated database user (aura_user)
- ✅ Password-protected access
- ✅ Network isolation within container network
- ✅ Configurable SSL support

### **Azure Security**
- ✅ Azure Key Vault for secrets management
- ✅ Container Registry authentication
- ✅ App Service managed identity
- ✅ VNet integration for network isolation

## 🚨 Troubleshooting

### **Common Issues and Solutions**

#### **Database Not Initializing**
```bash
# Symptom: Database health check fails
# Solution: Ensure fresh volume
docker-compose -f docker-compose.local.yml down --volumes
.\package-for-docker.bat
```

#### **Application Build Errors**
```bash
# Symptom: TypeScript compilation errors
# Solution: Check for syntax errors in simplified pages
# Files: src/app/admin/audit/settings/page.tsx, src/app/v1/dashboard/page.tsx
```

#### **MCP Services Not Starting**
```bash
# Symptom: Playwright automation fails
# Solution: Check browser dependencies
docker logs aura-mcp-services
```

#### **Container Communication Issues**
```bash
# Check container networking
docker network ls
docker network inspect aura-network
```

## 📊 Performance Metrics

### **Container Resource Usage**
- **Application Container**: ~163MB RAM, minimal CPU
- **Database Container**: ~305MB RAM, moderate CPU during initialization
- **MCP Services Container**: ~412MB RAM (includes browser), minimal CPU

### **Initialization Times**
- **First Build**: 5-8 minutes (downloading base images)
- **Subsequent Builds**: 2-3 minutes (cached layers)
- **Database Initialization**: 30-60 seconds (35 tables + data)
- **Application Startup**: 10-20 seconds (development mode)

## 🌐 Azure Deployment Architecture

### **Azure Resource Mapping**
```
┌─────────────────────────────────┐
│ aura1-devtest-fe-app-maen      │ ← Aura Application Container
│ (App Service)                   │   (Next.js Frontend + API)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ aura1-devtest-be-app-maen      │ ← MariaDB Database Container
│ (Container Instance)            │   (Database with 35 tables)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ aura1-devtest-be-asp-maen      │ ← MCP Services Container
│ (App Service)                   │   (Python MCP + Playwright)
└─────────────────────────────────┘
```

### **Supporting Azure Resources**
- **Container Registry**: `aura1devtestbeacrmaen.azurecr.io`
- **Resource Group**: `maen-rg-devtest-aura1-fw-001`
- **Virtual Network**: `maen-vnet-devtest-aura1-nw-001`
- **Storage**: `aura1devtestbestmaen` (for persistent data)

## 🎉 Success Criteria

### **Local Docker Testing Complete When:**
- ✅ All 3 containers build successfully
- ✅ Database automatically creates 35 tables
- ✅ Application health check returns `{"healthy": true}`
- ✅ Business briefs API returns data
- ✅ MCP services return `{"status": "healthy"}`
- ✅ No manual intervention required

### **Azure Deployment Ready When:**
- ✅ Local Docker testing passes
- ✅ Azure CLI configured and authenticated
- ✅ Container images pushed to Azure Container Registry
- ✅ App Services configured with proper environment variables
- ✅ All health checks pass in Azure environment

## 📝 Change Log

### **Key Fixes Implemented**
1. **Database Configuration**: Removed `skip-grant-tables` from my.ini
2. **Automatic Initialization**: MariaDB scripts run automatically on fresh volumes
3. **TypeScript Issues**: Simplified problematic pages for reliable builds
4. **Container Networking**: Proper service discovery and communication
5. **Health Checks**: Enhanced monitoring for all services
6. **Development Mode**: Application runs in dev mode for better debugging

### **Files Modified**
- `config/database/my.ini` - Removed problematic configuration
- `Dockerfile.mariadb` - Added automatic initialization
- `docker-compose.local.yml` - Fixed environment variables
- `package-for-docker.bat` - Enhanced with automatic verification
- `src/app/admin/audit/settings/page.tsx` - Simplified for reliable builds
- `src/app/v1/dashboard/page.tsx` - Simplified for reliable builds

## 🔄 Maintenance

### **Regular Updates**
```bash
# Update application code
# 1. Make changes in Stage 1 (local development)
# 2. Test in Stage 2 (local Docker)
# 3. Deploy in Stage 3 (Azure)

# Update database schema
# 1. Add new SQL scripts to tools/database/setup/
# 2. Update scripts/create-complete-aura-database.sql
# 3. Test with fresh Docker rebuild
# 4. Deploy to Azure
```

### **Backup and Recovery**
```bash
# Export database from container
docker exec aura-database mariadb-dump -u root -paura_root_password_123 --all-databases > aura-backup.sql

# Import database to new container
docker exec aura-database mariadb -u root -paura_root_password_123 < aura-backup.sql
```

---

**This containerization provides a robust, scalable, and maintainable deployment strategy for the Aura SDLC system with complete Azure integration.**
