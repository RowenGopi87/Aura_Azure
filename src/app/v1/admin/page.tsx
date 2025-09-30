"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from '@/store/settings-store';
import { useAuthStore } from "@/store/auth-store";
import { useRBAC } from "@/hooks/use-rbac";
import { useProviderStatus } from '@/hooks/useProviderStatus';
import ArriveSettings from '@/components/settings/ArriveSettings';
import { API_KEYS } from '@/lib/config/environment';
import { 
  Users,
  UserPlus,
  Edit3,
  Save,
  Trash2,
  Shield,
  CheckCircle,
  X,
  Search,
  Filter,
  Download,
  Settings,
  Brain,
  Key,
  Bot,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Info,
  RotateCcw,
  ArrowLeft
} from "lucide-react";
import Link from 'next/link';

// User Management Types
interface User {
  id: string;
  email: string;
  displayName: string;
  jobTitle: string;
  department: string;
  roles: string[];
  isActive: boolean;
  lastLogin: string;
}

interface ModulePermission {
  userId: string;
  userName: string;
  role: string;
  ideas: boolean;
  workItems: boolean;
  design: boolean;
  code: boolean;
  testCases: boolean;
  execution: boolean;
}

// LLM Module Configuration Types
interface LLMModulePermission {
  moduleId: string;
  moduleName: string;
  description: string;
  primaryProvider: string;
  primaryModel: string;
  backupProvider: string;
  backupModel: string;
  status: 'active' | 'inactive' | 'error';
  lastTested?: Date;
}

const MODULES = [
  { id: 'ideas', name: 'Ideas', description: 'Business ideas and use cases' },
  { id: 'work_items', name: 'Work Items', description: 'Requirements and work items' },
  { id: 'design', name: 'Design', description: 'System design and architecture' },
  { id: 'code', name: 'Code', description: 'Code generation and management' },
  { id: 'test_cases', name: 'Test Cases', description: 'Test case management' },
  { id: 'execution', name: 'Execution', description: 'Test execution and results' }
];

const LLM_MODULES = [
  { id: 'use-cases', name: 'Ideas', description: 'Business use case generation and analysis' },
  { id: 'requirements', name: 'Work Items', description: 'Requirements generation and decomposition' },
  { id: 'design', name: 'Design', description: 'Architecture and system design generation' },
  { id: 'design-reverse', name: 'Design (Reverse Engineering)', description: 'Reverse engineering for design analysis' },
  { id: 'code', name: 'Code', description: 'Code generation and review' },
  { id: 'code-reverse', name: 'Code (Reverse Engineering)', description: 'Reverse engineering for code analysis' },
  { id: 'test-cases', name: 'Test Cases', description: 'Test case generation and management' },
  { id: 'execution', name: 'Execution', description: 'Test execution and result analysis' },
  { id: 'defects', name: 'Defects', description: 'Defect analysis and resolution' },
  { id: 'traceability', name: 'Traceability', description: 'Requirements traceability analysis' }
];

