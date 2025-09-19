import { DATABASE_CONFIG, RAG_CONFIG, validateConfiguration } from '../config/environment';

// Re-export the centralized database configuration
export { DATABASE_CONFIG };

// Legacy embedding configuration for backward compatibility
export const EMBEDDING_CONFIG = {
  enabled: !!(RAG_CONFIG.embedding.apiKey),
  provider: RAG_CONFIG.embedding.provider,
  apiKey: RAG_CONFIG.embedding.apiKey,
  model: RAG_CONFIG.embedding.model
};

// Re-export validation function
export const validateConfig = validateConfiguration;

// Embedding dimensions for different models
export const EMBEDDING_DIMENSIONS = {
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
  'text-embedding-ada-002': 1536,
} as const;

// Supported OpenAI models
export const OPENAI_MODELS = {
  EMBEDDING: ['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'],
  CHAT: ['gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo']
} as const;

// Export types
export type DatabaseConfig = typeof DATABASE_CONFIG;
export type EmbeddingConfig = typeof EMBEDDING_CONFIG;
export type { ConfigValidationResult } from '../config/environment';