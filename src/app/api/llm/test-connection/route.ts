import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { secretsManager, LLMProvider } from '@/lib/secrets/secrets-manager';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const testConnectionSchema = z.object({
  provider: z.enum(['openai', 'google', 'anthropic', 'azure-openai']),
  model: z.string().optional()
});

/**
 * POST /api/llm/test-connection
 * 
 * Tests connection to an LLM provider using server-side credentials.
 * NEVER receives or exposes actual API keys.
 * 
 * Request: { provider: 'openai', model?: 'gpt-4o' }
 * Response: { success: true, message: 'Connection successful', ... }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = testConnectionSchema.parse(body);
    const { provider, model } = validatedData;

    console.log(`🧪 Testing connection to ${provider}...`);

    // Get API key from server-side secrets manager (never exposed to client)
    const apiKey = await secretsManager.getApiKey(provider as LLMProvider);

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Provider not configured',
        message: `${provider} API key not found in environment variables. Please configure in .env.local`
      }, { status: 400 });
    }

    // Validate API key format
    const isValid = await secretsManager.validateProvider(provider as LLMProvider);
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format',
        message: `${provider} API key format is invalid. Please check your environment configuration.`
      }, { status: 400 });
    }

    // Test actual connection to provider
    let testResult: { success: boolean; message: string; details?: any };

    switch (provider) {
      case 'openai':
        testResult = await testOpenAIConnection(apiKey, model || 'gpt-3.5-turbo');
        break;
      case 'google':
        testResult = await testGoogleAIConnection(apiKey, model || 'gemini-1.5-flash');
        break;
      case 'azure-openai':
        testResult = await testAzureOpenAIConnection();
        break;
      case 'anthropic':
        // Anthropic test can be added later
        testResult = { 
          success: true, 
          message: 'API key format valid (connection test not implemented)' 
        };
        break;
      default:
        testResult = { success: false, message: 'Unsupported provider' };
    }

    if (testResult.success) {
      console.log(`✅ ${provider} connection test successful`);
      return NextResponse.json({
        success: true,
        message: testResult.message,
        data: {
          provider,
          configured: true,
          tested: true,
          testedAt: new Date().toISOString(),
          ...testResult.details
        }
      });
    } else {
      console.error(`❌ ${provider} connection test failed:`, testResult.message);
      return NextResponse.json({
        success: false,
        error: 'Connection test failed',
        message: testResult.message
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Test connection error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Test connection failed',
      message: error.message
    }, { status: 500 });
  }
}

// Helper function to test OpenAI connection
async function testOpenAIConnection(apiKey: string, model: string): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const openai = new OpenAI({ apiKey });
    
    // Make a minimal test call
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 5
    });

    return {
      success: true,
      message: `Successfully connected to OpenAI (${model})`,
      details: {
        model: response.model,
        tokensUsed: response.usage?.total_tokens || 0
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `OpenAI connection failed: ${error.message}`
    };
  }
}

// Helper function to test Google AI connection
async function testGoogleAIConnection(apiKey: string, model: string): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const googleAI = new GoogleGenerativeAI(apiKey);
    const genModel = googleAI.getGenerativeModel({ model });
    
    // Make a minimal test call
    const result = await genModel.generateContent('Test');
    const response = await result.response;

    return {
      success: true,
      message: `Successfully connected to Google AI (${model})`,
      details: {
        model,
        responseReceived: !!response.text()
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Google AI connection failed: ${error.message}`
    };
  }
}

// Helper function to test Azure OpenAI connection
async function testAzureOpenAIConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const azureConfig = await secretsManager.getAzureOpenAIConfig();
    
    if (!azureConfig) {
      return {
        success: false,
        message: 'Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, and AZURE_OPENAI_DEPLOYMENT'
      };
    }

    // Test Azure OpenAI connection using Emirates deployment
    const { AzureOpenAIService } = await import('@/lib/services/azure-openai-service');
    const azureService = new AzureOpenAIService(azureConfig);
    
    const testResult = await azureService.testConnection();
    
    return {
      success: testResult.success,
      message: testResult.message,
      details: {
        endpoint: azureConfig.endpoint,
        deployment: azureConfig.deployment,
        apiVersion: azureConfig.apiVersion,
        ...testResult.details
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Azure OpenAI test failed: ${error.message}`
    };
  }
}
