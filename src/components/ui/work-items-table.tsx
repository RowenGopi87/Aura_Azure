"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  ChevronDown, 
  Edit, 
  Trash2, 
  Wand2,
  ExternalLink,
  TestTube,
  Loader2,
  MoreHorizontal,
  Target,
  Layers,
  BookOpen,
  FileText,
  Building2,
  FileBarChart,
  Code,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WorkItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  category?: string;
  businessBriefId: string;
  portfolioId?: string;
  assignedTo?: string;
  acceptanceCriteria?: string[];
  businessValue?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Type-specific fields
  storyPoints?: number;
  sprintEstimate?: number;
  estimatedEffort?: string;
  labels?: string[];
}

interface Portfolio {
  id: string;
  name: string;
  description: string;
  function: string;
  color?: string;
}

interface BusinessBrief {
  id: string;
  title: string;
  businessBriefId: string;
}

interface WorkItemsTableProps {
  initiatives: WorkItem[];
  features: WorkItem[];
  epics: WorkItem[];
  stories: WorkItem[];
  portfolios: Portfolio[];
  businessBriefs: BusinessBrief[];
  onGenerateFeatures?: (initiativeId: string) => void;
  onGenerateEpics?: (featureId: string) => void;
  onGenerateStories?: (epicId: string) => void;
  onCreateInJira?: (initiativeId: string) => void;
  onEdit?: (item: WorkItem, type: string) => void;
  onDelete?: (id: string, type: string) => void;
  generatingItems?: Record<string, boolean>;
  creatingInJira?: Record<string, boolean>;
}

