# 🧪 Aura Local Testing Guide

This guide helps you test the production Docker images locally before committing to your work environment.

## 📂 Local Testing Files

- `load-local-images.ps1` - Load the exported .tar images into Docker
- `docker-compose.local-test.yml` - Local deployment configuration
- `deploy-local.ps1` - Full deployment orchestration
- `cleanup-local.ps1` - Clean up test environment

## 🚀 Quick Start

### 1. Deploy Everything (Recommended)
```powershell
# Deploy with clean environment
.\deploy-local.ps1 -Clean

# Or just deploy (if images already loaded)
.\deploy-local.ps1 -SkipLoad
```

### 2. Step-by-Step Deployment
```powershell
# Step 1: Load the production images
.\load-local-images.ps1

# Step 2: Start services
docker-compose -f docker-compose.local-test.yml up -d

# Step 3: Check status
docker-compose -f docker-compose.local-test.yml ps
```

## 🔍 Testing Checklist

### Automated Checks (Built into deploy-local.ps1)
- ✅ Database connectivity test
- ✅ MCP services health check  
- ✅ Application response test

### Manual Testing (Your Responsibility)
- [ ] Navigate to http://localhost:3000
- [ ] Login/authentication works
- [ ] Database operations function
- [ ] AI features respond (design generation, etc.)
- [ ] MCP services integrate properly
- [ ] No critical errors in logs

## 🌐 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Application** | http://localhost:3000 | Main Aura interface |
| **Database** | localhost:3306 | MariaDB (user: aura_user) |
| **MCP Services** | http://localhost:8000 | Python MCP bridge |
| **Playwright MCP** | http://localhost:8931 | Browser automation |

## 🔧 Troubleshooting

### Check Service Logs
```powershell
# All services
docker-compose -f docker-compose.local-test.yml logs

# Specific service
docker-compose -f docker-compose.local-test.yml logs aura-application
docker-compose -f docker-compose.local-test.yml logs aura-database
docker-compose -f docker-compose.local-test.yml logs aura-mcp-services
```

### Common Issues

**Database Connection Failed**
```powershell
# Check if database is ready
docker exec aura-database-local-test mysqladmin ping -u aura_user -paura_password_123
```

**Application Not Responding**
```powershell
# Check application logs
docker logs aura-application-local-test
```

**MCP Services Down**
```powershell
# Check MCP health directly
curl http://localhost:8000/health
```

## 🧹 Cleanup

```powershell
# Clean up when testing complete
.\cleanup-local.ps1
```

## ✅ Success Criteria

**Local testing passes when:**
1. ✅ All services start and show healthy status
2. ✅ Application loads at http://localhost:3000
3. ✅ Database operations work (create/read projects, etc.)
4. ✅ AI features respond (even if API keys not configured)
5. ✅ No critical errors in service logs

## 🚀 Next Steps

**If local testing succeeds:**
1. Run cleanup: `.\cleanup-local.ps1`
2. Commit deployment images to work GitLab environment
3. Proceed with Azure production deployment

**If local testing fails:**
1. Check logs for specific issues
2. Fix any problems in source code
3. Rebuild images and re-export
4. Repeat local testing
