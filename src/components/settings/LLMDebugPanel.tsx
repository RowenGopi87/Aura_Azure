'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/settings-store';
import { 
  Bug, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';

export default function LLMDebugPanel() {
  const { getV1ModuleLLM } = useSettingsStore();
  const [testResults, setTestResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const modules = ['use-cases', 'requirements', 'design', 'code', 'test-cases', 'execution', 'defects', 'traceability'];

  const testModuleConfig = async (module: string, type: 'primary' | 'backup') => {
    try {
      const response = await fetch('/api/test-llm-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, type })
      });
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`Failed to test ${module} ${type}:`, error);
      return { validation: { isValid: false, issues: ['API call failed'] } };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    const results: any = {};

    for (const module of modules) {
      results[module] = {
        primary: await testModuleConfig(module, 'primary'),
        backup: await testModuleConfig(module, 'backup')
      };
    }

    setTestResults(results);
    setTesting(false);
  };

  const getStatusBadge = (validation: any) => {
    if (!validation) return <Badge variant="secondary">Not tested</Badge>;
    
    if (validation.isValid && validation.providerMatch) {
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Valid</Badge>;
    } else {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Invalid</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bug className="h-5 w-5 text-purple-600" />
          <CardTitle>LLM Configuration Debug</CardTitle>
        </div>
        <CardDescription>
          Test and validate LLM configurations for each module to identify issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button onClick={runAllTests} disabled={testing} variant="outline">
            {testing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bug className="h-4 w-4 mr-2" />
            )}
            {testing ? 'Testing...' : 'Test All Configurations'}
          </Button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Configuration Status:</h4>
            {modules.map(module => {
              const moduleResults = testResults[module];
              if (!moduleResults) return null;

              return (
                <div key={module} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{module.replace('-', ' ')}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-muted-foreground">Primary:</span>
                        {getStatusBadge(moduleResults.primary?.validation)}
                      </div>
                      {moduleResults.primary?.config && (
                        <div className="text-xs text-muted-foreground">
                          {moduleResults.primary.config.provider} - {moduleResults.primary.config.model}
                        </div>
                      )}
                      {moduleResults.primary?.validation?.issues?.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {moduleResults.primary.validation.issues.join(', ')}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-muted-foreground">Backup:</span>
                        {getStatusBadge(moduleResults.backup?.validation)}
                      </div>
                      {moduleResults.backup?.config && (
                        <div className="text-xs text-muted-foreground">
                          {moduleResults.backup.config.provider} - {moduleResults.backup.config.model}
                        </div>
                      )}
                      {moduleResults.backup?.validation?.issues?.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {moduleResults.backup.validation.issues.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Common Issues:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>API key format doesn't match provider (OpenAI keys start with 'sk-', Google keys start with 'AIza')</li>
            <li>Missing API key for the selected provider</li>
            <li>Provider/model combination not configured</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
