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
  maxTokens?: number;
  temperature?: number;
  // 🔒 SECURITY: API keys removed - now managed server-side only
  // Keys are retrieved from environment variables or Azure Key Vault
  // Never stored in client-side state or localStorage
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
  setLLMSettings: (settings: Partial<LLMSettings>) => void;
  initializeFromEnvironment: () => void;
  setV1ModuleLLM: (module: keyof V1LLMSettings, type: 'primary' | 'backup', provider: string, model: string) => void;
  getV1ModuleLLM: (module: keyof V1LLMSettings, type?: 'primary' | 'backup') => { provider: string; model: string; temperature: number; maxTokens: number; };
  resetLLMSettings: () => void;
  resetV1LLMSettings: () => void;
  validateSettings: () => boolean;
  validateV1ModuleSettings: (module: keyof V1LLMSettings) => boolean;
  getCurrentProvider: () => LLMProvider | undefined;
  getCurrentModel: () => LLMModel | undefined;
  // 🔒 SECURITY: Removed setAPIKey, setProviderAPIKey, getProviderAPIKey - keys are server-side only
  
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
    id: 'azure-openai',
    name: 'Azure OpenAI (Emirates)',
    models: [
      {
        id: 'gpt-4.1',
        name: 'GPT-4.1 (Emirates Deployment)',
        description: 'Emirates Azure OpenAI GPT-4.1 deployment',
        maxTokens: 128000
      },
      {
        id: 'gpt-35-turbo',
        name: 'GPT-3.5 Turbo (Emirates Deployment)', 
        description: 'Emirates Azure OpenAI GPT-3.5 deployment',
        maxTokens: 4096
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Most intelligent model with excellent reasoning',
        maxTokens: 200000
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Powerful model for complex tasks',
        maxTokens: 200000
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
  temperature: DEFAULT_LLM_CONFIG.temperature,
  maxTokens: DEFAULT_LLM_CONFIG.maxTokens
  // 🔒 SECURITY: API keys removed - managed server-side only
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
        
        // 🔒 SECURITY: No longer manages API keys
        // Keys are retrieved server-side when needed
        set((state) => ({
          llmSettings: {
            ...state.llmSettings,
            provider,
            model: defaultModel
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

      // 🔒 SECURITY: setAPIKey, setProviderAPIKey, getProviderAPIKey removed
      // API keys are now managed server-side only via SecretsManager

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
        // 🔒 SECURITY: Only validate provider/model selection
        // API key validation happens server-side via SecretsManager
        return !!(llmSettings.provider && llmSettings.model);
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
        
        // 🔒 SECURITY: No longer returns API key
        // API keys are retrieved server-side via SecretsManager
        console.log(`[SETTINGS STORE] 🔍 getV1ModuleLLM(${module}, ${type}):`, {
          provider: moduleConfig.provider,
          model: moduleConfig.model
        });
        
        return {
          provider: moduleConfig.provider,
          model: moduleConfig.model,
          temperature: llmSettings.temperature || 0.7,
          maxTokens: llmSettings.maxTokens || 4000
          // 🔒 NO API KEY - Retrieved server-side only
        };
      },

      resetV1LLMSettings: () => {
        set({ v1LLMSettings: DEFAULT_V1_SETTINGS });
      },

      validateV1ModuleSettings: (module: keyof V1LLMSettings) => {
        const { v1LLMSettings } = get();
        const moduleConfig = v1LLMSettings[module];
        
        // 🔒 SECURITY: Only validate provider/model configuration
        // API key validation happens server-side via SecretsManager
        return !!(
          moduleConfig.primary.provider && 
          moduleConfig.primary.model &&
          moduleConfig.backup.provider && 
          moduleConfig.backup.model
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

      // 🔒 SECURITY: Environment integration simplified - no client-side key management

      initializeFromEnvironment: () => {
        // API keys are now managed server-side only
        // This function no longer loads keys into client state
        console.log('[SETTINGS STORE] ✅ Settings initialized (server-side key management active)');
      }
    }),
    {
      name: 'aura-settings',
      // 🔒 SECURITY: Persist only provider/model preferences (NO API KEYS)
      partialize: (state) => ({
        llmSettings: {
          provider: state.llmSettings.provider,
          model: state.llmSettings.model,
          temperature: state.llmSettings.temperature,
          maxTokens: state.llmSettings.maxTokens
          // 🔒 SECURITY: API keys NO LONGER PERSISTED to localStorage
          // Keys are managed server-side only via environment variables or Azure Key Vault
        },
        v1LLMSettings: state.v1LLMSettings,
        reverseEngineeringLLMSettings: state.reverseEngineeringLLMSettings,
        arriveSettings: state.arriveSettings
      })
    }
  )
);

// Initialize the store with security migration
if (typeof window !== 'undefined') {
  // Run initialization only in browser environment
  setTimeout(() => {
    useSettingsStore.getState().initializeFromEnvironment();
    
    // 🔒 SECURITY: Legacy API key migration removed
    // API keys are now managed server-side only via SecretsManager
    // SecurityProvider component handles localStorage cleanup
  }, 0);
}