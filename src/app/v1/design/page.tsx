"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { mockWorkItems, mockRequirements } from '@/lib/mock-data';
import { useInitiativeStore } from '@/store/initiative-store';
import { useFeatureStore } from '@/store/feature-store';
import { useEpicStore } from '@/store/epic-store';
import { useStoryStore } from '@/store/story-store';
import { useUseCaseStore } from '@/store/use-case-store';
import { useSettingsStore } from '@/store/settings-store';
import { notify } from '@/lib/notification-helper';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Building2,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode2,
  FileImage,
  FileText,
  GitBranch,
  GitPullRequest,
  Layers,
  Link as LinkIcon,
  Loader2,
  Maximize2,
  Minimize2,
  Monitor,
  Palette,
  Play,
  Save,
  Settings,
  Smartphone,
  Sparkles,
  Tablet,
  Target,
  Upload,
  XCircle,
} from 'lucide-react';
import Link from "next/link";

interface GeneratedCode {
  html: string;
  css: string;
  javascript: string;
  framework: 'react' | 'vue' | 'vanilla';
}

interface DesignReverseEngineerConfig {
  inputType: 'figma' | 'image' | 'upload';
  figmaUrl: string;
  designImage: File | null;
  designFiles: File[];
  analysisLevel: 'story' | 'epic' | 'feature' | 'initiative' | 'business-brief';
  extractUserFlows: boolean;
  includeAccessibility: boolean;
}

interface ReverseEngineeredDesignItems {
  businessBrief?: any;
  initiatives?: any[];
  features?: any[];
  epics?: any[];
  stories?: any[];
  analysisDepth: string;
  extractedInsights: string;
  designAnalysis: string;
  userFlows?: string[];
  accessibilityInsights?: string[];
}

type ViewportType = 'desktop' | 'tablet' | 'mobile';

