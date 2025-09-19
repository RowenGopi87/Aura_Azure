# 🔐 Enterprise Environment Configuration Guide

## 📋 Overview

This guide covers the complete setup of environment variables for the Aura SDLC platform. All hardcoded values have been extracted to environment variables for enterprise-grade security and configuration management.

## 🚀 Quick Setup

### 1. Copy Environment Template
```bash
# Copy the template to create your .env file
cp config/environment/env.template .env
```

### 2. Configure Essential Variables
Edit your `.env` file and update these critical values:

```env
# Database (REQUIRED)
AURA_DB_PASSWORD=your_secure_database_password_here

# LLM API Keys (At least one required)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Start the Application
```bash
npm run dev
```

## 📚 Complete Configuration Reference

### 🏢 Application Configuration
```env
# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000    # Public app URL
NEXTAUTH_URL=http://localhost:3000           # Auth callback URL

# Environment
NODE_ENV=development                         # development/production
```

### 🗄️ Database Configuration
```env
# MariaDB Connection
AURA_DB_HOST=localhost                       # Database host
AURA_DB_PORT=3306                           # Database port
AURA_DB_USER=aura_user                      # Database username
AURA_DB_PASSWORD=your_password              # Database password (REQUIRED)
AURA_DB_NAME=aura_playground                # Database name

# Connection Pool
AURA_DB_MAX_POOL_SIZE=10                    # Max connections
AURA_DB_SSL=false                           # Enable SSL
AURA_DB_TIMEOUT=30                          # Connection timeout (seconds)

# Logging
AURA_DB_LOG_LEVEL=INFO                      # Log level
AURA_DB_LOG_QUERIES=false                   # Log SQL queries
```

### 🤖 LLM API Configuration
```env
# OpenAI
OPENAI_API_KEY=sk-your-key-here             # OpenAI API key
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-key-here # Client-side OpenAI key

# Google AI (Gemini)
GOOGLE_API_KEY=AI-your-key-here             # Google AI API key
NEXT_PUBLIC_GOOGLE_API_KEY=AI-your-key-here # Client-side Google key

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-your-key-here      # Anthropic API key
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-key    # Client-side Anthropic key
```

### ⚙️ Default LLM Settings
```env
# Default Provider
DEFAULT_LLM_PROVIDER=openai                 # openai/google/anthropic

# Default Models
DEFAULT_OPENAI_MODEL=gpt-4o                 # OpenAI model
DEFAULT_GOOGLE_MODEL=gemini-2.5-pro         # Google model
DEFAULT_ANTHROPIC_MODEL=claude-3-5-sonnet   # Anthropic model

# Generation Parameters
DEFAULT_LLM_TEMPERATURE=0.7                 # Creativity (0.0-2.0)
DEFAULT_LLM_MAX_TOKENS=4000                 # Max response length
```

### 🔗 MCP Server Configuration
```env
# MCP Bridge Server
MCP_BRIDGE_URL=http://localhost:8000        # Bridge server URL
MCP_BRIDGE_PORT=8000                        # Bridge server port

# Playwright MCP (Browser Automation)
PLAYWRIGHT_MCP_URL=http://localhost:8931    # Playwright server URL
PLAYWRIGHT_MCP_PORT=8931                    # Playwright server port

# Jira MCP (Project Management)
JIRA_MCP_URL=http://localhost:8932          # Jira server URL
JIRA_MCP_PORT=8932                          # Jira server port
JIRA_CLOUD_ID=your-jira-cloud-id            # Jira Cloud ID
JIRA_DEFAULT_PROJECT_KEY=SCRUM              # Default project key

# Debug Mode
MCP_USE_DEBUG=false                         # Enable debug logging
```

### 🧠 Embedding & RAG Configuration
```env
# Embedding Service
AURA_EMBEDDING_PROVIDER=openai              # Embedding provider
AURA_EMBEDDING_API_KEY=your-key-here        # Embedding API key
AURA_EMBEDDING_MODEL=text-embedding-3-small # Embedding model

# RAG Parameters
AURA_RAG_CHUNK_SIZE=1000                    # Text chunk size
AURA_RAG_CHUNK_OVERLAP=200                  # Chunk overlap
AURA_RAG_MAX_SEARCH_RESULTS=5               # Max search results
```

### 🔄 Reverse Engineering Configuration
```env
# Design Reverse Engineering
REVERSE_ENGINEERING_DESIGN_PROVIDER=google  # Provider for design RE
REVERSE_ENGINEERING_DESIGN_MODEL=gemini-2.5-flash # Model for design RE

