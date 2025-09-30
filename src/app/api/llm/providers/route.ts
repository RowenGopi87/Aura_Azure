import { NextRequest, NextResponse } from 'next/server';
import { secretsManager } from '@/lib/secrets/secrets-manager';

/**
 * GET /api/llm/providers
 * 
 * Returns available LLM providers and their configuration status.
 * NEVER exposes actual API keys - server-side validation only.
 * 
 * Response:
 * {
 *   providers: [
 *     { provider: 'openai', configured: true, source: 'environment', models: [...] },
 *     { provider: 'google', configured: false, ... }
 *   ],
 *   configurationSource: 'Local Environment Variables (.env.local)'
 * }
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching provider configurations (server-side)...');

    // Get all provider configurations from SecretsManager
    const providerConfigs = await secretsManager.getProviderConfigurations();
    
    const configurationSource = secretsManager.getConfigurationSource();

    // Count configured providers
    const configuredCount = providerConfigs.filter(p => p.configured).length;
    const totalCount = providerConfigs.length;

    console.log(`✅ Found ${configuredCount}/${totalCount} configured providers`);
    console.log('📋 Provider status:', providerConfigs.map(p => ({
      provider: p.provider,
      configured: p.configured,
      source: p.source
    })));

    return NextResponse.json({
      success: true,
      data: {
        providers: providerConfigs,
        configurationSource,
        summary: {
          total: totalCount,
          configured: configuredCount,
          notConfigured: totalCount - configuredCount
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to get provider configurations:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve provider configurations',
      message: error.message
    }, { status: 500 });
  }
}
