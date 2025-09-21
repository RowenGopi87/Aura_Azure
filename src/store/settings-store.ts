import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LLM_CONFIG, API_KEYS, REVERSE_ENGINEERING_CONFIG } from '@/lib/config/environment';

export interface LLMProvider {
  id: string;
  name: string;
  models: LLMModel[];
}

export interface LLMModel {
  id: string;
  name: string;
  description?: string;
  maxTokens?: number;
}

export interface LLMSettings {
  provider: string;
  model: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  // Provider-specific API keys
  apiKeys?: {
    openai?: string;
    google?: string;
    anthropic?: string;
  };
}

export interface ReverseEngineeringLLMSettings {
  design: {
    provider: string;
    model: string;
    backupProvider?: string;
    backupModel?: string;
  };
  code: {
    provider: string;
    model: string;
    backupProvider?: string;
    backupModel?: string;
  };
}

export interface V1ModuleLLMConfig {
  primary: {
    provider: string;
    model: string;
  };
  backup: {
    provider: string;
    model: string;
  };
}

export interface V1LLMSettings {
  'use-cases': V1ModuleLLMConfig;
  'requirements': V1ModuleLLMConfig;
  'design': V1ModuleLLMConfig;
  'code': V1ModuleLLMConfig;
  'test-cases': V1ModuleLLMConfig;
  'execution': V1ModuleLLMConfig;
  'defects': V1ModuleLLMConfig;
  'traceability': V1ModuleLLMConfig;
}

export interface ArriveSettings {
  enabled: boolean;
  generateOnCreation: boolean;
  outputPath: string;
  defaultComponentType: 'frontend' | 'backend' | 'integration';
  defaultEffortDays: number;
  defaultEstimatedLoc: number;
}

interface SettingsStore {
  // LLM Configuration
  llmSettings: LLMSettings;
  v1LLMSettings: V1LLMSettings;
  reverseEngineeringLLMSettings: ReverseEngineeringLLMSettings;
  availableProviders: LLMProvider[];
  
  // ARRIVE Integration Settings
  arriveSettings: ArriveSettings;
  
  // Actions
  setLLMProvider: (provider: string) => void;
  setLLMModel: (model: string) => void;
  setAPIKey: (apiKey: string) => void;
  setProviderAPIKey: (provider: string, apiKey: string) => void;
  getProviderAPIKey: (provider: string) => string;
  setLLMSettings: (settings: Partial<LLMSettings>) => void;
  loadAPIKeyFromEnv: (provider: string) => string;
  initializeFromEnvironment: () => void;
  setV1ModuleLLM: (module: keyof V1LLMSettings, type: 'primary' | 'backup', provider: string, model: string) => void;
  getV1ModuleLLM: (module: keyof V1LLMSettings, type?: 'primary' | 'backup') => { provider: string; model: string; apiKey: string; temperature: number; maxTokens: number; };
  resetLLMSettings: () => void;
  resetV1LLMSettings: () => void;
  validateSettings: () => boolean;
  validateV1ModuleSettings: (module: keyof V1LLMSettings) => boolean;
  getCurrentProvider: () => LLMProvider | undefined;
  getCurrentModel: () => LLMModel | undefined;
  
  // Reverse Engineering LLM Settings
  setReverseEngineeringLLM: (type: 'design' | 'code', provider: string, model: string) => void;
  setReverseEngineeringBackupLLM: (type: 'design' | 'code', provider: string, model: string) => void;
  resetReverseEngineeringLLMSettings: () => void;
  
  // ARRIVE Settings Actions
  setArriveSettings: (settings: Partial<ArriveSettings>) => void;
  resetArriveSettings: () => void;
  isArriveEnabled: () => boolean;
}

const DEFAULT_PROVIDERS: LLMProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Most capable multimodal model with vision capabilities',
        maxTokens: 128000
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast and cost-effective multimodal model',
        maxTokens: 128000
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Previous generation high-capability model',
        maxTokens: 128000
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective for simple tasks',
        maxTokens: 4096
      }
    ]
  },
  {
    id: 'google',
    name: 'Google AI (Gemini)',
    models: [
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Google\'s most capable multimodal model',
        maxTokens: 2097152
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Fast and efficient multimodal model',
        maxTokens: 1048576
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Previous generation high-capability model',
        maxTokens: 2097152
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Previous generation fast model',
        maxTokens: 1048576
      }
    ]
  }
];


