/**
 * Azure OpenAI Service
 * 
 * Handles Emirates Azure OpenAI deployment with specific endpoint and authentication.
 * Compatible with existing LLMService interface.
 * 
 * @module azure-openai-service
 */

import { OpenAI } from 'openai';
import { AzureOpenAIConfig } from '@/lib/secrets/secrets-manager';

export class AzureOpenAIService {
  private client: OpenAI;
  private config: AzureOpenAIConfig;

  constructor(config: AzureOpenAIConfig) {
    this.config = config;
    
    // Initialize Azure OpenAI client with Emirates-specific configuration
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: `${config.endpoint.replace(/\/$/, '')}/openai/deployments/${config.deployment}`,
      defaultQuery: { 'api-version': config.apiVersion },
      defaultHeaders: {
        'api-key': config.apiKey // Azure OpenAI uses 'api-key' header
      }
    });

    console.log('🏢 Azure OpenAI Service initialized:', {
      endpoint: config.endpoint,
      deployment: config.deployment,
      apiVersion: config.apiVersion,
      hasKey: !!config.apiKey
    });
  }

  /**
   * Generate chat completion using Azure OpenAI deployment
   */
  async generateChatCompletion(
    systemPrompt: string, 
    userPrompt: string, 
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<{ content: string; tokensUsed: number }> {
    try {
      console.log('🏢 Making Azure OpenAI API call:', {
        deployment: this.config.deployment,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 4000
      });

      const response = await this.client.chat.completions.create({
        model: this.config.deployment, // Use deployment name as model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000
      });

      const content = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      console.log('✅ Azure OpenAI response received:', {
        contentLength: content.length,
        tokensUsed,
        deployment: this.config.deployment
      });

      return { content, tokensUsed };

    } catch (error: any) {
      console.error('❌ Azure OpenAI API call failed:', error);
      throw new Error(`Azure OpenAI API call failed: ${error.message}`);
    }
  }

  /**
   * Test connection to Azure OpenAI
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const response = await this.generateChatCompletion(
        'You are a helpful assistant.',
        'Test connection - please respond with "OK"',
        { maxTokens: 10 }
      );

      if (response.content.toLowerCase().includes('ok')) {
        return {
          success: true,
          message: `Azure OpenAI connection successful (${this.config.deployment})`,
          details: {
            endpoint: this.config.endpoint,
            deployment: this.config.deployment,
            tokensUsed: response.tokensUsed
          }
        };
      } else {
        return {
          success: false,
          message: 'Azure OpenAI responded but with unexpected content'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Azure OpenAI connection failed: ${error.message}`
      };
    }
  }

  /**
   * Get configuration details (for debugging)
   */
  getConfigDetails() {
    return {
      endpoint: this.config.endpoint,
      deployment: this.config.deployment,
      apiVersion: this.config.apiVersion,
      hasKey: !!this.config.apiKey
    };
  }
}