# Code Reverse Engineering
REVERSE_ENGINEERING_CODE_PROVIDER=google    # Provider for code RE
REVERSE_ENGINEERING_CODE_MODEL=gemini-2.5-flash # Model for code RE
```

### 🛡️ Security & Monitoring
```env
# Debug & Logging
DEBUG_MODE=false                            # Enable debug mode
DETAILED_ERROR_REPORTING=true               # Detailed error messages

# Rate Limiting
API_RATE_LIMIT_ENABLED=true                 # Enable rate limiting
API_RATE_LIMIT_MAX_REQUESTS=100             # Max requests per window
API_RATE_LIMIT_WINDOW_MS=900000             # Rate limit window (15 min)

# Timeouts
API_REQUEST_TIMEOUT=30000                   # Request timeout (30 sec)

# Performance
PERFORMANCE_MONITORING=false                # Enable perf monitoring
```

### 🧪 Development Settings
```env
# Testing
USE_MOCK_LLM_RESPONSES=false                # Use mock responses for testing
```

## 🔐 Security Best Practices

### 1. **Environment File Security**
```bash
# Never commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### 2. **API Key Management**
- **Development**: Store in `.env` file
- **Production**: Use secure environment variable injection
- **CI/CD**: Use encrypted secrets
- **Team Sharing**: Use secure key management tools

### 3. **Database Security**
- Change default password `aura_password_123`
- Use strong passwords (12+ characters)
- Enable SSL in production
- Restrict database user permissions

### 4. **Production Considerations**
```env
# Production settings
NODE_ENV=production
AURA_DB_SSL=true
DEBUG_MODE=false
DETAILED_ERROR_REPORTING=false
API_RATE_LIMIT_ENABLED=true
```

## 🔧 Configuration Validation

The application includes built-in configuration validation. Check your setup:

```typescript
import { validateConfiguration, getConfigurationSummary } from '@/lib/config/environment';

// Validate configuration
const validation = validateConfiguration();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}

// Get configuration summary
const summary = getConfigurationSummary();
console.log('Configuration:', summary);
```

## 🚨 Troubleshooting

### Common Issues

#### 1. **Database Connection Failed**
```
Error: AURA_DB_PASSWORD environment variable is required
```
**Solution**: Set `AURA_DB_PASSWORD` in your `.env` file

#### 2. **No LLM Provider Available**
```
Warning: No LLM API keys configured
```
**Solution**: Set at least one of `OPENAI_API_KEY`, `GOOGLE_API_KEY`, or `ANTHROPIC_API_KEY`

#### 3. **MCP Server Connection Failed**
```
Error: MCP server is not running
```
**Solution**: 
- Check `MCP_BRIDGE_URL` is correct
- Ensure MCP servers are running
- Verify firewall settings

#### 4. **Jira Integration Not Working**
```
Warning: JIRA_CLOUD_ID not configured
```
**Solution**: Set your Jira Cloud ID in `JIRA_CLOUD_ID`

### Environment Validation
```bash
# Check configuration
curl http://localhost:3000/api/config/validate

# Check database health
curl http://localhost:3000/api/database/health

# Check MCP server health
curl http://localhost:8000/health
```

## 📋 Migration from Old Configuration

If upgrading from a previous version:

### 1. **Backup Current Settings**
```bash
cp .env .env.backup
```

### 2. **Update Configuration**
```bash
# Use the new template
cp config/environment/env.template .env

# Copy your API keys from backup
# Update database password
# Configure MCP URLs if different
```

### 3. **Validate Migration**
```bash
npm run dev
# Check for configuration warnings in console
```

## 🎯 Environment-Specific Configurations

### Development
```env
NODE_ENV=development
DEBUG_MODE=true
DETAILED_ERROR_REPORTING=true
USE_MOCK_LLM_RESPONSES=false
AURA_DB_LOG_QUERIES=true
```

### Staging
```env
NODE_ENV=staging
DEBUG_MODE=false
DETAILED_ERROR_REPORTING=true
API_RATE_LIMIT_ENABLED=true
AURA_DB_SSL=true
```

### Production
```env
NODE_ENV=production
DEBUG_MODE=false
DETAILED_ERROR_REPORTING=false
API_RATE_LIMIT_ENABLED=true
AURA_DB_SSL=true
PERFORMANCE_MONITORING=true
```

## 📞 Support

For configuration issues:
1. Check this documentation
2. Validate your `.env` file syntax
3. Review application logs
4. Use the built-in configuration validation tools

---

**🔒 Security Reminder**: Never commit API keys or passwords to version control. Always use environment variables for sensitive configuration.
