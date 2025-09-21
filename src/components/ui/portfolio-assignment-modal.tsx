"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain,
  Target,
  GripVertical,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  RotateCcw,
  Info
} from 'lucide-react';
import { useAudit } from "@/hooks/use-audit";

interface Portfolio {
  id: string;
  name: string;
  description: string;
  function: string;
  color?: string;
}

interface Initiative {
  id: string;
  title: string;
  description: string;
  businessValue?: string;
  portfolioId?: string | null;
  businessBriefId?: string;
  businessBriefTitle?: string;
}

interface PortfolioSuggestion {
  initiativeId: string;
  initiative: {
    title: string;
    description: string;
  };
  suggestion: {
    portfolioId: string | null;
    portfolio: Portfolio | null;
    confidence: number;
    reason: string;
  };
}

interface PortfolioAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initiatives: Initiative[];
  onAssignmentComplete: (assignments: { initiativeId: string; portfolioId: string }[]) => void;
  onAddInitiatives?: (newInitiatives: Initiative[]) => void;
}

export function PortfolioAssignmentModal({ 
  isOpen, 
  onClose, 
  initiatives, 
  onAssignmentComplete,
  onAddInitiatives 
}: PortfolioAssignmentModalProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [suggestions, setSuggestions] = useState<PortfolioSuggestion[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audit tracking
  const { trackGeneration, trackSave, trackAIEnhancement, isEnabled } = useAudit();
  
  // Debug audit state
  useEffect(() => {
    console.log('🔍 Audit system status:', { isEnabled });
  }, [isEnabled]);

  // Debug effect to track portfolio state changes
  useEffect(() => {
    console.log(`🗂️ Portfolio state updated: ${portfolios.length} portfolios`, portfolios);
  }, [portfolios]);
  
  // Drag and drop state
  const [draggedInitiative, setDraggedInitiative] = useState<Initiative | null>(null);
  
  // Local initiatives state to handle concurrent additions
  const [localInitiatives, setLocalInitiatives] = useState<Initiative[]>([]);
  const [newInitiativeCount, setNewInitiativeCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setLocalInitiatives(initiatives);
      if (initiatives.length > 0) {
        loadPortfolios();
        generateSuggestions();
      }
    }
  }, [isOpen, initiatives]);

  // Handle new initiatives being added during the session
  useEffect(() => {
    if (initiatives.length > localInitiatives.length) {
      const newInitiatives = initiatives.slice(localInitiatives.length);
      setLocalInitiatives(initiatives);
      setNewInitiativeCount(prev => prev + newInitiatives.length);
      
      // Generate suggestions for new initiatives
      if (newInitiatives.length > 0) {
        generateAdditionalSuggestions(newInitiatives);
      }
    }
  }, [initiatives, localInitiatives]);

  const loadPortfolios = async () => {
    try {
      console.log('🔄 Loading portfolios...');
      const response = await fetch('/api/portfolios');
      const data = await response.json();
      
      console.log('📦 Portfolio API response:', { 
        success: data.success, 
        portfolioCount: data.data?.length,
        portfolios: data.data 
      });
      
      if (data.success && data.data) {
        setPortfolios(data.data);
        console.log(`✅ Loaded ${data.data.length} portfolios into state`);
      } else {
        throw new Error(data.message || 'Failed to load portfolios');
      }
    } catch (error) {
      console.error('❌ Failed to load portfolios:', error);
      setError('Failed to load portfolios');
    }
  };

  const generateSuggestions = async () => {
    if (localInitiatives.length === 0) {
      console.log('No initiatives to generate suggestions for');
      return;
    }
    
    setSuggestionsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/initiatives/suggest-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiatives: localInitiatives.map(i => ({
            id: i.id,
            title: i.title,
            description: i.description,
            businessValue: i.businessValue
          }))
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data.suggestions);
        
        // Track portfolio suggestion generation
        console.log('📊 Tracking portfolio suggestion generation...');
        try {
          await trackGeneration({
            featureCategory: 'initiative',
            action: 'generate_portfolio_suggestions',
            resourceType: 'portfolio_suggestions',
            resourceId: `batch_${Date.now()}`,
            resourceTitle: `Portfolio Suggestions for ${localInitiatives.length} Initiatives`,
            generationData: {
              initiativeCount: localInitiatives.length,
              suggestionsGenerated: data.data.suggestions.length,
              portfolioCount: portfolios.length
            },
            promptData: {
              prompt: `Generate portfolio suggestions for ${localInitiatives.length} initiatives`,
              keywords: localInitiatives.map(i => i.title).slice(0, 5),
              additionalContext: {
                portfolios: portfolios.map(p => p.name),
                initiativeTitles: localInitiatives.map(i => i.title)
              }
            },
            aiModelUsed: 'keyword_analysis'
          });
          console.log('✅ Portfolio suggestion generation tracked successfully');
        } catch (auditError) {
          console.error('❌ Failed to track portfolio suggestion generation:', auditError);
        }
        
        // Auto-assign high-confidence suggestions
        const autoAssignments: Record<string, string> = {};
        const autoAssignedInitiatives: string[] = [];
        const abandonedInitiatives: string[] = [];
        
        data.data.suggestions.forEach((suggestion: PortfolioSuggestion) => {
          if (suggestion.suggestion.portfolioId && suggestion.suggestion.confidence >= 70) {
            autoAssignments[suggestion.initiativeId] = suggestion.suggestion.portfolioId;
            autoAssignedInitiatives.push(suggestion.initiative.title);
            console.log(`🎯 Auto-assigning initiative "${suggestion.initiative.title}" to portfolio ${suggestion.suggestion.portfolioId} (${suggestion.suggestion.confidence}% confidence)`);
          } else {
            abandonedInitiatives.push(suggestion.initiative.title);
          }
        });
        
        console.log(`✅ Auto-assignments created:`, autoAssignments);
        console.log(`📊 Total auto-assignments: ${Object.keys(autoAssignments).length}`);
        
        // Track auto-assignment results
        console.log('📊 Tracking auto-assignment results...');
        try {
          await trackAIEnhancement({
            featureCategory: 'initiative',
            action: 'auto_assign_portfolios',
            resourceType: 'portfolio_assignments',
            resourceId: `auto_assign_${Date.now()}`,
            resourceTitle: `Auto-assigned ${Object.keys(autoAssignments).length} initiatives`,
            enhancementData: {
              autoAssignedCount: Object.keys(autoAssignments).length,
              abandonedCount: abandonedInitiatives.length,
              totalInitiatives: localInitiatives.length,
              autoAssignedInitiatives,
              abandonedInitiatives,
              confidenceThreshold: 70
            }
          });
          console.log('✅ Auto-assignment results tracked successfully');
        } catch (auditError) {
          console.error('❌ Failed to track auto-assignment results:', auditError);
        }
        
        setAssignments(autoAssignments);
      } else {
        throw new Error(data.message || 'Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      setError('Failed to generate portfolio suggestions');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const generateAdditionalSuggestions = async (newInitiatives: Initiative[]) => {
    try {
      const response = await fetch('/api/initiatives/suggest-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiatives: newInitiatives.map(i => ({
            id: i.id,
            title: i.title,
            description: i.description,
            businessValue: i.businessValue
          }))
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Merge new suggestions with existing ones
        setSuggestions(prev => [...prev, ...data.data.suggestions]);
        
        // Auto-assign high-confidence suggestions for new initiatives
        const newAutoAssignments: Record<string, string> = {};
        data.data.suggestions.forEach((suggestion: PortfolioSuggestion) => {
          if (suggestion.suggestion.portfolioId && suggestion.suggestion.confidence >= 70) {
            newAutoAssignments[suggestion.initiativeId] = suggestion.suggestion.portfolioId;
          }
        });
        setAssignments(prev => ({ ...prev, ...newAutoAssignments }));
      }
    } catch (error) {
      console.error('Failed to generate additional suggestions:', error);
    }
  };

  const handleManualAssignment = async (initiativeId: string, portfolioId: string) => {
    const initiative = localInitiatives.find(i => i.id === initiativeId);
    const portfolio = portfolios.find(p => p.id === portfolioId);
    
    setAssignments(prev => ({
      ...prev,
      [initiativeId]: portfolioId
    }));
    
    // Track manual assignment
    if (initiative && portfolio) {
      await trackAIEnhancement({
        featureCategory: 'initiative',
        action: 'manual_assign_portfolio',
        resourceType: 'portfolio_assignment',
        resourceId: initiativeId,
        resourceTitle: `Manual Assignment: ${initiative.title}`,
        enhancementData: {
          initiativeTitle: initiative.title,
          portfolioName: portfolio.name,
          portfolioId: portfolioId,
          assignmentType: 'manual'
        }
      });
    }
  };

  const handleApplySuggestion = (suggestion: PortfolioSuggestion) => {
    if (suggestion.suggestion.portfolioId) {
      const portfolio = getPortfolioById(suggestion.suggestion.portfolioId);
      console.log(`📌 Applying suggestion: ${suggestion.initiativeId} → ${portfolio?.name || 'Unknown Portfolio'}`);
      
      setAssignments(prev => ({
        ...prev,
        [suggestion.initiativeId]: suggestion.suggestion.portfolioId
      }));
    }
  };

  const handleDragStart = (initiative: Initiative) => {
    setDraggedInitiative(initiative);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, portfolioId: string) => {
    e.preventDefault();
    if (draggedInitiative) {
      handleManualAssignment(draggedInitiative.id, portfolioId);
      setDraggedInitiative(null);
    }
  };

  const handleSaveAssignments = async () => {
    const assignmentList = Object.entries(assignments).map(([initiativeId, portfolioId]) => ({
      initiativeId,
      portfolioId
    }));

    if (assignmentList.length === 0) {
      setError('Please assign at least one initiative to a portfolio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/initiatives/assign-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: assignmentList })
      });

      const data = await response.json();
      
      if (data.success) {
        // Track successful save
        console.log('📊 Tracking portfolio assignment save...');
        try {
          const assignmentDetails = assignmentList.map(assignment => {
            const initiative = localInitiatives.find(i => i.id === assignment.initiativeId);
            const portfolio = portfolios.find(p => p.id === assignment.portfolioId);
            return {
              initiativeTitle: initiative?.title || 'Unknown',
              portfolioName: portfolio?.name || 'Unknown'
            };
          });

          await trackSave({
            featureCategory: 'initiative',
            resourceType: 'portfolio_assignments',
            resourceId: `batch_save_${Date.now()}`,
            resourceTitle: `Saved ${assignmentList.length} Portfolio Assignments`,
            metadata: {
              assignmentCount: assignmentList.length,
              totalInitiatives: localInitiatives.length,
              assignmentDetails,
              unassignedCount: localInitiatives.length - assignmentList.length
            }
          });
          console.log('✅ Portfolio assignment save tracked successfully');
        } catch (auditError) {
          console.error('❌ Failed to track portfolio assignment save:', auditError);
        }

        onAssignmentComplete(assignmentList);
        onClose();
      } else {
        throw new Error(data.message || 'Failed to save assignments');
      }
    } catch (error) {
      console.error('Failed to save assignments:', error);
      setError('Failed to save portfolio assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAssignments({});
  };

  const getAssignedCount = () => {
    const count = Object.keys(assignments).length;
    console.log(`📊 getAssignedCount: ${count}`, assignments);
    return count;
  };
  
  const getUnassignedInitiatives = () => {
    const unassigned = localInitiatives.filter(i => !assignments[i.id]);
    console.log(`🔍 getUnassignedInitiatives: ${unassigned.length} unassigned out of ${localInitiatives.length} total`);
    console.log(`🔍 Assignments state:`, assignments);
    console.log(`🔍 Unassigned initiatives:`, unassigned.map(i => ({ id: i.id, title: i.title })));
    return unassigned;
  };
  
  const getPortfolioById = (id: string) => portfolios.find(p => p.id === id);

  const assignmentProgress = (getAssignedCount() / localInitiatives.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto modal-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-black" />
            Assign Initiatives to Portfolios
          </DialogTitle>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Assign the {localInitiatives.length} generated initiatives to the appropriate portfolios. 
              AI suggestions are provided based on content analysis.
            </p>
            <p className="text-xs text-gray-500">
              Debug: {portfolios.length} portfolios loaded, {suggestions.length} suggestions generated
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-300 ease-in-out"
                    style={{ width: `${assignmentProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {getAssignedCount()}/{localInitiatives.length} assigned
                </span>
              </div>
              {suggestionsLoading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating AI suggestions...</span>
                </div>
              )}
              {newInitiativeCount > 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">+{newInitiativeCount} new initiatives added</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unassigned Initiatives */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Unassigned Initiatives</h3>
              <Badge variant="secondary">{getUnassignedInitiatives().length}</Badge>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getUnassignedInitiatives().map(initiative => {
                const suggestion = suggestions.find(s => s.initiativeId === initiative.id);
                
                return (
                  <Card 
                    key={initiative.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={() => handleDragStart(initiative)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          {initiative.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {initiative.businessBriefTitle && (
                        <div className="mb-2">
                          <Badge variant="outline" className="text-xs bg-gray-50">
                            {initiative.businessBriefTitle}
                          </Badge>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {initiative.description}
                      </p>
                      
                      {suggestion && suggestion.suggestion.portfolioId && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                suggestion.suggestion.confidence >= 70 
                                  ? 'border-green-500 text-green-700 bg-green-50' 
                                  : 'border-blue-500 text-blue-700 bg-blue-50'
                              }`}
                            >
                              <Brain className="w-3 h-3 mr-1" />
                              {suggestion.suggestion.confidence}% match
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 truncate flex-1">
                              → {suggestion.suggestion.portfolio?.name || 'Unknown Portfolio'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs ml-2 shrink-0"
                              onClick={() => handleApplySuggestion(suggestion)}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              {getUnassignedInitiatives().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>All initiatives have been assigned!</p>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Buckets */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Portfolio Buckets</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {portfolios.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-sm">No portfolios loaded</div>
                  <div className="text-xs text-gray-400 mt-2">
                    Check console for loading errors
                  </div>
                </div>
              )}
              {portfolios.map(portfolio => {
                const assignedInitiatives = localInitiatives.filter(i => assignments[i.id] === portfolio.id);
                
                console.log(`🗂️ Rendering portfolio: ${portfolio.name} with ${assignedInitiatives.length} assigned initiatives`);
                
                return (
                  <Card 
                    key={portfolio.id}
                    className="min-h-[120px] border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, portfolio.id)}
                    style={{
                      borderColor: assignedInitiatives.length > 0 ? portfolio.color : undefined,
                      backgroundColor: assignedInitiatives.length > 0 ? `${portfolio.color}10` : undefined
                    }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: portfolio.color }}
                        />
                        {portfolio.name}
                        <Badge variant="secondary">{assignedInitiatives.length}</Badge>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {portfolio.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {assignedInitiatives.length > 0 ? (
                        <div className="space-y-1">
                          {assignedInitiatives.map(initiative => (
                            <div 
                              key={initiative.id}
                              className="text-xs p-2 bg-white rounded border flex items-center justify-between"
                            >
                              <span className="truncate flex-1">{initiative.title}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-2"
                                onClick={() => {
                                  const newAssignments = { ...assignments };
                                  delete newAssignments[initiative.id];
                                  setAssignments(newAssignments);
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-xs py-4">
                          Drop initiatives here
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAssignments} 
            disabled={loading || getAssignedCount() === 0}
            className="bg-black hover:bg-gray-800"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Assignments ({getAssignedCount()})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
