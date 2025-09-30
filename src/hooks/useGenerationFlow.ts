import { useCallback } from 'react';
import { useGenerationStore } from '@/store/generation-store';
import { GenerationPromptData } from '@/components/modals/GenerationPromptModal';
import { ReviewDecision } from '@/components/modals/GenerationReviewModal';
import { useToast } from '@/hooks/use-toast';
import { useSettingsStore } from '@/store/settings-store';

interface UseGenerationFlowProps {
  onSuccess?: (savedItems: any[]) => void;
  onError?: (error: string) => void;
  onGenerationStart?: (parentId: string) => void;
  onGenerationEnd?: (parentId: string) => void;
}

export function useGenerationFlow({ onSuccess, onError, onGenerationStart, onGenerationEnd }: UseGenerationFlowProps = {}) {
  const { toast } = useToast();
  const { getV1ModuleLLM, validateV1ModuleSettings } = useSettingsStore();
  
  const {
    activeSession,
    isPromptModalOpen,
    isReviewModalOpen,
    isGenerating,
    isPersisting,
    startGeneration,
    setPromptData,
    setGenerationResponse,
    setReviewDecisions,
    setError,
    completeSession,
    cancelSession,
    closePromptModal,
    closeReviewModal,
    setGenerating,
    setPersisting
  } = useGenerationStore();

  // Start the generation flow
  const initiateGeneration = useCallback((
    parentType: 'Initiative' | 'Feature' | 'Epic' | 'BusinessBrief',
    parentId: string,
    targetType: 'Initiative' | 'Feature' | 'Epic' | 'Story',
    parentTitle?: string,
    pageSource: 'business-brief' | 'work-items' = 'work-items'
  ) => {
    console.log('🚀 Initiating generation flow:', { parentType, parentId, targetType, parentTitle });
    
    startGeneration({
      parentType,
      parentId,
      targetType,
      parentTitle,
      pageSource
    });
  }, [startGeneration]);

  // Handle prompt submission
  const handlePromptSubmit = useCallback(async (prompt: GenerationPromptData) => {
    if (!activeSession) {
      console.error('No active session for prompt submission');
      return;
    }

    console.log('📝 Submitting prompt:', prompt);
    setPromptData(prompt);
    setGenerating(true);

    // Notify that generation has started for this specific item
    if (onGenerationStart && activeSession.request.parentId) {
      onGenerationStart(activeSession.request.parentId);
    }

    try {
      // Determine which V1 module settings to use based on page source
      const moduleName = activeSession.request.pageSource === 'business-brief' ? 'use-cases' : 'requirements';
      
      // Validate V1 module settings
      if (!validateV1ModuleSettings(moduleName)) {
        throw new Error(`Please configure LLM settings for the ${moduleName} module in V1 Settings`);
      }

      // Get primary LLM settings for this module
      const settings = getV1ModuleLLM(moduleName, 'primary');

      // Call generation API
      const response = await fetch('/api/generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentType: activeSession.request.parentType,
          parentId: activeSession.request.parentId,
          targetType: activeSession.request.targetType,
          quantity: prompt.quantity,
          additionalContext: prompt.additionalContext,
          pageSource: activeSession.request.pageSource,
          llmSettings: settings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Generation failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      console.log(`✅ Generated ${result.data.candidates.length} candidates`);
      setGenerationResponse(result.data);

      // Show success toast
      toast({
        title: "Generation Complete",
        description: `Generated ${result.data.candidates.length} ${activeSession.request.targetType.toLowerCase()}s for review`,
      });

      // Notify that generation has ended for this specific item
      if (onGenerationEnd && activeSession.request.parentId) {
        onGenerationEnd(activeSession.request.parentId);
      }

    } catch (error: any) {
      console.error('❌ Generation error:', error);
      setError(error.message);
      
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
      
      // Notify that generation has ended (with error) for this specific item
      if (onGenerationEnd && activeSession.request.parentId) {
        onGenerationEnd(activeSession.request.parentId);
      }
      
      onError?.(error.message);
    } finally {
      setGenerating(false);
    }
  }, [activeSession, setPromptData, setGenerating, setGenerationResponse, setError, toast, onError]);

  // Handle review decisions submission  
  const handleReviewSubmit = useCallback(async (decisions: ReviewDecision[], editedCandidates?: any[]) => {
    if (!activeSession || !activeSession.response) {
      console.error('No active session or response for review submission');
      return;
    }

    console.log('📋 Submitting review decisions:', decisions);
    setReviewDecisions(decisions);
    setPersisting(true);

    try {
      // Filter kept items and prepare for persistence
      const keptDecisions = decisions.filter(d => d.action === 'kept');
      
      // Use edited candidates if provided, otherwise use original candidates
      const candidatesToProcess = editedCandidates || activeSession.response.candidates;
      const keptCandidates = candidatesToProcess.filter(candidate =>
        keptDecisions.some(decision => decision.candidateId === candidate.id)
      );

      if (keptCandidates.length === 0) {
        // No items kept, just complete the session
        completeSession();
        
        toast({
          title: "No Items Saved",
          description: "All candidates were discarded. No items were saved to the database.",
        });
        return;
      }

      // Transform candidates to kept items format
      const keptItems = keptCandidates.map(candidate => ({
        tempId: candidate.id,
        title: candidate.title,
        description: candidate.description,
        acceptanceCriteria: candidate.acceptanceCriteria,
        tags: candidate.tags || [],
        estimations: candidate.estimations || {},
        category: candidate.category,
        priority: candidate.priority,
        businessValue: candidate.businessValue,
        rationale: candidate.rationale,
        labels: candidate.labels || [],
        testingNotes: candidate.testingNotes || ''
      }));

      // Call persist API
      const response = await fetch('/api/generation/persist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentType: activeSession.request.parentType,
          parentId: activeSession.request.parentId,
          targetType: activeSession.request.targetType,
          kept: keptItems,
          decisions,
          sessionId: activeSession.request.id,
          pageSource: activeSession.request.pageSource
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Persistence API error:', errorData);
        
        // Handle validation errors more gracefully
        if (response.status === 400 && errorData.details) {
          const validationErrors = Array.isArray(errorData.details) 
            ? errorData.details.map((err: any) => `${err.path?.join('.')}: ${err.message}`).join('; ')
            : JSON.stringify(errorData.details);
          throw new Error(`Validation error: ${validationErrors}`);
        }
        
        throw new Error(errorData.error || `Persistence failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Persistence failed');
      }

      console.log(`✅ Persisted ${result.data.savedCount} items successfully`);
      completeSession();

      // Show success toast
      const savedCount = result.data.savedCount;
      const errorCount = result.data.errorCount;
      
      if (errorCount > 0) {
        toast({
          title: "Partially Saved",
          description: `${savedCount} ${activeSession.request.targetType.toLowerCase()}s saved successfully, ${errorCount} failed`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Items Saved",
          description: `Successfully saved ${savedCount} ${activeSession.request.targetType.toLowerCase()}s to the database`,
        });
      }

      // Call success callback with saved items
      onSuccess?.(result.data.savedItems);

    } catch (error: any) {
      console.error('❌ Persistence error:', error);
      setError(error.message);
      
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
      
      onError?.(error.message);
    } finally {
      setPersisting(false);
    }
  }, [activeSession, setReviewDecisions, setPersisting, completeSession, toast, onSuccess, onError]);

  // Handle cancellation
  const handleCancel = useCallback(() => {
    console.log('🚫 Cancelling generation flow');
    cancelSession();
    
    toast({
      title: "Generation Cancelled",
      description: "The generation process was cancelled",
    });
  }, [cancelSession, toast]);

  return {
    // State
    activeSession,
    isPromptModalOpen,
    isReviewModalOpen,
    isGenerating,
    isPersisting,
    
    // Actions
    initiateGeneration,
    handlePromptSubmit,
    handleReviewSubmit,
    handleCancel,
    
    // Modal controls
    closePromptModal,
    closeReviewModal
  };
}
