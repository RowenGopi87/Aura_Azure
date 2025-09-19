'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Using standard HTML checkboxes as Switch component doesn't exist
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/settings-store';
import { ArriveFileService } from '@/lib/arrive/file-service';
import { 
  FileText, 
  FolderOpen, 
  Settings, 
  Save, 
  RotateCcw, 
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

export default function ArriveSettings() {
  const { 
    arriveSettings, 
    setArriveSettings, 
    resetArriveSettings 
  } = useSettingsStore();
  
  const [tempSettings, setTempSettings] = useState(arriveSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showStoredFiles, setShowStoredFiles] = useState(false);
  const [storedFiles, setStoredFiles] = useState<string[]>([]);
  const [showPhysicalFiles, setShowPhysicalFiles] = useState(false);
  const [physicalFiles, setPhysicalFiles] = useState<string[]>([]);
  const [physicalFileStats, setPhysicalFileStats] = useState<any>(null);

  const handleSettingChange = (key: keyof typeof arriveSettings, value: any) => {
    setTempSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      setArriveSettings(tempSettings);
      setSaveStatus('success');
      
      // Clear success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save ARRIVE settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetArriveSettings();
    setTempSettings(useSettingsStore.getState().arriveSettings);
    setSaveStatus('idle');
  };

  const loadStoredFiles = () => {
    const files = ArriveFileService.listStoredFiles();
    setStoredFiles(files);
    setShowStoredFiles(true);
  };

  const clearStoredFiles = () => {
    ArriveFileService.clearStoredFiles();
    setStoredFiles([]);
    setShowStoredFiles(false);
  };

  const loadPhysicalFiles = async () => {
    try {
      const response = await fetch('/api/arrive/list');
      const result = await response.json();
      
      if (result.success) {
        setPhysicalFiles(result.data.files);
        setPhysicalFileStats(result.data);
        setShowPhysicalFiles(true);
      }
    } catch (error) {
      console.error('Failed to load physical files:', error);
    }
  };

  const clearPhysicalFiles = async () => {
    try {
      const response = await fetch('/api/arrive/list', { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        setPhysicalFiles([]);
        setPhysicalFileStats(null);
        setShowPhysicalFiles(false);
      }
    } catch (error) {
      console.error('Failed to clear physical files:', error);
    }
  };

  const viewStoredFile = (filePath: string) => {
    const content = ArriveFileService.getStoredContent(filePath);
    if (content) {
      // Open in a new window or modal (simplified approach)
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${filePath}</title>
              <style>
                body { font-family: monospace; white-space: pre-wrap; padding: 20px; }
                .header { background: #f5f5f5; padding: 10px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <strong>File:</strong> ${filePath}<br>
                <strong>Source:</strong> LocalStorage<br>
                <strong>Generated:</strong> ${new Date().toLocaleString()}
              </div>
              ${content}
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  const viewPhysicalFile = (filePath: string) => {
    // Open the physical file via API endpoint
    const url = `/api/arrive/files/${filePath}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Main ARRIVE Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle>ARRIVE Integration Settings</CardTitle>
          </div>
          <CardDescription>
            Configure automatic generation of ARRIVE YAML files when creating initiatives, features, epics, and stories.
            ARRIVE provides component-level and task-level definitions for development workflow management.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable ARRIVE Generation</Label>
              <p className="text-sm text-muted-foreground">
                Automatically generate ARRIVE YAML files when creating work items
              </p>
            </div>
            <input
              type="checkbox"
              id="enable-arrive"
              checked={tempSettings.enabled}
              onChange={(e) => handleSettingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          {tempSettings.enabled && (
            <>
              {/* Generate on Creation */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Generate on Creation</Label>
                  <p className="text-sm text-muted-foreground">
                    Generate ARRIVE files immediately when work items are created
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="generate-on-creation"
                  checked={tempSettings.generateOnCreation}
                  onChange={(e) => handleSettingChange('generateOnCreation', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {/* Output Path */}
              <div className="space-y-2">
                <Label htmlFor="output-path">Output Path</Label>
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="output-path"
                    value={tempSettings.outputPath}
                    onChange={(e) => handleSettingChange('outputPath', e.target.value)}
                    placeholder="arrive-yaml"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Base directory for generated ARRIVE YAML files
                </p>
              </div>

              {/* Default Component Type */}
              <div className="space-y-2">
                <Label htmlFor="component-type">Default Component Type</Label>
                <Select
                  value={tempSettings.defaultComponentType}
                  onValueChange={(value) => handleSettingChange('defaultComponentType', value as 'frontend' | 'backend' | 'integration')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select component type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Default component type when it cannot be auto-detected
                </p>
              </div>

              {/* Default Effort Days */}
              <div className="space-y-2">
                <Label htmlFor="effort-days">Default Effort Days</Label>
                <Input
                  id="effort-days"
                  type="number"
                  min="1"
                  max="10"
                  value={tempSettings.defaultEffortDays}
                  onChange={(e) => handleSettingChange('defaultEffortDays', parseInt(e.target.value) || 3)}
                />
                <p className="text-sm text-muted-foreground">
                  Default effort estimation in days for components (1-10 days)
                </p>
              </div>

              {/* Default Estimated LOC */}
              <div className="space-y-2">
                <Label htmlFor="estimated-loc">Default Estimated LOC</Label>
                <Input
                  id="estimated-loc"
                  type="number"
                  min="50"
                  max="1000"
                  step="50"
                  value={tempSettings.defaultEstimatedLoc}
                  onChange={(e) => handleSettingChange('defaultEstimatedLoc', parseInt(e.target.value) || 300)}
                />
                <p className="text-sm text-muted-foreground">
                  Default lines of code estimation for advances (50-1000 LOC)
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            
            <div className="flex items-center space-x-2">
              {saveStatus === 'success' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
              {saveStatus === 'error' && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-orange-600" />
            <span>Generated Files Management</span>
          </CardTitle>
          <CardDescription>
            View and manage generated ARRIVE YAML files (both physical files and localStorage)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Physical Files Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-green-700">Physical Files (Filesystem)</h4>
              <div className="flex items-center space-x-2">
                <Button onClick={loadPhysicalFiles} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Physical Files ({physicalFileStats?.totalFiles || 0})
                </Button>
                {physicalFiles.length > 0 && (
                  <Button onClick={clearPhysicalFiles} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Physical Files
                  </Button>
                )}
              </div>
            </div>

            {showPhysicalFiles && (
              <div className="space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
                {physicalFileStats && (
                  <div className="text-sm text-green-700 mb-2">
                    📁 <strong>{physicalFileStats.components} components</strong> with <strong>{physicalFileStats.totalFiles} files</strong>
                    <br />
                    💾 Location: <code className="bg-green-100 px-1 rounded">C:\Dev\Aura-Playground\arrive-yaml\</code>
                  </div>
                )}
                {physicalFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No physical ARRIVE files have been generated yet.</p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {physicalFiles.map((filePath, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-mono text-green-800">{filePath}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewPhysicalFile(filePath)}
                          title="View physical file"
                        >
                          <Eye className="h-3 w-3 text-green-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LocalStorage Files Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-blue-700">LocalStorage Files (Browser)</h4>
              <div className="flex items-center space-x-2">
                <Button onClick={loadStoredFiles} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Stored Files ({storedFiles.length})
                </Button>
                {storedFiles.length > 0 && (
                  <Button onClick={clearStoredFiles} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Stored Files
                  </Button>
                )}
              </div>
            </div>

            {showStoredFiles && (
              <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 mb-2">
                  💾 Stored in browser localStorage for UI demonstration
                </div>
                {storedFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No ARRIVE files in localStorage.</p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {storedFiles.map((filePath, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-mono text-blue-800">{filePath}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewStoredFile(filePath)}
                          title="View localStorage content"
                        >
                          <Eye className="h-3 w-3 text-blue-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ARRIVE Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <Badge variant={arriveSettings.enabled ? "default" : "secondary"} className="ml-2">
                {arriveSettings.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Output Path:</span>
              <span className="ml-2 font-mono text-muted-foreground">{arriveSettings.outputPath}</span>
            </div>
            <div>
              <span className="font-medium">Default Type:</span>
              <span className="ml-2 capitalize">{arriveSettings.defaultComponentType}</span>
            </div>
            <div>
              <span className="font-medium">Default Effort:</span>
              <span className="ml-2">{arriveSettings.defaultEffortDays} days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
