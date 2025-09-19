import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const testLLMConfigSchema = z.object({
  module: z.string(),
  type: z.enum(['primary', 'backup']).optional().default('primary')
});

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 LLM Configuration Test API called');
    
    const body = await request.json();
    const { module, type } = testLLMConfigSchema.parse(body);
    
    // Import settings store (server-side)
    const { useSettingsStore } = await import('@/store/settings-store');
    const { getV1ModuleLLM } = useSettingsStore.getState();
    
    // Get the LLM configuration for the module
    const llmConfig = getV1ModuleLLM(module as any, type);
    
    console.log(`🔍 Testing ${module} ${type} LLM config:`, {
      provider: llmConfig.provider,
      model: llmConfig.model,
      hasApiKey: !!llmConfig.apiKey,
      apiKeyPrefix: llmConfig.apiKey ? llmConfig.apiKey.substring(0, 8) + '...' : 'none'
    });

    // Validate the configuration
    const validation = {
      hasProvider: !!llmConfig.provider,
      hasModel: !!llmConfig.model,
      hasApiKey: !!llmConfig.apiKey,
      apiKeyFormat: 'unknown'
    };

    if (llmConfig.apiKey) {
      if (llmConfig.apiKey.startsWith('sk-')) {
        validation.apiKeyFormat = 'OpenAI';
      } else if (llmConfig.apiKey.startsWith('AIza')) {
        validation.apiKeyFormat = 'Google';
      } else if (llmConfig.apiKey.startsWith('sk-ant-')) {
        validation.apiKeyFormat = 'Anthropic';
      }
    }

    const isValid = validation.hasProvider && validation.hasModel && validation.hasApiKey;
    const providerMatch = (
      (llmConfig.provider === 'openai' && validation.apiKeyFormat === 'OpenAI') ||
      (llmConfig.provider === 'google' && validation.apiKeyFormat === 'Google') ||
      (llmConfig.provider === 'anthropic' && validation.apiKeyFormat === 'Anthropic')
    );

    return NextResponse.json({
      success: true,
      data: {
        module,
        type,
        config: {
          provider: llmConfig.provider,
          model: llmConfig.model,
          hasApiKey: validation.hasApiKey,
          apiKeyFormat: validation.apiKeyFormat
        },
        validation: {
          ...validation,
          isValid,
          providerMatch,
          issues: [
            ...(!validation.hasProvider ? ['Missing provider'] : []),
            ...(!validation.hasModel ? ['Missing model'] : []),
            ...(!validation.hasApiKey ? ['Missing API key'] : []),
            ...(!providerMatch && validation.hasApiKey ? [`API key format (${validation.apiKeyFormat}) doesn't match provider (${llmConfig.provider})`] : [])
          ]
        }
      }
    });

  } catch (error) {
    console.error('❌ Error testing LLM configuration:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'LLM configuration test failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