const ROLES = [
  { id: 'evp', name: 'Executive Vice President', level: 'Executive' },
  { id: 'svp', name: 'Senior Vice President', level: 'Executive' },
  { id: 'vp', name: 'Vice President', level: 'Executive' },
  { id: 'manager_product_delivery', name: 'Manager of Product and Delivery', level: 'Portfolio' },
  { id: 'manager_quality_engineering', name: 'Manager of Quality Engineering', level: 'Portfolio' },
  { id: 'technical_product_manager', name: 'Technical Product Manager', level: 'ART' },
  { id: 'principal_software_engineer', name: 'Principal Software Engineer', level: 'ART' },
  { id: 'senior_quality_engineer', name: 'Senior Quality Engineer', level: 'Team' },
  { id: 'software_developer', name: 'Software Developer', level: 'Team' },
  { id: 'technical_product_owner', name: 'Technical Product Owner', level: 'Team' },
  { id: 'system_administrator', name: 'System Administrator', level: 'Executive' }
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { isAdmin } = useRBAC();
  const { 
    llmSettings,
    v1LLMSettings,
    availableProviders,
    setLLMProvider,
    setLLMModel,
    setLLMSettings,
    resetLLMSettings,
    validateSettings,
    getCurrentProvider,
    getCurrentModel,
    setV1ModuleLLM
  } = useSettingsStore();

  // 🔒 SECURITY: Use provider status hook (server-side validation)
  const { 
    providers: providerStatuses, 
    configurationSource, 
    isLoading: isLoadingProviders,
    testConnection,
    refresh: refreshProviderStatus 
  } = useProviderStatus();

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // LLM Settings State
  const [llmModulePermissions, setLLMModulePermissions] = useState<LLMModulePermission[]>([]);
  const [activeTab, setActiveTab] = useState('users');
  const [tempTemperature, setTempTemperature] = useState(llmSettings.temperature?.toString() || '0.7');
  const [tempMaxTokens, setTempMaxTokens] = useState(llmSettings.maxTokens?.toString() || '4000');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  // 🔒 SECURITY: API key state removed - managed server-side only

  const currentProvider = getCurrentProvider();
  const currentModel = getCurrentModel();
  const isValid = validateSettings();

  useEffect(() => {
    if (isAdmin) {
      loadUsersAndPermissions();
      loadLLMModuleConfigurations();
    }
  }, [isAdmin]);

  const loadUsersAndPermissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        
        // Format users data
        const formattedUsers: User[] = data.users.map((user: any) => ({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          jobTitle: user.jobTitle,
          department: user.departmentName || user.department,
          roles: user.roles,
          isActive: user.isActive,
          lastLogin: user.lastLogin || new Date().toISOString()
        }));
        
        // Format permissions data - transform nested modules structure
        const formattedPermissions: ModulePermission[] = data.permissions.map((perm: any) => ({
          userId: perm.userId,
          userName: perm.userName,
          role: perm.roleDisplayName,
          ideas: perm.modules.ideas?.canAccess || false,
          workItems: perm.modules.work_items?.canAccess || false,
          design: perm.modules.design?.canAccess || false,
          code: perm.modules.code?.canAccess || false,
          testCases: perm.modules.test_cases?.canAccess || false,
          execution: perm.modules.execution?.canAccess || false
        }));
        
        setUsers(formattedUsers);
        setModulePermissions(formattedPermissions);
      }
    } catch (error) {
      console.error('Failed to load users and permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLLMModuleConfigurations = () => {
    const { reverseEngineeringLLMSettings } = useSettingsStore.getState();
    
    const llmConfigs: LLMModulePermission[] = LLM_MODULES.map(module => {
      let config;
      
      // Handle reverse engineering modules separately
      if (module.id === 'design-reverse') {
        config = {
          primary: {
            provider: reverseEngineeringLLMSettings.design.provider,
            model: reverseEngineeringLLMSettings.design.model
          },
          backup: {
            provider: reverseEngineeringLLMSettings.design.backupProvider || 'anthropic',
            model: reverseEngineeringLLMSettings.design.backupModel || 'claude-3-5-sonnet-20241022'
          }
        };
      } else if (module.id === 'code-reverse') {
        config = {
          primary: {
            provider: reverseEngineeringLLMSettings.code.provider,
            model: reverseEngineeringLLMSettings.code.model
          },
          backup: {
            provider: reverseEngineeringLLMSettings.code.backupProvider || 'openai',
            model: reverseEngineeringLLMSettings.code.backupModel || 'gpt-4o'
          }
        };
      } else {
        // Regular V1 modules
        config = v1LLMSettings[module.id as keyof typeof v1LLMSettings];
      }
      
      return {
        moduleId: module.id,
        moduleName: module.name,
        description: module.description,
        primaryProvider: config?.primary?.provider || 'openai',
        primaryModel: config?.primary?.model || 'gpt-4o',
        backupProvider: config?.backup?.provider || 'google',
        backupModel: config?.backup?.model || 'gemini-2.5-pro',
        status: 'active'
      };
    });
    setLLMModulePermissions(llmConfigs);
  };

  const updateModulePermission = async (userId: string, module: string, hasAccess: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          modulePermissions: { [module]: hasAccess }
        })
      });
      
      if (response.ok) {
        setModulePermissions(prev => prev.map(p => 
          p.userId === userId 
            ? { ...p, [module]: hasAccess }
            : p
        ));
      }
    } catch (error) {
      console.error('Error updating module permission:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId: newRole })
      });
      
      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, roles: [newRole] }
            : u
        ));
        await loadUsersAndPermissions();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const updateLLMModuleConfig = async (moduleId: string, type: 'primary' | 'backup', provider: string, model: string) => {
    // Show saving indicator immediately
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Handle reverse engineering modules
      if (moduleId === 'design-reverse') {
        const { setReverseEngineeringLLM, setReverseEngineeringBackupLLM } = useSettingsStore.getState();
        if (type === 'primary') {
          setReverseEngineeringLLM('design', provider, model);
        } else {
          setReverseEngineeringBackupLLM('design', provider, model);
        }
      } else if (moduleId === 'code-reverse') {
        const { setReverseEngineeringLLM, setReverseEngineeringBackupLLM } = useSettingsStore.getState();
        if (type === 'primary') {
          setReverseEngineeringLLM('code', provider, model);
        } else {
          setReverseEngineeringBackupLLM('code', provider, model);
        }
      } else {
        // Regular V1 modules
        setV1ModuleLLM(moduleId as any, type, provider, model);
      }
      
      // Update local state for UI
      setLLMModulePermissions(prev => prev.map(config => 
        config.moduleId === moduleId 
          ? {
              ...config,
              [`${type}Provider`]: provider,
              [`${type}Model`]: model
            }
          : config
      ));

      // Simulate brief delay to show saving state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Show success feedback
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      
      console.log(`✅ LLM Config Updated: ${moduleId} ${type} → ${provider}:${model}`);
      
    } catch (error) {
      console.error('Error updating LLM module config:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    setLLMProvider(provider);
    // 🔒 SECURITY: No API key management - server-side only
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // 🔒 SECURITY: Only save provider/model/temperature/maxTokens (NO API KEY)
      setLLMSettings({
        temperature: parseFloat(tempTemperature),
        maxTokens: parseInt(tempMaxTokens)
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

  const handleTestConnection = async (provider: string) => {
    setTestingProvider(provider);
    try {
      const result = await testConnection(provider);
      if (result.success) {
        alert(`✅ ${provider} connection successful!`);
      } else {
        alert(`❌ ${provider} connection failed: ${result.message}`);
      }
    } catch (error: any) {
      alert(`❌ Test failed: ${error.message}`);
    } finally {
      setTestingProvider(null);
    }
  };

  // 🔒 SECURITY: API key helper functions removed - managed server-side only

  const getProviderDescription = (providerId: string) => {
    switch (providerId) {
      case 'openai': return 'Standard OpenAI models including GPT-4, GPT-3.5 Turbo with excellent reasoning capabilities.';
      case 'azure-openai': return 'Emirates Azure OpenAI deployment with enterprise security and compliance features.';
      case 'google': return 'Google\'s Gemini models with strong multimodal capabilities and competitive performance.';
      case 'anthropic': return 'Anthropic\'s Claude models known for safety, helpfulness, and nuanced understanding.';
      default: return 'Select a provider to see more information.';
    }
  };

  // 🔒 SECURITY: API key helper functions removed - managed server-side only

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span>Access Denied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/v1">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to V1
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Settings className="h-8 w-8 text-blue-600" />
                <span>Admin Settings</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Manage users, permissions, and system-wide LLM configurations
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <Settings className="w-4 h-4 mr-1" />
            Admin Portal
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="p-6 pb-0">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>User Management</span>
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Module Permissions</span>
              </TabsTrigger>
              <TabsTrigger value="llm-settings" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>LLM Configuration</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>System Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 pt-0">
            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-6 mt-0">
              <div className="bg-gray-200/50 backdrop-blur-sm border-0 rounded-lg">
                <div className="p-3 border-b border-gray-200/50">
                  <h3 className="text-base font-semibold text-gray-900">User Management</h3>
                  <p className="text-xs text-gray-600">Manage user accounts and role assignments</p>
                </div>
                
                <Card className="border-0 rounded-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>System Users</CardTitle>
                        <CardDescription>
                          View and manage user accounts, roles, and access permissions.
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="w-48">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Quality">Quality</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-medium text-gray-700">User</th>
                            <th className="text-left p-3 font-medium text-gray-700">Department</th>
                            <th className="text-left p-3 font-medium text-gray-700">Role</th>
                            <th className="text-left p-3 font-medium text-gray-700">Status</th>
                            <th className="text-left p-3 font-medium text-gray-700">Last Login</th>
                            <th className="text-center p-3 font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <div>
                                  <div className="font-medium text-gray-900">{user.displayName}</div>
                                  <div className="text-sm text-gray-600">{user.email}</div>
                                  <div className="text-xs text-gray-500">{user.jobTitle}</div>
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                  {user.department}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <Select 
                                  value={user.roles[0] || ''} 
                                  onValueChange={(value) => updateUserRole(user.id, value)}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROLES.map((role) => (
                                      <SelectItem key={role.id} value={role.id}>
                                        {role.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-3">
                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="p-3 text-sm text-gray-600">
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <Button variant="outline" size="sm">
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Module Permissions Tab */}
            <TabsContent value="permissions" className="space-y-6 mt-0">
              <div className="bg-gray-200/50 backdrop-blur-sm border-0 rounded-lg">
                <div className="p-3 border-b border-gray-200/50">
                  <h3 className="text-base font-semibold text-gray-900">Module Permissions</h3>
                  <p className="text-xs text-gray-600">Configure module access permissions</p>
                </div>
                <Card className="border-0 rounded-none">
                  <CardHeader>
                    <CardTitle>Module Permissions Matrix</CardTitle>
                    <CardDescription>
                      Manage which users have access to which modules. Changes are saved automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-medium text-gray-700 min-w-[200px]">User</th>
                            <th className="text-left p-3 font-medium text-gray-700">Role</th>
                            {MODULES.map((module) => (
                              <th key={module.id} className="text-center p-3 font-medium text-gray-700 min-w-[100px]">
                                <div className="space-y-1">
                                  <div>{module.name}</div>
                                  <div className="text-xs font-normal text-gray-500">{module.description}</div>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {modulePermissions.map((permission) => (
                            <tr key={permission.userId} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <div className="font-medium text-gray-900">{permission.userName}</div>
                              </td>
                              <td className="p-3">
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                  {permission.role}
                                </Badge>
                              </td>
                              
                              {MODULES.map((module) => {
                                // Map module IDs to the correct permission property names
                                const moduleKey = module.id === 'work_items' ? 'workItems' : 
                                                module.id === 'test_cases' ? 'testCases' : 
                                                module.id;
                                const hasPermission = permission[moduleKey as keyof ModulePermission];
                                
                                return (
                                  <td key={module.id} className="p-3 text-center">
                                    <Button
                                      variant={hasPermission ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => updateModulePermission(permission.userId, moduleKey, !hasPermission)}
                                      className={hasPermission ? "bg-green-600 hover:bg-green-700 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}
                                    >
                                      {hasPermission ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                    </Button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* LLM Configuration Tab */}
            <TabsContent value="llm-settings" className="space-y-6 mt-0">
              {/* Global LLM Configuration */}
              <div className="bg-gray-200/50 backdrop-blur-sm border-0 rounded-lg">
                <div className="p-3 border-b border-gray-200/50">
                  <h3 className="text-base font-semibold text-gray-900">Global LLM Configuration</h3>
                  <p className="text-xs text-gray-600">Configure default LLM provider and API keys</p>
                </div>
                <Card className="border-0 rounded-none">
                  <CardHeader>
                    <CardTitle>LLM Provider Settings</CardTitle>
                    <CardDescription>
                      Configure your preferred language model provider and settings. This serves as the default for all modules.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Provider Selection */}
                    <div className="grid grid-cols-2 gap-4">
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
                                  {(() => {
                                    const status = providerStatuses.find(p => p.provider === provider.id);
                                    return status?.configured && (
                                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">✓</Badge>
                                    );
                                  })()}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {currentProvider && (
                          <p className="text-sm text-gray-600">{getProviderDescription(currentProvider.id)}</p>
                        )}
                      </div>

                      {currentProvider && (
                        <div className="space-y-2">
                          <Label htmlFor="model">Model</Label>
                          <Select value={llmSettings.model} onValueChange={(value) => setLLMModel(value)}>
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
                        </div>
                      )}
                    </div>

                    {/* 🔒 SECURITY: Provider Configuration Status (Server-Side Keys) */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4 text-gray-600" />
                          <Label>Provider Configuration</Label>
                        </div>
                        {configurationSource && (
                          <Badge variant="secondary" className="text-xs">
                            {configurationSource}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 text-blue-800 text-sm mb-2">
                          <Info className="h-4 w-4" />
                          <span className="font-medium">🔒 Secure Key Management</span>
                        </div>
                        <p className="text-blue-700 text-sm">
                          API keys are managed securely on the server-side via environment variables.
                          <br />
                          <strong>Local Development:</strong> Configure in <code>.env.local</code> file
                          <br />
                          <strong>Azure Production:</strong> Managed via Azure Key Vault (automatic)
                        </p>
                      </div>

                      {/* Provider Status */}
                      {currentProvider && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{currentProvider.name} Status:</span>
                            {isLoadingProviders ? (
                              <Badge variant="secondary">Checking...</Badge>
                            ) : (
                              (() => {
                                const status = providerStatuses.find(p => p.provider === llmSettings.provider);
                                return status?.configured ? (
                                  <Badge className="bg-green-600">✅ Configured</Badge>
                                ) : (
                                  <Badge variant="destructive">⚠️ Not Configured</Badge>
                                );
                              })()
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(llmSettings.provider)}
                            disabled={testingProvider === llmSettings.provider}
                            className="w-full mt-2"
                          >
                            {testingProvider === llmSettings.provider ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Testing Connection...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Test Connection
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Advanced Settings */}
                    <div className="grid grid-cols-2 gap-4">
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

                    {/* Save Actions */}
                    <div className="flex items-center justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          resetLLMSettings();
                          setTempTemperature('0.7');
                          setTempMaxTokens('4000');
                          setSaveStatus('idle');
                        }}
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
              </div>

              {/* V1 Module LLM Assignment */}
              <div className="bg-gray-200/50 backdrop-blur-sm border-0 rounded-lg">
                <div className="p-3 border-b border-gray-200/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">V1 Module LLM Assignment</h3>
                    <p className="text-xs text-gray-600">Configure primary and backup LLMs for each module</p>
                  </div>
                  {/* Save Status Indicator */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadLLMModuleConfigurations}
                      className="flex items-center space-x-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Refresh</span>
                    </Button>
                    {saveStatus === 'success' && (
                      <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Saved</span>
                      </Badge>
                    )}
                    {saveStatus === 'error' && (
                      <Badge className="bg-red-100 text-red-800 flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Error</span>
                      </Badge>
                    )}
                    {isSaving && (
                      <Badge className="bg-blue-100 text-blue-800 flex items-center space-x-1">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Saving...</span>
                      </Badge>
                    )}
                  </div>
                </div>
                <Card className="border-0 rounded-none">
                  <CardHeader>
                    <CardTitle>Module LLM Configuration Matrix</CardTitle>
                    <CardDescription>
                      Assign primary and backup LLMs to each V1 module. Primary is used by default, backup is used if primary fails. Changes are saved automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-medium text-gray-700 min-w-[200px]">Module</th>
                            <th className="text-center p-3 font-medium text-gray-700 min-w-[200px]">
                              <div className="space-y-1">
                                <div>Primary LLM</div>
                                <div className="text-xs font-normal text-gray-500">Default provider and model</div>
                              </div>
                            </th>
                            <th className="text-center p-3 font-medium text-gray-700 min-w-[200px]">
                              <div className="space-y-1">
                                <div>Backup LLM</div>
                                <div className="text-xs font-normal text-gray-500">Fallback provider and model</div>
                              </div>
                            </th>
                            <th className="text-center p-3 font-medium text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {llmModulePermissions.map((config) => (
                            <tr key={config.moduleId} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <div>
                                  <div className="font-medium text-gray-900">{config.moduleName}</div>
                                  <div className="text-sm text-gray-600">{config.description}</div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="space-y-2">
                                  <Select
                                    value={`${config.primaryProvider}:${config.primaryModel}`}
                                    onValueChange={(value) => {
                                      const [provider, model] = value.split(':');
                                      updateLLMModuleConfig(config.moduleId, 'primary', provider, model);
                                    }}
                                  >
                                    <SelectTrigger className="w-48">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableProviders.flatMap(provider => 
                                        provider.models.map(model => (
                                          <SelectItem key={`${provider.id}:${model.id}`} value={`${provider.id}:${model.id}`}>
                                            {provider.name} - {model.name}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="space-y-2">
                                  <Select
                                    value={`${config.backupProvider}:${config.backupModel}`}
                                    onValueChange={(value) => {
                                      const [provider, model] = value.split(':');
                                      updateLLMModuleConfig(config.moduleId, 'backup', provider, model);
                                    }}
                                  >
                                    <SelectTrigger className="w-48">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableProviders.flatMap(provider => 
                                        provider.models.map(model => (
                                          <SelectItem key={`${provider.id}:${model.id}`} value={`${provider.id}:${model.id}`}>
                                            {provider.name} - {model.name}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <Badge variant={config.status === 'active' ? "default" : "secondary"}>
                                  {config.status === 'active' ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Inactive
                                    </>
                                  )}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="system" className="space-y-6 mt-0">
              <div className="bg-gray-200/50 backdrop-blur-sm border-0 rounded-lg">
                <div className="p-3 border-b border-gray-200/50">
                  <h3 className="text-base font-semibold text-gray-900">System Settings</h3>
                  <p className="text-xs text-gray-600">Advanced system configuration and integrations</p>
                </div>

                {/* ARRIVE Integration Settings */}
                <ArriveSettings />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
