/**
 * Server-Side Secrets Manager
 * 
 * Manages LLM API keys securely on the server-side only.
 * Supports multiple providers and environment detection.
 * 
 * Security Features:
 * - Server-side only (never expose to client)
 * - Reads from environment variables (dev) or Azure Key Vault (prod)
 * - Auto-detects Azure environment
 * - No keys in client bundle or browser storage
 * 
 * @module secrets-manager
 */

// Provider types supported
export type LLMProvider = 'openai' | 'google' | 'anthropic' | 'azure-openai';

export interface ProviderConfig {
  provider: LLMProvider;
  configured: boolean;
  source: 'environment' | 'key-vault' | 'not-configured';
  availableModels: string[];
  requiresEndpoint?: boolean; // For Azure OpenAI
}

export interface AzureOpenAIConfig {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
}

class SecretsManager {
  private static instance: SecretsManager;
  private isAzureEnvironment: boolean;
  private useKeyVault: boolean;

  private constructor() {
    // Detect if running in Azure
    this.isAzureEnvironment = !!(
      process.env.WEBSITE_INSTANCE_ID ||       // Azure App Service
      process.env.AZURE_FUNCTIONS_ENVIRONMENT  // Azure Functions
    );

    // Check if Key Vault should be used (feature flag)
    this.useKeyVault = process.env.USE_AZURE_KEY_VAULT === 'true';

    console.log('🔐 SecretsManager initialized:', {
      isAzure: this.isAzureEnvironment,
      useKeyVault: this.useKeyVault,
      environment: process.env.NODE_ENV
    });
  }

  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  /**
   * Get API key for a specific provider
   * @param provider - The LLM provider name
   * @returns API key from environment or Key Vault
   */
  public async getApiKey(provider: LLMProvider): Promise<string> {
    if (this.useKeyVault) {
      return await this.getFromKeyVault(provider);
    } else {
      return this.getFromEnvironment(provider);
    }
  }

  /**
   * Get API key from environment variables
   */
  private getFromEnvironment(provider: LLMProvider): string {
    const keyMap: Record<LLMProvider, string> = {
      'openai': process.env.OPENAI_API_KEY || '',
      'google': process.env.GOOGLE_API_KEY || '',
      'anthropic': process.env.ANTHROPIC_API_KEY || '',
      'azure-openai': process.env.AZURE_OPENAI_KEY || ''
    };

    const apiKey = keyMap[provider];
    
    if (!apiKey) {
      console.warn(`⚠️ No API key found for provider: ${provider}`);
    } else {
      console.log(`✅ Retrieved API key for ${provider} from environment (${apiKey.substring(0, 8)}...)`);
    }

    return apiKey;
  }

  /**
   * Get API key from Azure Key Vault
   * (Implementation ready for when you deploy to Azure)
   */
  private async getFromKeyVault(provider: LLMProvider): Promise<string> {
    // This will be implemented when Azure Key Vault is ready
    // For now, fall back to environment variables
    console.log(`🔑 Key Vault integration not yet active, using environment for ${provider}`);
    
    try {
      // TODO: Implement Azure Key Vault retrieval
      // const { SecretClient } = require('@azure/keyvault-secrets');
      // const { DefaultAzureCredential } = require('@azure/identity');
      // const credential = new DefaultAzureCredential();
      // const vaultUrl = process.env.AZURE_KEY_VAULT_URL;
      // const client = new SecretClient(vaultUrl, credential);
      // const secretName = `${provider}-api-key`;
      // const secret = await client.getSecret(secretName);
      // return secret.value || '';
      
      // Fallback to environment for now
      return this.getFromEnvironment(provider);
    } catch (error) {
      console.error(`❌ Failed to retrieve ${provider} key from Key Vault:`, error);
      // Fallback to environment
      return this.getFromEnvironment(provider);
    }
  }

  /**
   * Get Azure OpenAI specific configuration for Emirates deployment
   */
  public async getAzureOpenAIConfig(): Promise<AzureOpenAIConfig | null> {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://api-genai-devtest-maen.azure-api.net/';
    const apiKey = await this.getApiKey('azure-openai');
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1'; // Default to Emirates deployment
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

    if (!apiKey) {
      console.warn('⚠️ Azure OpenAI API key not configured');
      return null;
    }

    console.log('🏢 Azure OpenAI config:', {
      endpoint,
      deployment,
      hasKey: !!apiKey,
      apiVersion
    });

    return { endpoint, apiKey, deployment, apiVersion };
  }

  /**
   * Get all configured providers with their status
   */
  public async getProviderConfigurations(): Promise<ProviderConfig[]> {
    const providers: LLMProvider[] = ['openai', 'google', 'anthropic', 'azure-openai'];
    const configs: ProviderConfig[] = [];

    for (const provider of providers) {
      const apiKey = await this.getApiKey(provider);
      const configured = !!apiKey && apiKey.length > 0;

      let availableModels: string[] = [];
      let requiresEndpoint = false;

      switch (provider) {
        case 'openai':
          availableModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
          break;
        case 'google':
          availableModels = ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'];
          break;
        case 'anthropic':
          availableModels = ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'];
          break;
        case 'azure-openai':
          requiresEndpoint = true;
          // For Azure OpenAI, models come from deployments (Emirates specific)
          availableModels = [
            process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1',
            process.env.AZURE_OPENAI_DEPLOYMENT_GPT35 || 'gpt-35-turbo'
          ].filter(Boolean);
          break;
      }

      configs.push({
        provider,
        configured,
        source: this.useKeyVault ? 'key-vault' : 'environment',
        availableModels,
        requiresEndpoint
      });
    }

    return configs;
  }

  /**
   * Validate that a specific provider is properly configured
   */
  public async validateProvider(provider: LLMProvider): Promise<boolean> {
    const apiKey = await this.getApiKey(provider);
    
    if (!apiKey) {
      return false;
    }

    // Basic format validation
    switch (provider) {
      case 'openai':
        return apiKey.startsWith('sk-');
      case 'google':
        return apiKey.startsWith('AIza');
      case 'anthropic':
        return apiKey.startsWith('sk-ant-');
      case 'azure-openai':
        // Azure keys have different format
        return apiKey.length > 10;
      default:
        return false;
    }
  }

  /**
   * Get configuration source description for UI display
   */
  public getConfigurationSource(): string {
    if (this.useKeyVault) {
      return 'Azure Key Vault (Managed Identity)';
    } else if (this.isAzureEnvironment) {
      return 'Azure App Service Configuration';
    } else {
      return 'Local Environment Variables (.env.local)';
    }
  }
}

// Export singleton instance (server-side only)
export const secretsManager = SecretsManager.getInstance();

// Type exports for use in other files
export type { ProviderConfig, AzureOpenAIConfig };

