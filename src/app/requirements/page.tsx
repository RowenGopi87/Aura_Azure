"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRequirementStore } from '@/store/requirement-store';
import { useUseCaseStore } from '@/store/use-case-store';
import { useInitiativeStore } from '@/store/initiative-store';
import { useFeatureStore } from '@/store/feature-store';
import { useEpicStore } from '@/store/epic-store';
import { useStoryStore } from '@/store/story-store';
import { useSettingsStore } from '@/store/settings-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Target,
  Layers,
  BookOpen,
  FileText,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  ArrowRight,
  Loader2,
  Filter,
  Search,
  Wand2,
  TrendingUp,
  Clock,
  TestTube,
  ExternalLink,
  Settings
} from 'lucide-react';
import { MockLLMService } from '@/lib/mock-data';
import { mockInitiatives, mockFeatures, mockEpics, mockStories } from '@/lib/mock-data'; // Import mock data

export default function RequirementsPage() {
  const searchParams = useSearchParams();
  const { requirements, updateRequirement } = useRequirementStore();
  const { useCases } = useUseCaseStore();
  const { initiatives, addInitiative, updateInitiative, deleteInitiative } = useInitiativeStore();
  const { features, addGeneratedFeatures, getFeaturesByInitiative } = useFeatureStore();
  const { epics, addGeneratedEpics, getEpicsByFeature } = useEpicStore();
  const { stories, addGeneratedStories, getStoriesByEpic } = useStoryStore();
  const { llmSettings, validateSettings } = useSettingsStore();
  
  // State management
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [collapsedLevels, setCollapsedLevels] = useState<Set<string>>(new Set()); // For collapsible hierarchy
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Individual loading states for each item type and ID
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [editingItem, setEditingItem] = useState<any>(null);
  const [generatingItems, setGeneratingItems] = useState<Record<string, boolean>>({});
  const [creatingInJira, setCreatingInJira] = useState<Record<string, boolean>>({});
  
  // Debug mode toggles (hidden by default, accessible via debug menu)
  const [useMockLLM, setUseMockLLM] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [showDebugControls, setShowDebugControls] = useState(false);
  const [isLoadingFromDatabase, setIsLoadingFromDatabase] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  
  // Helper to set loading state for specific item
  const setItemLoading = (itemId: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [itemId]: isLoading
    }));
  };
  
  // Helper to check if item is loading
  const isItemLoading = (itemId: string) => {
    return loadingStates[itemId] || false;
  };

  // Load work items from database  
  const loadWorkItemsFromDatabase = async () => {
    // Multiple guards to prevent ANY duplicate loading
    if (isLoadingFromDatabase || hasLoadedOnce) {
      console.log('🔄 Database load already done or in progress, skipping...');
      return;
    }
    
    // Set a session flag to prevent loading on tab switches
    if (typeof window !== 'undefined' && (window as any).auraDataLoaded) {
      console.log('🔄 Data already loaded in this session, skipping...');
      return;
    }
    
    setIsLoadingFromDatabase(true);
    if (typeof window !== 'undefined') {
      (window as any).auraDataLoaded = true;
    }
    
    try {
      console.log('📊 Loading work items from database (SINGLE LOAD)...');
      
      // Get fresh store instances and clear them COMPLETELY first
      const currentInitiativeStore = useInitiativeStore.getState();
      const currentFeatureStore = useFeatureStore.getState();
      const currentEpicStore = useEpicStore.getState();
      const currentStoryStore = useStoryStore.getState();
      
      // COMPLETE store clearing to prevent any duplicates
      console.log('🧹 Clearing all store data completely...');
      currentInitiativeStore.initiatives = [];
      currentFeatureStore.features = [];
      currentEpicStore.epics = [];
      currentStoryStore.stories = [];
      
      // Load initiatives from database
      const initiativeResponse = await fetch('/api/initiatives/list');
      const initiativeData = await initiativeResponse.json();
      if (initiativeData.success) {
        initiativeData.data.forEach((init: any) => {
          currentInitiativeStore.addInitiative({
            id: init.id,
            businessBriefId: init.business_brief_id,
            title: init.title,
            description: init.description,
            category: 'business',
            priority: init.priority,
            rationale: init.description,
            acceptanceCriteria: JSON.parse(init.acceptance_criteria || '[]'),
            businessValue: init.business_value,
            workflowLevel: 'initiative',
            status: init.status,
            createdAt: new Date(init.created_at),
            updatedAt: new Date(init.updated_at),
            createdBy: init.assigned_to || 'System',
            assignedTo: init.assigned_to || 'Team'
          });
        });
        console.log(`✅ Loaded ${initiativeData.data.length} initiatives from database`);
      }

      // Load features from database
      const featureResponse = await fetch('/api/features/list');
      const featureData = await featureResponse.json();
      if (featureData.success) {
        featureData.data.forEach((feat: any) => {
          // Find the business brief ID from the initiative
          const linkedInitiative = currentInitiativeStore.initiatives.find((init: any) => init.id === feat.initiative_id);
          currentFeatureStore.addFeature({
            id: feat.id,
            initiativeId: feat.initiative_id,
            businessBriefId: linkedInitiative?.businessBriefId || '',
            title: feat.title,
            description: feat.description,
            category: 'functional',
            priority: feat.priority,
            rationale: feat.description,
            acceptanceCriteria: JSON.parse(feat.acceptance_criteria || '[]'),
            businessValue: feat.business_value,
            workflowLevel: 'feature',
            status: feat.status,
            createdAt: new Date(feat.created_at),
            updatedAt: new Date(feat.updated_at),
            createdBy: feat.assigned_to || 'System'
          });
        });
        console.log(`✅ Loaded ${featureData.data.length} features from database`);
      }

      // Load epics from database
      const epicResponse = await fetch('/api/epics/list');
      const epicData = await epicResponse.json();
      if (epicData.success) {
        epicData.data.forEach((epic: any) => {
          // Find the initiative and business brief IDs from the feature
          const linkedFeature = currentFeatureStore.features.find((feat: any) => feat.id === epic.feature_id);
          currentEpicStore.addEpic({
            id: epic.id,
            featureId: epic.feature_id,
            initiativeId: linkedFeature?.initiativeId || '',
            businessBriefId: linkedFeature?.businessBriefId || '',
            title: epic.title,
            description: epic.description,
            category: 'technical',
            priority: epic.priority,
            rationale: epic.description,
            acceptanceCriteria: JSON.parse(epic.acceptance_criteria || '[]'),
            businessValue: epic.business_value,
            workflowLevel: 'epic',
            sprintEstimate: epic.story_points || 3,
            estimatedEffort: 'Medium',
            status: epic.status,
            createdAt: new Date(epic.created_at),
            updatedAt: new Date(epic.updated_at),
            createdBy: epic.assigned_to || 'System'
          });
        });
        console.log(`✅ Loaded ${epicData.data.length} epics from database`);
      }

      // Load stories from database
      const storyResponse = await fetch('/api/stories/list');
      const storyData = await storyResponse.json();
      if (storyData.success) {
        storyData.data.forEach((story: any) => {
          // Find the feature, initiative, and business brief IDs from the epic
          const linkedEpic = currentEpicStore.epics.find((epic: any) => epic.id === story.epic_id);
          currentStoryStore.addStory({
            id: story.id,
            epicId: story.epic_id,
            featureId: linkedEpic?.featureId || '',
            initiativeId: linkedEpic?.initiativeId || '',
            businessBriefId: linkedEpic?.businessBriefId || '',
            title: story.title,
            description: story.description,
            category: 'functional',
            priority: story.priority,
            rationale: story.description,
            acceptanceCriteria: JSON.parse(story.acceptance_criteria || '[]'),
            businessValue: story.business_value || '',
            workflowLevel: 'story',
            storyPoints: story.story_points || 3,
            labels: [],
            testingNotes: '',
            status: story.status,
            createdAt: new Date(story.created_at),
            updatedAt: new Date(story.updated_at),
            createdBy: story.assigned_to || 'System'
          });
        });
        console.log(`✅ Loaded ${storyData.data.length} stories from database`);
      }

    } catch (error) {
      console.error('❌ Failed to load work items from database:', error);
    } finally {
      setIsLoadingFromDatabase(false);
    }
  };
  
  // Form state - using Initiative interface types
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'on-hold',
    businessBriefId: '',
    acceptanceCriteria: '',
    businessValue: '',
    rationale: '',
    assignee: ''
  });

  // Set filter from URL params
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setFilterStatus(filterParam);
    }
  }, [searchParams]);

  // Auto-expand initiative groups when initiatives are loaded
  useEffect(() => {
    console.log('🔍 Requirements page - Current initiatives:', initiatives);
    console.log('🔍 Requirements page - Initiatives count:', initiatives.length);
    if (initiatives.length > 0) {
      console.log('🔍 Requirements page - First initiative:', initiatives[0]);
      const businessBriefIds = [...new Set(initiatives.map(init => init.businessBriefId))];
      setExpandedItems(new Set(businessBriefIds));
    }
  }, [initiatives]);

  // Debug helper for the browser console
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugInitiatives = () => {
        console.log('🔍 Debug: Current initiatives from store:', initiatives);
        console.log('🔍 Debug: Store state:', { 
          count: initiatives.length, 
          businessBriefs: [...new Set(initiatives.map(init => init.businessBriefId))],
          statuses: [...new Set(initiatives.map(init => init.status))]
        });
        return initiatives;
      };
      (window as any).debugFeatures = () => {
        console.log('🔍 Debug: Current features from store:', features);
        console.log('🔍 Debug: Features by initiative:', features.reduce((acc, feat) => {
          if (!acc[feat.initiativeId]) acc[feat.initiativeId] = [];
          acc[feat.initiativeId].push(feat);
          return acc;
        }, {} as Record<string, any[]>));
        return features;
      };
      (window as any).debugFeatureDisplay = () => {
        console.log('🔍 Debug: Feature display analysis:');
        initiatives.forEach(init => {
          const featuresForInit = getFeaturesByInitiative(init.id);
          console.log(`Initiative ${init.id} (${init.title}): ${featuresForInit.length} features`);
          featuresForInit.forEach(f => console.log(`  - ${f.id}: ${f.title} (initiativeId: ${f.initiativeId})`));
        });
      };
      (window as any).debugEpics = () => {
        console.log('🔍 Debug: Current epics from store:', epics);
        console.log('🔍 Debug: Epics by feature:', epics.reduce((acc, epic) => {
          if (!acc[epic.featureId]) acc[epic.featureId] = [];
          acc[epic.featureId].push(epic);
          return acc;
        }, {} as Record<string, any[]>));
        return epics;
      };
      (window as any).debugStories = () => {
        console.log('🔍 Debug: Current stories from store:', stories);
        console.log('🔍 Debug: Stories by epic:', stories.reduce((acc, story) => {
          if (!acc[story.epicId]) acc[story.epicId] = [];
          acc[story.epicId].push(story);
          return acc;
        }, {} as Record<string, any[]>));
        return stories;
      };
      (window as any).clearAllFeatures = () => {
        console.log('🧹 Clearing all features from store...');
        const { features } = useFeatureStore.getState();
        features.forEach(f => useFeatureStore.getState().deleteFeature(f.id));
        console.log('✅ All features cleared');
      };
    }
  }, [initiatives, features, epics, stories, getFeaturesByInitiative]);

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

  // Handle item selection
  const handleItemSelect = (item: any) => {
    const isSelected = selectedItem === item.id;
    setSelectedItem(isSelected ? null : item.id);
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'initiative': return <Target size={16} style={{color: '#D4A843'}} />; // Darker yellow for initiative
      case 'feature': return <Layers size={16} style={{color: '#5B8DB8'}} />; // Darker blue for feature
      case 'epic': return <BookOpen size={16} style={{color: '#8B7A9B'}} />; // Darker purple for epic
      case 'story': return <FileText size={16} style={{color: '#7FB37C'}} />; // Darker green for story
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Utility to check if content is shallow
  const isShallow = (item: any, type: string) => {
    if (!item) return true;
    const desc = item.description || item.text || '';
    const rationale = item.rationale || '';
    const businessValue = item.businessValue || '';
    // Consider shallow if description < 100 chars or rationale/businessValue missing
    return desc.length < 100 || rationale.length < 30 || businessValue.length < 30;
  };

  // Enrich handler (regenerates the item)
  const handleEnrich = async (item: any, type: string) => {
    if (type === 'initiative') {
      await handleGenerateFeatures(item.id); // For now, just regenerate features as a placeholder
    } else if (type === 'feature') {
      await handleGenerateEpics(item.id);
    } else if (type === 'epic') {
      await handleGenerateStories(item.id);
    }
    // You can expand this to call a dedicated enrich endpoint if needed
  };

  // AI Generation functions
  const handleGenerateFeatures = async (initiativeId: string) => {
    if (generatingItems[initiativeId]) {
      console.log(`⚠️ Generation already in progress for: ${initiativeId}`);
      return;
    }
    
    setGeneratingItems(prev => ({ ...prev, [initiativeId]: true }));
    
    try {
      console.log(`🔍 handleGenerateFeatures called with initiativeId: ${initiativeId}`);
      console.log(`🔍 Current loadingStates before check:`, loadingStates);
      
      // Prevent multiple simultaneous calls for the same initiative
      if (loadingStates[initiativeId]) {
        console.log(`⚠️ Feature generation already in progress for initiative: ${initiativeId}`);
        return;
      }
      
    const initiative = initiatives.find(init => init.id === initiativeId);
    if (!initiative) {
      console.error('Initiative not found:', initiativeId);
      return;
    }

      console.log(`🔍 Found initiative: ${initiative.id} - ${initiative.title}`);

      // Check if features already exist for this initiative
      const existingFeatures = getFeaturesByInitiative(initiativeId);
      console.log(`🔍 Existing features for ${initiativeId}:`, existingFeatures.length);
      if (existingFeatures.length > 0) {
        const confirmOverwrite = window.confirm(`This initiative already has ${existingFeatures.length} features. Do you want to generate additional features?`);
        if (!confirmOverwrite) {
          console.log('Feature generation cancelled - features already exist.');
          return;
        }
      }

      if (!window.confirm('Are you sure you want to generate features for this initiative?')) {
        console.log('Feature generation cancelled by user.');
        return;
      }
      console.log('[AURA] User confirmed feature generation for initiative:', initiativeId);

      // CRITICAL: Set generating state ONLY for this specific initiative
      console.log(`🔍 Setting generatingItems state for ONLY ${initiativeId}`);
      setItemLoading(initiativeId, true);
      
      console.log('Generating features for initiative:', initiativeId);
      
      // Use mock service in development mode
      if (useMockLLM) {
        console.log('🔧 Using MockLLMService for testing');
        const result = await MockLLMService.generateFeatures(initiativeId, initiative);
        
        if (!result.success) {
          throw new Error('Mock feature generation failed');
        }

        // Save generated features to the store
        const { features: generatedFeatures, metadata } = result.data;
        
        console.log('💾 Saving mock features to store...');
        const savedFeatures = addGeneratedFeatures(initiativeId, initiative.businessBriefId, generatedFeatures);
        console.log(`✅ Successfully saved ${savedFeatures.length} mock features to store`);

        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = `✅ Generated ${savedFeatures.length} mock features successfully`;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
        
        return;
      }
      
      // Original LLM service code
      // Check if settings are valid
      if (!validateSettings()) {
        throw new Error('Please configure your LLM provider and API key in Settings');
      }

      // Validate settings via API
      const settingsResponse = await fetch('/api/settings/validate', {
        headers: {
          'x-llm-provider': llmSettings.provider,
          'x-llm-model': llmSettings.model,
          'x-llm-api-key': llmSettings.apiKey,
          'x-llm-temperature': llmSettings.temperature?.toString() || '0.7',
          'x-llm-max-tokens': llmSettings.maxTokens?.toString() || '4000',
        },
      });
      
      if (!settingsResponse.ok) {
        throw new Error('Please configure LLM settings in the Settings page first');
      }

      const { isValid, settings } = await settingsResponse.json();
      if (!isValid) {
        throw new Error('Please configure your LLM provider and API key in Settings');
      }

      // Get business brief data for context
      const businessBrief = useCases.find(uc => uc.businessBriefId === initiative.businessBriefId);
      
      // Generate features using the configured LLM
      const response = await fetch('/api/generate-features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initiativeId: initiative.id,
          businessBriefId: initiative.businessBriefId,
          initiativeData: {
            title: initiative.title,
            description: initiative.description,
            category: initiative.category,
            priority: initiative.priority,
            rationale: initiative.rationale,
            acceptanceCriteria: initiative.acceptanceCriteria,
            businessValue: initiative.businessValue,
            workflowLevel: initiative.workflowLevel,
          },
          businessBriefData: businessBrief ? {
            title: businessBrief.title,
            businessObjective: businessBrief.businessObjective,
            quantifiableBusinessOutcomes: businessBrief.quantifiableBusinessOutcomes,
            inScope: businessBrief.inScope,
            impactOfDoNothing: businessBrief.impactOfDoNothing,
            happyPath: businessBrief.happyPath,
            exceptions: businessBrief.exceptions,
            impactedEndUsers: businessBrief.impactedEndUsers,
            changeImpactExpected: businessBrief.changeImpactExpected,
          } : undefined,
          llmSettings: settings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate features');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Feature generation failed');
      }

      // Save generated features to the store
      const { features: generatedFeatures, metadata } = result.data;
      
      console.log('💾 Saving features to store...');
      const savedFeatures = addGeneratedFeatures(initiativeId, initiative.businessBriefId, generatedFeatures);
      console.log(`✅ Successfully saved ${savedFeatures.length} features to store`);

      // Show success message
      console.log('Features generated successfully:', savedFeatures.length);
      
      // Create a temporary success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Generated ${savedFeatures.length} features successfully`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      
    } catch (error) {
      console.error('Error generating features:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Create a temporary error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `❌ Feature Generation Failed: ${errorMessage}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 5000);
    } finally {
      setGeneratingItems(prev => ({ ...prev, [initiativeId]: false }));
    }
  };

  // Epic Generation function
  const handleGenerateEpics = async (featureId: string) => {
    if (generatingItems[featureId]) return;
    setGeneratingItems(prev => ({ ...prev, [featureId]: true }));
    try {
      if (useMockLLM) {
        console.log('🔧 Using MockLLMService for testing');
        const feature = features.find(feat => feat.id === featureId);
        if (!feature) {
          console.error('Feature not found for epic generation');
          return;
        }
        const initiative = initiatives.find(init => init.id === feature?.initiativeId);
        const result = await MockLLMService.generateEpics(featureId, feature, initiative);
        
        if (!result.success) {
          throw new Error('Mock epic generation failed');
        }

        // Save generated epics to the store
        const { epics: generatedEpics, metadata } = result.data;
        
        console.log('💾 Saving mock epics to store...');
        const savedEpics = addGeneratedEpics(featureId, feature.initiativeId, feature.businessBriefId, generatedEpics); // Mock data doesn't have initiativeId, featureId, businessBriefId
        console.log(`✅ Successfully saved ${savedEpics.length} mock epics to store`);

        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = `✅ Generated ${savedEpics.length} mock epics successfully`;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
        
        return;
      }
      if (!window.confirm('Are you sure you want to generate epics for this feature?')) {
        console.log('Epic generation cancelled by user.');
        return;
      }
      console.log('[AURA] User confirmed epic generation for feature:', featureId);
    const feature = features.find(feat => feat.id === featureId);
    if (!feature) {
      console.error('Feature not found:', featureId);
      return;
    }

      setItemLoading(featureId, true);
      
      console.log('Generating epics for feature:', featureId);
      
      // Check if settings are valid
      if (!validateSettings()) {
        throw new Error('Please configure your LLM provider and API key in Settings');
      }

      // Validate settings via API
      const settingsResponse = await fetch('/api/settings/validate', {
        headers: {
          'x-llm-provider': llmSettings.provider,
          'x-llm-model': llmSettings.model,
          'x-llm-api-key': llmSettings.apiKey,
          'x-llm-temperature': llmSettings.temperature?.toString() || '0.7',
          'x-llm-max-tokens': llmSettings.maxTokens?.toString() || '4000',
        },
      });
      
      if (!settingsResponse.ok) {
        throw new Error('Please configure LLM settings in the Settings page first');
      }

      const { isValid, settings } = await settingsResponse.json();
      if (!isValid) {
        throw new Error('Please configure your LLM provider and API key in Settings');
      }

      // Get business brief and initiative data for context
      const businessBrief = useCases.find(uc => uc.businessBriefId === feature.businessBriefId);
      const initiative = initiatives.find(init => init.id === feature.initiativeId);
      
      // Generate epics using the configured LLM
      const response = await fetch('/api/generate-epics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featureId: feature.id,
          initiativeId: feature.initiativeId,
          businessBriefId: feature.businessBriefId,
          featureData: {
            title: feature.title,
            description: feature.description,
            category: feature.category,
            priority: feature.priority,
            rationale: feature.rationale,
            acceptanceCriteria: feature.acceptanceCriteria,
            businessValue: feature.businessValue,
            workflowLevel: feature.workflowLevel,
          },
          businessBriefData: businessBrief ? {
            title: businessBrief.title,
            businessObjective: businessBrief.businessObjective,
            quantifiableBusinessOutcomes: businessBrief.quantifiableBusinessOutcomes,
            inScope: businessBrief.inScope,
            impactOfDoNothing: businessBrief.impactOfDoNothing,
            happyPath: businessBrief.happyPath,
            exceptions: businessBrief.exceptions,
            impactedEndUsers: businessBrief.impactedEndUsers,
            changeImpactExpected: businessBrief.changeImpactExpected,
          } : undefined,
          initiativeData: initiative ? {
            title: initiative.title,
            description: initiative.description,
            category: initiative.category,
            priority: initiative.priority,
            rationale: initiative.rationale,
            acceptanceCriteria: initiative.acceptanceCriteria,
            businessValue: initiative.businessValue,
            workflowLevel: initiative.workflowLevel,
          } : undefined,
          llmSettings: settings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate epics');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Epic generation failed');
      }

      // Save generated epics to the store
      const { epics: generatedEpics, metadata } = result.data;
      
      console.log('💾 Saving epics to store...');
      const savedEpics = addGeneratedEpics(featureId, feature.initiativeId, feature.businessBriefId, generatedEpics);
      console.log(`✅ Successfully saved ${savedEpics.length} epics to store`);

      // Show success message
      console.log('Epics generated successfully:', savedEpics.length);
      
      // Create a temporary success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Generated ${savedEpics.length} epics successfully`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      
    } catch (error) {
      console.error('Error generating epics:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Create a temporary error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `❌ Epic Generation Failed: ${errorMessage}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 5000);
    } finally {
      setGeneratingItems(prev => ({ ...prev, [featureId]: false }));
    }
  };

  // Story Generation function
  const handleGenerateStories = async (epicId: string) => {
    if (generatingItems[epicId]) return;
    setGeneratingItems(prev => ({ ...prev, [epicId]: true }));
    try {
      if (useMockLLM) {
        console.log('🔧 Using MockLLMService for testing');
        const epic = epics.find(ep => ep.id === epicId);
        if (!epic) {
          console.error('Epic not found for story generation');
          return;
        }
        const feature = features.find(feat => feat.id === epic?.featureId);
        const initiative = initiatives.find(init => init.id === epic?.initiativeId);
        const result = await MockLLMService.generateStories(epicId, epic, feature, initiative);
        
        if (!result.success) {
          throw new Error('Mock story generation failed');
        }

        // Save generated stories to the store
        const { stories: generatedStories, metadata } = result.data;
        
        console.log('💾 Saving mock stories to store...');
        const savedStories = addGeneratedStories(epicId, epic.featureId, epic.initiativeId, epic.businessBriefId, generatedStories); // Mock data doesn't have epicId, featureId, initiativeId, businessBriefId
        console.log(`✅ Successfully saved ${savedStories.length} mock stories to store`);

        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = `✅ Generated ${savedStories.length} mock stories successfully`;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
        
        return;
      }
      if (!window.confirm('Are you sure you want to generate stories for this epic?')) {
        console.log('Story generation cancelled by user.');
        return;
      }
      console.log('[AURA] User confirmed story generation for epic:', epicId);
    const epic = epics.find(ep => ep.id === epicId);
    if (!epic) {
      console.error('Epic not found:', epicId);
      return;
    }

      setItemLoading(epicId, true);
      
      console.log('Generating stories for epic:', epicId);
      
      // Check if settings are valid
      if (!validateSettings()) {
        throw new Error('Please configure your LLM provider and API key in Settings');
      }

      // Validate settings via API
      const settingsResponse = await fetch('/api/settings/validate', {
        headers: {
          'x-llm-provider': llmSettings.provider,
          'x-llm-model': llmSettings.model,
          'x-llm-api-key': llmSettings.apiKey,
          'x-llm-temperature': llmSettings.temperature?.toString() || '0.7',
          'x-llm-max-tokens': llmSettings.maxTokens?.toString() || '4000',
        },
      });
      
      if (!settingsResponse.ok) {
        throw new Error('Please configure LLM settings in the Settings page first');
      }

      const { isValid, settings } = await settingsResponse.json();
      if (!isValid) {
        throw new Error('Please configure your LLM provider and API key in Settings');
      }

      // Get business brief, initiative, and feature data for context
      const businessBrief = useCases.find(uc => uc.businessBriefId === epic.businessBriefId);
      const initiative = initiatives.find(init => init.id === epic.initiativeId);
      const feature = features.find(feat => feat.id === epic.featureId);
      
      // Generate stories using the configured LLM
      const response = await fetch('/api/generate-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          epicId: epic.id,
          featureId: epic.featureId,
          initiativeId: epic.initiativeId,
          businessBriefId: epic.businessBriefId,
          epicData: {
            title: epic.title,
            description: epic.description,
            category: epic.category,
            priority: epic.priority,
            rationale: epic.rationale,
            acceptanceCriteria: epic.acceptanceCriteria,
            businessValue: epic.businessValue,
            workflowLevel: epic.workflowLevel,
            estimatedEffort: epic.estimatedEffort,
            sprintEstimate: epic.sprintEstimate,
          },
          businessBriefData: businessBrief ? {
            title: businessBrief.title,
            businessObjective: businessBrief.businessObjective,
            quantifiableBusinessOutcomes: businessBrief.quantifiableBusinessOutcomes,
            inScope: businessBrief.inScope,
            impactOfDoNothing: businessBrief.impactOfDoNothing,
            happyPath: businessBrief.happyPath,
            exceptions: businessBrief.exceptions,
            impactedEndUsers: businessBrief.impactedEndUsers,
            changeImpactExpected: businessBrief.changeImpactExpected,
          } : undefined,
          initiativeData: initiative ? {
            title: initiative.title,
            description: initiative.description,
            category: initiative.category,
            priority: initiative.priority,
            rationale: initiative.rationale,
            acceptanceCriteria: initiative.acceptanceCriteria,
            businessValue: initiative.businessValue,
            workflowLevel: initiative.workflowLevel,
          } : undefined,
          featureData: feature ? {
            title: feature.title,
            description: feature.description,
            category: feature.category,
            priority: feature.priority,
            rationale: feature.rationale,
            acceptanceCriteria: feature.acceptanceCriteria,
            businessValue: feature.businessValue,
            workflowLevel: feature.workflowLevel,
          } : undefined,
          llmSettings: settings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate stories');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Story generation failed');
      }

      // Save generated stories to the store
      const { stories: generatedStories, metadata } = result.data;
      
      console.log('💾 Saving stories to store...');
      const savedStories = addGeneratedStories(epicId, epic.featureId, epic.initiativeId, epic.businessBriefId, generatedStories);
      console.log(`✅ Successfully saved ${savedStories.length} stories to store`);

      // Show success message
      console.log('Stories generated successfully:', savedStories.length);
      
      // Create a temporary success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Generated ${savedStories.length} stories successfully`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      
    } catch (error) {
      console.error('Error generating stories:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Create a temporary error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `❌ Story Generation Failed: ${errorMessage}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 5000);
    } finally {
      setGeneratingItems(prev => ({ ...prev, [epicId]: false }));
    }
  };

  // Handle creating initiative in Jira
  const handleCreateInJira = async (initiativeId: string) => {
    const initiative = initiatives.find(init => init.id === initiativeId);
    if (!initiative) {
      console.error('Initiative not found:', initiativeId);
      return;
    }

    console.log('🎯 Creating initiative in Jira:', initiative.title);
    setCreatingInJira(prev => ({ ...prev, [initiativeId]: true }));

    try {
      const response = await fetch('/api/create-jira-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initiative,
          llmSettings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Jira issue');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Jira issue creation failed');
      }

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.innerHTML = `✅ Initiative created in Jira: <a href="${result.data.issueUrl}" target="_blank" class="underline">${result.data.issueKey}</a>`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 10000);
      
      console.log('✅ Jira issue created successfully:', result.data);

    } catch (error) {
      console.error('Error creating Jira issue:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Create a temporary error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `❌ Jira Creation Failed: ${errorMessage}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 5000);
    } finally {
      setCreatingInJira(prev => ({ ...prev, [initiativeId]: false }));
    }
  };

  // Manual entry functions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const acceptanceCriteriaArray = formData.acceptanceCriteria
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim());

    const newInitiative = {
      id: `init-${Date.now()}`,
      businessBriefId: formData.businessBriefId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      rationale: formData.rationale,
      acceptanceCriteria: acceptanceCriteriaArray,
      businessValue: formData.businessValue,
      workflowLevel: 'initiative',
      status: formData.status,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Manual Entry'
    };

    if (editingItem) {
      updateInitiative(editingItem.id, newInitiative);
    } else {
      addInitiative(newInitiative);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      status: 'draft',
      businessBriefId: '',
      acceptanceCriteria: '',
      businessValue: '',
      rationale: '',
      assignee: ''
    });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category || '',
      priority: item.priority,
      status: item.status,
      businessBriefId: item.businessBriefId,
      acceptanceCriteria: item.acceptanceCriteria.join('\n'),
      businessValue: item.businessValue || '',
      rationale: item.rationale || '',
      assignee: item.assignee || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteInitiative(id);
    }
  };

  // Calculate stats
  const totalInitiatives = initiatives.length;
  const activeInitiatives = initiatives.filter(item => item.status === 'active').length;
  const completedInitiatives = initiatives.filter(item => item.status === 'completed').length;
  const totalFeatures = features.length;
  const totalEpics = epics.length;
  const totalStories = stories.length;

  // Group initiatives by business brief for better organization
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

  // Render work item with hierarchical structure
  const renderWorkItem = (item: any, level: number = 0, type: string = 'initiative') => {
    const isSelected = selectedItem === item.id;
    const initiativeFeatures = type === 'initiative' ? getFeaturesByInitiative(item.id) : [];
    const featureEpics = type === 'feature' ? getEpicsByFeature(item.id) : [];
    const epicStories = type === 'epic' ? getStoriesByEpic(item.id) : [];

    // Debug logging for feature display
    if (type === 'initiative') {
      console.log(`🔍 Rendering initiative ${item.id} (${item.title})`);
      console.log(`🔍 Features for initiative ${item.id}:`, initiativeFeatures.length);
      console.log(`🔍 Feature details:`, initiativeFeatures.map(f => ({ id: f.id, title: f.title, initiativeId: f.initiativeId })));
    }

    // Check if this level is collapsed
    const isCollapsed = collapsedLevels.has(item.id);

    // Get appropriate badge color for type
    const getTypeBadgeColor = (type: string) => {
      switch (type) {
        case 'initiative': return 'text-yellow-800 border-yellow-300'; // Custom initiative color
        case 'feature': return 'text-blue-800 border-blue-300'; // Custom feature color
        case 'epic': return 'text-purple-800 border-purple-300'; // Custom epic color
        case 'story': return 'text-green-800 border-green-300'; // Custom story color
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div key={item.id} className={`relative flex flex-col space-y-1 border-l-2 pl-4 ml-2 py-2 ${isSelected ? 'bg-gray-50' : ''}`}> 
        <div
          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-all ${
            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => handleItemSelect(item)}
        >
          {/* Collapse/Expand Chevron */}
          {(type === 'initiative' && initiativeFeatures.length > 0) || 
           (type === 'feature' && featureEpics.length > 0) || 
           (type === 'epic' && epicStories.length > 0) ? (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setCollapsedLevels(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(item.id)) {
                    newSet.delete(item.id);
                  } else {
                    newSet.add(item.id);
                  }
                  return newSet;
                });
              }}
            >
              {isCollapsed ? (
                <ChevronRight size={12} className="text-gray-500" />
              ) : (
                <ChevronDown size={12} className="text-gray-500" />
              )}
            </Button>
          ) : (
            <div className="w-6 h-6" />
          )}

          {/* Type Icon */}
          <div className="flex items-center space-x-2">
            {getTypeIcon(type)}
            <Badge 
              className={getTypeBadgeColor(type)} 
              variant="secondary"
              style={{
                backgroundColor: type === 'initiative' ? '#FFECAD' : 
                               type === 'feature' ? '#D4E1EC' : 
                               type === 'epic' ? '#D6D0DD' : 
                               type === 'story' ? '#CDE1CC' : undefined
              }}
            >
              {type}
            </Badge>
          </div>

          {/* Title and Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
              <Badge className={getStatusColor(item.status)}>
                {item.status}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                {item.priority}
              </Badge>
              {item.category && (
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              )}
              {type === 'initiative' && initiativeFeatures.length > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {initiativeFeatures.length} features
                </Badge>
              )}
              {type === 'feature' && featureEpics.length > 0 && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                  {featureEpics.length} epics
                </Badge>
              )}
              {type === 'epic' && epicStories.length > 0 && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  {epicStories.length} stories
                </Badge>
              )}
              {type === 'epic' && item.sprintEstimate && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                  {item.sprintEstimate} sprint{item.sprintEstimate !== 1 ? 's' : ''}
                </Badge>
              )}
              {type === 'story' && item.storyPoints && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                  {item.storyPoints} points
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{item.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            {type === 'initiative' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateFeatures(item.id);
                  }}
                  disabled={generatingItems[item.id]}
                  title="Generate Features"
                >
                  {generatingItems[item.id] ? (
                    <Loader2 size={12} className="animate-spin" style={{color: '#5B8DB8'}} />
                  ) : (
                    <Wand2 size={12} style={{color: '#5B8DB8'}} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateInJira(item.id);
                  }}
                  disabled={creatingInJira[item.id]}
                  title="Create in Jira Cloud"
                >
                  {creatingInJira[item.id] ? (
                    <Loader2 size={12} className="animate-spin" style={{color: '#0052CC'}} />
                  ) : (
                    <ExternalLink size={12} style={{color: '#0052CC'}} />
                  )}
                </Button>
              </>
            )}
            {type === 'feature' && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateEpics(item.id);
                }}
                disabled={generatingItems[item.id]}
                title="Generate Epics"
              >
                {generatingItems[item.id] ? (
                  <Loader2 size={12} className="animate-spin" style={{color: '#8B7A9B'}} />
                ) : (
                  <Wand2 size={12} style={{color: '#8B7A9B'}} />
                )}
              </Button>
            )}
            {type === 'epic' && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateStories(item.id);
                }}
                disabled={generatingItems[item.id]}
                title="Generate Stories"
              >
                {generatingItems[item.id] ? (
                  <Loader2 size={12} className="animate-spin" style={{color: '#7FB37C'}} />
                ) : (
                  <Wand2 size={12} style={{color: '#7FB37C'}} />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Add test case generation functionality
                console.log(`Generate test cases for ${type}: ${item.id}`);
              }}
              title="Generate Test Cases"
            >
              <TestTube size={12} className="text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(item);
              }}
              title="Edit"
            >
              <Edit size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
              title="Delete"
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>

        {/* Selected Item Details */}
        {isSelected && (
          <div className="ml-8 p-4 bg-gray-50 rounded-lg border space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            
            {item.rationale && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Rationale</h4>
                <p className="text-sm text-gray-600">{item.rationale}</p>
              </div>
            )}
            
            {item.businessValue && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Business Value</h4>
                <p className="text-sm text-gray-600">{item.businessValue}</p>
              </div>
            )}

            {type === 'epic' && item.estimatedEffort && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Estimated Effort</h4>
                <p className="text-sm text-gray-600">{item.estimatedEffort}</p>
              </div>
            )}

            {type === 'epic' && item.sprintEstimate && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sprint Estimate</h4>
                <p className="text-sm text-gray-600">{item.sprintEstimate} sprint{item.sprintEstimate !== 1 ? 's' : ''}</p>
              </div>
            )}

            {type === 'story' && item.storyPoints && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Story Points</h4>
                <p className="text-sm text-gray-600">{item.storyPoints} points</p>
              </div>
            )}

            {type === 'story' && item.labels && item.labels.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Labels</h4>
                <div className="flex flex-wrap gap-2">
                  {item.labels.map((label: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {type === 'story' && item.testingNotes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Testing Notes</h4>
                <p className="text-sm text-gray-600">{item.testingNotes}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Acceptance Criteria</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {item.acceptanceCriteria.map((criteria: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Render Features under Initiative */}
        {type === 'initiative' && initiativeFeatures.length > 0 && !isCollapsed && (
          <div className="ml-8 space-y-2">
            {initiativeFeatures.map((feature) => renderWorkItem(feature, level + 1, 'feature'))}
          </div>
        )}

        {/* Render Epics under Feature */}
        {type === 'feature' && featureEpics.length > 0 && !isCollapsed && (
          <div className="ml-8 space-y-2">
            {featureEpics.map((epic) => renderWorkItem(epic, level + 1, 'epic'))}
          </div>
        )}

        {/* Render Stories under Epic */}
        {type === 'epic' && epicStories.length > 0 && !isCollapsed && (
          <div className="ml-8 space-y-2">
            {epicStories.map((story) => renderWorkItem(story, level + 1, 'story'))}
          </div>
        )}
      </div>
    );
  };

  // Load data ONCE on mount - no dependencies to prevent re-triggers  
  useEffect(() => {
    if (!hasLoadedOnce && !isLoadingFromDatabase) {
      console.log('🚀 ONE-TIME load from database...');
      setHasLoadedOnce(true);
      loadWorkItemsFromDatabase();
    }
  }, []); // Empty dependencies - runs exactly once

  return (
    <div className="space-y-6">
      {/* Hidden Debug Menu */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDebugControls(!showDebugControls)}
          className="text-gray-400 hover:text-gray-600"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Debug Controls Dropdown */}
      {showDebugControls && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800">Debug Mode Controls</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugControls(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={useMockLLM}
                onChange={(e) => setUseMockLLM(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Use Mock LLM (no API costs)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={useMockData}
                onChange={(e) => setUseMockData(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Use Mock Data (vs Database)</span>
            </label>
          </div>
          <div className="pt-2 border-t border-gray-200 space-x-2">
            <button 
              onClick={() => {
                if (window.confirm('Clear all features from store?')) {
                  (window as any).clearAllFeatures();
                  window.location.reload();
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Clear All Features
            </button>
            <button 
              onClick={() => (window as any).debugFeatureDisplay()}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Debug Feature Display
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Items Management</h1>
          <p className="text-gray-600 mt-1">
            Hierarchical breakdown: Initiative → Feature → Epic → Story
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Enterprise Workflow
            </Badge>
            <Badge variant="secondary" className="text-xs">
              AI-Powered Generation
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2" onClick={resetForm}>
                <Plus size={16} />
                <span>Manual Entry</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Initiative' : 'Create New Initiative'}
                </DialogTitle>
                <DialogDescription>
                  Define the initiative details
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Brief *
                  </label>
                  <Select value={formData.businessBriefId} onValueChange={(value) => setFormData({ ...formData, businessBriefId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business brief" />
                    </SelectTrigger>
                    <SelectContent>
                      {useCases.map((useCase) => (
                        <SelectItem key={useCase.id} value={useCase.id}>
                          {useCase.businessBriefId} - {useCase.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter initiative title"
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
                    placeholder="Describe the initiative"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <Select value={formData.status} onValueChange={(value: 'draft' | 'active' | 'completed' | 'on-hold') => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., strategic, operational"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acceptance Criteria *
                  </label>
                  <Textarea
                    value={formData.acceptanceCriteria}
                    onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                    placeholder="List acceptance criteria (one per line)"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Update' : 'Create'} Initiative
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button className="flex items-center space-x-2" disabled={Object.values(generatingItems).some(loading => loading)}>
            <Sparkles size={16} />
            <span>AI Generate</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search initiatives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="initiative">Initiatives</SelectItem>
            <SelectItem value="feature">Features</SelectItem>
            <SelectItem value="epic">Epics</SelectItem>
            <SelectItem value="story">Stories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Work Item Summary</CardTitle>
              <CardDescription>Overall work item metrics and progress</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSummaryCardsVisible(!summaryCardsVisible)}
              className="h-8 w-8 p-0"
            >
              {summaryCardsVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </CardHeader>
        {summaryCardsVisible && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Initiatives</p>
                      <p className="text-2xl font-bold" style={{color: '#D4A843'}}>{totalInitiatives}</p>
                    </div>
                    <Target className="h-8 w-8" style={{color: '#D4A843'}} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-blue-600">{activeInitiatives}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{completedInitiatives}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Features</p>
                      <p className="text-2xl font-bold" style={{color: '#5B8DB8'}}>{totalFeatures}</p>
                    </div>
                    <Layers className="h-8 w-8" style={{color: '#5B8DB8'}} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Epics</p>
                      <p className="text-2xl font-bold" style={{color: '#8B7A9B'}}>{totalEpics}</p>
                    </div>
                    <BookOpen className="h-8 w-8" style={{color: '#8B7A9B'}} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stories</p>
                      <p className="text-2xl font-bold" style={{color: '#7FB37C'}}>{totalStories}</p>
                    </div>
                    <FileText className="h-8 w-8" style={{color: '#7FB37C'}} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Hierarchical Work Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target size={18} />
                <span>Work Item Hierarchy</span>
              </CardTitle>
              <CardDescription>Initiative → Feature → Epic → Story breakdown</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {businessBriefGroups.length > 0 ? (
              businessBriefGroups.map((group) => (
                <div key={group.businessBriefId} className="space-y-2">
                  {/* Business Brief Header */}
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all"
                    style={{backgroundColor: '#FFD0C2'}}
                    onClick={() => {
                      setCollapsedLevels(prev => {
                        const newSet = new Set(prev);
                        const briefKey = `brief-${group.businessBriefId}`;
                        if (newSet.has(briefKey)) {
                          newSet.delete(briefKey);
                        } else {
                          newSet.add(briefKey);
                        }
                        return newSet;
                      });
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {collapsedLevels.has(`brief-${group.businessBriefId}`) ? (
                          <ChevronRight size={12} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={12} className="text-gray-500" />
                        )}
                      </Button>
                      <Target className="h-5 w-5" style={{color: '#B8957A'}} />
                      <div>
                        <h3 className="font-medium text-gray-900">{group.businessBriefTitle}</h3>
                        <p className="text-sm text-gray-600">{group.initiatives.length} initiatives</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {group.businessBriefId}
                    </Badge>
                  </div>
                  
                  {/* Initiatives */}
                  {!collapsedLevels.has(`brief-${group.businessBriefId}`) && (
                    <div className="ml-4 space-y-2">
                      {group.initiatives.map((initiative) => renderWorkItem(initiative, 0, 'initiative'))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Target size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Items</h3>
                <p className="text-gray-600 mb-4">Start by creating initiatives from business briefs</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Create First Initiative
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 