const DEFAULT_SETTINGS: LLMSettings = {
  provider: DEFAULT_LLM_CONFIG.provider,
  model: DEFAULT_LLM_CONFIG.models[DEFAULT_LLM_CONFIG.provider as keyof typeof DEFAULT_LLM_CONFIG.models],
  apiKey: API_KEYS[DEFAULT_LLM_CONFIG.provider as keyof typeof API_KEYS] || '',
  temperature: DEFAULT_LLM_CONFIG.temperature,
  maxTokens: DEFAULT_LLM_CONFIG.maxTokens,
  // Initialize provider-specific API keys from environment
  apiKeys: {
    openai: API_KEYS.openai || '',
    google: API_KEYS.google || '',
    anthropic: API_KEYS.anthropic || ''
  }
};

const DEFAULT_V1_MODULE_CONFIG: V1ModuleLLMConfig = {
  primary: {
    provider: 'openai',
    model: 'gpt-4o'
  },
  backup: {
    provider: 'google',
    model: 'gemini-2.5-pro'
  }
};

const DEFAULT_V1_SETTINGS: V1LLMSettings = {
  'use-cases': DEFAULT_V1_MODULE_CONFIG,
  'requirements': DEFAULT_V1_MODULE_CONFIG,
  'design': DEFAULT_V1_MODULE_CONFIG,
  'code': DEFAULT_V1_MODULE_CONFIG,
  'test-cases': DEFAULT_V1_MODULE_CONFIG,
  'execution': DEFAULT_V1_MODULE_CONFIG,
  'defects': DEFAULT_V1_MODULE_CONFIG,
  'traceability': DEFAULT_V1_MODULE_CONFIG,
};


const DEFAULT_REVERSE_ENGINEERING_LLM_SETTINGS: ReverseEngineeringLLMSettings = {
  design: {
    provider: REVERSE_ENGINEERING_CONFIG.design.provider,
    model: REVERSE_ENGINEERING_CONFIG.design.model
  },
  code: {
    provider: REVERSE_ENGINEERING_CONFIG.code.provider,
    model: REVERSE_ENGINEERING_CONFIG.code.model
  }
};

