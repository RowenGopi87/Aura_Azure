import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { auditService, AuditEvent } from '@/lib/audit/audit-service';

export function useAudit() {
  const { user } = useAuthStore();

  // Generation tracking
  const trackGeneration = useCallback(async (params: {
    featureCategory: AuditEvent['featureCategory'];
    action: string;
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    generationData: any;
    promptData?: {
      prompt: string;
      keywords?: string[];
      additionalContext?: any;
    };
    aiModelUsed?: string;
    startTime?: number;
  }) => {
    if (!user) return;

    const generationTimeMs = params.startTime ? Date.now() - params.startTime : undefined;

    await auditService.trackGeneration({
      user,
      featureCategory: params.featureCategory,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      generationData: params.generationData,
      promptData: {
        ...params.promptData,
        promptLength: params.promptData?.prompt.length,
        keywords: params.promptData?.keywords || auditService.extractKeywords(params.promptData?.prompt || '')
      },
      aiModelUsed: params.aiModelUsed,
      generationTimeMs
    });

    // Also track prompt analytics
    if (params.promptData?.prompt) {
      await auditService.trackPromptUsage({
        userId: user.id,
        featureCategory: params.featureCategory,
        promptText: params.promptData.prompt,
        keywords: params.promptData.keywords || auditService.extractKeywords(params.promptData.prompt),
        promptLength: params.promptData.prompt.length
      });
    }
  }, [user]);

  // Edit tracking
  const trackEdit = useCallback(async (params: {
    featureCategory: AuditEvent['featureCategory'];
    action: string;
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    beforeContent: any;
    afterContent: any;
    fieldsChanged?: string[];
  }) => {
    if (!user) return;

    const editType = auditService.analyzeEditType(params.beforeContent, params.afterContent);
    const fieldsChanged = params.fieldsChanged || detectChangedFields(params.beforeContent, params.afterContent);

    await auditService.trackEdit({
      user,
      featureCategory: params.featureCategory,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      beforeContent: params.beforeContent,
      afterContent: params.afterContent,
      editType,
      fieldsChanged
    });
  }, [user]);

  // Save tracking
  const trackSave = useCallback(async (params: {
    featureCategory: AuditEvent['featureCategory'];
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    metadata?: any;
  }) => {
    if (!user) return;

    await auditService.trackSave({
      user,
      featureCategory: params.featureCategory,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      metadata: params.metadata
    });
  }, [user]);

  // Delete tracking
  const trackDelete = useCallback(async (params: {
    featureCategory: AuditEvent['featureCategory'];
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    metadata?: any;
  }) => {
    if (!user) return;

    await auditService.trackDelete({
      user,
      featureCategory: params.featureCategory,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      metadata: params.metadata
    });
  }, [user]);

  // Export/Integration tracking
  const trackExport = useCallback(async (params: {
    featureCategory: AuditEvent['featureCategory'];
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    integrationTarget: string;
    metadata?: any;
  }) => {
    if (!user) return;

    await auditService.trackExport({
      user,
      featureCategory: params.featureCategory,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      integrationTarget: params.integrationTarget,
      metadata: params.metadata
    });
  }, [user]);

  // AI Enhancement tracking
  const trackAIEnhancement = useCallback(async (params: {
    featureCategory: AuditEvent['featureCategory'];
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    beforeContent: any;
    afterContent: any;
    aiModelUsed: string;
    startTime?: number;
  }) => {
    if (!user) return;

    const generationTimeMs = params.startTime ? Date.now() - params.startTime : undefined;

    await auditService.trackAIEnhancement({
      user,
      featureCategory: params.featureCategory,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      beforeContent: params.beforeContent,
      afterContent: params.afterContent,
      aiModelUsed: params.aiModelUsed,
      generationTimeMs
    });
  }, [user]);

  // View tracking
  const trackView = useCallback(async (params: {
    featureCategory: AuditEvent['featureCategory'];
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    metadata?: any;
  }) => {
    if (!user) return;

    await auditService.logEvent({
      userId: user.id,
      sessionId: user.sessionId,
      eventType: 'view',
      featureCategory: params.featureCategory,
      action: 'view',
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      metadata: params.metadata
    });
  }, [user]);

  // Search tracking
  const trackSearch = useCallback(async (params: {
    featureCategory: AuditEvent['featureCategory'];
    searchQuery: string;
    resultsCount?: number;
    metadata?: any;
  }) => {
    if (!user) return;

    await auditService.logEvent({
      userId: user.id,
      sessionId: user.sessionId,
      eventType: 'search',
      featureCategory: params.featureCategory,
      action: 'search',
      promptData: {
        prompt: params.searchQuery,
        keywords: auditService.extractKeywords(params.searchQuery)
      },
      metadata: {
        ...params.metadata,
        resultsCount: params.resultsCount
      }
    });
  }, [user]);

  return {
    trackGeneration,
    trackEdit,
    trackSave,
    trackDelete,
    trackExport,
    trackAIEnhancement,
    trackView,
    trackSearch,
    isEnabled: !!user
  };
}

// Utility function to detect changed fields
function detectChangedFields(before: any, after: any): string[] {
  const changedFields: string[] = [];
  
  if (!before || !after) return [];

  const beforeKeys = Object.keys(before);
  const afterKeys = Object.keys(after);
  const allKeys = new Set([...beforeKeys, ...afterKeys]);

  for (const key of allKeys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changedFields.push(key);
    }
  }

  return changedFields;
}
