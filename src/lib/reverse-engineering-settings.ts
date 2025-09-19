export interface ReverseEngineeringProvider {
  name: string;
  provider: string;
  model: string;
}

export interface ReverseEngineeringLLMSettings {
  design: {
    provider: string;
    model: string;
  };
  code: {
    provider: string;
    model: string;
  };
}

export function getReverseEngineeringProviders(
  type: 'design' | 'code', 
  settings?: ReverseEngineeringLLMSettings
): ReverseEngineeringProvider[] {
  // Use provided settings or fall back to defaults
  const defaultSettings: ReverseEngineeringLLMSettings = {
    design: {
      provider: 'google',
      model: 'gemini-2.5-flash'
    },
    code: {
      provider: 'google',
      model: 'gemini-2.5-flash'
    }
  };
  
  const effectiveSettings = settings || defaultSettings;
  const primaryConfig = effectiveSettings[type];
  
  // Create provider configurations based on settings
  const providers: ReverseEngineeringProvider[] = [];
  
  // Add the primary configured provider
  if (primaryConfig.provider === 'google') {
    providers.push({
      name: 'Google',
      provider: 'google',
      model: primaryConfig.model
    });
  } else if (primaryConfig.provider === 'openai') {
    providers.push({
      name: 'OpenAI',
      provider: 'openai',
      model: primaryConfig.model
    });
  }
  
  // Add fallback provider (opposite of primary)
  if (primaryConfig.provider === 'google') {
    providers.push({
      name: 'OpenAI',
      provider: 'openai',
      model: 'gpt-4o' // Default fallback model
    });
  } else {
    providers.push({
      name: 'Google',
      provider: 'google',
      model: 'gemini-2.5-pro' // Default fallback model
    });
  }
  
  return providers;
}

export function getDefaultReverseEngineeringProviders(): ReverseEngineeringProvider[] {
  // Fallback if settings are not available
  return [
    { name: 'Google', provider: 'google', model: 'gemini-2.5-flash' },
    { name: 'OpenAI', provider: 'openai', model: 'gpt-4o' }
  ];
}
