import { EmiratesUser } from '@/store/auth-store';

export interface AuditEvent {
  id?: string;
  userId: string;
  sessionId?: string;
  eventType: 'generation' | 'edit' | 'save' | 'delete' | 'export' | 'integration' | 'view' | 'search' | 'ai_enhancement';
  featureCategory: 'brief' | 'initiative' | 'feature' | 'epic' | 'story' | 'code' | 'design' | 'test' | 'auth' | 'system';
  action: string;
  resourceType?: string;
  resourceId?: string;
  resourceTitle?: string;
  
  // Generation & Content Tracking
  generationData?: any;
  promptData?: {
    prompt: string;
    keywords?: string[];
    promptLength?: number;
    additionalContext?: any;
  };
  aiModelUsed?: string;
  generationTimeMs?: number;
  
  // Edit Tracking
  beforeContent?: any;
  afterContent?: any;
  editType?: 'minor' | 'major' | 'complete_rewrite';
  fieldsChanged?: string[];
  
  // Value Indicators
  wasSaved?: boolean;
  wasExported?: boolean;
  wasIntegrated?: boolean;
  integrationTarget?: string;
  
  // Context & Metadata
  pageUrl?: string;
  referrerUrl?: string;
  browserInfo?: any;
  metadata?: any;
  
  // Performance & Quality
  userSatisfactionScore?: number;
  contentQualityScore?: number;
}

export interface PromptAnalytics {
  userId: string;
  featureCategory: 'brief' | 'initiative' | 'feature' | 'epic' | 'story' | 'code' | 'design' | 'test';
  promptText: string;
  keywords?: string[];
  promptLength?: number;
  complexityScore?: number;
  successRate?: number;
  avgGenerationTimeMs?: number;
}

class AuditService {
  private isEnabled: boolean = true;
  private isAsync: boolean = true;
  private eventQueue: AuditEvent[] = [];
  private batchSize: number = 10;
  private flushInterval: number = 5000; // 5 seconds

  constructor() {
    if (typeof window !== 'undefined') {
      // Start batch processing in browser environment
      setInterval(() => this.flushEvents(), this.flushInterval);
    }
  }

  // Main audit logging method
  async logEvent(event: AuditEvent): Promise<void> {
    if (!this.isEnabled) return;

    // Add timestamp and browser context
    const enrichedEvent: AuditEvent = {
      ...event,
      pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      referrerUrl: typeof window !== 'undefined' ? document.referrer : undefined,
      browserInfo: typeof window !== 'undefined' ? {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      } : undefined
    };

    if (this.isAsync) {
      this.eventQueue.push(enrichedEvent);
      if (this.eventQueue.length >= this.batchSize) {
        await this.flushEvents();
      }
    } else {
      await this.sendEvent(enrichedEvent);
    }
  }

  // Specific tracking methods for different types of events

  // 1. Generation Tracking
  async trackGeneration(params: {
    user: EmiratesUser;
    featureCategory: AuditEvent['featureCategory'];
    action: string;
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    generationData: any;
    promptData?: AuditEvent['promptData'];
    aiModelUsed?: string;
    generationTimeMs?: number;
  }): Promise<void> {
    await this.logEvent({
      userId: params.user.id,
      sessionId: params.user.sessionId,
      eventType: 'generation',
      featureCategory: params.featureCategory,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      generationData: params.generationData,
      promptData: params.promptData,
      aiModelUsed: params.aiModelUsed,
      generationTimeMs: params.generationTimeMs,
      wasSaved: false,
      wasExported: false,
      wasIntegrated: false
    });
  }

  // 2. Edit Tracking
  async trackEdit(params: {
    user: EmiratesUser;
    featureCategory: AuditEvent['featureCategory'];
    action: string;
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    beforeContent: any;
    afterContent: any;
    editType: 'minor' | 'major' | 'complete_rewrite';
    fieldsChanged: string[];
  }): Promise<void> {
    await this.logEvent({
      userId: params.user.id,
      sessionId: params.user.sessionId,
      eventType: 'edit',
      featureCategory: params.featureCategory,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      beforeContent: params.beforeContent,
      afterContent: params.afterContent,
      editType: params.editType,
      fieldsChanged: params.fieldsChanged
    });
  }

