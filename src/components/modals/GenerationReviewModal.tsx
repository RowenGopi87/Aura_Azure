import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  X, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Save,
  Loader2,
  AlertCircle,
  Edit3,
  Undo
} from 'lucide-react';

export interface GenerationCandidate {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  tags?: string[];
  estimations?: { storyPoints?: number; estimatedEffort?: string; sprintEstimate?: number };
  links: { parentId: string; parentType: string };
  rawModelOutput?: string;
  category?: string;
  priority?: string;
  businessValue?: string;
  rationale?: string;
  storyPoints?: number;
  labels?: string[];
  testingNotes?: string;
}

export interface GenerationResponse {
  candidates: GenerationCandidate[];
  model: string;
  promptUsed: string;
}

export interface ReviewDecision {
  candidateId: string;
  action: 'kept' | 'discarded';
  reason?: string;
}

interface GenerationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: (decisions: ReviewDecision[], editedCandidates?: GenerationCandidate[]) => void;
  generationData: GenerationResponse | null;
  targetType: 'Initiative' | 'Feature' | 'Epic' | 'Story';
  parentTitle?: string;
  isLoading?: boolean;
}

type CandidateStatus = 'pending' | 'kept' | 'discarded';

export function GenerationReviewModal({
  isOpen,
  onClose,
  onConfirmSave,
  generationData,
  targetType,
  parentTitle,
  isLoading = false
}: GenerationReviewModalProps) {
  const { toast } = useToast();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidateStatuses, setCandidateStatuses] = useState<Record<string, CandidateStatus>>({});
  const [discardReasons, setDiscardReasons] = useState<Record<string, string>>({});
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [editedCandidates, setEditedCandidates] = useState<Record<string, Partial<GenerationCandidate>>>({});

  // Initialize candidate statuses when data loads
  useEffect(() => {
    if (generationData?.candidates) {
      const initialStatuses: Record<string, CandidateStatus> = {};
      generationData.candidates.forEach(candidate => {
        initialStatuses[candidate.id] = 'pending';
      });
      setCandidateStatuses(initialStatuses);
      
      // Select first candidate by default
      if (generationData.candidates.length > 0) {
        setSelectedCandidateId(generationData.candidates[0].id);
      }
    }
  }, [generationData]);

  const handleCandidateAction = (candidateId: string, action: 'kept' | 'discarded') => {
    setCandidateStatuses(prev => ({
      ...prev,
      [candidateId]: action
    }));
  };

  const handleKeepAll = () => {
    if (!generationData) return;
    const newStatuses: Record<string, CandidateStatus> = {};
    generationData.candidates.forEach(candidate => {
      newStatuses[candidate.id] = 'kept';
    });
    setCandidateStatuses(newStatuses);
  };

  const handleDiscardAll = () => {
    if (!generationData) return;
    const newStatuses: Record<string, CandidateStatus> = {};
    generationData.candidates.forEach(candidate => {
      newStatuses[candidate.id] = 'discarded';
    });
    setCandidateStatuses(newStatuses);
  };

  const handleStartEdit = (candidateId: string) => {
    setEditingCandidateId(candidateId);
  };

  const handleSaveEditComplete = () => {
    setEditingCandidateId(null);
    // Changes are already saved in editedCandidates state
  };

  const handleSaveEdit = async (candidateId: string, field: string, value: string | string[]) => {
    setEditedCandidates(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [field]: value
      }
    }));

    // Log edit action for audit trail
    try {
      await fetch('/api/audit/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'system', // TODO: Get real user ID
          eventType: 'edit',
          featureCategory: targetType.toLowerCase(),
          action: 'candidate_edited',
          resourceType: 'generation_candidate',
          resourceId: candidateId,
          resourceTitle: generationData?.candidates.find(c => c.id === candidateId)?.title || 'Unknown',
          beforeContent: { [field]: generationData?.candidates.find(c => c.id === candidateId)?.[field as keyof GenerationCandidate] },
          afterContent: { [field]: value },
          fieldsChanged: [field],
          editType: 'minor',
          metadata: {
            sessionId: 'review-session', // Will be replaced with actual session ID
            targetType,
            parentTitle,
            editField: field
          }
        })
      });
    } catch (auditError) {
      console.warn('Failed to log edit audit:', auditError);
    }
  };

  const handleConfirmSave = () => {
    if (!generationData) return;
    
    // Debug current state
    console.log('🔍 DEBUG - Current candidate statuses:', candidateStatuses);
    console.log('🔍 DEBUG - All candidates:', generationData.candidates.map(c => c.id));
    
    // Merge edited candidates with original data
    const finalCandidates = generationData.candidates.map(candidate => ({
      ...candidate,
      ...editedCandidates[candidate.id]
    }));
    
    // Only include decisions for items that have been explicitly kept or discarded
    // Treat "pending" items as "discarded" (user didn't make a decision)
    const decisions: ReviewDecision[] = finalCandidates.map(candidate => {
      const status = candidateStatuses[candidate.id] || 'pending';
      const action = status === 'kept' ? 'kept' : 'discarded'; // Convert pending to discarded
      
      console.log(`🔍 DEBUG - Candidate ${candidate.id}: status=${status}, action=${action}`);
      
      return {
        candidateId: candidate.id,
        action,
        reason: status === 'discarded' 
          ? discardReasons[candidate.id] || (status === 'pending' ? 'Not reviewed (auto-discarded)' : undefined)
          : undefined
      };
    });

    console.log('🔍 DEBUG - Final decisions being sent:', decisions);
    console.log('🔍 DEBUG - Kept count:', decisions.filter(d => d.action === 'kept').length);
    console.log('🔍 DEBUG - Discarded count:', decisions.filter(d => d.action === 'discarded').length);

    // Validate that all decisions have valid actions before sending
    const validDecisions = decisions.every(d => d.action === 'kept' || d.action === 'discarded');
    if (!validDecisions) {
      console.error('❌ Invalid decisions detected:', decisions);
      toast({
        title: "Review Error",
        description: "Please review all items before saving. Pending items will be auto-discarded.",
        variant: "destructive"
      });
      return;
    }

    // Pass the updated candidates along with decisions
    onConfirmSave(decisions, finalCandidates);
  };

  const getStatusIcon = (status: CandidateStatus) => {
    switch (status) {
      case 'kept': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'discarded': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case 'kept': return 'bg-green-50 border-green-200';
      case 'discarded': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const selectedCandidate = generationData?.candidates.find(c => c.id === selectedCandidateId);
  const keptCount = Object.values(candidateStatuses).filter(status => status === 'kept').length;
  const discardedCount = Object.values(candidateStatuses).filter(status => status === 'discarded').length;
  const pendingCount = Object.values(candidateStatuses).filter(status => status === 'pending').length;

  if (!generationData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Review Generated {targetType}s
          </DialogTitle>
          <DialogDescription>
            {parentTitle && (
              <span className="block mb-2">
                For: <strong>{parentTitle}</strong>
              </span>
            )}
            Review and select the {targetType.toLowerCase()}s you want to keep. Only kept items will be saved.
          </DialogDescription>
          <div className="flex gap-4 mt-2 mb-4">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              Kept: {keptCount}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3 text-red-600" />
              Discarded: {discardedCount}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3 text-gray-500" />
              Pending: {pendingCount}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Left Panel - Candidate List */}
          <div className="flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Generated {targetType}s</h3>
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleKeepAll}
                  disabled={isLoading}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Keep All
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleDiscardAll}
                  disabled={isLoading}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Discard All
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-md">
              <div className="p-2 space-y-2">
                {generationData.candidates.map((candidate) => {
                  const status = candidateStatuses[candidate.id] || 'pending';
                  const isSelected = selectedCandidateId === candidate.id;
                  
                  return (
                    <div
                      key={candidate.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-blue-500 border-blue-300' : ''
                      } ${getStatusColor(status)}`}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {getStatusIcon(status)}
                        <h4 className="font-medium flex-1 text-sm">
                          {candidate.title}
                        </h4>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {candidate.description}
                      </p>
                      
                      <div className="flex gap-1 flex-wrap">
                        {candidate.priority && (
                          <Badge variant="outline" className="text-xs">
                            {candidate.priority}
                          </Badge>
                        )}
                        {candidate.category && (
                          <Badge variant="outline" className="text-xs">
                            {candidate.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Selected Candidate Details */}
          <div className="flex flex-col min-h-0">
            {selectedCandidate ? (
              <>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">Details</h3>
                  <div className="flex gap-2">
                    {editingCandidateId === selectedCandidate.id ? (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleSaveEditComplete}
                        disabled={isLoading}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save Edit
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(selectedCandidate.id)}
                        disabled={isLoading}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={candidateStatuses[selectedCandidate.id] === 'kept' ? 'default' : 'outline'}
                      onClick={() => handleCandidateAction(selectedCandidate.id, 'kept')}
                      disabled={isLoading}
                      className={candidateStatuses[selectedCandidate.id] === 'kept' 
                        ? 'bg-black hover:bg-gray-800 text-white' 
                        : 'text-black border-gray-300 hover:bg-gray-50'
                      }
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Keep
                    </Button>
                    <Button
                      size="sm"
                      variant={candidateStatuses[selectedCandidate.id] === 'discarded' ? 'default' : 'outline'}
                      onClick={() => handleCandidateAction(selectedCandidate.id, 'discarded')}
                      disabled={isLoading}
                      className={candidateStatuses[selectedCandidate.id] === 'discarded' 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                      }
                    >
                      <X className="h-4 w-4 mr-1" />
                      Discard
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="criteria">Criteria</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="meta">Meta</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 min-h-0">
                    <TabsContent value="overview" className="h-full">
                      <ScrollArea className="h-full border rounded-md p-4">
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium mb-2">Title</h5>
                            {editingCandidateId === selectedCandidate.id ? (
                              <Input
                                value={editedCandidates[selectedCandidate.id]?.title ?? selectedCandidate.title}
                                onChange={(e) => handleSaveEdit(selectedCandidate.id, 'title', e.target.value)}
                                className="font-semibold"
                                placeholder="Initiative title..."
                              />
                            ) : (
                              <h4 className="font-semibold">{editedCandidates[selectedCandidate.id]?.title ?? selectedCandidate.title}</h4>
                            )}
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-2">Description</h5>
                            {editingCandidateId === selectedCandidate.id ? (
                              <Textarea
                                value={editedCandidates[selectedCandidate.id]?.description ?? selectedCandidate.description}
                                onChange={(e) => handleSaveEdit(selectedCandidate.id, 'description', e.target.value)}
                                rows={4}
                                placeholder="Detailed description..."
                              />
                            ) : (
                              <p className="text-gray-700">{editedCandidates[selectedCandidate.id]?.description ?? selectedCandidate.description}</p>
                            )}
                          </div>
                          
                          {(selectedCandidate.businessValue || editingCandidateId === selectedCandidate.id) && (
                            <div>
                              <h5 className="font-medium mb-2">Business Value</h5>
                              {editingCandidateId === selectedCandidate.id ? (
                                <Textarea
                                  value={editedCandidates[selectedCandidate.id]?.businessValue ?? selectedCandidate.businessValue ?? ''}
                                  onChange={(e) => handleSaveEdit(selectedCandidate.id, 'businessValue', e.target.value)}
                                  rows={3}
                                  placeholder="Business value statement..."
                                />
                              ) : (
                                <p className="text-gray-700">{editedCandidates[selectedCandidate.id]?.businessValue ?? selectedCandidate.businessValue}</p>
                              )}
                            </div>
                          )}
                          
                          {(selectedCandidate.rationale || editingCandidateId === selectedCandidate.id) && (
                            <div>
                              <h5 className="font-medium mb-2">Rationale</h5>
                              {editingCandidateId === selectedCandidate.id ? (
                                <Textarea
                                  value={editedCandidates[selectedCandidate.id]?.rationale ?? selectedCandidate.rationale ?? ''}
                                  onChange={(e) => handleSaveEdit(selectedCandidate.id, 'rationale', e.target.value)}
                                  rows={3}
                                  placeholder="Strategic rationale..."
                                />
                              ) : (
                                <p className="text-gray-700">{editedCandidates[selectedCandidate.id]?.rationale ?? selectedCandidate.rationale}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="criteria" className="h-full">
                      <ScrollArea className="h-full border rounded-md p-4">
                        <div>
                          <h5 className="font-medium mb-2">Acceptance Criteria</h5>
                          <ul className="space-y-2">
                            {selectedCandidate.acceptanceCriteria.map((criteria, index) => (
                              <li key={index} className="flex gap-2">
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-700">{criteria}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="details" className="h-full">
                      <ScrollArea className="h-full border rounded-md p-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            {selectedCandidate.priority && (
                              <div>
                                <span className="text-sm font-medium text-gray-500">Priority</span>
                                <p className="capitalize">{selectedCandidate.priority}</p>
                              </div>
                            )}
                            {selectedCandidate.category && (
                              <div>
                                <span className="text-sm font-medium text-gray-500">Category</span>
                                <p className="capitalize">{selectedCandidate.category}</p>
                              </div>
                            )}
                          </div>
                          
                          {selectedCandidate.estimations && (
                            <div>
                              <h5 className="font-medium mb-2">Estimations</h5>
                              <div className="space-y-1">
                                {selectedCandidate.estimations.storyPoints && (
                                  <p><span className="text-gray-500">Story Points:</span> {selectedCandidate.estimations.storyPoints}</p>
                                )}
                                {selectedCandidate.estimations.estimatedEffort && (
                                  <p><span className="text-gray-500">Estimated Effort:</span> {selectedCandidate.estimations.estimatedEffort}</p>
                                )}
                                {selectedCandidate.estimations.sprintEstimate && (
                                  <p><span className="text-gray-500">Sprint Estimate:</span> {selectedCandidate.estimations.sprintEstimate}</p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {selectedCandidate.tags && selectedCandidate.tags.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Tags</h5>
                              <div className="flex gap-1 flex-wrap">
                                {selectedCandidate.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="meta" className="h-full">
                      <ScrollArea className="h-full border rounded-md p-4">
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-500">Model Used:</span>
                            <p>{generationData.model}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Generated ID:</span>
                            <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{selectedCandidate.id}</p>
                          </div>
                          {selectedCandidate.rawModelOutput && (
                            <div>
                              <span className="font-medium text-gray-500">Raw Output:</span>
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 whitespace-pre-wrap">
                                {selectedCandidate.rawModelOutput}
                              </pre>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Select a {targetType.toLowerCase()} to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {keptCount > 0 ? (
              <div>
                <div>{keptCount} {targetType.toLowerCase()}{keptCount !== 1 ? 's' : ''} will be saved</div>
                {pendingCount > 0 && (
                  <div className="text-xs text-orange-600 mt-1">
                    {pendingCount} pending item{pendingCount !== 1 ? 's' : ''} will be auto-discarded
                  </div>
                )}
              </div>
            ) : (
              'No items selected for saving'
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSave}
              disabled={keptCount === 0 || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Confirm & Save {keptCount} {targetType}{keptCount !== 1 ? 's' : ''}
                  {pendingCount > 0 && (
                    <span className="ml-1 text-xs opacity-75">
                      (+{pendingCount} auto-discard)
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
