/**
 * Enterprise Environment Configuration
 * Centralized configuration management for all environment variables
 */

// ========================================
// APPLICATION CONFIGURATION
// ========================================
export const APP_CONFIG = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  authUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// ========================================
// DATABASE CONFIGURATION
// ========================================
export const DATABASE_CONFIG = {
  host: process.env.AURA_DB_HOST || 'localhost',
  port: parseInt(process.env.AURA_DB_PORT || '3306'),
  user: process.env.AURA_DB_USER || 'aura_user',
  password: process.env.AURA_DB_PASSWORD || '',
  name: process.env.AURA_DB_NAME || 'aura_playground',
  maxPoolSize: parseInt(process.env.AURA_DB_MAX_POOL_SIZE || '10'),
  ssl: process.env.AURA_DB_SSL === 'true',
  timeout: parseInt(process.env.AURA_DB_TIMEOUT || '30000'),
  logLevel: process.env.AURA_DB_LOG_LEVEL || 'INFO',
  logQueries: process.env.AURA_DB_LOG_QUERIES === 'true',
} as const;

// ========================================
// MCP CONFIGURATION
// ========================================
export const MCP_CONFIG = {
  bridge: {
    url: process.env.MCP_BRIDGE_URL || 'http://localhost:8000',
    port: parseInt(process.env.MCP_BRIDGE_PORT || '8000'),
  },
  playwright: {
    url: process.env.PLAYWRIGHT_MCP_URL || 'http://localhost:8931',
    port: parseInt(process.env.PLAYWRIGHT_MCP_PORT || '8931'),
  },
  jira: {
    url: process.env.JIRA_MCP_URL || 'http://localhost:8932',
    port: parseInt(process.env.JIRA_MCP_PORT || '8932'),
    cloudId: process.env.JIRA_CLOUD_ID || '',
    defaultProjectKey: process.env.JIRA_DEFAULT_PROJECT_KEY || 'SCRUM',
  },
  debug: process.env.MCP_USE_DEBUG === 'true',
} as const;

// ========================================
// LLM API KEYS
// ========================================
export const API_KEYS = {
  openai: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  google: process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
  anthropic: process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
} as const;

// ========================================
// DEFAULT LLM CONFIGURATION
// ========================================
export const DEFAULT_LLM_CONFIG = {
  provider: process.env.DEFAULT_LLM_PROVIDER || 'openai',
  models: {
    openai: process.env.DEFAULT_OPENAI_MODEL || 'gpt-4o',
    google: process.env.DEFAULT_GOOGLE_MODEL || 'gemini-2.5-pro',
    anthropic: process.env.DEFAULT_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  },
  temperature: parseFloat(process.env.DEFAULT_LLM_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.DEFAULT_LLM_MAX_TOKENS || '4000'),
} as const;

// ========================================
// EMBEDDING & RAG CONFIGURATION
// ========================================
export const RAG_CONFIG = {
  embedding: {
    provider: process.env.AURA_EMBEDDING_PROVIDER || 'openai',
    apiKey: process.env.AURA_EMBEDDING_API_KEY || API_KEYS.openai,
    model: process.env.AURA_EMBEDDING_MODEL || 'text-embedding-3-small',
  },
  chunking: {
    size: parseInt(process.env.AURA_RAG_CHUNK_SIZE || '1000'),
    overlap: parseInt(process.env.AURA_RAG_CHUNK_OVERLAP || '200'),
    maxResults: parseInt(process.env.AURA_RAG_MAX_SEARCH_RESULTS || '5'),
  },
} as const;

// ========================================
// REVERSE ENGINEERING CONFIGURATION
// ========================================
export const REVERSE_ENGINEERING_CONFIG = {
  design: {
    provider: process.env.REVERSE_ENGINEERING_DESIGN_PROVIDER || 'google',
    model: process.env.REVERSE_ENGINEERING_DESIGN_MODEL || 'gemini-2.5-flash',
  },
  code: {
    provider: process.env.REVERSE_ENGINEERING_CODE_PROVIDER || 'google',
    model: process.env.REVERSE_ENGINEERING_CODE_MODEL || 'gemini-2.5-flash',
  },
} as const;

