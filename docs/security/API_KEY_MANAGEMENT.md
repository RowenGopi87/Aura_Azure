# API Key Management & Security Guide

## Overview

This document outlines the API key management and security approach implemented in the Aura SDLC platform, addressing secure storage, retrieval, and best practices.

## Security Architecture

### 1. Multi-Layer API Key Management

The platform implements a hierarchical approach to API key management:

1. **Environment Variables (Highest Priority)**
   - Keys loaded from `.env` files or system environment
   - Server-side only for maximum security
   - Automatically loaded on application startup

2. **User-Configured Storage (Fallback)**
   - Keys entered through the settings UI
   - Stored in browser's localStorage via Zustand persist
   - Used when environment variables are not available

3. **Runtime Persistence**
   - Keys preserved when switching between providers
   - Automatic fallback to environment variables when available

### 2. Environment Variable Configuration

#### Supported Environment Variables:
```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_API_KEY=sk-...

# Google AI Configuration  
GOOGLE_API_KEY=AI...
NEXT_PUBLIC_GOOGLE_API_KEY=AI...

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
```

#### Priority Order:
1. `PROVIDER_API_KEY` (server-side only)
2. `NEXT_PUBLIC_PROVIDER_API_KEY` (client-accessible)
3. User-configured keys from settings

### 3. Security Features

#### ✅ Implemented Security Measures:

- **Input Validation**: API keys are validated for format and reject file paths
- **Environment Priority**: Environment variables take precedence over user input
- **Secure Display**: API keys are masked in the UI with show/hide toggle
- **Persistence Control**: Users can override environment keys if needed
- **Provider Isolation**: Keys are managed per provider with automatic switching

#### ✅ Security Best Practices:

- **No Hardcoded Keys**: All hardcoded API keys removed from source code
- **Environment-First**: Prioritizes server-side environment variables
- **User Responsibility**: Clear documentation about client-side storage risks
- **Validation**: Rejects suspicious input patterns (file paths, etc.)

### 4. Storage Locations

#### Server-Side (Secure):
- Environment variables in `.env` files
- System environment variables
- Docker secrets (for containerized deployments)

#### Client-Side (User Responsibility):
- Browser localStorage (Zustand persistence)
- User's local browser storage only
- Not transmitted to external servers

## Usage Guide

### 1. Recommended Setup (Most Secure)

Set environment variables in your `.env` file:
```env
OPENAI_API_KEY=your_actual_key_here
GOOGLE_API_KEY=your_actual_key_here
ANTHROPIC_API_KEY=your_actual_key_here
```

### 2. Alternative Setup (User-Configured)

1. Navigate to Settings (V1: `/v1/settings`, V2: `/settings`)
2. Select your preferred provider
3. Enter your API key
4. Click "Save Configuration"

### 3. Provider Switching

When switching providers:
- Environment keys are automatically loaded if available
- Previously configured keys are preserved as fallback
- No need to re-enter keys for each provider switch

## Security Considerations

### ✅ What We Do:

- **Environment Priority**: Always prefer environment variables
- **Input Validation**: Validate API key formats
- **Secure UI**: Mask sensitive data in forms
- **Provider Isolation**: Separate key management per provider
- **Documentation**: Clear security guidance for users

### ⚠️ User Responsibilities:

- **Environment Security**: Secure your `.env` files and server environment
- **Browser Security**: Understand that client-side storage is less secure
- **Key Rotation**: Regularly rotate your API keys
- **Access Control**: Restrict access to systems containing API keys

### 🚫 What We Don't Do:

- **Server-Side Storage**: We don't store user keys on our servers
- **Key Transmission**: User keys are not sent to external services
- **Encryption**: Client-side keys are not encrypted (browser limitation)
- **Key Generation**: We don't generate or manage API keys for users

## Migration from Previous Versions

### Automatic Migration:

1. **Environment Loading**: Existing environment variables are automatically detected
2. **Settings Preservation**: Previously saved settings are maintained
3. **Fallback Support**: Both old and new approaches work simultaneously

### Manual Steps (if needed):

1. Move hardcoded keys to environment variables
2. Update `.env` files with proper variable names
3. Restart the application to load new environment variables

## Best Practices

### For Development:
- Use `.env.local` for local development keys
- Never commit `.env` files to version control
- Use different keys for development and production

### For Production:
- Use system environment variables or secrets management
- Implement proper access controls
- Monitor API key usage and rotate regularly
- Use least-privilege API keys when possible

### For Teams:
- Share environment variable templates (without actual keys)
- Document key requirements in project README
- Use secrets management systems for shared environments

## Troubleshooting

### Common Issues:

1. **Keys Not Loading**: Check environment variable names and restart app
2. **Provider Switching**: Verify keys are set for the selected provider
3. **Persistence Issues**: Clear browser storage and reconfigure if needed

### Debug Steps:

1. Check browser console for API key validation errors
2. Verify environment variables are loaded (check Network tab)
3. Test with a fresh browser session to isolate storage issues

## Security Incident Response

If API keys are compromised:

1. **Immediate**: Revoke compromised keys at the provider
2. **Generate**: Create new API keys
3. **Update**: Update environment variables or settings
4. **Monitor**: Watch for unauthorized usage
5. **Rotate**: Implement regular key rotation schedule

## Compliance Notes

- **Data Residency**: Keys stored locally in user's browser
- **Encryption**: Environment variables should be secured at OS/container level
- **Audit**: API key usage can be monitored through provider dashboards
- **Access**: Implement proper access controls for deployment environments

---

For questions or security concerns, please review the main documentation or contact the development team.