export function WorkItemsTable({
  initiatives,
  features,
  epics,
  stories,
  portfolios,
  businessBriefs,
  onGenerateFeatures,
  onGenerateEpics, 
  onGenerateStories,
  onCreateInJira,
  onEdit,
  onDelete,
  generatingItems = {},
  creatingInJira = {}
}: WorkItemsTableProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, item: WorkItem, type: string} | null>(null);

  // Get type icon with consistent sizing
  const getTypeIcon = (type: string, portfolioColor?: string) => {
    const iconProps = { size: 14, className: "flex-shrink-0" };
    switch (type) {
      case 'portfolio': return <Building2 {...iconProps} style={{color: portfolioColor || '#8B4513'}} />;
      case 'brief': return <FileBarChart {...iconProps} style={{color: '#CD853F'}} />;
      case 'initiative': return <Target {...iconProps} style={{color: '#D4A843'}} />;  // Gold
      case 'feature': return <Layers {...iconProps} style={{color: '#3B82F6'}} />;     // Blue 
      case 'epic': return <BookOpen {...iconProps} style={{color: '#8B5CF6'}} />;      // Purple
      case 'story': return <FileText {...iconProps} style={{color: '#10B981'}} />;     // Green
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

  // Toggle expanded state for hierarchical items
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, item: WorkItem, type: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type
    });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Group initiatives by portfolio, then by business brief
  const groupedData = React.useMemo(() => {
    const portfolioMap = new Map(portfolios.map(p => [p.id, p]));
    const businessBriefMap = new Map(businessBriefs.map(b => [b.id, b]));

    // Group by portfolio first
    const byPortfolio: Record<string, {
      portfolio: Portfolio | null;
      businessBriefs: Record<string, {
        businessBrief: BusinessBrief | null;
        initiatives: WorkItem[];
      }>;
    }> = {};

    initiatives.forEach(initiative => {
      const portfolioId = initiative.portfolioId && initiative.portfolioId.trim() !== '' ? initiative.portfolioId : 'unassigned';
      const businessBriefId = initiative.businessBriefId;
      
      if (!byPortfolio[portfolioId]) {
        byPortfolio[portfolioId] = {
          portfolio: portfolioId !== 'unassigned' ? portfolioMap.get(portfolioId) || null : null,
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
  }, [initiatives, portfolios, businessBriefs]);

  // Get child items for a work item
  const getChildItems = (item: WorkItem, type: string) => {
    switch (type) {
      case 'initiative':
        // For store-based data, we need to match by initiative ID in features
        // But features might not have initiativeId field, so use businessBriefId as fallback
        return features.filter(f => 
          (f as any).initiativeId === item.id || 
          (f.businessBriefId === item.businessBriefId && !(f as any).initiativeId)
        );
      case 'feature':
        // Similar logic for epics under features
        return epics.filter(e => 
          (e as any).featureId === item.id || 
          (e.businessBriefId === item.businessBriefId && !(e as any).featureId)
        );
      case 'epic':
        // Similar logic for stories under epics
        return stories.filter(s => 
          (s as any).epicId === item.id || 
          (s.businessBriefId === item.businessBriefId && !(s as any).epicId)
        );
      default:
        return [];
    }
  };

  // Navigation function with work item selection
  const router = useRouter();

  const handleDesignNavigation = (item: WorkItem, type: string) => {
    // Store the selected work item in sessionStorage to be picked up by Design page
    const workItemData = {
      id: item.id,
      title: item.title,
      description: item.description,
      type: type,
      priority: item.priority,
      status: item.status,
      businessBriefId: (item as any).businessBriefId, // Include business brief context
      portfolioId: (item as any).portfolioId, // Include portfolio context
    };
    
    console.log('🚀 Work Items → Design - Auto-navigation initiated for:', {
      title: workItemData.title,
      type: workItemData.type,
      id: workItemData.id
    });
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedWorkItem', JSON.stringify(workItemData));
      sessionStorage.setItem('selectedWorkItemTab', 'work-item');
      sessionStorage.setItem('designAutoAdvance', 'true'); // Flag for auto-advance
      console.log('📦 Session data stored - Design will auto-advance to config stage');
    }
    
    console.log('🚀 Navigating to Design Configuration...');
    router.push('/v1/design');
  };

  const handleCodeNavigation = (item: WorkItem, type: string) => {
    // Store the selected work item in sessionStorage to be picked up by Code page
    const workItemData = {
      id: item.id,
      title: item.title,
      description: item.description,
      type: type,
      priority: item.priority,
      status: item.status
    };
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedWorkItem', JSON.stringify(workItemData));
    }
    
    router.push('/v1/code');
  };

  // Render action buttons for work items (AI generation)
  const renderActionButtons = (item: WorkItem, type: string) => {
    const isGenerating = generatingItems[item.id] || false;
    
    // Determine primary action based on type with color styling
    const getPrimaryAction = () => {
      if (type === 'initiative' && onGenerateFeatures) {
        return {
          label: 'Generate Features',
          action: () => onGenerateFeatures(item.id),
          loading: isGenerating,
          bgColor: 'bg-green-600 hover:bg-green-700',
          textColor: 'text-white'
        };
      }
      if (type === 'feature' && onGenerateEpics) {
        return {
          label: 'Generate Epics',
          action: () => onGenerateEpics(item.id),
          loading: isGenerating,
          bgColor: 'bg-purple-600 hover:bg-purple-700',
          textColor: 'text-white'
        };
      }
      if (type === 'epic' && onGenerateStories) {
        return {
          label: 'Generate Stories',
          action: () => onGenerateStories(item.id),
          loading: isGenerating,
          bgColor: 'bg-blue-600 hover:bg-blue-700',
          textColor: 'text-white'
        };
      }
      return null;
    };

    const primaryAction = getPrimaryAction();

    return (
      <div className="flex justify-center">
        {/* Primary Action Button */}
        {primaryAction && (
          <Button
            variant="default"
            size="sm"
            className={`h-6 px-2 text-xs flex items-center gap-1 min-w-24 ${primaryAction.bgColor} ${primaryAction.textColor}`}
            onClick={(e) => { 
              e.stopPropagation(); 
              primaryAction.action(); 
            }}
            disabled={primaryAction.loading}
            title={primaryAction.label}
          >
            {primaryAction.loading ? (
              <>
                <Loader2 size={10} className="animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 size={10} />
                <span>{primaryAction.label.split(' ')[1]}</span>
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  // Render next step buttons for work items  
  const renderNextStepButtons = (item: WorkItem, type: string) => {
    const isCreatingJira = creatingInJira[item.id] || false;
    
    return (
      <div className="flex items-center gap-1 justify-center">
        {/* Design Button */}
        <Button
          variant="default"
          size="sm"
          className="h-6 px-2 text-xs flex items-center gap-1 bg-black hover:bg-gray-800 text-white"
          onClick={(e) => { 
            e.stopPropagation(); 
            handleDesignNavigation(item, type);
          }}
          title="🚀 Go to Design Configuration - Auto-selects this work item for design generation"
        >
          <Palette size={10} />
          <span>Design</span>
        </Button>

        {/* Code Button */}
        <Button
          variant="default"
          size="sm"
          className="h-6 px-2 text-xs flex items-center gap-1 bg-black hover:bg-gray-800 text-white"
          onClick={(e) => { 
            e.stopPropagation(); 
            handleCodeNavigation(item, type);
          }}
          title="Navigate to Code with this work item selected"
        >
          <Code size={10} />
          <span>Code</span>
        </Button>

        {/* Three Dots Menu for Other Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit?.(item, type)}>
              <Edit size={12} className="mr-2" />
              Edit {type.charAt(0).toUpperCase() + type.slice(1)}
            </DropdownMenuItem>
            
            {/* Create in Jira - for initiatives */}
            {type === 'initiative' && onCreateInJira && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onCreateInJira(item.id)}
                  disabled={isCreatingJira}
                  className="text-green-600"
                >
                  {isCreatingJira ? (
                    <Loader2 size={12} className="mr-2 animate-spin" />
                  ) : (
                    <ExternalLink size={12} className="mr-2" />
                  )}
                  {isCreatingJira ? 'Creating in Jira...' : 'Create in Jira'}
                </DropdownMenuItem>
              </>
            )}

            {/* Test Cases Generation */}
            <DropdownMenuItem 
              onClick={() => {/* TODO: Add test generation */}}
              className="text-green-600"
            >
              <TestTube size={12} className="mr-2" />
              Generate Test Cases
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete?.(item.id, type)} 
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 size={12} className="mr-2" />
              Delete {type.charAt(0).toUpperCase() + type.slice(1)}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // Render a work item row
  const renderWorkItem = (item: WorkItem, type: string, level: number = 0) => {
    const childItems = getChildItems(item, type);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = childItems.length > 0;

    return (
      <React.Fragment key={`${type}-${item.id}`}>
        {/* Main row */}
        <div
          className={`group flex items-center px-2 py-1 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${level > 0 ? 'bg-gray-25' : ''}`}
          style={{ marginLeft: `${level * 24}px` }}
          onContextMenu={(e) => handleContextMenu(e, item, type)}
          onClick={() => hasChildren && toggleExpanded(item.id)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onEdit?.(item, type);
          }}
          title="Double-click to edit"
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

          {/* Points */}
          <div className="w-12 text-xs text-gray-600 text-center">
            {item.storyPoints ? `${item.storyPoints}pt` : 
             item.sprintEstimate ? `${item.sprintEstimate}sp` : '-'}
          </div>

          {/* Actions */}
          <div className="w-36 flex justify-center">
            {renderActionButtons(item, type)}
          </div>

          {/* Next Step */}
          <div className="w-52 flex justify-center">
            {renderNextStepButtons(item, type)}
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target size={18} />
          Work Items Hierarchy
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="flex items-center px-2 py-1 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700 sticky top-0 z-10">
          <div className="w-6"></div> {/* Expand column */}
          <div className="flex-1 min-w-0">Work Item</div>
          <div className="w-16 text-center">Priority</div>
          <div className="w-16 text-center">Status</div>
          <div className="w-18 text-center">Assigned</div>
          <div className="w-12 text-center">Points</div>
          <div className="w-36 text-center">Actions</div>
          <div className="w-52 text-center">Next Step</div>
        </div>

        {/* Table Body */}
        <div className="max-h-[600px] overflow-y-auto">
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
                  {Object.values(portfolioGroup.businessBriefs).reduce((sum, bb) => sum + bb.initiatives.length, 0)} initiatives
                </Badge>
              </div>

              {/* Business Briefs & Initiatives */}
              {expandedItems.has(`portfolio-${portfolioId}`) && 
                Object.entries(portfolioGroup.businessBriefs).map(([businessBriefId, businessBriefGroup]) => (
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
                      businessBriefGroup.initiatives.map(initiative =>
                        renderWorkItem(initiative, 'initiative', 1)
                      )}
                  </React.Fragment>
                ))}
            </React.Fragment>
          ))}
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button 
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              onClick={() => { onEdit?.(contextMenu.item, contextMenu.type); setContextMenu(null); }}
            >
              <Edit size={12} />
              Edit {contextMenu.type}
            </button>
            <hr className="my-1" />
            <button 
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
              onClick={() => { onDelete?.(contextMenu.item.id, contextMenu.type); setContextMenu(null); }}
            >
              <Trash2 size={12} />
              Delete {contextMenu.type}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