  // 3. Save Tracking
  async trackSave(params: {
    user: EmiratesUser;
    featureCategory: AuditEvent['featureCategory'];
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    metadata?: any;
  }): Promise<void> {
    await this.logEvent({
      userId: params.user.id,
      sessionId: params.user.sessionId,
      eventType: 'save',
      featureCategory: params.featureCategory,
      action: 'save',
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      wasSaved: true,
      metadata: params.metadata
    });
  }

  // 4. Delete Tracking
  async trackDelete(params: {
    user: EmiratesUser;
    featureCategory: AuditEvent['featureCategory'];
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    metadata?: any;
  }): Promise<void> {
    await this.logEvent({
      userId: params.user.id,
      sessionId: params.user.sessionId,
      eventType: 'delete',
      featureCategory: params.featureCategory,
      action: 'delete',
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      metadata: params.metadata
    });
  }

  // 5. Export/Integration Tracking
  async trackExport(params: {
    user: EmiratesUser;
    featureCategory: AuditEvent['featureCategory'];
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    integrationTarget: string; // 'jira', 'confluence', etc.
    metadata?: any;
  }): Promise<void> {
    await this.logEvent({
      userId: params.user.id,
      sessionId: params.user.sessionId,
      eventType: 'integration',
      featureCategory: params.featureCategory,
      action: `export_to_${params.integrationTarget}`,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      wasExported: true,
      wasIntegrated: true,
      integrationTarget: params.integrationTarget,
      metadata: params.metadata
    });
  }

  // 6. AI Enhancement Tracking
  async trackAIEnhancement(params: {
    user: EmiratesUser;
    featureCategory: AuditEvent['featureCategory'];
    resourceType: string;
    resourceId: string;
    resourceTitle: string;
    beforeContent: any;
    afterContent: any;
    aiModelUsed: string;
    generationTimeMs?: number;
  }): Promise<void> {
    await this.logEvent({
      userId: params.user.id,
      sessionId: params.user.sessionId,
      eventType: 'ai_enhancement',
      featureCategory: params.featureCategory,
      action: 'ai_enhance',
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      beforeContent: params.beforeContent,
      afterContent: params.afterContent,
      aiModelUsed: params.aiModelUsed,
      generationTimeMs: params.generationTimeMs
    });
  }

  // Prompt Analytics
  async trackPromptUsage(params: PromptAnalytics): Promise<void> {
    try {
      // This would typically send to an API endpoint
      await fetch('/api/audit/prompt-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
    } catch (error) {
      console.error('Failed to track prompt usage:', error);
    }
  }

  // Batch processing
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEventBatch(eventsToSend);
    } catch (error) {
      console.error('Failed to send audit events:', error);
      // Re-queue failed events
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  private async sendEvent(event: AuditEvent): Promise<void> {
    try {
      await fetch('/api/audit/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send audit event:', error);
    }
  }

  private async sendEventBatch(events: AuditEvent[]): Promise<void> {
    try {
      await fetch('/api/audit/events/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Failed to send audit event batch:', error);
    }
  }

  // Configuration methods
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  setAsync(async: boolean): void {
    this.isAsync = async;
  }

  // Utility methods for content analysis
  analyzeEditType(before: any, after: any): 'minor' | 'major' | 'complete_rewrite' {
    if (!before || !after) return 'complete_rewrite';
    
    const beforeStr = JSON.stringify(before);
    const afterStr = JSON.stringify(after);
    
    const similarity = this.calculateSimilarity(beforeStr, afterStr);
    
    if (similarity > 0.8) return 'minor';
    if (similarity > 0.4) return 'major';
    return 'complete_rewrite';
  }

  extractKeywords(text: string): string[] {
    if (!text) return [];
    
    // Simple keyword extraction - can be enhanced with NLP
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'will', 'would', 'could', 'should'].includes(word));
    
    // Return unique words, sorted by frequency
    const frequency: { [key: string]: number } = {};
    words.forEach(word => frequency[word] = (frequency[word] || 0) + 1);
    
    return Object.keys(frequency)
      .sort((a, b) => frequency[b] - frequency[a])
      .slice(0, 10);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

// Export singleton instance
export const auditService = new AuditService();