const DEFAULT_ARRIVE_SETTINGS: ArriveSettings = {
  enabled: false, // Default to disabled
  generateOnCreation: true,
  outputPath: 'arrive-yaml',
  defaultComponentType: 'backend',
  defaultEffortDays: 3,
  defaultEstimatedLoc: 300
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      llmSettings: DEFAULT_SETTINGS,
      v1LLMSettings: DEFAULT_V1_SETTINGS,
      reverseEngineeringLLMSettings: DEFAULT_REVERSE_ENGINEERING_LLM_SETTINGS,
      arriveSettings: DEFAULT_ARRIVE_SETTINGS,
      availableProviders: DEFAULT_PROVIDERS,

      setLLMProvider: (provider: string) => {
        const providerData = get().availableProviders.find(p => p.id === provider);
        const defaultModel = providerData?.models[0]?.id || '';
        
        // Try to load API key from environment first, then preserve existing
        const envApiKey = get().loadAPIKeyFromEnv(provider);
        const currentApiKey = get().llmSettings.apiKey;
        const apiKeyToUse = envApiKey || currentApiKey || '';
        
        set((state) => ({
          llmSettings: {
            ...state.llmSettings,
            provider,
            model: defaultModel,
            apiKey: apiKeyToUse
          }
        }));
      },

      setLLMModel: (model: string) => {
        set((state) => ({
          llmSettings: {
            ...state.llmSettings,
            model
          }
        }));
      },

      setAPIKey: (apiKey: string) => {
        // Validate API key format and reject file paths
        if (apiKey && (apiKey.includes('\\') || apiKey.includes('/') || apiKey.includes(':'))) {
          console.error('❌ Invalid API key format detected (contains file path characters)');
          console.log('💡 API key should start with sk- for OpenAI or AI for Google');
          return;
        }
        
        set((state) => ({
          llmSettings: {
            ...state.llmSettings,
            apiKey
          }
        }));
      },

      setProviderAPIKey: (provider: string, apiKey: string) => {
        set((state) => ({
          llmSettings: {
            ...state.llmSettings,
            apiKeys: {
              ...state.llmSettings.apiKeys,
              [provider]: apiKey
            }
          }
        }));
      },

      getProviderAPIKey: (provider: string) => {
        const { llmSettings } = get();
        return llmSettings.apiKeys?.[provider as keyof typeof llmSettings.apiKeys] || '';
      },

      setLLMSettings: (settings: Partial<LLMSettings>) => {
        set((state) => ({
          llmSettings: {
            ...state.llmSettings,
            ...settings
          }
        }));
      },

      resetLLMSettings: () => {
        set({ llmSettings: DEFAULT_SETTINGS });
      },

      validateSettings: () => {
        const { llmSettings } = get();
        return !!(llmSettings.provider && llmSettings.model && llmSettings.apiKey);
      },

      getCurrentProvider: () => {
        const { llmSettings, availableProviders } = get();
        return availableProviders.find(p => p.id === llmSettings.provider);
      },

      getCurrentModel: () => {
        const { llmSettings } = get();
        const provider = get().getCurrentProvider();
        return provider?.models.find(m => m.id === llmSettings.model);
      },

      // V1 Module LLM Management
      setV1ModuleLLM: (module: keyof V1LLMSettings, type: 'primary' | 'backup', provider: string, model: string) => {
        set((state) => ({
          v1LLMSettings: {
            ...state.v1LLMSettings,
            [module]: {
              ...state.v1LLMSettings[module],
              [type]: {
                provider,
                model
              }
            }
          }
        }));
      },

      getV1ModuleLLM: (module: keyof V1LLMSettings, type: 'primary' | 'backup' = 'primary') => {
        const { v1LLMSettings, llmSettings } = get();
        const moduleConfig = v1LLMSettings[module][type];
        
        // Get the appropriate API key for the provider
        const getApiKeyForProvider = (provider: string): string => {
          console.log(`[SETTINGS STORE] 🔍 Getting API key for provider: ${provider}`);
          console.log(`[SETTINGS STORE] 🔍 Current llmSettings:`, {
            hasApiKeys: !!llmSettings.apiKeys,
            globalApiKey: llmSettings.apiKey ? llmSettings.apiKey.substring(0, 8) + '...' : 'none',
            apiKeysStructure: llmSettings.apiKeys ? Object.keys(llmSettings.apiKeys) : 'none'
          });
          
          // First check provider-specific API keys
          if (llmSettings.apiKeys) {
            switch (provider) {
              case 'openai':
                if (llmSettings.apiKeys.openai) {
                  console.log(`[SETTINGS STORE] ✅ Found provider-specific OpenAI key`);
                  return llmSettings.apiKeys.openai;
                }
                break;
              case 'google':
                if (llmSettings.apiKeys.google) {
                  console.log(`[SETTINGS STORE] ✅ Found provider-specific Google key`);
                  return llmSettings.apiKeys.google;
                }
                break;
              case 'anthropic':
                if (llmSettings.apiKeys.anthropic) {
                  console.log(`[SETTINGS STORE] ✅ Found provider-specific Anthropic key`);
                  return llmSettings.apiKeys.anthropic;
                }
                break;
            }
          }
          
          // Fallback to global API key, but validate it matches the provider
          const globalKey = llmSettings.apiKey;
          console.log(`[SETTINGS STORE] 🔄 Checking global API key for ${provider}:`, globalKey ? globalKey.substring(0, 8) + '...' : 'none');
          
          if (globalKey) {
            switch (provider) {
              case 'openai':
                if (globalKey.startsWith('sk-')) {
                  console.log(`[SETTINGS STORE] ✅ Global key matches OpenAI format`);
                  return globalKey;
                } else {
                  console.log(`[SETTINGS STORE] ❌ Global key doesn't match OpenAI format (starts with: ${globalKey.substring(0, 4)})`);
                  return '';
                }
              case 'google':
                if (globalKey.startsWith('AIza')) {
                  console.log(`[SETTINGS STORE] ✅ Global key matches Google format`);
                  return globalKey;
                } else {
                  console.log(`[SETTINGS STORE] ❌ Global key doesn't match Google format (starts with: ${globalKey.substring(0, 4)})`);
                  return '';
                }
              case 'anthropic':
                if (globalKey.startsWith('sk-ant-')) {
                  console.log(`[SETTINGS STORE] ✅ Global key matches Anthropic format`);
                  return globalKey;
                } else {
                  console.log(`[SETTINGS STORE] ❌ Global key doesn't match Anthropic format (starts with: ${globalKey.substring(0, 7)})`);
                  return '';
                }
              default:
                console.log(`[SETTINGS STORE] ⚠️ Unknown provider ${provider}, returning global key`);
                return globalKey;
            }
          }
          
          console.log(`[SETTINGS STORE] ❌ No API key found for provider: ${provider}`);
          return '';
        };

        const apiKey = getApiKeyForProvider(moduleConfig.provider);
        
        console.log(`[SETTINGS STORE] 🔍 DEBUG getV1ModuleLLM(${module}, ${type}):`, {
          provider: moduleConfig.provider,
          model: moduleConfig.model,
          hasApiKey: !!apiKey,
          apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none'
        });
        
        return {
          provider: moduleConfig.provider,
          model: moduleConfig.model,
          apiKey: apiKey,
          temperature: llmSettings.temperature || 0.7,
          maxTokens: llmSettings.maxTokens || 4000
        };
      },

      resetV1LLMSettings: () => {
        set({ v1LLMSettings: DEFAULT_V1_SETTINGS });
      },

      validateV1ModuleSettings: (module: keyof V1LLMSettings) => {
        const { v1LLMSettings, llmSettings } = get();
        const moduleConfig = v1LLMSettings[module];
        return !!(
          moduleConfig.primary.provider && 
          moduleConfig.primary.model && 
          moduleConfig.backup.provider && 
          moduleConfig.backup.model && 
          llmSettings.apiKey
        );
      },

      // Reverse Engineering LLM Settings Actions
      setReverseEngineeringLLM: (type: 'design' | 'code', provider: string, model: string) => {
        set((state) => ({
          reverseEngineeringLLMSettings: {
            ...state.reverseEngineeringLLMSettings,
            [type]: {
              ...state.reverseEngineeringLLMSettings[type],
              provider,
              model
            }
          }
        }));
      },

      setReverseEngineeringBackupLLM: (type: 'design' | 'code', provider: string, model: string) => {
        set((state) => ({
          reverseEngineeringLLMSettings: {
            ...state.reverseEngineeringLLMSettings,
            [type]: {
              ...state.reverseEngineeringLLMSettings[type],
              backupProvider: provider,
              backupModel: model
            }
          }
        }));
      },

      resetReverseEngineeringLLMSettings: () => {
        set({ reverseEngineeringLLMSettings: DEFAULT_REVERSE_ENGINEERING_LLM_SETTINGS });
      },

      // ARRIVE Settings Actions
      setArriveSettings: (settings: Partial<ArriveSettings>) => {
        set((state) => ({
          arriveSettings: {
            ...state.arriveSettings,
            ...settings
          }
        }));
      },

      resetArriveSettings: () => {
        set({ arriveSettings: DEFAULT_ARRIVE_SETTINGS });
      },

      isArriveEnabled: () => {
        const { arriveSettings } = get();
        return arriveSettings.enabled;
      },

      // Environment variable integration
      loadAPIKeyFromEnv: (provider: string) => {
        switch (provider) {
          case 'openai':
            return API_KEYS.openai || '';
          case 'google':
            return API_KEYS.google || '';
          case 'anthropic':
            return API_KEYS.anthropic || '';
          default:
            return '';
        }
      },

      initializeFromEnvironment: () => {
        const { llmSettings } = get();
        
        // Migrate existing settings to new structure
        if (!llmSettings.apiKeys) {
          console.log('[SETTINGS STORE] 🔄 Migrating to provider-specific API keys structure');
          const newApiKeys = {
            openai: API_KEYS.openai || (llmSettings.apiKey?.startsWith('sk-') ? llmSettings.apiKey : ''),
            google: API_KEYS.google || (llmSettings.apiKey?.startsWith('AIza') ? llmSettings.apiKey : ''),
            anthropic: API_KEYS.anthropic || (llmSettings.apiKey?.startsWith('sk-ant-') ? llmSettings.apiKey : '')
          };
          
          set((state) => ({
            llmSettings: {
              ...state.llmSettings,
              apiKeys: newApiKeys
            }
          }));
          
          console.log('[SETTINGS STORE] ✅ Migration complete:', {
            hasOpenAI: !!newApiKeys.openai,
            hasGoogle: !!newApiKeys.google,
            hasAnthropic: !!newApiKeys.anthropic
          });
        }
        
        // If no API key is set, try to load from environment
        if (!llmSettings.apiKey && llmSettings.provider) {
          const envApiKey = get().loadAPIKeyFromEnv(llmSettings.provider);
          if (envApiKey) {
            set((state) => ({
              llmSettings: {
                ...state.llmSettings,
                apiKey: envApiKey
              }
            }));
          }
        }
      }
    }),
    {
      name: 'aura-settings',
      // Persist all settings including API key (user responsibility for security)
      partialize: (state) => ({
        llmSettings: {
          provider: state.llmSettings.provider,
          model: state.llmSettings.model,
          temperature: state.llmSettings.temperature,
          maxTokens: state.llmSettings.maxTokens,
          // Persist API key for convenience (user should secure their environment)
          apiKey: state.llmSettings.apiKey,
          // Persist provider-specific API keys
          apiKeys: state.llmSettings.apiKeys
        },
        v1LLMSettings: state.v1LLMSettings,
        reverseEngineeringLLMSettings: state.reverseEngineeringLLMSettings,
        arriveSettings: state.arriveSettings
      })
    }
  )
);

// Initialize the store and run migrations
if (typeof window !== 'undefined') {
  // Run initialization only in browser environment
  setTimeout(() => {
    useSettingsStore.getState().initializeFromEnvironment();
  }, 0);
}