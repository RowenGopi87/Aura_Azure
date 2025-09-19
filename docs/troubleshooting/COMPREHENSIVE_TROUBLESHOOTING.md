# 🛠️ Comprehensive Troubleshooting Guide

## Overview
This guide provides complete troubleshooting solutions for all known issues in the Aura SDLC platform, including browser problems, connection issues, SSL errors, and configuration problems.

## 🚨 Quick Issue Index

| Issue Type | Symptoms | Quick Fix |
|------------|----------|-----------|
| [Browser Profile](#browser-issues) | "Browser is already in use" | `stop-all-servers.bat` → `clear-browser-processes.bat` → restart |
| [SSL Certificates](#ssl-issues) | "certificate verify failed" | `fix-ssl-issues.bat` |
| [MCP Connection](#mcp-connection-issues) | "Invalid URL: undefined" | Use correct MCP server package |
| [Date Formatting](#date-formatting-issues) | "Invalid time value" | Use date utility functions |
| [Client Isolation](#client-isolation-issues) | Works in file:// but not localhost | Ensure proper MCP client isolation |

---

## 🌐 Browser Issues

### "Browser is already in use" Error

**Error Message:**
```
Error: Browser is already in use for C:\Users\...\ms-playwright\mcp-chrome-profile, use --isolated to run multiple instances of the same browser
```

#### Root Cause
- Chrome browser process remains running after test execution
- Browser process holds a lock on the `mcp-chrome-profile` directory
- Multiple tests try to access the same browser profile simultaneously

#### ⚡ Quick Fix
1. **Stop all servers:** `stop-all-servers.bat`
2. **Clear browser processes:** `clear-browser-processes.bat`
3. **Restart servers:** `start-aura-with-mcp.bat`
4. **Try test again**

#### Technical Solution
Automatic browser cleanup implemented in `mcp_server.py`:
```python
finally:
    # Ensure browser session is always closed
    if agent and agent.client:
        await agent.client.close_all_sessions()
```

### Browser Visibility Issues
**Problem:** Browser window not appearing during test execution

#### Solution
1. Check MCP server startup logs for: `Browser will be VISIBLE during test execution!`
2. Verify you're not running in silent mode
3. Ensure proper browser launch configuration

---

## 🔐 SSL Issues

### SSL Certificate Verification Failed

**Error Message:**
```
[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate
```

#### ⚡ Quick Fix
1. **Stop all servers:** `stop-all-servers.bat`
2. **Run SSL fix:** `fix-ssl-issues.bat`
3. **Restart servers:** `start-aura-with-mcp.bat`

#### What the SSL Fix Does
- Updates certificate stores
- Configures Python SSL context
- Bypasses certificate verification for development
- Updates pip and certificate packages

---

## 🔗 MCP Connection Issues

### "Invalid URL: undefined" Error

**Error Message:**
```
SyntaxError: browserType.launch: Invalid URL: undefined
<ws connecting> undefined
```

#### Root Cause
Using wrong Playwright MCP server package (`@playwright/mcp@0.0.30` instead of stable `@executeautomation/playwright-mcp-server@1.0.5`)

#### Solution
**Updated startup scripts to use correct package:**

```batch
# Correct stable package
npx @executeautomation/playwright-mcp-server@1.0.5 --port 8931

# NOT the unstable package
# npx @playwright/mcp@0.0.30
```

#### Files Updated
- `mcp/start_mcp_servers.bat`
- `start-aura-with-mcp.bat`
- `start-aura-with-mcp-silent.bat`

---

## 🧩 Client Isolation Issues

### Works in File:// but Fails on Localhost

**Problem:** Tests work when HTML file opened directly but fail from web server

#### Root Cause
Shared MCP client state across requests in web server environment:
```python
# PROBLEM: Global shared state
mcp_client = None
current_agent = None
```

#### Solution
**Proper client isolation implemented:**
```python
# Each request gets isolated client
async def execute_test_case(test_case_data):
    # Create isolated client for this request
    client = MCP_Client()
    agent = PlaywrightAgent(client)
    
    try:
        # Execute test with isolated resources
        result = await agent.execute(test_case_data)
        return result
    finally:
        # Clean up this request's resources
        await client.close_all_sessions()
```

---

## 📅 Date Formatting Issues

### "Invalid time value" Runtime Errors

**Error Examples:**
```
Error: Invalid time value
selectedTestCase.createdAt.toLocaleDateString is not a function
testCase.lastExecuted.toLocaleString is not a function
```

#### Root Cause
Direct date formatting without validation on potentially null/undefined values

#### Solution
**Use date utility functions:**
```typescript
// ❌ Unsafe - can crash
{someDate.toLocaleDateString()}

// ✅ Safe - handles all edge cases
import { formatDateForDisplay } from '@/lib/date-utils';
{formatDateForDisplay(someDate)}
```

#### Available Functions
- `formatDateForDisplay(date)` → "Jan 15, 2024"
- `formatDateTimeForDisplay(date)` → "Jan 15, 2024, 10:30 AM"
- `formatRelativeTime(date)` → "2 days ago"

---

## 🔧 Configuration Issues

### Package Comparison Errors
**Problem:** Inconsistent package versions or configurations

#### Solution
1. **Check package consistency:** Compare `package.json` versions
2. **Clean install:** `npm ci` for consistent dependencies
3. **Verify configurations:** Ensure all config files are properly set

### Environment Configuration
**Problem:** Missing or incorrect environment variables

#### Solution
1. **Copy template:** `cp config/environment/env.template .env`
2. **Set required variables:**
   - `AURA_DB_PASSWORD`
   - At least one API key (`OPENAI_API_KEY` or `GOOGLE_API_KEY`)
3. **Validate configuration:** `node tools/scripts/development/migrate-environment.js validate`

---

## 🚀 Advanced Troubleshooting

### Complete System Reset
If multiple issues persist:

1. **Full stop:**
   ```bash
   stop-all-servers.bat
   clear-browser-processes.bat
   ```

2. **Clean processes:**
   ```bash
   # Check for stuck processes
   tasklist | findstr chrome
   tasklist | findstr node
   ```

3. **Reset environment:**
   ```bash
   fresh-start.bat
   ```

4. **Reboot if needed:** Complete system restart for persistent issues

### Diagnostic Commands

1. **MCP Connection Test:**
   ```bash
   diagnose-mcp-connection.bat
   ```

2. **Browser Process Check:**
   ```bash
   tasklist | findstr chrome
   ```

3. **Port Usage Check:**
   ```bash
   netstat -an | findstr :3000
   netstat -an | findstr :8000
   netstat -an | findstr :8931
   ```

### Log Analysis

#### Success Indicators
```
🚀 Executing test case: [Test Name]
🤖 Using google model: gemini-2.5-pro
🎭 Chrome browser window will open and be visible...
✅ Browser session closed successfully
```

#### Error Indicators
```
❌ Browser profile locked
❌ SSL certificate verification failed
❌ Invalid URL: undefined
❌ MCP client connection failed
```

---

## 📋 Prevention Best Practices

### Daily Development
1. **Use proper startup scripts:** Always use `start-aura-with-mcp.bat`
2. **Clean shutdown:** Use `stop-all-servers.bat` before closing
3. **Monitor resources:** Check Task Manager for stuck processes
4. **Regular cleanup:** Run cleanup scripts if issues arise

### Environment Management
1. **Keep dependencies updated:** Regular `npm update`
2. **Monitor disk space:** Ensure adequate space for browser profiles
3. **Regular reboots:** Restart development machine periodically
4. **Backup configurations:** Keep working `.env` backed up

### Code Quality
1. **Use utility functions:** Always use date utilities for date formatting
2. **Proper error handling:** Implement try-catch blocks for external calls
3. **Resource cleanup:** Ensure proper cleanup in finally blocks
4. **Type safety:** Use TypeScript properly for better error prevention

---

## 🆘 Getting Help

### Information to Collect
1. **Exact error message** with full stack trace
2. **Steps to reproduce** the issue
3. **System information:**
   - Windows version
   - Node.js version
   - Chrome version
   - Playwright version
4. **Recent changes** made to the system
5. **Log excerpts** from terminal output

### Escalation Path
1. **Try quick fixes** from this guide first
2. **Run diagnostic scripts** to gather information
3. **Check recent changes** that might have caused the issue
4. **Create detailed issue report** with collected information

---

## ✅ Success Criteria

After following this guide, you should have:
- ✅ No browser profile conflicts
- ✅ Successful SSL connections
- ✅ Stable MCP server connections
- ✅ Proper date formatting throughout the application
- ✅ Isolated client sessions for web server usage
- ✅ Reliable test execution without crashes

This comprehensive guide consolidates all known troubleshooting information for the Aura SDLC platform. Keep it updated as new issues are discovered and resolved.
