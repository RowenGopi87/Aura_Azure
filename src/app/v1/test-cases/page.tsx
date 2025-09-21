"use client";

import React, { useState, useCallback } from 'react';
import { RouteGuard } from '@/components/rbac/route-guard';
import { useInitiativeStore } from '@/store/initiative-store';
import { useFeatureStore } from '@/store/feature-store';
import { useEpicStore } from '@/store/epic-store';
import { useStoryStore } from '@/store/story-store';
import { useUseCaseStore } from '@/store/use-case-store';
import { useSettingsStore } from '@/store/settings-store';
import { useTestCaseStore, TestCase } from '@/store/test-case-store';
import { formatDateForDisplay } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Play,
  Edit,
  Trash2,
  User,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FolderOpen,
  Folder,
  Target,
  Layers,
  BookOpen,
  FileText,
  Wand2,
  Loader2,
  GripVertical,
  Save,
  X,
  Building2,
  MoreHorizontal
} from 'lucide-react';

function TestCasesPageComponent() {
  const { initiatives } = useInitiativeStore();
  const { features, getFeaturesByInitiative } = useFeatureStore();
  const { epics, getEpicsByFeature } = useEpicStore();
  const { stories, getStoriesByEpic } = useStoryStore();
  const { useCases } = useUseCaseStore();
  const { llmSettings, validateSettings } = useSettingsStore();
  const { 
    testCases, 
    addTestCase, 
    addGeneratedTestCases, 
    updateTestCase, 
    deleteTestCase, 
    updateTestCaseStatus,
    getTestCasesByWorkItemId 
  } = useTestCaseStore();

  // State management
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedBusinessBriefs, setExpandedBusinessBriefs] = useState<Set<string>>(new Set());
  const [selectedWorkItem, setSelectedWorkItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [executingTestCases, setExecutingTestCases] = useState<Record<string, boolean>>({});
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [generatingItems, setGeneratingItems] = useState<Record<string, boolean>>({});
  const [panelWidth, setPanelWidth] = useState(50); // Percentage width for left panel
  const [isResizing, setIsResizing] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedWorkItemForGeneration, setSelectedWorkItemForGeneration] = useState<any>(null);

  // Form data for test case creation/editing
  const [formData, setFormData] = useState<{
    title: string;
    summary: string;
    description: string;
    type: 'positive' | 'negative' | 'edge';
    priority: 'low' | 'medium' | 'high' | 'critical';
    preconditions: string;
    steps: string;
    expectedResult: string;
    assignee: string;
    estimatedTime: number;
    tags: string;
  }>({
    title: '',
    summary: '',
    description: '',
    type: 'positive',
    priority: 'medium',
    preconditions: '',
    steps: '',
    expectedResult: '',
    assignee: '',
    estimatedTime: 5,
    tags: ''
  });

  // Test generation form data
  const [generateFormData, setGenerateFormData] = useState({
    testType: 'unit' as 'unit' | 'integration' | 'system' | 'acceptance' | 'performance' | 'security',
    count: 5,
    includeNegative: true,
    includeEdge: true
  });

  // Handle panel resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const containerWidth = window.innerWidth;
    const newWidth = (e.clientX / containerWidth) * 100;
    
    // Limit between 20% and 80%
    if (newWidth >= 20 && newWidth <= 80) {
      setPanelWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add event listeners for resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Toggle expanded state
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Toggle business brief expanded state
  const toggleBusinessBriefExpanded = (id: string) => {
    const newExpanded = new Set(expandedBusinessBriefs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedBusinessBriefs(newExpanded);
  };

  // Get type icon with consistent sizing
  const getTypeIcon = (type: string, portfolioColor?: string) => {
    const iconProps = { size: 14, className: "flex-shrink-0" };
    switch (type) {
      case 'portfolio': return <Building2 {...iconProps} style={{color: portfolioColor || '#8B4513'}} />;
      case 'brief': return <FileText {...iconProps} style={{color: '#CD853F'}} />;
      case 'initiative': return <Target {...iconProps} style={{color: '#D4A843'}} />;
      case 'feature': return <Layers {...iconProps} style={{color: '#3B82F6'}} />;
      case 'epic': return <BookOpen {...iconProps} style={{color: '#8B5CF6'}} />;
      case 'story': return <FileText {...iconProps} style={{color: '#10B981'}} />;
      default: return <FileText {...iconProps} className="text-gray-600" />;
    }
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-1.5 py-0.5 text-xs font-medium rounded";
    switch (priority) {
      case 'critical': return `${baseClasses} bg-red-100 text-red-800`;
      case 'high': return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'medium': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low': return `${baseClasses} bg-green-100 text-green-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-1.5 py-0.5 text-xs font-medium rounded";
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed': return `${baseClasses} bg-green-100 text-green-800`;
      case 'active':
      case 'in_progress': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'on-hold': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'cancelled': return `${baseClasses} bg-red-100 text-red-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get test case type icon
  const getTestCaseTypeIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle size={14} className="text-green-600" />;
      case 'negative': return <XCircle size={14} className="text-red-600" />;
      case 'edge': return <AlertTriangle size={14} className="text-yellow-600" />;
      default: return <TestTube size={14} className="text-gray-600" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get child items for a work item
  const getChildItems = (item: any, type: string) => {
    switch (type) {
      case 'initiative':
        return features.filter(f => (f as any).initiativeId === item.id);
      case 'feature':
        return epics.filter(e => (e as any).featureId === item.id);
      case 'epic':
        return stories.filter(s => (s as any).epicId === item.id);
      default:
        return [];
    }
  };

  // Render a work item row in the hierarchy
  const renderWorkItem = (item: any, type: string, level: number = 0) => {
    const childItems = getChildItems(item, type);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = childItems.length > 0;
    const itemTestCases = getTestCasesByWorkItemId(item.id);

    return (
      <React.Fragment key={`${type}-${item.id}`}>
        {/* Main row */}
        <div
          className={`group flex items-center px-2 py-1 bg-gray-200/30 hover:bg-gray-200/50 border-b border-gray-300/30 cursor-pointer ${
            selectedWorkItem?.id === item.id ? 'bg-blue-100/50 border-l-4 border-l-blue-500' : ''
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => setSelectedWorkItem(item)}
          title="Click to select this work item"
        >
          {/* Expand/Collapse */}
          <div className="flex items-center justify-center w-6">
            {hasChildren ? (
              <button onClick={(e) => { e.stopPropagation(); toggleExpanded(item.id); }}>
                {isExpanded ? (
                  <ChevronDown size={12} className="text-gray-500" />
                ) : (
                  <ChevronRight size={12} className="text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-3" />
            )}
          </div>

          {/* Type & Title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getTypeIcon(type)}
            <Badge variant="outline" className="text-xs px-1 py-0.5 shrink-0">
              {type}
            </Badge>
            <span className="font-medium text-sm truncate" title={item.title}>
              {item.title}
            </span>
            {hasChildren && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 shrink-0">
                {childItems.length}
              </Badge>
            )}
            {itemTestCases.length > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 shrink-0">
                {itemTestCases.length} tests
              </Badge>
            )}
          </div>

          {/* Priority */}
          <div className="w-16 flex justify-center">
            <span className={getPriorityBadge(item.priority)}>
              {item.priority}
            </span>
          </div>

          {/* Status */}
          <div className="w-16 flex justify-center">
            <span className={getStatusBadge(item.status)}>
              {item.status}
            </span>
          </div>

          {/* Assigned To */}
          <div className="w-18 text-xs text-gray-600 text-center truncate">
            {item.assignedTo || 'Unassigned'}
          </div>

          {/* Test Cases Count */}
          <div className="w-16 text-xs text-gray-600 text-center">
            {itemTestCases.length} tests
          </div>

          {/* Generate Test Cases Button */}
          <div className="w-8 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateTestCases(item, type);
              }}
              disabled={generatingItems[`${type}-${item.id}`]}
              title="Generate Test Cases"
            >
              {generatingItems[`${type}-${item.id}`] ? (
                <Loader2 size={12} className="animate-spin text-green-600" />
              ) : (
                <TestTube size={12} className="text-green-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Child items */}
        {isExpanded && hasChildren && (
          <>
            {childItems.map(childItem =>
              renderWorkItem(childItem, 
                type === 'initiative' ? 'feature' : 
                type === 'feature' ? 'epic' : 
                type === 'epic' ? 'story' : 'unknown',
                level + 1
              )
            )}
          </>
        )}
      </React.Fragment>
    );
  };

  // Handle test case form submission
  const handleTestCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const preconditionsArray = formData.preconditions
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim());

    const stepsArray = formData.steps
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim());

    const tagsArray = formData.tags
      .split(',')
      .filter(item => item.trim())
      .map(item => item.trim());

    const testCaseData: TestCase = {
      id: selectedTestCase ? selectedTestCase.id : `TC-${String(testCases.length + 1).padStart(3, '0')}`,
      workItemId: selectedWorkItem?.id || '',
      workItemType: selectedWorkItem?.workflowLevel || 'initiative',
      title: formData.title,
      summary: formData.summary,
      description: formData.description,
      type: formData.type,
      testPyramidType: selectedTestCase ? selectedTestCase.testPyramidType : 'unit',
      status: 'not_run',
      priority: formData.priority,
      preconditions: preconditionsArray,
      steps: stepsArray,
      expectedResult: formData.expectedResult,
      assignee: formData.assignee,
      estimatedTime: formData.estimatedTime,
      tags: tagsArray,
      createdBy: 'Current User',
      createdAt: selectedTestCase ? selectedTestCase.createdAt : new Date(),
    };

    if (selectedTestCase) {
      updateTestCase(selectedTestCase.id, testCaseData);
    } else {
      addTestCase(testCaseData);
    }

    resetForm();
    setIsDialogOpen(false);
    setIsDetailModalOpen(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      description: '',
      type: 'positive',
      priority: 'medium',
      preconditions: '',
      steps: '',
      expectedResult: '',
      assignee: '',
      estimatedTime: 5,
      tags: ''
    });
    setSelectedTestCase(null);
  };

  // Handle test case generation
  const handleGenerateTestCases = async (workItem: any, type: string) => {
    setSelectedWorkItemForGeneration({ ...workItem, workflowLevel: type });
    setIsGenerateDialogOpen(true);
  };

  // Execute test case generation
  const executeTestCaseGeneration = async () => {
    if (!selectedWorkItemForGeneration) return;

    const key = `${selectedWorkItemForGeneration.workflowLevel}-${selectedWorkItemForGeneration.id}`;
    setGeneratingItems(prev => ({ ...prev, [key]: true }));
    setIsGenerateDialogOpen(false);

    try {
      // Mock generation for now - you can replace with real LLM integration
        setTimeout(() => {
        const mockTestCases = [
              {
            title: `${generateFormData.testType} Test for ${selectedWorkItemForGeneration.title}`,
                summary: `Verify ${selectedWorkItemForGeneration.title} functionality works correctly`,
            description: `Test the core functionality of ${selectedWorkItemForGeneration.title} to ensure it meets requirements`,
    type: 'positive' as const,
                priority: 'high' as const,
                preconditions: [
                  'System is running and accessible',
                  'User has appropriate permissions',
                  'Test data is available'
                ],
                steps: [
                  'Navigate to the relevant section',
                  'Perform the primary action',
                  'Verify the response',
                  'Check for side effects'
                ],
            expectedResult: `The ${selectedWorkItemForGeneration.title} should function correctly`,
                estimatedTime: 10,
            tags: [generateFormData.testType, 'automated', 'generated']
              }
        ];

        // Add test cases to store
        const newTestCases = mockTestCases.map((tc, index) => ({
            id: `TC-${String(testCases.length + index + 1).padStart(3, '0')}`,
            workItemId: selectedWorkItemForGeneration.id,
            workItemType: selectedWorkItemForGeneration.workflowLevel as any,
            title: tc.title,
            summary: tc.summary,
            description: tc.description,
            type: tc.type,
            testPyramidType: generateFormData.testType,
            status: 'not_run' as const,
            priority: tc.priority,
            preconditions: tc.preconditions,
            steps: tc.steps,
            expectedResult: tc.expectedResult,
            estimatedTime: tc.estimatedTime,
            tags: tc.tags,
            createdBy: 'AI Generator',
            createdAt: new Date(),
          }));

        newTestCases.forEach(tc => addTestCase(tc));
          
          setGeneratingItems(prev => ({ ...prev, [key]: false }));

          // Show success message
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = `✅ Generated ${newTestCases.length} test cases successfully`;
          document.body.appendChild(notification);
          setTimeout(() => document.body.removeChild(notification), 3000);
        }, 2000);
      
    } catch (error) {
      console.error('Error generating test cases:', error);
      setGeneratingItems(prev => ({ ...prev, [key]: false }));
    }
  };

  // Open test case detail modal
  const openTestCaseDetail = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setFormData({
      title: testCase.title,
      summary: testCase.summary,
      description: testCase.description,
      type: testCase.type,
      priority: testCase.priority,
      preconditions: testCase.preconditions.join('\n'),
      steps: testCase.steps.join('\n'),
      expectedResult: testCase.expectedResult,
      assignee: testCase.assignee || '',
      estimatedTime: testCase.estimatedTime || 5,
      tags: testCase.tags.join(', ')
    });
    setIsDetailModalOpen(true);
  };

  // MCP Test Case Execution
  const executeTestCaseWithMCP = async (testCase: TestCase) => {
    setExecutingTestCases(prev => ({ ...prev, [testCase.id]: true }));
    
    try {
      console.log(`🚀 Executing test case via MCP: ${testCase.title}`);
      
      const response = await fetch('/api/execute-test-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCase: {
            id: testCase.id,
            title: testCase.title,
            description: testCase.description,
            preconditions: testCase.preconditions || [],
            steps: testCase.steps || [],
            expectedResult: testCase.expectedResult || ''
          },
          llmProvider: 'google',
          model: 'gemini-2.5-pro'
        })
      });

      if (!response.ok) {
        throw new Error(`MCP execution failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update test case status based on MCP execution result
      const executionStatus = result.status === 'PASSED' ? 'passed' : 'failed';
      updateTestCaseStatus(testCase.id, executionStatus);
      
      console.log(`✅ MCP execution completed for: ${testCase.title}`, result);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Test "${testCase.title}" executed via MCP: ${executionStatus.toUpperCase()}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 4000);
      
    } catch (error) {
      console.error('❌ MCP execution failed:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `❌ MCP execution failed for "${testCase.title}"`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 4000);
      
    } finally {
      setExecutingTestCases(prev => ({ ...prev, [testCase.id]: false }));
    }
  };

  // Group initiatives by business brief for hierarchical display
  const initiativesByBusinessBrief = initiatives.reduce((groups, initiative) => {
    const useCase = useCases.find(uc => uc.id === initiative.businessBriefId);
    const businessBriefId = initiative.businessBriefId;
    const businessBriefTitle = useCase?.title || 'Unknown Business Brief';
    
    if (!groups[businessBriefId]) {
      groups[businessBriefId] = {
        businessBriefId,
        businessBriefTitle,
        useCase,
        initiatives: []
      };
    }
    groups[businessBriefId].initiatives.push(initiative);
    return groups;
  }, {} as Record<string, { businessBriefId: string; businessBriefTitle: string; useCase: any; initiatives: any[] }>);

  const businessBriefGroups = Object.values(initiativesByBusinessBrief);

  // Get filtered test cases for current selection
  const currentTestCases = selectedWorkItem ? getTestCasesByWorkItemId(selectedWorkItem.id) : [];
  const filteredTestCases = currentTestCases.filter(testCase => {
    const matchesType = filterType === 'all' || testCase.type === filterType;
    const matchesStatus = filterStatus === 'all' || testCase.status === filterStatus;
    const matchesSearch = !searchTerm || 
      testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testCase.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // Calculate stats
  const totalTestCases = testCases.length;
  const passedTestCases = testCases.filter(tc => tc.status === 'passed').length;
  const failedTestCases = testCases.filter(tc => tc.status === 'failed').length;
  const notRunTestCases = testCases.filter(tc => tc.status === 'not_run').length;
    
    return (
    <div className="container mx-auto p-6 space-y-6">
      
      {/* Glass Effect Container */}
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-xl p-6 space-y-6">
        
        {/* Header with Buttons */}
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Cases</h1>
            <p className="text-gray-600 mt-1">Hierarchical test case management</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
              placeholder="Search test cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 py-1 text-sm"
              />
            </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 py-1 text-sm">
              <Filter size={14} className="mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_run">Not Run</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

        {/* Summary Cards - Condensed */}
        <div className="bg-gray-200/60 backdrop-blur-sm border border-gray-300/40 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Test Case Summary</h3>
              <p className="text-xs text-gray-600">Overall test case metrics and status</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSummaryCardsVisible(!summaryCardsVisible)}
              className="h-6 w-6 p-0"
            >
              {summaryCardsVisible ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </div>
          
          {summaryCardsVisible && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TestTube className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">{totalTestCases}</span>
                </div>
                <p className="text-xs font-medium text-gray-600">Total Test Cases</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-2xl font-bold text-green-600">{passedTestCases}</span>
                </div>
                <p className="text-xs font-medium text-gray-600">Passed</p>
                <p className="text-xs text-gray-500">{totalTestCases > 0 ? Math.round((passedTestCases / totalTestCases) * 100) : 0}% of total</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <XCircle className="h-6 w-6 text-red-600 mr-2" />
                  <span className="text-2xl font-bold text-red-600">{failedTestCases}</span>
                </div>
                <p className="text-xs font-medium text-gray-600">Failed</p>
                <p className="text-xs text-gray-500">{totalTestCases > 0 ? Math.round((failedTestCases / totalTestCases) * 100) : 0}% of total</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-6 w-6 text-gray-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-600">{notRunTestCases}</span>
                </div>
                <p className="text-xs font-medium text-gray-600">Not Run</p>
                <p className="text-xs text-gray-500">{totalTestCases > 0 ? Math.round((notRunTestCases / totalTestCases) * 100) : 0}% of total</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Two Pane Layout */}
        <div className="bg-gray-200/50 backdrop-blur-sm border-0 rounded-lg overflow-hidden">
          <div className="flex h-[600px]">
            {/* Left Panel - Work Items Hierarchy */}
            <div 
              className="bg-gray-100/30 border-r border-gray-300/40 flex flex-col"
              style={{ width: `${panelWidth}%` }}
            >
              {/* Left Panel Header */}
              <div className="p-4 border-b border-gray-300/40">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target size={18} />
                  Work Items Hierarchy
                </h3>
                <p className="text-sm text-gray-600 mt-1">Select a work item to view and manage test cases</p>
              </div>

              {/* Work Items Table */}
              <div className="flex-1 overflow-y-auto">
                <div className="border-0">
                  <CardContent className="p-0">
                    {/* Table Header */}
                    <div className="flex items-center px-2 py-1 bg-gray-200/40 border-b border-gray-300/40 text-sm font-medium text-gray-700 sticky top-0 z-10">
                      <div className="w-6"></div> {/* Expand column */}
                      <div className="flex-1 min-w-0">Work Item</div>
                      <div className="w-16 text-center">Priority</div>
                      <div className="w-16 text-center">Status</div>
                      <div className="w-18 text-center">Assigned</div>
                      <div className="w-16 text-center">Tests</div>
                      <div className="w-8 text-center">Gen</div>
                    </div>

                    {/* Table Body */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {businessBriefGroups.map((group) => {
              const isBusinessBriefExpanded = expandedBusinessBriefs.has(group.businessBriefId);
              
              return (
                          <React.Fragment key={group.businessBriefId}>
                  {/* Business Brief Header */}
                  <div 
                              className="flex items-center gap-3 px-3 py-3 bg-gray-200/40 border-b border-gray-300/40 cursor-pointer"
                    onClick={() => toggleBusinessBriefExpanded(group.businessBriefId)}
                  >
                              <button>
                      {isBusinessBriefExpanded ? (
                                  <ChevronDown size={14} className="text-gray-600" />
                      ) : (
                                  <ChevronRight size={14} className="text-gray-600" />
                      )}
                              </button>
                              {getTypeIcon('brief')}
                    <div className="flex-1">
                                <div className="font-semibold text-sm">{group.businessBriefTitle}</div>
                                <div className="text-xs text-gray-600">{group.initiatives.length} initiatives</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {group.businessBriefId}
                  </Badge>
                </div>
                  
                  {/* Initiatives */}
                  {isBusinessBriefExpanded && (
                              <div>
                                {group.initiatives.map((initiative) => renderWorkItem(initiative, 'initiative', 1))}
            </div>
                  )}
                          </React.Fragment>
              );
            })}
          </div>

                    {businessBriefGroups.length === 0 && (
            <div className="text-center py-12">
              <Folder size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No work items found</h3>
              <p className="text-gray-600">
                          Start by creating initiatives in the Work Items page
              </p>
              </div>
            )}
                  </CardContent>
                </div>
        </div>
          </div>
          
      {/* Resizer */}
      <div
        className="w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400 transition-colors flex items-center justify-center"
        onMouseDown={handleMouseDown}
      >
        <GripVertical size={16} className="text-gray-500" />
          </div>

            {/* Right Panel - Test Cases */}
      <div 
              className="flex flex-col bg-gray-100/30"
              style={{ width: `${100 - panelWidth}%` }}
      >
              {/* Right Panel Header */}
              <div className="p-4 border-b border-gray-300/40">
          <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedWorkItem ? `Test Cases - ${selectedWorkItem.title}` : 'Test Cases'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedWorkItem ? `${filteredTestCases.length} test cases` : 'Select a work item to view test cases'}
              </p>
            </div>
            <div className="flex space-x-2">
              {selectedWorkItem && (
                <Button
                  variant="outline"
                        onClick={() => {/* TODO: Add generate functionality */}}
                        disabled={!selectedWorkItem}
                >
                  <Wand2 size={16} className="mr-2" />
                  Generate Tests
                </Button>
              )}
                    <Button 
                      onClick={() => setIsDialogOpen(true)} 
                      disabled={!selectedWorkItem}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                <Plus size={16} className="mr-2" />
                      New Test Case
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {selectedWorkItem && (
                <div className="p-4 border-b border-gray-300/40">
                  <div className="flex items-center space-x-4">
              <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="edge">Edge</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_run">Not Run</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

              {/* Test Cases List */}
              <div className="flex-1 overflow-y-auto">
          {selectedWorkItem ? (
            filteredTestCases.length > 0 ? (
                <Table>
                  <TableHeader>
                   <TableRow>
                          <TableHead className="w-20">ID</TableHead>
                          <TableHead className="min-w-0 max-w-xs">Title</TableHead>
                          <TableHead className="w-16">Type</TableHead>
                          <TableHead className="w-20">Status</TableHead>
                          <TableHead className="w-20">Priority</TableHead>
                          <TableHead className="w-24">Assignee</TableHead>
                          <TableHead className="w-40">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {filteredTestCases.map((testCase) => (
                    <TableRow 
                      key={testCase.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => openTestCaseDetail(testCase)}
                    >
                            <TableCell className="font-mono text-sm">
                              <span>{testCase.id}</span>
                      </TableCell>
                            <TableCell className="min-w-0 max-w-xs">
                              <div className="min-w-0">
                                <div className="font-medium truncate" title={testCase.title}>
                                  {testCase.title.length > 50 ? `${testCase.title.substring(0, 50)}...` : testCase.title}
                          </div>
                                <div className="text-sm text-gray-600 truncate" title={testCase.summary}>
                                  {testCase.summary.length > 60 ? `${testCase.summary.substring(0, 60)}...` : testCase.summary}
                          </div>
                        </div>
                      </TableCell>
                            <TableCell>
                        <div className="flex items-center justify-center">
                          {getTestCaseTypeIcon(testCase.type)}
                        </div>
                      </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(testCase.status)} variant="secondary">
                                {testCase.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(testCase.priority)} variant="outline">
                                {testCase.priority}
                        </Badge>
                      </TableCell>
                            <TableCell>{testCase.assignee || 'Unassigned'}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              executeTestCaseWithMCP(testCase);
                            }}
                            disabled={executingTestCases[testCase.id]}
                            title="Execute Test Case via MCP"
                          >
                            {executingTestCases[testCase.id] ? (
                              <Loader2 size={12} className="animate-spin text-blue-600" />
                            ) : (
                              <Play size={12} className="text-blue-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                                  className="p-1 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                                    updateTestCaseStatus(testCase.id, 'passed');
                                  }}
                                  title="Mark as Passed"
                                >
                                  <CheckCircle size={12} className="text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                                  className="p-1 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                                    updateTestCaseStatus(testCase.id, 'failed');
                            }}
                                  title="Mark as Failed"
                          >
                                  <XCircle size={12} className="text-red-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                                  className="p-1 h-6 w-6 text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTestCase(testCase.id);
                            }}
                            title="Delete"
                          >
                                  <Trash2 size={12} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <TestTube size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No test cases found</h3>
                  <p className="text-gray-600 mb-4">
                          Create your first test case for this work item
                  </p>
                        <Button 
                          onClick={() => setIsDialogOpen(true)}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                    <Plus size={16} className="mr-2" />
                    Create Test Case
                  </Button>
          </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Work Item</h3>
                <p className="text-gray-600">
                        Choose a work item from the hierarchy to view and manage its test cases
                </p>
              </div>
            </div>
          )}
              </div>
            </div>
        </div>
        </div>
        
        </div>
        
      {/* Create Test Case Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>Create New Test Case</DialogTitle>
              <DialogDescription>
              Create a test case for {selectedWorkItem?.title}
              </DialogDescription>
            </DialogHeader>
          <form onSubmit={handleTestCaseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                  </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter test case title"
                  required
                />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="edge">Edge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary *
                </label>
                <Input
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief summary of what this test case verifies"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the test case"
                  rows={3}
                  required
                />
              </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <Input
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Assigned tester"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Time (minutes)
                </label>
                <Input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 5 })}
                  min="1"
                />
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preconditions *
                </label>
                <Textarea
                  value={formData.preconditions}
                  onChange={(e) => setFormData({ ...formData, preconditions: e.target.value })}
                  placeholder="List preconditions (one per line)"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Steps *
                </label>
                <Textarea
                  value={formData.steps}
                  onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                  placeholder="List test steps (one per line)"
                rows={5}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Result *
                </label>
                <Textarea
                  value={formData.expectedResult}
                  onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                  placeholder="Describe the expected result"
                  rows={3}
                  required
                />
              </div>
              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
                  </label>
                  <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Comma-separated tags (e.g., authentication, ui, api)"
              />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">
                Create Test Case
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      {/* Test Case Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>Test Case Details - {selectedTestCase?.id}</span>
            </DialogTitle>
            <DialogDescription>
              View and edit test case details
            </DialogDescription>
          </DialogHeader>
          {selectedTestCase && (
            <form onSubmit={handleTestCaseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
          <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter test case title"
                    required
          />
        </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
            <SelectItem value="edge">Edge</SelectItem>
          </SelectContent>
        </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary *
                </label>
                <Input
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief summary of what this test case verifies"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the test case"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <Input
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    placeholder="Assigned tester"
                  />
            </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 5 })}
                    min="1"
                  />
                    </div>
                  </div>

                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preconditions *
                </label>
                <Textarea
                  value={formData.preconditions}
                  onChange={(e) => setFormData({ ...formData, preconditions: e.target.value })}
                  placeholder="List preconditions (one per line)"
                  rows={3}
                  required
                />
                    </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Steps *
                </label>
                <Textarea
                  value={formData.steps}
                  onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                  placeholder="List test steps (one per line)"
                  rows={5}
                  required
                />
                  </div>

                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Result *
                </label>
                <Textarea
                  value={formData.expectedResult}
                  onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                  placeholder="Describe the expected result"
                  rows={3}
                  required
                />
                    </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Comma-separated tags (e.g., authentication, ui, api)"
                />
                  </div>

              {/* Test Case Metadata */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Test Case Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                    <span className="text-gray-600">Created:</span> {formatDateForDisplay(selectedTestCase.createdAt)}
                    </div>
                  <div>
                    <span className="text-gray-600">Created by:</span> {selectedTestCase.createdBy}
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span> 
                    <Badge className={getStatusColor(selectedTestCase.status)} variant="secondary">
                      {selectedTestCase.status.replace('_', ' ')}
                    </Badge>
            </div>
                  {selectedTestCase.lastExecuted && (
            <div>
                      <span className="text-gray-600">Last executed:</span> {formatDateForDisplay(selectedTestCase.lastExecuted)}
            </div>
                  )}
          </div>
                    </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsDetailModalOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                  </div>
            </form>
          )}
                 </DialogContent>
       </Dialog>

       {/* Test Case Generation Dialog */}
       <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Generate Test Cases</DialogTitle>
             <DialogDescription>
               Generate test cases for: {selectedWorkItemForGeneration?.title}
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-6">
             {/* Test Type Selection */}
                    <div>
               <label className="block text-sm font-medium text-gray-700 mb-3">
                 Test Type *
               </label>
               <div className="grid grid-cols-2 gap-3">
                 {[
                   { value: 'unit', label: 'Unit Tests', desc: 'Test individual components in isolation' },
                   { value: 'integration', label: 'Integration Tests', desc: 'Test component interactions' },
                   { value: 'system', label: 'System Tests', desc: 'Test complete system functionality' },
                   { value: 'acceptance', label: 'Acceptance Tests', desc: 'Test business requirements' },
                   { value: 'performance', label: 'Performance Tests', desc: 'Test speed and scalability' },
                   { value: 'security', label: 'Security Tests', desc: 'Test for vulnerabilities' }
                 ].map((type) => (
                   <div
                     key={type.value}
                     className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                       generateFormData.testType === type.value
                         ? 'border-blue-500 bg-blue-50'
                         : 'border-gray-200 hover:border-gray-300'
                     }`}
                     onClick={() => setGenerateFormData({ ...generateFormData, testType: type.value as any })}
                   >
                     <div className="font-medium text-sm">{type.label}</div>
                     <div className="text-xs text-gray-600 mt-1">{type.desc}</div>
                    </div>
                 ))}
                  </div>
            </div>

             {/* Additional Options */}
             <div className="space-y-4">
               <div className="flex items-center space-x-3">
                 <input
                   type="checkbox"
                   id="includeNegative"
                   checked={generateFormData.includeNegative}
                   onChange={(e) => setGenerateFormData({ ...generateFormData, includeNegative: e.target.checked })}
                   className="rounded border-gray-300"
                 />
                 <label htmlFor="includeNegative" className="text-sm font-medium text-gray-700">
                   Include negative test cases (error handling)
                 </label>
          </div>

               <div className="flex items-center space-x-3">
                 <input
                   type="checkbox"
                   id="includeEdge"
                   checked={generateFormData.includeEdge}
                   onChange={(e) => setGenerateFormData({ ...generateFormData, includeEdge: e.target.checked })}
                   className="rounded border-gray-300"
                 />
                 <label htmlFor="includeEdge" className="text-sm font-medium text-gray-700">
                   Include edge cases (boundary conditions)
                 </label>
          </div>
          </div>

             <div className="flex justify-end space-x-2 pt-4">
               <Button 
                 type="button" 
                 variant="outline" 
                 onClick={() => setIsGenerateDialogOpen(false)}
               >
                 Cancel
               </Button>
               <Button 
                 onClick={executeTestCaseGeneration}
                 disabled={!generateFormData.testType}
                className="bg-black text-white hover:bg-gray-800"
               >
                 <Wand2 size={16} className="mr-2" />
                 Generate Test Cases
               </Button>
             </div>
           </div>
         </DialogContent>
              </Dialog>
    </div>
  );
}

// Protected export with RBAC
export default function TestCasesPage() {
  return (
    <RouteGuard requiredModule="test_cases" requiredPermission="read" fallbackPath="/v1">
      <TestCasesPageComponent />
    </RouteGuard>
  );
}
