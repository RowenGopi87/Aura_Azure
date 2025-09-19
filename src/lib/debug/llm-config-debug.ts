import { useSettingsStore } from '@/store/settings-store';

/**
 * Debug utility to check LLM configuration state
 */
export function debugLLMConfig() {
  const store = useSettingsStore.getState();
  
  console.log('🔍 LLM Configuration Debug Report:');
  console.log('=====================================');
  
  // Check global settings
  console.log('📋 Global LLM Settings:', {
    provider: store.llmSettings.provider,
    model: store.llmSettings.model,
    hasGlobalApiKey: !!store.llmSettings.apiKey,
    globalApiKeyPrefix: store.llmSettings.apiKey ? store.llmSettings.apiKey.substring(0, 8) + '...' : 'none',
    hasApiKeysStructure: !!store.llmSettings.apiKeys
  });
  
  // Check provider-specific API keys
  if (store.llmSettings.apiKeys) {
    console.log('🔑 Provider-Specific API Keys:');
    Object.entries(store.llmSettings.apiKeys).forEach(([provider, key]) => {
      console.log(`  ${provider}: ${key ? key.substring(0, 8) + '...' : 'not set'}`);
    });
  } else {
    console.log('⚠️ No provider-specific API keys structure found');
  }
  
  // Test each module configuration
  console.log('🧪 Module Configuration Tests:');
  const modules = ['use-cases', 'requirements', 'design', 'code', 'test-cases', 'execution', 'defects', 'traceability'];
  
  modules.forEach(module => {
    try {
      const primaryConfig = store.getV1ModuleLLM(module as any, 'primary');
      const backupConfig = store.getV1ModuleLLM(module as any, 'backup');
      
      console.log(`  ${module}:`);
      console.log(`    Primary: ${primaryConfig.provider}/${primaryConfig.model} - API Key: ${primaryConfig.apiKey ? '✅' : '❌'}`);
      console.log(`    Backup:  ${backupConfig.provider}/${backupConfig.model} - API Key: ${backupConfig.apiKey ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`    ${module}: ❌ Error - ${error}`);
    }
  });
  
  console.log('=====================================');
}

/**
 * Check if a specific module configuration is valid
 */
export function validateModuleConfig(module: string, type: 'primary' | 'backup' = 'primary'): {
  isValid: boolean;
  issues: string[];
  config?: any;
} {
  try {
    const store = useSettingsStore.getState();
    const config = store.getV1ModuleLLM(module as any, type);
    
    const issues: string[] = [];
    
    if (!config.provider) issues.push('No provider configured');
    if (!config.model) issues.push('No model configured');
    if (!config.apiKey) issues.push('No API key available');
    
    // Check API key format
    if (config.apiKey && config.provider) {
      switch (config.provider) {
        case 'openai':
          if (!config.apiKey.startsWith('sk-')) {
            issues.push('OpenAI API key should start with "sk-"');
          }
          break;
        case 'google':
          if (!config.apiKey.startsWith('AIza')) {
            issues.push('Google API key should start with "AIza"');
          }
          break;
        case 'anthropic':
          if (!config.apiKey.startsWith('sk-ant-')) {
            issues.push('Anthropic API key should start with "sk-ant-"');
          }
          break;
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      config
    };
  } catch (error) {
    return {
      isValid: false,
      issues: [`Configuration error: ${error}`]
    };
  }
}

// Export for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugLLMConfig = debugLLMConfig;
  (window as any).validateModuleConfig = validateModuleConfig;
}
