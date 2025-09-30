import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GenerationPromptData } from '@/components/modals/GenerationPromptModal';
import { GenerationResponse, ReviewDecision } from '@/components/modals/GenerationReviewModal';

export interface GenerationRequest {
  id: string;
  parentType: 'Initiative' | 'Feature' | 'Epic' | 'BusinessBrief';
  parentId: string;
  parentTitle?: string;
  targetType: 'Initiative' | 'Feature' | 'Epic' | 'Story';
  prompt: GenerationPromptData;
  pageSource: 'business-brief' | 'work-items';
  timestamp: Date;
}

export interface GenerationSession {
  request: GenerationRequest;
  response: GenerationResponse | null;
  decisions: ReviewDecision[] | null;
  status: 'prompting' | 'generating' | 'reviewing' | 'persisting' | 'completed' | 'cancelled' | 'error';
  error?: string;
}

interface GenerationState {
  // Current active session
  activeSession: GenerationSession | null;
  
  // Modal states
  isPromptModalOpen: boolean;
  isReviewModalOpen: boolean;
  isGenerating: boolean;
  isPersisting: boolean;
  
  // Generation history (for audit purposes)
  generationHistory: GenerationSession[];
  
  // Actions
  startGeneration: (request: Omit<GenerationRequest, 'id' | 'timestamp'>) => void;
  setPromptData: (prompt: GenerationPromptData) => void;
  setGenerationResponse: (response: GenerationResponse) => void;
  setReviewDecisions: (decisions: ReviewDecision[]) => void;
  setError: (error: string) => void;
  completeSession: () => void;
  cancelSession: () => void;
  
  // Modal actions
  openPromptModal: () => void;
  closePromptModal: () => void;
  openReviewModal: () => void;
  closeReviewModal: () => void;
  
  // Status actions
  setGenerating: (isGenerating: boolean) => void;
  setPersisting: (isPersisting: boolean) => void;
  
  // Utility
  clearHistory: () => void;
  getSessionById: (id: string) => GenerationSession | undefined;
}

const generateSessionId = (): string => {
  return `gen-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeSession: null,
      isPromptModalOpen: false,
      isReviewModalOpen: false,
      isGenerating: false,
      isPersisting: false,
      generationHistory: [],

      // Actions
      startGeneration: (requestData) => {
        const request: GenerationRequest = {
          id: generateSessionId(),
          timestamp: new Date(),
          ...requestData
        };
        
        const session: GenerationSession = {
          request,
          response: null,
          decisions: null,
          status: 'prompting'
        };
        
        set({
          activeSession: session,
          isPromptModalOpen: true,
          isReviewModalOpen: false,
          isGenerating: false,
          isPersisting: false
        });
        
        console.log('🚀 Started new generation session:', session.request.id);
      },

      setPromptData: (prompt) => {
        const { activeSession } = get();
        if (!activeSession) return;
        
        const updatedSession: GenerationSession = {
          ...activeSession,
          request: { ...activeSession.request, prompt },
          status: 'generating'
        };
        
        set({ 
          activeSession: updatedSession,
          isPromptModalOpen: false,
          isGenerating: true 
        });
        
        console.log('📝 Updated session with prompt data:', prompt);
      },

      setGenerationResponse: (response) => {
        const { activeSession } = get();
        if (!activeSession) return;
        
        const updatedSession: GenerationSession = {
          ...activeSession,
          response,
          status: 'reviewing'
        };
        
        set({
          activeSession: updatedSession,
          isGenerating: false,
          isReviewModalOpen: true
        });
        
        console.log('📦 Set generation response with', response.candidates.length, 'candidates');
      },

      setReviewDecisions: (decisions) => {
        const { activeSession } = get();
        if (!activeSession) return;
        
        const updatedSession: GenerationSession = {
          ...activeSession,
          decisions,
          status: 'persisting'
        };
        
        set({
          activeSession: updatedSession,
          isReviewModalOpen: false,
          isPersisting: true
        });
        
        const keptCount = decisions.filter(d => d.action === 'kept').length;
        console.log('✅ Set review decisions:', keptCount, 'kept,', decisions.length - keptCount, 'discarded');
      },

      setError: (error) => {
        const { activeSession } = get();
        if (!activeSession) return;
        
        const updatedSession: GenerationSession = {
          ...activeSession,
          status: 'error',
          error
        };
        
        set({
          activeSession: updatedSession,
          isPromptModalOpen: false,
          isReviewModalOpen: false,
          isGenerating: false,
          isPersisting: false
        });
        
        console.error('❌ Generation session error:', error);
      },

      completeSession: () => {
        const { activeSession, generationHistory } = get();
        if (!activeSession) return;
        
        const completedSession: GenerationSession = {
          ...activeSession,
          status: 'completed'
        };
        
        set({
          activeSession: null,
          isPromptModalOpen: false,
          isReviewModalOpen: false,
          isGenerating: false,
          isPersisting: false,
          generationHistory: [completedSession, ...generationHistory.slice(0, 49)] // Keep last 50 sessions
        });
        
        console.log('🎉 Completed generation session:', completedSession.request.id);
      },

      cancelSession: () => {
        const { activeSession, generationHistory } = get();
        if (!activeSession) return;
        
        const cancelledSession: GenerationSession = {
          ...activeSession,
          status: 'cancelled'
        };
        
        set({
          activeSession: null,
          isPromptModalOpen: false,
          isReviewModalOpen: false,
          isGenerating: false,
          isPersisting: false,
          generationHistory: [cancelledSession, ...generationHistory.slice(0, 49)]
        });
        
        console.log('🚫 Cancelled generation session:', cancelledSession.request.id);
      },

      // Modal actions
      openPromptModal: () => set({ isPromptModalOpen: true }),
      closePromptModal: () => {
        const { activeSession } = get();
        if (activeSession?.status === 'prompting') {
          get().cancelSession();
        } else {
          set({ isPromptModalOpen: false });
        }
      },
      
      openReviewModal: () => set({ isReviewModalOpen: true }),
      closeReviewModal: () => {
        const { activeSession } = get();
        if (activeSession?.status === 'reviewing') {
          get().cancelSession();
        } else {
          set({ isReviewModalOpen: false });
        }
      },

      // Status actions
      setGenerating: (isGenerating) => set({ isGenerating }),
      setPersisting: (isPersisting) => set({ isPersisting }),

      // Utility
      clearHistory: () => {
        set({ generationHistory: [] });
        console.log('🗑️ Cleared generation history');
      },
      
      getSessionById: (id) => {
        const { activeSession, generationHistory } = get();
        if (activeSession?.request.id === id) return activeSession;
        return generationHistory.find(session => session.request.id === id);
      }
    }),
    {
      name: 'aura-generation-store',
      // Only persist generation history, not active sessions or modal states
      partialize: (state) => ({
        generationHistory: state.generationHistory
      })
    }
  )
);
