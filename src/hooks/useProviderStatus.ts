import { useState, useEffect, useCallback } from 'react';
import { ProviderConfig } from '@/lib/secrets/secrets-manager';

interface ProviderStatusResponse {
  providers: ProviderConfig[];
  configurationSource: string;
  summary: {
    total: number;
    configured: number;
    notConfigured: number;
  };
}

export function useProviderStatus() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [configurationSource, setConfigurationSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviderStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/llm/providers');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch provider status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setProviders(result.data.providers);
        setConfigurationSource(result.data.configurationSource);
        console.log('✅ Provider status loaded:', result.data.summary);
      } else {
        throw new Error(result.error || 'Failed to load provider status');
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch provider status:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviderStatus();
  }, [fetchProviderStatus]);

  const testConnection = async (provider: string, model?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/llm/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, model })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Connection test successful for ${provider}`);
        // Refresh provider status after successful test
        await fetchProviderStatus();
      } else {
        console.error(`❌ Connection test failed for ${provider}:`, result.message);
      }

      return {
        success: result.success,
        message: result.message || result.error
      };
    } catch (err: any) {
      console.error('❌ Test connection error:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };

  const getProvider = useCallback((providerName: string): ProviderConfig | undefined => {
    return providers.find(p => p.provider === providerName);
  }, [providers]);

  const getConfiguredProviders = useCallback((): ProviderConfig[] => {
    return providers.filter(p => p.configured);
  }, [providers]);

  const isProviderConfigured = useCallback((providerName: string): boolean => {
    const provider = getProvider(providerName);
    return provider?.configured || false;
  }, [getProvider]);

  return {
    providers,
    configurationSource,
    isLoading,
    error,
    refresh: fetchProviderStatus,
    testConnection,
    getProvider,
    getConfiguredProviders,
    isProviderConfigured
  };
}