export default function DesignPage() {
  // Store hooks
  const { addInitiative, initiatives, clearInitiatives } = useInitiativeStore();
  const { addFeature, features, clearFeatures } = useFeatureStore();
  const { addEpic, epics, clearEpics } = useEpicStore();
  const { addStory, stories, clearStories } = useStoryStore();
  const { addUseCase } = useUseCaseStore();
  const { reverseEngineeringLLMSettings, getV1ModuleLLM } = useSettingsStore();

  // Design Generation State
  const [selectedTab, setSelectedTab] = useState<'figma' | 'work-item'>('work-item');
  const [designImage, setDesignImage] = useState<File | null>(null);
  const [workItemImage, setWorkItemImage] = useState<File | null>(null);
  const [figmaUrl, setFigmaUrl] = useState('');
  const [selectedWorkItem, setSelectedWorkItem] = useState<string>('');
  const [designPrompt, setDesignPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview');
  const [viewportType, setViewportType] = useState<ViewportType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Reverse Engineering State
  const [reverseConfig, setReverseConfig] = useState<DesignReverseEngineerConfig>({
    inputType: 'image',
    figmaUrl: '',
    designImage: null,
    designFiles: [],
    analysisLevel: 'story',
    extractUserFlows: true,
    includeAccessibility: true
  });
  const [reverseEngineeredItems, setReverseEngineeredItems] = useState<ReverseEngineeredDesignItems | null>(null);
  const [isReverseEngineering, setIsReverseEngineering] = useState(false);
  const [reverseProgress, setReverseProgress] = useState(0);
  
  // Real vs Mock LLM toggle for reverse engineering
  const [useRealLLMForReverse, setUseRealLLMForReverse] = useState(false);

  // Real vs Mock LLM toggle for design generation
  const [useRealLLMForGeneration, setUseRealLLMForGeneration] = useState(true);
  
  // AI Progress Modal states (thinking model)
  const [isAiProgressModalOpen, setIsAiProgressModalOpen] = useState(false);
  const [aiProgressMessage, setAiProgressMessage] = useState('');
  
  // Workflow stage management for work items
  const [workflowStage, setWorkflowStage] = useState<'table' | 'config' | 'generated'>('table');
  const [selectedWorkItemForDesign, setSelectedWorkItemForDesign] = useState<string>('');
  const [savedDesigns, setSavedDesigns] = useState<Record<string, GeneratedCode>>({});
  
  // Hierarchical table state (like V1 requirements)
  // Start with first few portfolios expanded by default so users can see the structure
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [portfolios, setPortfolios] = useState<any[]>([]);
  
  // Get business briefs from the store (same as Requirements page)
  const { useCases: businessBriefs } = useUseCaseStore();

  // Load portfolios from database (like V1 requirements)
  const loadPortfolios = async () => {
    try {
      console.log('📊 Loading portfolios...');
      const response = await fetch('/api/portfolios');
      const data = await response.json();
      
      if (data.success && data.data) {
        setPortfolios(data.data);
        console.log(`✅ Loaded ${data.data.length} portfolios`);
      }
    } catch (error) {
      console.error('❌ Failed to load portfolios:', error);
    }
  };

  // Add loading state to prevent multiple API calls
  const [isLoadingWorkItems, setIsLoadingWorkItems] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Load work items from database (includes portfolioId values)
  const loadWorkItemsFromDatabase = async () => {
    try {
      console.log('🔄 Loading work items from database...');
      
      // Multiple guards to prevent ANY duplicate loading (like Work Items tab)
      if (isLoadingWorkItems) {
        console.log('🔄 Already loading, skipping...');
        return;
      }
      
      // Check if ALL work item types are already loaded (not just initiatives)
      const hasCompleteData = initiatives.length > 0 && features.length > 0 && epics.length > 0 && stories.length > 0;
      console.log('📊 Current data state:', {
        initiatives: initiatives.length,
        features: features.length, 
        epics: epics.length,
        stories: stories.length,
        hasCompleteData,
        sessionFlag: (window as any)?.auraDesignDataLoaded
      });
      
      if (typeof window !== 'undefined' && (window as any).auraDesignDataLoaded && hasCompleteData) {
        console.log('🔄 Complete data already loaded in this session, skipping...');
        return;
      }
      
      // If we reach here, we need to load data (either first time or incomplete data)
      console.log('🚀 Proceeding to load work items...', 
        !hasCompleteData ? 'Reason: Incomplete data' : 'Reason: First load'
      );

      setIsLoadingWorkItems(true);
      if (typeof window !== 'undefined') {
        (window as any).auraDesignDataLoaded = true;
      }
      
      // Clear all stores using proper Zustand methods to trigger reactivity
      console.log('🧹 Before clearing - Current store contents:', {
        initiatives: initiatives.length,
        features: features.length,
        epics: epics.length,
        stories: stories.length
      });
      
      console.log('🧹 Clearing all store data using proper Zustand methods...');
      clearInitiatives();
      clearFeatures();
      clearEpics(); 
      clearStories();
      
      // Wait for React to process the clearing before loading new data
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('✅ After clearing and waiting - All stores emptied using reactive methods');
      
      // Load all work items from API (they include portfolioId from database)
      const [initiativesRes, featuresRes, epicsRes, storiesRes] = await Promise.all([
        fetch('/api/initiatives/list'),
        fetch('/api/features/list'),  
        fetch('/api/epics/list'),
        fetch('/api/stories/list')
      ]);
      
      // Parse responses
      const [initiativesData, featuresData, epicsData, storiesData] = await Promise.all([
        initiativesRes.json(),
        featuresRes.json(),
        epicsRes.json(), 
        storiesRes.json()
      ]);
      
      console.log('📊 Database results:', {
        initiatives: initiativesData.data?.length || 0,
        features: featuresData.data?.length || 0,
        epics: epicsData.data?.length || 0,
        stories: storiesData.data?.length || 0
      });
      
      // Load initiatives (with portfolioId from database) - simplified after complete clearing
      if (initiativesData.success) {
        console.log('📊 Loading initiatives from API:', initiativesData.data.length);
        
        initiativesData.data.forEach((item: any) => {
          addInitiative({
            id: item.id,
            businessBriefId: item.businessBriefId,
            portfolioId: item.portfolioId, // Ensure portfolioId is passed from database
            title: item.title,
            description: item.description,
            category: 'business',
            priority: item.priority,
            rationale: item.businessValue || item.description,
            acceptanceCriteria: typeof item.acceptanceCriteria === 'string' 
              ? JSON.parse(item.acceptanceCriteria || '[]')
              : (item.acceptanceCriteria || []),
            businessValue: item.businessValue || '',
            workflowLevel: 'initiative',
            status: item.status,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
            createdBy: item.assignedTo || 'System',
            assignedTo: item.assignedTo || 'Team'
          });
          console.log('✅ Loaded initiative:', item.id, item.title);
        });
        
        // Portfolio mapping is now stored directly in initiative.portfolioId
        console.log(`✅ Loaded ${initiativesData.data.length} initiatives with portfolio mapping`);
      }
      
      // Load features
      if (featuresData.success) {
        console.log('📊 Loading features from API:', featuresData.data.length);
        console.log('✅ Loading features with corrected field mapping');
        
        featuresData.data.forEach((item: any) => addFeature({
          id: item.id,
          initiativeId: item.initiative_id || item.initiativeId, // ✅ Use API's snake_case field
          businessBriefId: item.business_brief_id || item.businessBriefId, // ✅ Use API's snake_case field
          title: item.title,
          description: item.description,
          category: 'business',
          priority: item.priority,
          rationale: item.businessValue || item.description,
          status: item.status,
          acceptanceCriteria: typeof item.acceptanceCriteria === 'string'
            ? JSON.parse(item.acceptanceCriteria || '[]')
            : (item.acceptanceCriteria || []),
          businessValue: item.businessValue || '',
          workflowLevel: 'feature',
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          createdBy: 'System',
          assignedTo: 'Team'
        }));
      }
      
      // Load epics
      if (epicsData.success) {
        console.log('📊 Loading epics from API:', epicsData.data.length);
        console.log('✅ Loading epics with corrected field mapping');
        
        epicsData.data.forEach((item: any) => addEpic({
          id: item.id,
          featureId: item.feature_id || item.featureId, // ✅ Use API's snake_case field
          initiativeId: item.initiative_id || item.initiativeId, // ✅ Use API's snake_case field
          businessBriefId: item.business_brief_id || item.businessBriefId, // ✅ Use API's snake_case field
          title: item.title,
          description: item.description,
          category: 'business', 
          priority: item.priority,
          rationale: item.businessValue || item.description,
          status: item.status,
          acceptanceCriteria: typeof item.acceptanceCriteria === 'string'
            ? JSON.parse(item.acceptanceCriteria || '[]')
            : (item.acceptanceCriteria || []),
          businessValue: item.businessValue || '',
          workflowLevel: 'epic',
          estimatedEffort: item.estimatedEffort || 'TBD',
          sprintEstimate: item.sprintEstimate || 1,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          createdBy: 'System',
          assignedTo: 'Team'
        }));
      }
      
      // Load stories
      if (storiesData.success) {
        console.log('📊 Loading stories from API:', storiesData.data.length);
        console.log('✅ Loading stories with corrected field mapping');
        
        storiesData.data.forEach((item: any) => addStory({
          id: item.id,
          epicId: item.epic_id || item.epicId, // ✅ Use API's snake_case field
          featureId: item.feature_id || item.featureId, // ✅ Use API's snake_case field
          initiativeId: item.initiative_id || item.initiativeId, // ✅ Use API's snake_case field
          businessBriefId: item.business_brief_id || item.businessBriefId, // ✅ Use API's snake_case field
          title: item.title,
          description: item.description,
          category: 'business',
          priority: item.priority,
          rationale: item.businessValue || item.description,
          status: item.status,
          acceptanceCriteria: typeof item.acceptanceCriteria === 'string'
            ? JSON.parse(item.acceptanceCriteria || '[]')
            : (item.acceptanceCriteria || []),
          businessValue: item.businessValue || '',
          workflowLevel: 'story',
          storyPoints: item.storyPoints || 0,
          assignee: item.assignedTo || 'Team',
          labels: item.labels || [],
          testingNotes: item.testingNotes || '',
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          createdBy: 'System'
        }));
      }
      
      // Mark data as loaded successfully
      setHasLoadedData(true);
      
      // Validate data was loaded correctly into reactive stores
      setTimeout(() => {
        const finalState = {
          initiatives: useInitiativeStore.getState().initiatives.length,
          features: useFeatureStore.getState().features.length,
          epics: useEpicStore.getState().epics.length,
          stories: useStoryStore.getState().stories.length
        };
        console.log('✅ Final validation - Store state after loading:', finalState);
        console.log('📊 API data loaded:', {
          initiatives: initiativesData.data?.length || 0,
          features: featuresData.data?.length || 0, 
          epics: epicsData.data?.length || 0,
          stories: storiesData.data?.length || 0
        });
      }, 100); // Small delay to ensure React re-renders have completed
      
    } catch (error) {
      console.error('❌ Failed to load work items:', error);
    } finally {
      setIsLoadingWorkItems(false);
    }
  };

  // Initial data loading when page mounts (using Work Items tab strategy)
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('🚀 Loading initial data for Design page (SINGLE LOAD)...');
      
      const useCaseStore = useUseCaseStore.getState();
      
      try {
        // Load portfolios and business briefs
        await Promise.all([
          loadPortfolios(),
          useCaseStore.loadFromDatabase() // Load business briefs
        ]);
        
        // Load work items from database (includes portfolioId) - with session protection
        await loadWorkItemsFromDatabase();
        
        console.log('✅ Initial data loading completed');
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
      }
    };
    
    loadInitialData();
  }, []); // Only run once on mount - session flag prevents subsequent loads

  // Auto-expand first few portfolios when data is available
  useEffect(() => {
    if (portfolios.length > 0 && initiatives.length > 0 && expandedItems.size === 0) {
      // Get unique portfolio IDs from initiatives
      const portfolioIds = Array.from(new Set(
        initiatives
          .map((init: any) => init.portfolioId)
          .filter(Boolean)
          .slice(0, 2)
      ));
      
      const portfoliosToExpand = portfolioIds.map(id => `portfolio-${id}`);
      const briefsToExpand = ['brief-unassigned']; // Expand unassigned by default
      
      setExpandedItems(new Set([...portfoliosToExpand, ...briefsToExpand, 'portfolio-unassigned']));
    }
  }, [portfolios, initiatives]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workItemImageRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const designUploadRef = useRef<HTMLInputElement>(null);

  // Check for selected work item from session storage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWorkItem = sessionStorage.getItem('selectedWorkItem');
      const storedTab = sessionStorage.getItem('selectedWorkItemTab');
      const autoAdvance = sessionStorage.getItem('designAutoAdvance');
      
      console.log('🔍 Design Page - Checking session storage:', {
        hasWorkItem: !!storedWorkItem,
        tab: storedTab,
        autoAdvance: autoAdvance
      });
      
      if (storedWorkItem) {
        try {
          const workItemData = JSON.parse(storedWorkItem);
          console.log('📦 Design Page - Received work item data:', {
            title: workItemData.title,
            type: workItemData.type,
            id: workItemData.id
          });
          
          // Set the work item for the generation process
          setSelectedWorkItem(workItemData.id);
          
          // Set the tab to work-item if it was set from the Work Items table
          if (storedTab === 'work-item') {
            console.log('🔄 Switching to work-item input source');
            setSelectedTab('work-item');
            
            // 🚀 AUTO-ADVANCE: Automatically go to config stage when coming from Work Items
            if (autoAdvance === 'true') {
              console.log('🚀 AUTO-ADVANCE ACTIVATED');
              console.log(`✨ Jumping directly to design configuration for: "${workItemData.title}"`);
              
              setSelectedWorkItemForDesign(workItemData.id);
              setWorkflowStage('config');
              
              // Auto-populate the design prompt with rich context
              const contextParts = [
                `"${workItemData.title}"`,
                workItemData.description ? `Description: ${workItemData.description}` : '',
                workItemData.priority ? `Priority: ${workItemData.priority}` : '',
                workItemData.type ? `Type: ${workItemData.type}` : ''
              ].filter(Boolean);
              
              const autoPrompt = `Create a modern, responsive UI component for ${contextParts.join('. ')}.`;
              setDesignPrompt(autoPrompt);
              
              console.log('🎯 Design prompt auto-generated:', autoPrompt);
            }
          }
          
          // Clear the session storage after using it
          sessionStorage.removeItem('selectedWorkItem');
          sessionStorage.removeItem('selectedWorkItemTab');
          sessionStorage.removeItem('designAutoAdvance');
          
        } catch (error) {
          console.error('❌ Failed to parse stored work item data:', error);
        }
      } else {
        console.log('🔍 Design Page - No stored work item found, starting fresh');
      }
    }
  }, []);

  // Combine all work items from stores
  const allWorkItems = React.useMemo(() => {
    const combinedItems: Array<any> = [];
    
    // Add initiatives (with portfolioId and businessBriefId for grouping)
    initiatives.forEach(item => {
      combinedItems.push({
        ...item,  // Include all fields from initiative
        type: 'initiative'
      });
    });
    
    // Add features
    features.forEach(item => {
      combinedItems.push({
        ...item,  // Include all fields from feature
        type: 'feature'
      });
    });
    
    // Add epics
    epics.forEach(item => {
      combinedItems.push({
        ...item,  // Include all fields from epic
        type: 'epic'
      });
    });
    
    // Add stories
    stories.forEach(item => {
      combinedItems.push({
        ...item,  // Include all fields from story
        type: 'story'
      });
    });
    
    console.log('📊 Design Page - Combined work items:', {
      total: combinedItems.length,
      initiatives: combinedItems.filter(item => item.type === 'initiative').length,
      features: combinedItems.filter(item => item.type === 'feature').length,
      epics: combinedItems.filter(item => item.type === 'epic').length,
      stories: combinedItems.filter(item => item.type === 'story').length
    });
    
    // Log parent-child relationship counts for debugging
    const featuresWithParent = combinedItems.filter(item => item.type === 'feature' && (item as any).initiativeId);
    const epicsWithParent = combinedItems.filter(item => item.type === 'epic' && (item as any).featureId);
    const storiesWithParent = combinedItems.filter(item => item.type === 'story' && (item as any).epicId);
    
    console.log('📊 Parent-child relationships:', {
      featuresWithParent: featuresWithParent.length,
      epicsWithParent: epicsWithParent.length,
      storiesWithParent: storiesWithParent.length
    });
    
    // Fall back to mock data if no items from stores
    return combinedItems.length > 0 ? combinedItems : mockWorkItems.map(item => ({
      ...item,
      type: item.type || 'unknown'
    }));
  }, [initiatives, features, epics, stories]);

  // Debug effect to log selectedTab changes
  useEffect(() => {
    console.log('🔍 V1 Design - selectedTab changed to:', selectedTab);
  }, [selectedTab]);

  // Effect to ensure preview is updated when switching to preview mode
  useEffect(() => {
    if (previewMode === 'preview' && generatedCode && generatedCode.html.length > 0) {
      console.log('🔄 [PREVIEW-MODE] Preview mode activated, refreshing content...');
      setTimeout(() => updatePreview(generatedCode), 100);
    }
  }, [previewMode, generatedCode]);

  // Viewport dimensions
  const viewportDimensions = {
    desktop: { width: '100%', height: '700px' },
    tablet: { width: '768px', height: '700px' },
    mobile: { width: '375px', height: '700px' }
  };

  // Utility function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:image/jpeg;base64, prefix to get just the base64 data
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Design Generation Functions (existing)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDesignImage(file);
    }
  };

  const handleWorkItemImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setWorkItemImage(file);
    }
  };

  const handleWorkItemImageDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleWorkItemImageDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setWorkItemImage(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setDesignImage(file);
    }
  };

  // Reverse Engineering Functions
  const handleReverseDesignFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setReverseConfig(prev => ({ ...prev, designFiles: files }));
  };

  const handleReverseImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReverseConfig(prev => ({ ...prev, designImage: file }));
    }
  };

  const reverseEngineerDesign = async () => {
    if (!reverseConfig.inputType || 
        (reverseConfig.inputType === 'figma' && !reverseConfig.figmaUrl) ||
        (reverseConfig.inputType === 'image' && !reverseConfig.designImage) ||
        (reverseConfig.inputType === 'upload' && reverseConfig.designFiles.length === 0)) {
      alert('Please provide design input for reverse engineering.');
      return;
    }

    setIsReverseEngineering(true);
    setReverseProgress(0);
    setReverseEngineeredItems(null);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setReverseProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 400);

      // Prepare design content for analysis
      let designData = '';
      let imageData = '';
      let imageType = '';
      let fileData: { filename: string; content: string }[] = [];

      if (reverseConfig.inputType === 'figma') {
        designData = `Figma URL: ${reverseConfig.figmaUrl}`;
      } else if (reverseConfig.inputType === 'image' && reverseConfig.designImage) {
        imageData = await fileToBase64(reverseConfig.designImage);
        imageType = reverseConfig.designImage.type;
        designData = `Design Image: ${reverseConfig.designImage.name}`;
      } else if (reverseConfig.inputType === 'upload') {
        for (const file of reverseConfig.designFiles) {
          if (file.type.startsWith('image/')) {
            const content = await fileToBase64(file);
            fileData.push({ filename: file.name, content });
            designData += `\n\nDesign File: ${file.name}`;
          }
        }
      }

      console.log('[DESIGN-REVERSE] Starting design reverse engineering with:', {
        inputType: reverseConfig.inputType,
        analysisLevel: reverseConfig.analysisLevel,
        filesCount: reverseConfig.designFiles.length,
        hasImage: !!imageData
      });

      // Call the design reverse engineering API
      const response = await fetch('/api/reverse-engineer-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputType: reverseConfig.inputType,
          figmaUrl: reverseConfig.figmaUrl,
          designData,
          imageData,
          imageType,
          fileData,
          analysisLevel: reverseConfig.analysisLevel,
          extractUserFlows: reverseConfig.extractUserFlows,
          includeAccessibility: reverseConfig.includeAccessibility,
          useRealLLM: useRealLLMForReverse,
          reverseEngineeringSettings: reverseEngineeringLLMSettings
        }),
      });

      console.log('[DESIGN-REVERSE] API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[DESIGN-REVERSE] API Response:', result);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setReverseProgress(100);
      
      if (result.success && result.data) {
        setReverseEngineeredItems(result.data);
      } else {
        throw new Error(result.message || 'Failed to reverse engineer design');
      }
    } catch (error) {
      console.error('Error reverse engineering design:', error);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      // Mock fallback data
      const mockReverseEngineered: ReverseEngineeredDesignItems = {
        analysisDepth: reverseConfig.analysisLevel,
        extractedInsights: `Visual analysis of ${reverseConfig.inputType} design reveals sophisticated user interface patterns with modern design principles, clear information hierarchy, and intuitive user workflows.`,
        designAnalysis: `The design demonstrates professional UI/UX practices with consistent visual elements, proper spacing, and user-centric layout. Key interface components include navigation systems, content areas, interactive elements, and responsive design patterns.`,
        userFlows: reverseConfig.extractUserFlows ? [
          'User registration and onboarding flow',
          'Main navigation and content discovery',
          'Primary action completion workflow',
          'Settings and profile management'
        ] : undefined,
        accessibilityInsights: reverseConfig.includeAccessibility ? [
          'Color contrast meets WCAG standards',
          'Proper heading hierarchy for screen readers',
          'Interactive elements have sufficient touch targets',
          'Focus states and keyboard navigation support'
        ] : undefined,
        businessBrief: reverseConfig.analysisLevel === 'business-brief' ? {
          id: 'BB-DESIGN-REV-001',
          title: 'UI/UX Design Business Brief',
          description: 'Business context extracted from visual design analysis',
          businessObjective: 'Create an intuitive, user-friendly interface that drives engagement and conversion',
          quantifiableBusinessOutcomes: ['Increase user engagement by 35%', 'Improve conversion rates by 20%', 'Reduce user drop-off by 30%']
        } : undefined,
        initiatives: ['initiative', 'business-brief'].includes(reverseConfig.analysisLevel) ? [{
          id: 'INIT-DESIGN-REV-001',
          title: 'User Experience Enhancement Initiative',
          description: 'Initiative extracted from design patterns and user interface analysis'
        }] : undefined,
        features: ['feature', 'initiative', 'business-brief'].includes(reverseConfig.analysisLevel) ? [{
          id: 'FEAT-DESIGN-REV-001',
          title: 'Interactive User Interface Feature',
          description: 'User interface components and interaction patterns identified in design'
        }] : undefined,
        epics: ['epic', 'feature', 'initiative', 'business-brief'].includes(reverseConfig.analysisLevel) ? [{
          id: 'EPIC-DESIGN-REV-001',
          title: 'User Interface Design Epic',
          description: 'Complete user interface implementation based on design specifications'
        }] : undefined,
        stories: [{
          id: 'STORY-DESIGN-REV-001',
          title: 'As a user, I want an intuitive navigation system',
          description: 'User navigation functionality extracted from design analysis'
        }]
      };
      
      setReverseEngineeredItems(mockReverseEngineered);
    } finally {
      setTimeout(() => {
        setIsReverseEngineering(false);
        setReverseProgress(0);
      }, 1000);
    }
  };

  const saveReverseEngineeredDesignItems = () => {
    if (!reverseEngineeredItems) return;
    
    try {
      let savedCount = 0;
      
      // Save Business Brief as Use Case
      if (reverseEngineeredItems.businessBrief) {
        const useCase = {
          id: reverseEngineeredItems.businessBrief.id,
          title: reverseEngineeredItems.businessBrief.title,
          description: reverseEngineeredItems.businessBrief.description,
          businessObjective: reverseEngineeredItems.businessBrief.businessObjective,
          quantifiableBusinessOutcomes: reverseEngineeredItems.businessBrief.quantifiableBusinessOutcomes,
          inScope: 'UI/UX Design Implementation, User Interface Components, User Experience Flows',
          impactOfDoNothing: 'Poor user experience, reduced engagement, lower conversion rates',
          happyPath: 'Users interact with intuitive interface, complete tasks efficiently, high satisfaction',
          exceptions: 'Design inconsistencies, Accessibility issues, Mobile responsiveness problems',
          impactedEndUsers: 'End users, Design team, Development team, Product stakeholders',
          changeImpactExpected: 'Significant improvement in user experience and interface usability',
          businessBriefId: reverseEngineeredItems.businessBrief.id,
          acceptanceCriteria: ['Design implementation matches specifications', 'User experience flows work smoothly'],
          businessValue: 'Enhanced user experience drives engagement and business outcomes',
          submittedBy: 'Design Reverse Engineering System',
          priority: 'high' as 'low' | 'medium' | 'high' | 'critical',
          status: 'submitted' as 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          tags: ['reverse-engineered', 'design', 'ui-ux'],
          notes: `Extracted from design analysis: ${reverseEngineeredItems.extractedInsights}`
        };
        
        addUseCase(useCase);
        savedCount++;
      }

      // Save other work items (similar to code reverse engineering)
      if (reverseEngineeredItems.initiatives) {
        reverseEngineeredItems.initiatives.forEach(initiative => {
          const initiativeData = {
            ...initiative,
            businessBriefId: reverseEngineeredItems.businessBrief?.id || 'BB-DESIGN-REV-DEFAULT',
            priority: initiative.priority || 'medium',
            status: 'planned',
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            tags: ['reverse-engineered', 'design']
          };
          
          addInitiative(initiativeData);
          savedCount++;
        });
      }

      // Save Features, Epics, Stories (similar pattern)
      // ... (similar implementation as in code reverse engineering)

      // Show success notification
      notify.success(
        'Design Reverse Engineering Complete',
        `Successfully saved ${savedCount} work items extracted from design analysis. Check other tabs to see the items.`
      );

      // Clear the reverse engineering results
      setReverseEngineeredItems(null);
      setReverseConfig({
        inputType: 'image',
        figmaUrl: '',
        designImage: null,
        designFiles: [],
        analysisLevel: 'story',
        extractUserFlows: true,
        includeAccessibility: true
      });

      console.log('[DESIGN-REVERSE] Successfully saved', savedCount, 'work items to stores');
      
    } catch (error) {
      console.error('[DESIGN-REVERSE] Error saving work items:', error);
      notify.error(
        'Save Failed',
        'Failed to save reverse engineered work items. Please try again.'
      );
    }
  };



  const generateCodeFromDesign = async () => {
    if (!designImage && !figmaUrl && !selectedWorkItem) {
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Show AI progress modal with thinking animation
    const generationMode = useRealLLMForGeneration ? 'AI is analyzing' : 'Mock system is generating';
    setAiProgressMessage(`${generationMode} your design requirements...`);
    setIsAiProgressModalOpen(true);
    
    // Brief delay to ensure smooth modal transition
    await new Promise(resolve => setTimeout(resolve, 300));

    // Declare progressInterval outside try-catch so it's accessible in both blocks
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval!);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare the request payload
      let prompt = '';
      let context = '';
      let imageData = '';
      let imageType = '';
      
      if (selectedTab === 'figma') {
        if (designImage) {
          context = `Design file: ${designImage.name}`;
          prompt = `Generate a modern, responsive web component based on the uploaded design image. ${designPrompt || 'Create a clean, professional implementation with proper styling and interactions.'}`;
          
          // Convert image to base64 with enhanced error handling
          try {
            console.log('🖼️ Converting image to base64...', { name: designImage.name, size: designImage.size, type: designImage.type });
            imageData = await fileToBase64(designImage);
            imageType = designImage.type;
            console.log('✅ Image converted to base64 successfully', { length: imageData.length });
          } catch (imageError) {
            console.error('❌ Image conversion failed:', imageError);
            throw new Error(`Failed to process image: ${imageError instanceof Error ? imageError.message : 'Unknown image error'}`);
          }
        } else if (figmaUrl) {
          context = `Figma URL: ${figmaUrl}`;
          prompt = `Generate a modern, responsive web component based on the Figma design at the provided URL. ${designPrompt || 'Create a clean, professional implementation with proper styling and interactions.'}`;
        }
      } else {
        const workItem = allWorkItems.find(item => item.id === selectedWorkItem);
        if (workItem) {
          context = `Work Item: ${workItem.title}`;
          let workItemPrompt = `Generate a modern, responsive web component for the work item "${workItem.title}". 
          
Description: ${workItem.description}
Requirements: Create a user interface that addresses the work item requirements.`;

          // If work item has an uploaded image, include it in the context
          if (workItemImage) {
            context += ` | Reference Design: ${workItemImage.name}`;
            workItemPrompt += `

VISUAL REFERENCE & DESIGN ANALYSIS: I have provided a design reference image that MUST be analyzed comprehensively to extract and replicate its visual characteristics. Please carefully examine the uploaded image and extract the following design elements:

🎨 **COLOR PALETTE ANALYSIS**:
- Primary colors (backgrounds, main elements)
- Secondary colors (accents, highlights)
- Text colors (headings, body text, links)
- Border colors and gradients
- Extract exact hex codes where possible

🖋️ **TYPOGRAPHY & FONTS**:
- Font families used (serif, sans-serif specific names if identifiable)
- Font weights (light, regular, medium, bold)
- Font sizes and hierarchy (headings, body text, captions)
- Letter spacing and line height patterns
- Text alignment and formatting

🏗ī¸ **LAYOUT & STRUCTURE**:
- Grid system and spacing patterns
- Component arrangement and hierarchy
- Padding and margin patterns
- Container widths and responsive breakpoints
- Element proportions and sizing

🎭 **VISUAL STYLE & THEME**:
- Overall design aesthetic (modern, minimal, corporate, playful, etc.)
- Button styles (rounded corners, shadows, hover effects)
- Card/container styling (borders, shadows, backgrounds)
- Icon styles and treatments
- Animation and interaction patterns

CRITICAL REQUIREMENT: The generated component MUST visually match the uploaded design image as closely as possible while fulfilling the work item requirements. Prioritize visual fidelity to the design image over generic styling choices.`;

            // Convert work item image to base64 with enhanced error handling
            try {
              console.log('🖼️ Converting work item image to base64...', { name: workItemImage.name, size: workItemImage.size, type: workItemImage.type });
              imageData = await fileToBase64(workItemImage);
              imageType = workItemImage.type;
              console.log('✅ Work item image converted to base64 successfully', { length: imageData.length });
            } catch (imageError) {
              console.error('❌ Work item image conversion failed:', imageError);
              throw new Error(`Failed to process work item image: ${imageError instanceof Error ? imageError.message : 'Unknown image error'}`);
            }
          }

          prompt = workItemPrompt + `
${designPrompt || 'Focus on user experience, accessibility, and modern design patterns.'}`;
        }
      }

      // Get V1 module LLM settings for design generation
      const primaryLLM = getV1ModuleLLM('design', 'primary');
      const backupLLM = getV1ModuleLLM('design', 'backup');
      
      console.log('[DESIGN] Using V1 LLM settings:', {
        primary: `${primaryLLM.provider} - ${primaryLLM.model}`,
        backup: `${backupLLM.provider} - ${backupLLM.model}`
      });

      // Call enhanced API with retry mechanism (Google -> OpenAI fallback)
      const response = await fetch('/api/generate-design-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          framework: 'react',
          includeResponsive: true,
          includeAccessibility: true,
          imageData: imageData || undefined,
          imageType: imageType || undefined,
          preferredProvider: 'google', // Legacy fallback preference
          useRealLLM: useRealLLMForGeneration,
          // V1 Module LLM Settings
          primaryProvider: primaryLLM.provider,
          primaryModel: primaryLLM.model,
          backupProvider: backupLLM.provider,
          backupModel: backupLLM.model
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('🎨 [DESIGN-GENERATION] Full API response:', result);
      console.log('🎨 [DESIGN-GENERATION] Response data structure:', {
        hasData: !!result.data,
        hasCode: !!result.data?.code,
        codeKeys: result.data?.code ? Object.keys(result.data.code) : 'No code object',
        dataKeys: result.data ? Object.keys(result.data) : 'No data object'
      });
      
      clearInterval(progressInterval!);
      setGenerationProgress(100);
      
      // Use the generated code from the API (with retry/fallback handled at API level)
      if (result.success && result.data && result.data.code) {
        console.log('🎨 [DESIGN-GENERATION] Parsing generated code from API response...');
        
        // Update progress message to show completion
        setAiProgressMessage('Generation complete! Preparing design preview...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const realCode: GeneratedCode = {
          framework: result.data.framework || 'react',
          html: result.data.code.html || '',
          css: result.data.code.css || '',
          javascript: result.data.code.javascript || '',
        };
        
        console.log('🎨 [DESIGN-GENERATION] Parsed code structure:', {
          htmlLength: realCode.html.length,
          cssLength: realCode.css.length,
          jsLength: realCode.javascript.length,
          framework: realCode.framework,
          htmlPreview: realCode.html.substring(0, 500) + '...',
          fullHtmlContent: realCode.html // Log the complete HTML for debugging
        });
        
        setGeneratedCode(realCode);
        
        // Update iframe preview with enhanced logging
        setTimeout(() => {
          console.log('🖼️ [DESIGN-GENERATION] Updating preview iframe...');
          updatePreview(realCode);
        }, 100);

        // Close progress modal and transition to generated stage
        setIsAiProgressModalOpen(false);
        
        // If we're in work-item workflow, transition to generated stage
        if (selectedTab === 'work-item' && selectedWorkItemForDesign) {
          setWorkflowStage('generated');
          setPreviewMode('preview');
        }
        
        // Show success message with provider info
        if (result.data.provider) {
          console.log(`🎉 Design generated successfully using ${result.data.provider}${result.data.usedFallback ? ' (fallback)' : ''}!`);
          
          // Show user notification about which provider was used
          if (result.data.provider === 'OpenAI') {
            console.log(`🔄 Used OpenAI as fallback (Google temporarily unavailable). Next retry will attempt Google first again.`);
          } else if (result.data.provider === 'Mock') {
            console.log(`⚠️ Used mock response (all LLM providers temporarily unavailable)`);
          }
        }
      } else {
        throw new Error(result.message || 'API returned success but no data');
      }
      
    } catch (error) {
      console.error('Error generating code:', error);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      // Close progress modal on error
      setIsAiProgressModalOpen(false);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`❌ Design generation failed: ${errorMessage}\n\nThe system will automatically retry with different providers. Please try again or check your API keys in settings.`);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1000);
    }
  };

  const updatePreview = (code: GeneratedCode) => {
    console.log('🖼️ [PREVIEW-UPDATE] Starting preview update...', {
      hasIframe: !!previewRef.current,
      htmlLength: code.html.length,
      cssLength: code.css.length,
      jsLength: code.javascript.length,
      framework: code.framework
    });
    
    if (!previewRef.current) {
      console.error('❌ [PREVIEW-UPDATE] No iframe reference found');
      return;
    }
    
    const iframe = previewRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) {
      console.error('❌ [PREVIEW-UPDATE] Cannot access iframe document');
      return;
    }
    
    console.log('🖼️ [PREVIEW-UPDATE] Iframe document accessible, analyzing HTML content...');
    
    // Check if the generated code is a complete HTML document
    const isCompleteDocument = code.html.includes('<!DOCTYPE html>') || code.html.includes('<html');
    console.log('🖼️ [PREVIEW-UPDATE] HTML analysis:', {
      isCompleteDocument,
      htmlStartsWithDoctype: code.html.startsWith('<!DOCTYPE'),
      containsHtmlTag: code.html.includes('<html'),
      htmlPreview: code.html.substring(0, 300)
    });
    
    try {
      let finalHtml = '';
      
      if (isCompleteDocument) {
        console.log('📄 [PREVIEW-UPDATE] Using complete HTML document as-is');
        finalHtml = code.html;
      } else {
        console.log('🔧 [PREVIEW-UPDATE] Wrapping component in HTML structure');
        // If it's just a component, wrap it in a proper HTML structure
        finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
      body {
        margin: 0;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #f9fafb;
      }
      ${code.css}
    </style>
</head>
<body>
    ${code.html}
    ${code.javascript ? `<script>${code.javascript}</script>` : ''}
</body>
</html>`;
      }
      
      console.log('📝 [PREVIEW-UPDATE] Final HTML to be rendered:', {
        htmlLength: finalHtml.length,
        htmlPreview: finalHtml.substring(0, 1000),
        containsBody: finalHtml.includes('<body'),
        containsContent: finalHtml.includes('</body>') && finalHtml.indexOf('</body>') > finalHtml.indexOf('<body') + 10
      });
      
      // Clear any existing content and write new content
      iframeDoc.open();
      iframeDoc.write(finalHtml);
      iframeDoc.close();
      
      // Also try setting srcDoc as a fallback
      setTimeout(() => {
        if (iframe.contentDocument?.body?.children.length === 0) {
          console.log('🔄 [PREVIEW-UPDATE] Iframe body still empty, trying srcDoc fallback...');
          iframe.srcdoc = finalHtml;
        }
      }, 500);
      
      console.log('✅ [PREVIEW-UPDATE] Preview updated successfully');
      
      // Add iframe load event listener for additional debugging
      iframe.onload = () => {
        console.log('🖼️ [PREVIEW-UPDATE] Iframe loaded successfully');
        try {
          const iframeBody = iframeDoc.body;
          const iframeHead = iframeDoc.head;
          if (iframeBody) {
            console.log('📊 [PREVIEW-UPDATE] Iframe content stats:', {
              bodyInnerHTMLLength: iframeBody.innerHTML.length,
              bodyChildren: iframeBody.children.length,
              bodyText: iframeBody.textContent?.substring(0, 200) + '...',
              bodyHTML: iframeBody.innerHTML.substring(0, 300) + '...',
              headChildren: iframeHead?.children.length || 0,
              documentTitle: iframeDoc.title,
              documentReadyState: iframeDoc.readyState
            });
            
            // Check for any script errors in the iframe
            if (iframe.contentWindow) {
              iframe.contentWindow.onerror = (msg, url, line, col, error) => {
                console.error('🚨 [IFRAME-ERROR] Script error in preview:', { msg, url, line, col, error });
              };
            }
          }
        } catch (e) {
          console.log('ℹ️ [PREVIEW-UPDATE] Cannot access iframe content (normal for cross-origin)', e);
        }
      };
      
    } catch (error) {
      console.error('❌ [PREVIEW-UPDATE] Error updating preview:', error);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadCode = () => {
    if (!generatedCode) return;
    
    const content = `// Generated Design Component
${generatedCode.javascript}

/* Styles */
${generatedCode.css}

<!-- HTML Template -->
${generatedCode.html}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-component.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Workflow stage handlers
  const handleWorkItemSelect = (workItemId: string) => {
    setSelectedWorkItemForDesign(workItemId);
  };

  const handleDesignClick = () => {
    setWorkflowStage('config');
  };

  const handleBackToTable = () => {
    setWorkflowStage('table');
    setSelectedWorkItemForDesign('');
    setGeneratedCode(null);
  };

  const handleSaveDesign = () => {
    if (generatedCode && selectedWorkItemForDesign) {
      setSavedDesigns(prev => ({
        ...prev,
        [selectedWorkItemForDesign]: generatedCode
      }));
      
      // Show success notification
      notify.success(
        'Design Saved',
        'Design has been saved to the work item successfully!'
      );
      
      // Go back to table view
      handleBackToTable();
    }
  };

  const handleCodeDesign = () => {
    if (generatedCode && selectedWorkItemForDesign) {
      // First save the design
      setSavedDesigns(prev => ({
        ...prev,
        [selectedWorkItemForDesign]: generatedCode
      }));
      
      // Store the design context in session storage for the code tab
      sessionStorage.setItem('designContext', JSON.stringify({
        workItemId: selectedWorkItemForDesign,
        generatedDesign: generatedCode,
        designSaved: true
      }));
      
      // Navigate to the code tab
      window.location.href = '/v1/code';
    } else {
      notify.error('Code Design', 'Please generate a design first before proceeding to code generation.');
    }
  };

  const handleViewSavedDesign = (workItemId: string) => {
    const savedDesign = savedDesigns[workItemId];
    if (savedDesign) {
      setSelectedWorkItemForDesign(workItemId);
      setGeneratedCode(savedDesign);
      setWorkflowStage('generated');
      setPreviewMode('preview');
      setTimeout(() => updatePreview(savedDesign), 100);
    }
  };

  // Hierarchical table helper functions (from V1 requirements)
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getTypeIcon = (type: string, portfolioColor?: string) => {
    switch (type) {
      case 'portfolio': return <Building2 size={14} style={{color: portfolioColor || '#8B4513'}} />;
      case 'brief': return <FileText size={12} style={{color: '#CD853F'}} />;
      case 'initiative': return <Target size={12} style={{color: '#D4A843'}} />;  // Gold
      case 'feature': return <Layers size={12} style={{color: '#3B82F6'}} />;     // Blue
      case 'epic': return <BookOpen size={12} style={{color: '#8B5CF6'}} />;      // Purple
      case 'story': return <FileText size={12} style={{color: '#10B981'}} />;     // Green
      default: return <FileText size={12} className="text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "text-xs px-1.5 py-0.5 rounded-full font-medium";
    switch (priority) {
      case 'critical': return `${baseClasses} bg-red-100 text-red-800`;
      case 'high': return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'medium': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low': return `${baseClasses} bg-green-100 text-green-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-xs px-1.5 py-0.5 rounded-full font-medium";
    switch (status) {
      case 'completed': return `${baseClasses} bg-green-100 text-green-800`;
      case 'in_progress': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'planned': return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'backlog': return `${baseClasses} bg-gray-100 text-gray-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Group work items by portfolio and business brief (like V1 requirements)
  const groupedData = React.useMemo(() => {
    const portfolioMap = new Map(portfolios.map(p => [p.id, p]));
    const businessBriefMap = new Map(businessBriefs.map(bb => [bb.id, bb]));
    
    const byPortfolio: Record<string, any> = {};

    allWorkItems.filter(item => item.type === 'initiative').forEach(initiative => {
      // Get portfolioId directly from the initiative (loaded from database)
      const portfolioId = (initiative as any).portfolioId && (initiative as any).portfolioId.trim() !== '' ? (initiative as any).portfolioId : 'unassigned';
      const businessBriefId = (initiative as any).businessBriefId || 'unassigned';

      if (!byPortfolio[portfolioId]) {
        byPortfolio[portfolioId] = {
          portfolio: portfolioMap.get(portfolioId) || null,
          businessBriefs: {}
        };
      }

      if (!byPortfolio[portfolioId].businessBriefs[businessBriefId]) {
        byPortfolio[portfolioId].businessBriefs[businessBriefId] = {
          businessBrief: businessBriefMap.get(businessBriefId) || null,
          initiatives: []
        };
      }

      byPortfolio[portfolioId].businessBriefs[businessBriefId].initiatives.push(initiative);
    });

    return byPortfolio;
  }, [allWorkItems, portfolios, businessBriefs]);

  // Get child items for a work item
  const getChildItems = (item: any, type: string) => {
    console.log(`🔍 getChildItems called for ${type}:`, item.id, item.title);
    
    switch (type) {
      case 'initiative':
        const features = allWorkItems.filter(f => f.type === 'feature');
        const matchingFeatures = allWorkItems.filter(f => 
          f.type === 'feature' && (
            (f as any).initiativeId === item.id || 
            ((f as any).businessBriefId === (item as any).businessBriefId && !(f as any).initiativeId)
          )
        );
        console.log(`✅ Found ${matchingFeatures.length} features for initiative ${item.id}`);
        return matchingFeatures;
        
      case 'feature':
        const matchingEpics = allWorkItems.filter(e => 
          e.type === 'epic' && (
            (e as any).featureId === item.id || 
            ((e as any).businessBriefId === (item as any).businessBriefId && !(e as any).featureId)
          )
        );
        console.log(`✅ Found ${matchingEpics.length} epics for feature ${item.id}`);
        return matchingEpics;
        
      case 'epic':
        const matchingStories = allWorkItems.filter(s => 
          s.type === 'story' && (
            (s as any).epicId === item.id || 
            ((s as any).businessBriefId === (item as any).businessBriefId && !(s as any).epicId)
          )
        );
        console.log(`✅ Found ${matchingStories.length} stories for epic ${item.id}`);
        return matchingStories;
        
      default:
        return [];
    }
  };

  // Render a work item row (hierarchical)
  const renderWorkItem = (item: any, type: string, level: number = 0, parentId?: string) => {
    const childItems = getChildItems(item, type);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = childItems.length > 0;
    const isSelected = selectedWorkItemForDesign === item.id;
    const hasSavedDesign = savedDesigns[item.id];

    // Simple but unique key now that duplicates are prevented at source
    const uniqueKey = `${type}-${item.id}-L${level}-P${parentId || 'root'}`;

    return (
      <React.Fragment key={uniqueKey}>
        {/* Main row */}
        <div
          className={`group flex items-center px-2 py-2 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
            level > 0 ? 'bg-gray-25' : ''
          } ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleWorkItemSelect(item.id);
            }
          }}
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
            {/* Paint Palette Icon for saved designs */}
            {hasSavedDesign && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewSavedDesign(item.id);
                }}
                className="p-1 rounded hover:bg-blue-100 transition-colors"
                title="View saved design"
              >
                <Palette className="w-4 h-4 text-blue-600" />
              </button>
            )}
          </div>

          {/* Priority */}
          <div className="w-20 flex justify-center">
            <span className={getPriorityBadge(item.priority)}>
              {item.priority}
            </span>
          </div>

          {/* Status */}
          <div className="w-20 flex justify-center">
            <span className={getStatusBadge(item.status)}>
              {item.status}
            </span>
          </div>

          {/* Design Button */}
          <div className="w-24 flex justify-center">
            {isSelected ? (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDesignClick();
                }}
                className="h-7 px-2 text-xs"
              >
                <Palette className="w-3 h-3 mr-1" />
                Design
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWorkItemSelect(item.id);
                }}
                className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Select
              </Button>
            )}
          </div>
        </div>

        {/* Child items */}
        {isExpanded && hasChildren && (
          <>
            {childItems.map((childItem: any) =>
              renderWorkItem(childItem, 
                type === 'initiative' ? 'feature' : 
                type === 'feature' ? 'epic' : 
                type === 'epic' ? 'story' : 'unknown',
                level + 1,
                item.id // Pass parent ID for unique keys
              )
            )}
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className={`container mx-auto p-6 space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design Repository</h1>
          <p className="text-gray-600 text-sm">Generate and analyze UI/UX designs with AI-powered tools</p>
        </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Palette className="w-4 h-4 mr-1" />
            Design Phase
          </Badge>
      </div>

      {/* Main Tab Navigation - Moved higher */}
      <Tabs defaultValue="design-generation" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="design-generation" className="flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Design Generation
          </TabsTrigger>
          <TabsTrigger value="reverse-engineering" className="flex items-center">
            <BrainCircuit className="w-4 h-4 mr-2" />
            Reverse Engineering
          </TabsTrigger>
        </TabsList>

        {/* Design Generation Tab */}
        <TabsContent value="design-generation" className="mt-0">
          {/* Input Source Selection - Smaller and more refined */}
          <div className="mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Input Source:</span>
              <div className="flex gap-2">
                        <Button
                          variant={selectedTab === 'work-item' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedTab('work-item');
                            // Clear other tab's data when switching
                            setDesignImage(null);
                            setFigmaUrl('');
                    // Reset workflow to table stage
                    setWorkflowStage('table');
                    setSelectedWorkItemForDesign('');
                          }}
                  className="flex items-center gap-2 px-3 py-2"
                        >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Work Items</span>
                        </Button>
                        <Button
                          variant={selectedTab === 'figma' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedTab('figma');
                            // Clear other tab's data when switching
                            setSelectedWorkItem('');
                            setWorkItemImage(null);
                          }}
                  className="flex items-center gap-2 px-3 py-2"
                        >
                  <FileImage className="w-4 h-4" />
                  <span className="text-sm">Figma & Images</span>
                        </Button>
                      </div>
                      </div>
                    </div>

          {/* Conditional Layout based on selectedTab */}
          {selectedTab === 'work-item' ? (
            // Staged Workflow for Work Items
            <div className="space-y-6">
                            {/* Stage 1: Work Items Hierarchy Table (like V1 Requirements) */}
              {workflowStage === 'table' && (
                      <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target size={18} />
                      <h3 className="text-lg font-semibold text-gray-900">Work Items Hierarchy</h3>
                    </div>
                    <p className="text-sm text-gray-600">Select a work item to create a design</p>
                        </div>
                        

                        
                  {/* Hierarchical Table - Exact V1 Requirements Style */}
                  <Card>
                    <CardContent className="p-0">
                      {/* Table Header */}
                      <div className="flex items-center px-2 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700 sticky top-0 z-10">
                        <div className="w-6"></div> {/* Expand column */}
                        <div className="flex-1 min-w-0">Work Item</div>
                        <div className="w-20 text-center">Priority</div>
                        <div className="w-20 text-center">Status</div>
                        <div className="w-24 text-center">Design</div>
                      </div>

                      {/* Table Body */}
                      <div className="max-h-[500px] overflow-y-auto">
                      {Object.entries(groupedData).map(([portfolioId, portfolioGroup]) => (
                        <React.Fragment key={portfolioId}>
                          {/* Portfolio Header */}
                          <div 
                            className="flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 cursor-pointer"
                            onClick={() => toggleExpanded(`portfolio-${portfolioId}`)}
                          >
                            <button>
                              {expandedItems.has(`portfolio-${portfolioId}`) ? (
                                <ChevronDown size={14} className="text-gray-600" />
                              ) : (
                                <ChevronRight size={14} className="text-gray-600" />
                              )}
                            </button>
                            {getTypeIcon('portfolio', portfolioGroup.portfolio?.color)}
                            <div className="flex-1">
                              <div className="font-semibold text-sm">
                                {portfolioGroup.portfolio?.name || 'Unassigned Portfolio'}
                          </div>
                              <div className="text-xs text-gray-600">
                                {portfolioGroup.portfolio?.description || 'Items not assigned to any portfolio'}
                        </div>
                      </div>
                            <Badge variant="outline" className="text-xs">
                              {Object.values(portfolioGroup.businessBriefs).reduce((sum: number, bb: any) => sum + bb.initiatives.length, 0)} initiatives
                            </Badge>
                            </div>
                            
                          {/* Business Briefs & Initiatives */}
                          {expandedItems.has(`portfolio-${portfolioId}`) && 
                            Object.entries(portfolioGroup.businessBriefs).map(([businessBriefId, businessBriefGroup]: [string, any]) => (
                              <React.Fragment key={businessBriefId}>
                                {/* Business Brief Header */}
                                <div 
                                  className="flex items-center gap-3 px-6 py-2 bg-amber-50 border-b border-gray-100 cursor-pointer"
                                  onClick={() => toggleExpanded(`brief-${businessBriefId}`)}
                                >
                                  <button>
                                    {expandedItems.has(`brief-${businessBriefId}`) ? (
                                      <ChevronDown size={12} className="text-gray-500" />
                                    ) : (
                                      <ChevronRight size={12} className="text-gray-500" />
                                    )}
                                  </button>
                                  {getTypeIcon('brief')}
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {businessBriefGroup.businessBrief?.title || `Business Brief ${businessBriefId}`}
                                      </div>
                                        </div>
                                  <Badge variant="outline" className="text-xs">
                                    {businessBriefGroup.initiatives.length} init
                                        </Badge>
                                      </div>
                                      
                                {/* Initiatives */}
                                {expandedItems.has(`brief-${businessBriefId}`) &&
                                  businessBriefGroup.initiatives.map((initiative: any) =>
                                    renderWorkItem(initiative, 'initiative', 1, businessBriefId)
                                  )}
                              </React.Fragment>
                            ))}
                                                </React.Fragment>
                      ))}
                      </div>
                    </CardContent>
                  </Card>
                                      </div>
              )}

              {/* Stage 2: Design Configuration */}
              {workflowStage === 'config' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Design Configuration</h3>
                      <p className="text-sm text-gray-600">Configure design generation for selected work item</p>
                          </div>
                    <Button variant="outline" onClick={handleBackToTable}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Work Items
                                          </Button>
                                      </div>
                                      
                  {/* Enhanced Selected Work Item Display */}
                  {selectedWorkItemForDesign && (
                          <div className="bg-blue-50 px-3 py-2 rounded border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {allWorkItems.find(item => item.id === selectedWorkItemForDesign)?.type}
                        </Badge>
                        <span className="font-medium text-blue-900 text-sm">
                          {allWorkItems.find(item => item.id === selectedWorkItemForDesign)?.title}
                                </span>
                              </div>
                              {/* Auto-selection indicator */}
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-300">
                                <span className="mr-1">🚀</span>
                                Auto-selected from Work Items
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                  {/* Single Design Configuration Card */}
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Design Configuration
                      </CardTitle>
                      <CardDescription>
                        Configure design generation settings and requirements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Design Reference Upload & Requirements - Side by Side */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Design Reference Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🎨 Upload Design Reference
                          </label>
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                            onDragOver={handleWorkItemImageDragOver}
                            onDrop={handleWorkItemImageDrop}
                            onClick={() => workItemImageRef.current?.click()}
                          >
                            <input
                              ref={workItemImageRef}
                              type="file"
                              accept="image/*"
                              onChange={handleWorkItemImageUpload}
                              className="hidden"
                            />
                            {workItemImage ? (
                              <div className="space-y-2">
                                <FileImage className="w-6 h-6 text-green-600 mx-auto" />
                                <p className="text-xs font-medium text-green-700">{workItemImage.name}</p>
                                <p className="text-xs text-green-600">Click to change</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium text-blue-600">Upload</span> design reference
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Design Requirements */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Design Requirements
                          </label>
                          <Textarea
                            placeholder="Describe your design requirements, style preferences, or specific features..."
                            value={designPrompt}
                            onChange={(e) => setDesignPrompt(e.target.value)}
                            className="min-h-[120px]"
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Generation Controls */}
                      <div className="space-y-4">
                        {/* LLM Toggle */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-800 mb-2">⚙️ Generation Mode</h4>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="use-real-llm-workflow"
                              checked={useRealLLMForGeneration}
                              onChange={(e) => setUseRealLLMForGeneration(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="use-real-llm-workflow" className="text-sm text-yellow-700">
                              <span className="font-medium">Use Real LLM</span> (requires API key configuration)
                            </label>
                          </div>
                          <p className="text-xs text-yellow-600 mt-1">
                            {useRealLLMForGeneration 
                              ? "🔥 Using real AI for comprehensive design generation" 
                              : "🎭 Using mock generation for development/testing (no API costs)"
                            }
                          </p>
                        </div>

                        {/* Generate Button */}
                        <Button
                          onClick={() => {
                            setSelectedWorkItem(selectedWorkItemForDesign);
                            generateCodeFromDesign();
                          }}
                          disabled={isGenerating || !selectedWorkItemForDesign}
                          className="w-full"
                          size="lg"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating Design...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Design Code
                            </>
                          )}
                        </Button>
                        
                        {isGenerating && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>Analyzing design and generating code...</span>
                              <span>{generationProgress}%</span>
                            </div>
                            <Progress value={generationProgress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                      </div>
                    )}

              {/* Stage 3: Generated Design Code */}
              {workflowStage === 'generated' && generatedCode && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Generated Design Code</h3>
                      <p className="text-sm text-gray-600">Generated {generatedCode.framework} design code ready for implementation</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" onClick={handleBackToTable}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Work Items
                      </Button>
                      <Button onClick={handleSaveDesign}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Design
                      </Button>
                      <Button 
                        onClick={handleCodeDesign}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Code2 className="w-4 h-4 mr-2" />
                        Code Design
                      </Button>
                    </div>
                  </div>

                  {/* Inline Controls - All in one row */}
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                          <Button
                        variant="outline"
                            size="sm"
                        onClick={downloadCode}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant={previewMode === 'preview' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setPreviewMode('preview');
                          if (generatedCode) {
                            setTimeout(() => updatePreview(generatedCode), 100);
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant={previewMode === 'code' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('code')}
                      >
                        <Code2 className="w-4 h-4 mr-1" />
                        Code
                          </Button>
                        </div>
                    
                    {/* Viewport Controls */}
                    {previewMode === 'preview' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Viewport:</span>
                        <Button
                          variant={viewportType === 'desktop' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewportType('desktop')}
                        >
                          <Monitor className="w-4 h-4 mr-1" />
                          Desktop
                        </Button>
                        <Button
                          variant={viewportType === 'tablet' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewportType('tablet')}
                        >
                          <Tablet className="w-4 h-4 mr-1" />
                          Tablet
                        </Button>
                        <Button
                          variant={viewportType === 'mobile' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewportType('mobile')}
                        >
                          <Smartphone className="w-4 h-4 mr-1" />
                          Mobile
                        </Button>
                        <div className="text-xs text-gray-500 ml-2">
                          {viewportType === 'desktop' && 'Responsive'}
                          {viewportType === 'tablet' && '768px'}
                          {viewportType === 'mobile' && '375px'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Design Content */}
                  {previewMode === 'preview' ? (
                    <div className="space-y-4">
                      
                      {/* Preview Frame */}
                      <div className="border rounded-lg bg-gray-100 p-4 min-h-[400px] flex justify-center">
                        <div
                          className="bg-white rounded shadow-lg relative"
                          style={{
                            width: viewportDimensions[viewportType].width,
                            height: viewportDimensions[viewportType].height,
                            maxWidth: '100%',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <iframe
                            ref={previewRef}
                            className="w-full h-full border-0 rounded"
                            title="Design Preview"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            style={{ background: 'white' }}
                          />
                                  </div>
                                  </div>
                                </div>
                  ) : (
                    <Tabs defaultValue="html" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="css">CSS</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="html">
                        <div className="relative">
                                <Button
                            variant="outline"
                                  size="sm"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => copyToClipboard(generatedCode.html, 'html')}
                          >
                            {copied === 'html' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                                </Button>
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                            <code>{generatedCode.html}</code>
                          </pre>
                              </div>
                      </TabsContent>
                      
                      <TabsContent value="css">
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => copyToClipboard(generatedCode.css, 'css')}
                          >
                            {copied === 'css' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                            <code>{generatedCode.css}</code>
                          </pre>
                          </div>
                      </TabsContent>
                      
                      <TabsContent value="javascript">
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => copyToClipboard(generatedCode.javascript, 'javascript')}
                          >
                            {copied === 'javascript' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                            <code>{generatedCode.javascript}</code>
                          </pre>
                      </div>
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Standard Layout for Figma/Images
            <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {/* Design Configuration Section */}
            {!isFullscreen && (
              <div className="space-y-6">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Design Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your design generation settings and input source
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Figma & Images Tab */}
                    {selectedTab === 'figma' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Figma URL
                          </label>
                          <Input
                            placeholder="https://www.figma.com/file/..."
                            value={figmaUrl}
                            onChange={(e) => setFigmaUrl(e.target.value)}
                          />
                        </div>
                        
                        <div className="text-center text-sm text-gray-500">or</div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Design Image
                          </label>
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            {designImage ? (
                              <div className="space-y-2">
                                <FileImage className="w-8 h-8 text-green-600 mx-auto" />
                                <p className="text-sm font-medium text-green-700">{designImage.name}</p>
                                <p className="text-xs text-green-600">Click to change</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Design Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Design Requirements
                      </label>
                      <Textarea
                        placeholder="Describe your design requirements, style preferences, or specific features..."
                        value={designPrompt}
                        onChange={(e) => setDesignPrompt(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* LLM Toggle for Figma */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚙️ Generation Mode</h4>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="use-real-llm-figma"
                          checked={useRealLLMForGeneration}
                          onChange={(e) => setUseRealLLMForGeneration(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="use-real-llm-figma" className="text-sm text-yellow-700">
                          <span className="font-medium">Use Real LLM</span> (requires API key configuration)
                        </label>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        {useRealLLMForGeneration 
                          ? "🔥 Using real AI for comprehensive design generation" 
                          : "🎭 Using mock generation for development/testing (no API costs)"
                        }
                      </p>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateCodeFromDesign}
                      disabled={isGenerating || (!figmaUrl && !designImage)}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Design...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Design Code
                        </>
                      )}
                    </Button>
                    
                    {isGenerating && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Analyzing design and generating code...</span>
                          <span>{generationProgress}%</span>
                        </div>
                        <Progress value={generationProgress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Design Output Section */}
            <div className={`space-y-6 ${isFullscreen ? 'h-screen' : ''}`}>
              {generatedCode ? (
                <Card className={isFullscreen ? 'h-full flex flex-col' : ''}>
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Code2 className="w-5 h-5 mr-2" />
                        Generated Design Code
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadCode}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant={previewMode === 'preview' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setPreviewMode('preview');
                            // Re-render the preview when switching back to preview mode
                            if (generatedCode) {
                              setTimeout(() => updatePreview(generatedCode), 100);
                            }
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant={previewMode === 'code' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreviewMode('code')}
                        >
                          <Code2 className="w-4 h-4 mr-1" />
                          Code
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className="flex items-center"
                        >
                          {isFullscreen ? (
                            <>
                              <Minimize2 className="w-4 h-4 mr-1" />
                              Exit Fullscreen
                            </>
                          ) : (
                            <>
                              <Maximize2 className="w-4 h-4 mr-1" />
                              Fullscreen
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Generated {generatedCode.framework} design code ready for implementation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={isFullscreen ? 'flex-1 flex flex-col' : ''}>
                    {previewMode === 'preview' ? (
                      <div className={`space-y-4 ${isFullscreen ? 'flex-1 flex flex-col' : ''}`}>
                        {/* Viewport Controls */}
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Viewport:</span>
                            <Button
                              variant={viewportType === 'desktop' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setViewportType('desktop')}
                            >
                              <Monitor className="w-4 h-4 mr-1" />
                              Desktop
                            </Button>
                            <Button
                              variant={viewportType === 'tablet' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setViewportType('tablet')}
                            >
                              <Tablet className="w-4 h-4 mr-1" />
                              Tablet
                            </Button>
                            <Button
                              variant={viewportType === 'mobile' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setViewportType('mobile')}
                            >
                              <Smartphone className="w-4 h-4 mr-1" />
                              Mobile
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewportType === 'desktop' && 'Responsive'}
                            {viewportType === 'tablet' && '768px'}
                            {viewportType === 'mobile' && '375px'}
                          </div>
                        </div>
                        
                        {/* Preview Frame */}
                        <div className={`border rounded-lg bg-gray-100 p-4 ${isFullscreen ? 'flex-1' : 'min-h-[400px]'} flex justify-center`}>
                          <div
                            className="bg-white rounded shadow-lg relative"
                            style={{
                              width: viewportDimensions[viewportType].width,
                              height: isFullscreen ? '100%' : viewportDimensions[viewportType].height,
                              maxWidth: '100%',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <iframe
                              ref={previewRef}
                              className="w-full h-full border-0 rounded"
                              title="Design Preview"
                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                              style={{ background: 'white' }}
                            />
                            
                            {/* Debug overlay - only show when no content is loaded */}
                            {(!generatedCode || generatedCode.html.length === 0) && (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm pointer-events-none bg-white bg-opacity-80">
                                <div className="text-center">
                                  <div className="mb-2">🖼️ Generate design to see preview</div>
                                  <div className="text-xs">Upload an image and click Generate Design Code</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Tabs defaultValue="html" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="html">HTML</TabsTrigger>
                          <TabsTrigger value="css">CSS</TabsTrigger>
                          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="html">
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 z-10"
                              onClick={() => copyToClipboard(generatedCode.html, 'html')}
                            >
                              {copied === 'html' ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                              <code>{generatedCode.html}</code>
                            </pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="css">
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 z-10"
                              onClick={() => copyToClipboard(generatedCode.css, 'css')}
                            >
                              {copied === 'css' ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                              <code>{generatedCode.css}</code>
                            </pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="javascript">
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 z-10"
                              onClick={() => copyToClipboard(generatedCode.javascript, 'javascript')}
                            >
                              {copied === 'javascript' ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                              <code>{generatedCode.javascript}</code>
                            </pre>
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Palette className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Design</h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Upload a Figma design, provide an image, or select a work item to generate production-ready design code.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          )}
        </TabsContent>

        {/* Reverse Engineering Tab */}
        <TabsContent value="reverse-engineering" className="mt-6">
          <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {/* Reverse Engineering Configuration */}
            {!isFullscreen && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BrainCircuit className="w-5 h-5 mr-2" />
                      Design Reverse Engineering Configuration
                    </CardTitle>
                    <CardDescription>
                      Analyze visual designs to extract work items, user flows, and business requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Input Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Design Input Source
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant={reverseConfig.inputType === 'figma' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setReverseConfig(prev => ({ ...prev, inputType: 'figma' }))}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <LinkIcon className="w-5 h-5 mb-1" />
                          <span className="text-xs">Figma URL</span>
                        </Button>
                        <Button
                          variant={reverseConfig.inputType === 'image' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setReverseConfig(prev => ({ ...prev, inputType: 'image' }))}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <FileImage className="w-5 h-5 mb-1" />
                          <span className="text-xs">Single Image</span>
                        </Button>
                        <Button
                          variant={reverseConfig.inputType === 'upload' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setReverseConfig(prev => ({ ...prev, inputType: 'upload' }))}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <Upload className="w-5 h-5 mb-1" />
                          <span className="text-xs">Multiple Files</span>
                        </Button>
                      </div>
                    </div>

                    {/* Input Details */}
                    {reverseConfig.inputType === 'figma' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Figma URL
                        </label>
                        <Input
                          placeholder="https://www.figma.com/file/..."
                          value={reverseConfig.figmaUrl}
                          onChange={(e) => setReverseConfig(prev => ({ ...prev, figmaUrl: e.target.value }))}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Provide a public Figma file URL for analysis
                        </p>
                      </div>
                    )}

                    {reverseConfig.inputType === 'image' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Design Image
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReverseImageUpload}
                            className="hidden"
                            id="reverse-image-upload"
                          />
                          <label
                            htmlFor="reverse-image-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-blue-600 hover:text-blue-500">
                                Upload design image
                              </span>{' '}
                              or drag and drop
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </label>
                        </div>
                        
                        {reverseConfig.designImage && (
                          <div className="mt-3 flex items-center space-x-2 bg-green-50 p-2 rounded border border-green-200">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              {reverseConfig.designImage.name}
                            </span>
                            <span className="text-xs text-green-600">
                              ({(reverseConfig.designImage.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {reverseConfig.inputType === 'upload' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Multiple Design Files
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            ref={designUploadRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleReverseDesignFiles}
                            className="hidden"
                            id="reverse-files-upload"
                          />
                          <label
                            htmlFor="reverse-files-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-blue-600 hover:text-blue-500">
                                Upload design files
                              </span>{' '}
                              or drag and drop
                            </div>
                            <p className="text-xs text-gray-500">Multiple PNG, JPG, GIF files</p>
                          </label>
                        </div>
                        
                        {reverseConfig.designFiles.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {reverseConfig.designFiles.map((file, index) => (
                              <div key={index} className="flex items-center space-x-2 bg-green-50 p-2 rounded border border-green-200">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-700 font-medium">
                                  {file.name}
                                </span>
                                <span className="text-xs text-green-600">
                                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Analysis Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Analysis Level
                      </label>
                      <Select 
                        value={reverseConfig.analysisLevel} 
                        onValueChange={(value) => setReverseConfig(prev => ({ 
                          ...prev, 
                          analysisLevel: value as 'story' | 'epic' | 'feature' | 'initiative' | 'business-brief'
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select analysis depth" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="story">
                            <div className="flex items-center">
                              <Target className="w-4 h-4 mr-2" />
                              Story Level (UI User Stories)
                            </div>
                          </SelectItem>
                          <SelectItem value="epic">
                            <div className="flex items-center">
                              <Layers className="w-4 h-4 mr-2" />
                              Epic Level (Design Features)
                            </div>
                          </SelectItem>
                          <SelectItem value="feature">
                            <div className="flex items-center">
                              <FileCode2 className="w-4 h-4 mr-2" />
                              Feature Level (Interface Areas)
                            </div>
                          </SelectItem>
                          <SelectItem value="initiative">
                            <div className="flex items-center">
                              <GitBranch className="w-4 h-4 mr-2" />
                              Initiative Level (UX Goals)
                            </div>
                          </SelectItem>
                          <SelectItem value="business-brief">
                            <div className="flex items-center">
                              <BrainCircuit className="w-4 h-4 mr-2" />
                              Business Brief (Complete Context)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Higher levels include all lower levels (e.g., Business Brief includes everything)
                      </p>
                    </div>

                    {/* Analysis Options */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="extract-flows"
                          checked={reverseConfig.extractUserFlows}
                          onChange={(e) => setReverseConfig(prev => ({ ...prev, extractUserFlows: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="extract-flows" className="text-sm text-gray-700">
                          Extract User Flows
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include-accessibility"
                          checked={reverseConfig.includeAccessibility}
                          onChange={(e) => setReverseConfig(prev => ({ ...prev, includeAccessibility: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="include-accessibility" className="text-sm text-gray-700">
                          Accessibility Analysis 
                        </label>
                      </div>
                    </div>

                    {/* LLM Mode Toggle */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚙️ Analysis Mode</h4>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="use-real-llm-reverse"
                          checked={useRealLLMForReverse}
                          onChange={(e) => setUseRealLLMForReverse(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="use-real-llm-reverse" className="text-sm text-yellow-700">
                          <span className="font-medium">Use Real LLM</span> (requires API key configuration)
                        </label>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        {useRealLLMForReverse 
                          ? "🔥 Using real AI for comprehensive design analysis with product owner expertise" 
                          : "🎭 Using mock analysis for development/testing (no API costs)"
                        }
                      </p>
                    </div>

                    {/* Analyze Button */}
                    <Button
                      onClick={reverseEngineerDesign}
                      disabled={isReverseEngineering || (
                        (reverseConfig.inputType === 'figma' && !reverseConfig.figmaUrl) ||
                        (reverseConfig.inputType === 'image' && !reverseConfig.designImage) ||
                        (reverseConfig.inputType === 'upload' && reverseConfig.designFiles.length === 0)
                      )}
                      className="w-full"
                      size="lg"
                    >
                      {isReverseEngineering ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Design...
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="w-4 h-4 mr-2" />
                          Reverse Engineer Design
                        </>
                      )}
                    </Button>
                    
                    {isReverseEngineering && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Analyzing visual design and extracting requirements...</span>
                          <span>{reverseProgress}%</span>
                        </div>
                        <Progress value={reverseProgress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reverse Engineering Results */}
            <div className={`space-y-6 ${isFullscreen ? 'h-screen' : ''}`}>
              {reverseEngineeredItems ? (
                <Card className={isFullscreen ? 'h-full flex flex-col' : ''}>
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <BrainCircuit className="w-5 h-5 mr-2" />
                        Design Analysis Results
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {reverseEngineeredItems.analysisDepth}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveReverseEngineeredDesignItems}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Save Work Items
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="mt-1">
                      Extracted work items and business requirements from visual design analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={isFullscreen ? 'flex-1 flex flex-col overflow-auto' : ''}>
                    <div className="space-y-6">
                      {/* AI Analysis Summary Document */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          AI Design Analysis Summary
                        </h3>
                        <p className="text-blue-800 leading-relaxed mb-4">
                          {reverseEngineeredItems.extractedInsights}
                        </p>
                        <div className="border-t border-blue-200 pt-4">
                          <h4 className="font-medium text-blue-900 mb-2">Visual Design Analysis</h4>
                          <p className="text-blue-700 text-sm">
                            {reverseEngineeredItems.designAnalysis}
                          </p>
                        </div>
                      </div>

                      {/* User Flows */}
                      {reverseEngineeredItems.userFlows && reverseEngineeredItems.userFlows.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-2 flex items-center">
                            <GitBranch className="w-4 h-4 mr-2" />
                            Identified User Flows
                          </h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            {reverseEngineeredItems.userFlows.map((flow, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-600 mr-2">•</span>
                                {flow}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Accessibility Insights */}
                      {reverseEngineeredItems.accessibilityInsights && reverseEngineeredItems.accessibilityInsights.length > 0 && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <h4 className="font-medium text-amber-900 mb-2 flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            Accessibility Insights
                          </h4>
                          <ul className="text-sm text-amber-700 space-y-1">
                            {reverseEngineeredItems.accessibilityInsights.map((insight, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-amber-600 mr-2">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Work Items Hierarchy (Same as Code tab but with design context) */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Layers className="w-5 h-5 mr-2" />
                          Extracted Work Items
                        </h3>

                        {/* Business Brief */}
                        {reverseEngineeredItems.businessBrief && (
                          <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="bg-blue-50">
                              <CardTitle className="text-blue-900 flex items-center">
                                <BrainCircuit className="w-5 h-5 mr-2" />
                                Business Brief
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <span className="text-sm font-medium text-gray-500">ID:</span>
                                  <span className="ml-2 text-sm text-gray-900">{reverseEngineeredItems.businessBrief.id}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Title:</span>
                                  <span className="ml-2 text-sm font-medium text-gray-900">{reverseEngineeredItems.businessBrief.title}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Description:</span>
                                  <p className="mt-1 text-sm text-gray-700">{reverseEngineeredItems.businessBrief.description}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Business Objective:</span>
                                  <p className="mt-1 text-sm text-gray-700">{reverseEngineeredItems.businessBrief.businessObjective}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Quantifiable Outcomes:</span>
                                  <ul className="mt-1 text-sm text-gray-700 list-disc list-inside">
                                    {reverseEngineeredItems.businessBrief.quantifiableBusinessOutcomes?.map((outcome: string, index: number) => (
                                      <li key={index}>{outcome}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Initiatives */}
                        {reverseEngineeredItems.initiatives && reverseEngineeredItems.initiatives.length > 0 && (
                          <Card className="border-l-4 border-l-purple-500">
                            <CardHeader className="bg-purple-50">
                              <CardTitle className="text-purple-900 flex items-center">
                                <GitBranch className="w-5 h-5 mr-2" />
                                Initiatives ({reverseEngineeredItems.initiatives.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {reverseEngineeredItems.initiatives.map((initiative: any, index: number) => (
                                  <div key={initiative.id} className="border border-purple-200 rounded-lg p-3 bg-purple-25">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-purple-900">{initiative.title}</h4>
                                        <p className="text-sm text-purple-700 mt-1">{initiative.description}</p>
                                        <div className="flex items-center space-x-4 mt-2">
                                          <span className="text-xs text-purple-600">ID: {initiative.id}</span>
                                          <Badge variant="outline">{initiative.priority || 'medium'}</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Features */}
                        {reverseEngineeredItems.features && reverseEngineeredItems.features.length > 0 && (
                          <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="bg-green-50">
                              <CardTitle className="text-green-900 flex items-center">
                                <FileCode2 className="w-5 h-5 mr-2" />
                                Features ({reverseEngineeredItems.features.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {reverseEngineeredItems.features.map((feature: any, index: number) => (
                                  <div key={feature.id} className="border border-green-200 rounded-lg p-3 bg-green-25">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-green-900">{feature.title}</h4>
                                        <p className="text-sm text-green-700 mt-1">{feature.description}</p>
                                        <div className="flex items-center space-x-4 mt-2">
                                          <span className="text-xs text-green-600">ID: {feature.id}</span>
                                          <Badge variant="outline">{feature.priority || 'medium'}</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Epics */}
                        {reverseEngineeredItems.epics && reverseEngineeredItems.epics.length > 0 && (
                          <Card className="border-l-4 border-l-orange-500">
                            <CardHeader className="bg-orange-50">
                              <CardTitle className="text-orange-900 flex items-center">
                                <Layers className="w-5 h-5 mr-2" />
                                Epics ({reverseEngineeredItems.epics.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {reverseEngineeredItems.epics.map((epic: any, index: number) => (
                                  <div key={epic.id} className="border border-orange-200 rounded-lg p-3 bg-orange-25">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-orange-900">{epic.title}</h4>
                                        <p className="text-sm text-orange-700 mt-1">{epic.description}</p>
                                        <div className="flex items-center space-x-4 mt-2">
                                          <span className="text-xs text-orange-600">ID: {epic.id}</span>
                                          <Badge variant="outline">{epic.priority || 'medium'}</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Stories */}
                        {reverseEngineeredItems.stories && reverseEngineeredItems.stories.length > 0 && (
                          <Card className="border-l-4 border-l-red-500">
                            <CardHeader className="bg-red-50">
                              <CardTitle className="text-red-900 flex items-center">
                                <Target className="w-5 h-5 mr-2" />
                                User Stories ({reverseEngineeredItems.stories.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {reverseEngineeredItems.stories.map((story: any, index: number) => (
                                  <div key={story.id} className="border border-red-200 rounded-lg p-3 bg-red-25">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-red-900">{story.title}</h4>
                                        <p className="text-sm text-red-700 mt-1">{story.description}</p>
                                        {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                                          <div className="mt-2">
                                            <span className="text-xs font-medium text-red-600">Acceptance Criteria:</span>
                                            <ul className="text-xs text-red-600 list-disc list-inside mt-1">
                                              {story.acceptanceCriteria.map((criteria: string, idx: number) => (
                                                <li key={idx}>{criteria}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        <div className="flex items-center space-x-4 mt-2">
                                          <span className="text-xs text-red-600">ID: {story.id}</span>
                                          <Badge variant="outline">{story.priority || 'medium'}</Badge>
                                          {story.storyPoints && (
                                            <Badge variant="outline">{story.storyPoints} pts</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BrainCircuit className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze Design</h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Provide a Figma URL, upload design images, or select multiple files to extract business requirements and work items from visual designs.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      {!isFullscreen && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tips:</strong> For best design generation results, provide clear design files and specific requirements. 
            For reverse engineering, upload high-quality design images with clear interface elements for optimal work item extraction.
          </AlertDescription>
        </Alert>
      )}

      {/* AI Progress Modal - Thinking Model */}
      <Dialog open={isAiProgressModalOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BrainCircuit className="w-5 h-5 mr-2 animate-pulse text-blue-600" />
              AI Design Generation
            </DialogTitle>
            <DialogDescription>
              Please wait while AI processes your design requirements...
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <BrainCircuit className="w-8 h-8 text-blue-600 absolute top-4 left-4 animate-pulse" />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {aiProgressMessage || 'Initializing AI design generation...'}
              </p>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 