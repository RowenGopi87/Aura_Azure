"use client";

import { useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { V1Settings } from '@/components/ui/v1-settings';
import { ReverseEngineeringSettings } from '@/components/ui/reverse-engineering-settings';
import ArriveSettings from '@/components/settings/ArriveSettings';
import LLMDebugPanel from '@/components/settings/LLMDebugPanel';
import { API_KEYS } from '@/lib/config/environment';
import { 
  Settings, 
  Brain, 
  Key, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function V1SettingsPage() {
  const {
    llmSettings,
    availableProviders,
    setLLMProvider,
    setLLMModel,
    setAPIKey,
    setProviderAPIKey,
    getProviderAPIKey,
    setLLMSettings,
    resetLLMSettings,
    validateSettings,
    getCurrentProvider,
    getCurrentModel,
    loadApiKeyFromEnv
  } = useSettingsStore();

  const [showApiKey, setShowApiKey] = useState(false);
  // Initialize with provider-specific API key, fallback to legacy apiKey, then empty string
  const [tempApiKey, setTempApiKey] = useState(() => {
    const providerKey = getProviderAPIKey(llmSettings.provider);
    return providerKey || llmSettings.apiKey || '';
  });
  const [tempTemperature, setTempTemperature] = useState(llmSettings.temperature?.toString() || '0.7');
  const [tempMaxTokens, setTempMaxTokens] = useState(llmSettings.maxTokens?.toString() || '4000');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const currentProvider = getCurrentProvider();
  const currentModel = getCurrentModel();
  const isValid = validateSettings();

  // Load API key from environment variables if not set and available
  const loadApiKeyFromEnv = (providerId: string) => {
    let envApiKey = '';
    switch (providerId) {
      case 'openai':
        envApiKey = API_KEYS.openai;
        break;
      case 'google':
        envApiKey = API_KEYS.google;
        break;
      case 'anthropic':
        envApiKey = API_KEYS.anthropic;
        break;
    }
    
    if (envApiKey && envApiKey !== '') {
      setTempApiKey(envApiKey);
      return envApiKey;
    }
    return '';
  };

  const handleProviderChange = (provider: string) => {
    setLLMProvider(provider);
    
    // Try to load API key from environment first, then from provider-specific storage
    const envKey = loadApiKeyFromEnv(provider);
    const providerKey = getProviderAPIKey(provider);
    
    if (envKey) {
      // Environment key takes priority
      setTempApiKey(envKey);
    } else if (providerKey) {
      // Use stored provider-specific key
      setTempApiKey(providerKey);
    } else {
      // No key found, reset
      setTempApiKey('');
    }
  };

  const handleModelChange = (model: string) => {
    setLLMModel(model);
    const selectedModel = currentProvider?.models.find(m => m.id === model);
    if (selectedModel?.maxTokens) {
      setTempMaxTokens(selectedModel.maxTokens.toString());
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Save provider-specific API key
      setProviderAPIKey(llmSettings.provider, tempApiKey);
      
      // Migrate legacy API key if it exists and no provider-specific key was set
      if (llmSettings.apiKey && !getProviderAPIKey(llmSettings.provider)) {
        setProviderAPIKey(llmSettings.provider, llmSettings.apiKey);
      }
      
      setLLMSettings({
        temperature: parseFloat(tempTemperature),
        maxTokens: parseInt(tempMaxTokens),
        // Clear legacy API key after migration
        apiKey: ''
      });

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetLLMSettings();
    setTempApiKey('');
    setTempTemperature('0.7');
    setTempMaxTokens('4000');
    setSaveStatus('idle');
  };

  // Helper functions for provider descriptions and API key instructions
  const getProviderDescription = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return 'Advanced AI models including GPT-4, GPT-3.5 Turbo with excellent reasoning capabilities.';
      case 'google':
        return 'Google\'s Gemini models with strong multimodal capabilities and competitive performance.';
      case 'anthropic':
        return 'Anthropic\'s Claude models known for safety, helpfulness, and nuanced understanding.';
      default:
        return 'Select a provider to see more information.';
    }
  };

  const getApiKeyInstructions = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return 'Get your API key from https://platform.openai.com/api-keys. Keys start with "sk-".';
      case 'google':
        return 'Get your API key from https://aistudio.google.com/app/apikey. Keys start with "AI".';
      case 'anthropic':
        return 'Get your API key from https://console.anthropic.com/. Keys start with "sk-ant-".';
      default:
        return 'Please select a provider to see API key instructions.';
    }
  };

  const getApiKeyPlaceholder = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return 'sk-...';
      case 'google':
        return 'AI...';
      case 'anthropic':
        return 'sk-ant-...';
      default:
        return 'Enter API key';
    }
  };

  // Check if API key is available from environment
  const hasEnvApiKey = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return !!API_KEYS.openai;
      case 'google':
        return !!API_KEYS.google;
      case 'anthropic':
        return !!API_KEYS.anthropic;
      default:
        return false;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/v1/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to V1 Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Version 1 Settings</h1>
            <p className="text-gray-600 text-sm">Configure LLM providers and settings for V1 modules</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          <Settings className="w-4 h-4 mr-1" />
          V1 Configuration
        </Badge>
      </div>

      {/* Global LLM Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle>Global LLM Provider Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure your preferred language model provider and settings. This serves as the default for all V1 modules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select value={llmSettings.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center space-x-2">
                      <span>{provider.name}</span>
                      {hasEnvApiKey(provider.id) && (
                        <Badge variant="secondary" className="text-xs">ENV</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentProvider && (
              <p className="text-sm text-gray-600">{getProviderDescription(currentProvider.id)}</p>
            )}
          </div>

          {/* Model Selection */}
          {currentProvider && (
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={llmSettings.model} onValueChange={handleModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {currentProvider.models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        {model.description && (
                          <span className="text-xs text-gray-500">{model.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentModel && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {currentModel.maxTokens && <span>Max tokens: {currentModel.maxTokens.toLocaleString()}</span>}
                  {currentModel.inputCost && <span>• Input: ${currentModel.inputCost}/1K</span>}
                  {currentModel.outputCost && <span>• Output: ${currentModel.outputCost}/1K</span>}
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* API Key Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Key className="h-4 w-4 text-gray-600" />
              <Label htmlFor="apiKey">API Key</Label>
              {currentProvider && hasEnvApiKey(currentProvider.id) && (
                <Badge variant="secondary" className="text-xs">
                  Loaded from Environment
                </Badge>
              )}
            </div>
            
            {currentProvider && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>API Key {hasEnvApiKey(currentProvider.id) ? 'Available' : 'Required'}</AlertTitle>
                <AlertDescription>
                  {hasEnvApiKey(currentProvider.id) 
                    ? `API key loaded from environment variables. You can override it here if needed.`
                    : getApiKeyInstructions(currentProvider.id)
                  }
                </AlertDescription>
              </Alert>
            )}

            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder={currentProvider ? getApiKeyPlaceholder(currentProvider.id) : 'Enter API key'}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Advanced Settings</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={tempTemperature}
                  onChange={(e) => setTempTemperature(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Controls randomness. Lower = more focused, Higher = more creative (0-2)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="1"
                  value={tempMaxTokens}
                  onChange={(e) => setTempMaxTokens(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Maximum number of tokens in the response
                </p>
              </div>
            </div>
          </div>

          {/* Save Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>Reset to Defaults</span>
            </Button>

            <div className="flex items-center space-x-3">
              {saveStatus === 'success' && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-sm">Settings saved!</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm">Save failed</span>
                </div>
              )}
              
              <Button 
                onClick={handleSave}
                disabled={isSaving || !currentProvider}
                className="flex items-center space-x-2"
              >
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* V1 Module LLM Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <CardTitle>V1 Module LLM Assignment</CardTitle>
          </div>
          <CardDescription>
            Configure primary and backup LLMs for each V1 module. Each module can use different LLMs with automatic fallback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <V1Settings showActions={true} />
        </CardContent>
      </Card>

      {/* Reverse Engineering LLM Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-green-600" />
            <CardTitle>Reverse Engineering LLM Settings</CardTitle>
          </div>
          <CardDescription>
            Configure specialized LLMs for reverse engineering tasks in design and code analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReverseEngineeringSettings showActions={true} />
        </CardContent>
      </Card>

      {/* ARRIVE Integration Settings */}
      <ArriveSettings />

      {/* LLM Debug Panel */}
      <LLMDebugPanel />

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className={isValid ? "text-green-600" : "text-gray-400"} size={20} />
            <span>Configuration Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Provider Selected</span>
              <Badge variant={llmSettings.provider ? "default" : "secondary"}>
                {llmSettings.provider ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Model Selected</span>
              <Badge variant={llmSettings.model ? "default" : "secondary"}>
                {llmSettings.model ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Key Configured</span>
              <Badge variant={llmSettings.apiKey ? "default" : "secondary"}>
                {llmSettings.apiKey ? "✓" : "✗"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