// ========================================
// SECURITY & MONITORING
// ========================================
export const SECURITY_CONFIG = {
  debug: process.env.DEBUG_MODE === 'true',
  rateLimiting: {
    enabled: process.env.API_RATE_LIMIT_ENABLED !== 'false',
    maxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '100'),
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000'),
  },
  timeout: parseInt(process.env.API_REQUEST_TIMEOUT || '30000'),
  detailedErrors: process.env.DETAILED_ERROR_REPORTING !== 'false',
  performanceMonitoring: process.env.PERFORMANCE_MONITORING === 'true',
} as const;

// ========================================
// DEVELOPMENT SETTINGS
// ========================================
export const DEV_CONFIG = {
  useMockResponses: process.env.USE_MOCK_LLM_RESPONSES === 'true',
} as const;

// ========================================
// CONFIGURATION VALIDATION
// ========================================
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateConfiguration(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required database configuration
  if (!DATABASE_CONFIG.password) {
    errors.push('AURA_DB_PASSWORD is required');
  }

  // Check API keys
  if (!API_KEYS.openai && !API_KEYS.google && !API_KEYS.anthropic) {
    warnings.push('No LLM API keys configured. Some features may not work.');
  }

  // Check MCP configuration
  if (MCP_CONFIG.jira.cloudId === '' || MCP_CONFIG.jira.cloudId === 'your_jira_cloud_id_here') {
    warnings.push('JIRA_CLOUD_ID not configured. Jira integration will not work.');
  }

  // Validate numeric configurations
  if (isNaN(DATABASE_CONFIG.port) || DATABASE_CONFIG.port <= 0) {
    errors.push('AURA_DB_PORT must be a valid positive number');
  }

  if (isNaN(MCP_CONFIG.bridge.port) || MCP_CONFIG.bridge.port <= 0) {
    errors.push('MCP_BRIDGE_PORT must be a valid positive number');
  }

  if (DEFAULT_LLM_CONFIG.temperature < 0 || DEFAULT_LLM_CONFIG.temperature > 2) {
    errors.push('DEFAULT_LLM_TEMPERATURE must be between 0 and 2');
  }

  if (DEFAULT_LLM_CONFIG.maxTokens <= 0) {
    errors.push('DEFAULT_LLM_MAX_TOKENS must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
export function getApiKeyForProvider(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'openai':
      return API_KEYS.openai;
    case 'google':
    case 'gemini':
      return API_KEYS.google;
    case 'anthropic':
    case 'claude':
      return API_KEYS.anthropic;
    default:
      return '';
  }
}

export function getMCPBridgeUrl(): string {
  return MCP_CONFIG.bridge.url;
}

export function isDatabaseConfigured(): boolean {
  return !!(DATABASE_CONFIG.password && DATABASE_CONFIG.host && DATABASE_CONFIG.user);
}

export function isLLMConfigured(provider?: string): boolean {
  if (provider) {
    return !!getApiKeyForProvider(provider);
  }
  return !!(API_KEYS.openai || API_KEYS.google || API_KEYS.anthropic);
}

// ========================================
// CONFIGURATION SUMMARY
// ========================================
export function getConfigurationSummary() {
  const validation = validateConfiguration();
  
  return {
    app: {
      environment: APP_CONFIG.nodeEnv,
      url: APP_CONFIG.url,
    },
    database: {
      configured: isDatabaseConfigured(),
      host: DATABASE_CONFIG.host,
      port: DATABASE_CONFIG.port,
      name: DATABASE_CONFIG.name,
    },
    llm: {
      configured: isLLMConfigured(),
      defaultProvider: DEFAULT_LLM_CONFIG.provider,
      availableProviders: Object.keys(API_KEYS).filter(key => 
        getApiKeyForProvider(key) !== ''
      ),
    },
    mcp: {
      bridgeUrl: MCP_CONFIG.bridge.url,
      playwrightUrl: MCP_CONFIG.playwright.url,
      jiraConfigured: !!MCP_CONFIG.jira.cloudId && MCP_CONFIG.jira.cloudId !== 'your_jira_cloud_id_here',
    },
    validation,
  };
}
