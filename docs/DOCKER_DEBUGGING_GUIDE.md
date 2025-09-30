# 🐳 Docker Debugging Guide for Aura SDLC

## Overview
This guide provides comprehensive debugging solutions for the Aura SDLC application running in Docker containers, with special focus on monitoring LLM operations and troubleshooting runtime issues.

## 🚀 Quick Start

### Method 1: Using Debug Scripts (Recommended)

**Windows (PowerShell):**
```powershell
# Start debug environment
.\scripts\debug-docker.ps1 start

# View logs with follow
.\scripts\debug-docker.ps1 logs application -Follow

# Open shell in application container
.\scripts\debug-docker.ps1 shell application
```

**Linux/macOS:**
```bash
# Make script executable (first time only)
chmod +x scripts/debug-docker.sh

# Start debug environment
./scripts/debug-docker.sh start

# View logs with follow
./scripts/debug-docker.sh logs application --follow

# Open shell in application container
./scripts/debug-docker.sh shell application
```

### Method 2: Using npm Scripts
```bash
# Start debug containers
npm run docker:debug

# View all logs
npm run docker:logs

# Stop debug containers
npm run docker:debug:down
```

## 🔍 Web-Based Debugging Interfaces

Once the debug environment is running, access these interfaces:

| Interface | URL | Purpose |
|-----------|-----|---------|
| **Application** | http://localhost:3000 | Main Aura application |
| **Log Viewer (Dozzle)** | http://localhost:9999 | Real-time container logs |
| **Node.js Debugger** | chrome://inspect | Chrome DevTools debugging |

### Setting Up Chrome DevTools Debugging
1. Open Chrome and navigate to `chrome://inspect`
2. Click "Configure" and add `localhost:9229`
3. Click "inspect" under the Node.js target
4. Set breakpoints in your source code

## 📋 Monitoring LLM Operations

### Enhanced Logging for LLM Debugging

The debug configuration includes enhanced logging for LLM operations:

```bash
# Environment variables set in debug mode:
LLM_DEBUG=true
LLM_LOG_REQUESTS=true
LLM_LOG_RESPONSES=true
DEBUG=*
```

### Viewing LLM Logs

**Real-time monitoring:**
```bash
# Windows
.\scripts\debug-docker.ps1 logs application -Follow

# Linux/macOS
./scripts/debug-docker.sh logs application --follow
```

**Specific LLM operation logs:**
```bash
# Filter for LLM-related logs
docker logs aura-application-debug 2>&1 | grep -i "llm\|openai\|anthropic\|google"
```

### LLM Request/Response Debugging

When `LLM_DEBUG=true`, you'll see detailed logs like:
```
[LLM] Request to OpenAI:
  Model: gpt-4
  Messages: [...]
  Temperature: 0.7

[LLM] Response from OpenAI:
  Status: 200
  Usage: { prompt_tokens: 150, completion_tokens: 75 }
  Response: [...]
```

## 🛠️ Common Debugging Scenarios

### 1. Hydration Errors (Fixed)
The hydration error in `chat-assistant-improved.tsx` has been fixed by using UTC timezone for timestamp formatting.

### 2. LLM Not Responding

**Check API keys:**
```bash
# Enter application container
docker exec -it aura-application-debug /bin/bash

# Check environment variables
env | grep -E "OPENAI|ANTHROPIC|GOOGLE"
```

**View LLM-specific logs:**
```bash
# Follow logs and filter for API calls
docker logs -f aura-application-debug | grep -i "api\|llm\|error"
```

### 3. Database Connection Issues

**Check database health:**
```bash
# Windows
.\scripts\debug-docker.ps1 status

# Linux/macOS
./scripts/debug-docker.sh status
```

**Test database connection:**
```bash
# Enter database container
docker exec -it aura-database-debug mysql -u aura_user -paura_password_123 -e "SELECT 1"
```

### 4. MCP Services Issues

**Check MCP service health:**
```bash
curl http://localhost:8000/health
curl http://localhost:8931/health
```

**View MCP logs:**
```bash
# Windows
.\scripts\debug-docker.ps1 logs mcp -Follow

# Linux/macOS
./scripts/debug-docker.sh logs mcp --follow
```

## 📊 Performance Monitoring

### Container Resource Usage
```bash
# View real-time stats
docker stats

# View specific container stats
docker stats aura-application-debug
```

### Application Performance
The debug environment includes performance monitoring tools:
- Node.js profiler accessible via Chrome DevTools
- Memory usage tracking
- CPU usage monitoring

## 🔧 Advanced Debugging Commands

### Container Shell Access
```bash
# Application container (Node.js/Next.js)
docker exec -it aura-application-debug /bin/bash

# Database container (MariaDB)
docker exec -it aura-database-debug /bin/bash

# MCP services container (Python)
docker exec -it aura-mcp-services-debug /bin/bash
```

### Log Analysis
```bash
# Export logs to file
docker logs aura-application-debug > app-logs.txt 2>&1

# Search for specific errors
docker logs aura-application-debug 2>&1 | grep -i "error\|exception\|failed"

# Monitor log file sizes
docker exec aura-application-debug du -sh /app/logs/*
```

### Network Debugging
```bash
# Test connectivity between containers
docker exec aura-application-debug ping aura-database-debug
docker exec aura-application-debug curl http://aura-mcp-services-debug:8000/health
```

## 🧹 Cleanup and Maintenance

### Regular Cleanup
```bash
# Stop debug environment
# Windows
.\scripts\debug-docker.ps1 stop

# Linux/macOS
./scripts/debug-docker.sh stop

# Full cleanup (removes containers, volumes, and images)
# Windows
.\scripts\debug-docker.ps1 clean

# Linux/macOS
./scripts/debug-docker.sh clean
```

### Log Rotation
Logs are automatically rotated with these settings:
- Max size: 100MB (application), 50MB (MCP), 10MB (database)
- Max files: 5 (application), 5 (MCP), 3 (database)

## 🚨 Troubleshooting Tips

### Port Conflicts
If ports are already in use:
```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :9229
netstat -ano | findstr :9999

# Kill processes using the ports (Windows)
taskkill /PID <PID> /F
```

### Container Won't Start
```bash
# Check container logs for startup errors
docker logs aura-application-debug

# Check Docker daemon status
docker version
docker system info
```

### Out of Disk Space
```bash
# Clean up Docker system
docker system prune -f

# Remove unused volumes
docker volume prune -f

# Check disk usage
docker system df
```

## 📝 Best Practices

1. **Always use the debug environment** for troubleshooting production issues
2. **Monitor logs in real-time** when testing new features
3. **Use Chrome DevTools** for frontend debugging
4. **Check container health** before assuming application issues
5. **Export logs** for offline analysis when needed
6. **Clean up regularly** to prevent disk space issues

## 🔗 Related Documentation

- [Next.js Debugging Guide](https://nextjs.org/docs/advanced-features/debugging)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Chrome DevTools Node.js Debugging](https://nodejs.org/en/docs/guides/debugging-getting-started/)

---

*This debugging setup provides comprehensive monitoring and debugging capabilities for the Aura SDLC application. All logs, metrics, and debugging tools are accessible through the web interfaces or command-line utilities.*







