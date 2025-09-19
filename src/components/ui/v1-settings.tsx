"use client";

import { useState } from 'react';
import { useSettingsStore, V1LLMSettings } from '@/store/settings-store';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Bot, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  FileText,
  Palette,
  Code2,
  TestTube,
  Play,
  Bug,
  GitBranch,
  Save
} from 'lucide-react';

const MODULE_ICONS = {
  'use-cases': FileText,
  'requirements': Settings,
  'design': Palette,
  'code': Code2,
  'test-cases': TestTube,
  'execution': Play,
  'defects': Bug,
  'traceability': GitBranch,
};

const MODULE_NAMES = {
  'use-cases': 'Ideas',
  'requirements': 'Work Items',
  'design': 'Design',
  'code': 'Code',
  'test-cases': 'Test Cases',
  'execution': 'Execution',
  'defects': 'Defects',
  'traceability': 'Traceability',
};

interface V1SettingsProps {
  showActions?: boolean;
}

export function V1Settings({ showActions = false }: V1SettingsProps) {
  const {
    v1LLMSettings,
    availableProviders,
    setV1ModuleLLM,
    validateV1ModuleSettings,
    llmSettings,
    resetV1LLMSettings
  } = useSettingsStore();

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleModuleLLMChange = (
    module: keyof V1LLMSettings,
    type: 'primary' | 'backup',
    value: string
  ) => {
    const [provider, model] = value.split(':');
    setV1ModuleLLM(module, type, provider, model);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Settings are automatically persisted by Zustand
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving V1 settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetV1LLMSettings();
    setSaveStatus('idle');
  };

  const getProviderModelOptions = () => {
    return availableProviders.flatMap(provider => 
      provider.models.map(model => ({
        value: `${provider.id}:${model.id}`,
        label: `${provider.name} - ${model.name}`,
        provider: provider.name,
        model: model.name
      }))
    );
  };

  const options = getProviderModelOptions();
  const hasApiKey = !!llmSettings.apiKey;

  return (
    <div className="space-y-4">
      {/* Header - only show in standalone mode (right panel) */}
      {showActions && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <Bot size={16} className="mr-2" />
            V1 Module LLM Assignment
          </h4>
          <p className="text-sm text-blue-800 mb-2">
            Assign primary and backup LLMs to each V1 module. Primary is used by default, backup is used if primary fails.
          </p>
          {!hasApiKey && (
            <div className="flex items-center text-amber-700 text-xs">
              <AlertCircle size={12} className="mr-1" />
              Configure API key in main Settings first
            </div>
          )}
        </div>
      )}

      {/* Alert for main settings page when API key is missing */}
      {!showActions && !hasApiKey && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            Please configure your API key in the LLM Provider Configuration section above first.
          </AlertDescription>
        </Alert>
      )}

      {/* Module Configuration */}
      <div className="space-y-3">
        {(Object.keys(v1LLMSettings) as Array<keyof V1LLMSettings>).map((module) => {
          const Icon = MODULE_ICONS[module];
          const isValid = validateV1ModuleSettings(module);
          const config = v1LLMSettings[module];
          
          return (
            <Card key={module} className="border-gray-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon size={14} className="mr-2 text-gray-600" />
                    {MODULE_NAMES[module]}
                  </div>
                  {hasApiKey && (
                    <Badge variant={isValid ? "default" : "secondary"} className="text-xs">
                      {isValid ? (
                        <><CheckCircle size={10} className="mr-1" />Ready</>
                      ) : (
                        <><AlertCircle size={10} className="mr-1" />Setup</>
                      )}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Primary LLM */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Primary LLM</label>
                    <Select
                      value={`${config.primary.provider}:${config.primary.model}`}
                      onValueChange={(value) => handleModuleLLMChange(module, 'primary', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select primary LLM" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className="text-sm">{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Backup LLM */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Backup LLM</label>
                    <Select
                      value={`${config.backup.provider}:${config.backup.model}`}
                      onValueChange={(value) => handleModuleLLMChange(module, 'backup', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select backup LLM" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className="text-sm">{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions - only show in standalone mode (right panel) */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset to Defaults
          </Button>
          
          <div className="flex items-center space-x-2">
            {saveStatus === 'success' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle size={10} className="mr-1" />
                Saved
              </Badge>
            )}
            {saveStatus === 'error' && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <AlertCircle size={10} className="mr-1" />
                Failed
              </Badge>
            )}
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>Saving...</>
              ) : (
                <><Save size={12} className="mr-1" />Save</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <h5 className="font-medium text-gray-900 text-sm mb-2">Configuration Status</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span>API Key:</span>
            <span className={hasApiKey ? 'text-green-600' : 'text-red-600'}>
              {hasApiKey ? 'Configured' : 'Missing'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Modules Ready:</span>
            <span className="text-blue-600">
              {(Object.keys(v1LLMSettings) as Array<keyof V1LLMSettings>).filter(validateV1ModuleSettings).length}/8
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
