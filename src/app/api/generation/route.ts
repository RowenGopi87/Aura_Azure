import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService } from '@/lib/services/llm-service';
import { createConnection } from '@/lib/database';
import { auditService } from '@/lib/audit/audit-service';
import { secretsManager, LLMProvider } from '@/lib/secrets/secrets-manager';

const generationRequestSchema = z.object({
  parentType: z.enum(['Initiative', 'Feature', 'Epic', 'BusinessBrief']),
  parentId: z.string(),
  targetType: z.enum(['Initiative', 'Feature', 'Epic', 'Story']),
  quantity: z.number().min(1).max(15),
  additionalContext: z.string().optional(),
  pageSource: z.enum(['business-brief', 'work-items']),
  llmConfig: z.object({
    provider: z.string(),
    model: z.string(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
  })
});

// Generate candidates for human-in-the-loop review
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const validatedData = generationRequestSchema.parse(body);
    const { 
      parentType, 
      parentId, 
      targetType, 
      quantity, 
      additionalContext, 
      pageSource, 
      llmConfig 
    } = validatedData;

    console.log('🎯 Generation request:', { parentType, parentId, targetType, quantity, pageSource, provider: llmConfig.provider });

    // 🔒 SECURITY: Get API key from server-side secrets manager (never from client)
    const apiKey = await secretsManager.getApiKey(llmConfig.provider as LLMProvider);
    
    if (!apiKey) {
      throw new Error(`${llmConfig.provider} is not configured. Please set the API key in environment variables.`);
    }

    // Build complete LLM settings with server-side key
    const llmSettings = {
      provider: llmConfig.provider,
      model: llmConfig.model,
      apiKey, // 🔒 Retrieved server-side only
      temperature: llmConfig.temperature || 0.7,
      maxTokens: llmConfig.maxTokens || 4000
    };

    console.log('🔐 Using server-side API key for:', llmConfig.provider, '(key never exposed to client)');

    
    // Get parent data for context
    const connection = await createConnection();
    let parentData: any = null;
    let businessBriefData: any = null;

    if (parentType === 'BusinessBrief') {
      const [briefRows] = await connection.execute(
        'SELECT * FROM business_briefs WHERE id = ?',
        [parentId]
      );
      parentData = (briefRows as any[])[0];
      businessBriefData = parentData;
    } else {
      // Get the work item
      const tableName = parentType.toLowerCase() + 's';
      const [workItemRows] = await connection.execute(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [parentId]
      );
      parentData = (workItemRows as any[])[0];

      // Also get the business brief if available
      if (parentData?.businessBriefId) {
        const [parentBriefRows] = await connection.execute(
          'SELECT * FROM business_briefs WHERE id = ?',
          [parentData.businessBriefId]
        );
        businessBriefData = (parentBriefRows as any[])[0];
      }
    }

    if (!parentData) {
      throw new Error(`${parentType} with ID ${parentId} not found`);
    }

    // Log generation request audit
    await auditService.logEvent({
      userId: 'system', // TODO: Get real user ID from session
      sessionId: null,
      eventType: 'generation',
      featureCategory: targetType.toLowerCase() as any,
      action: 'generate_candidates',
      resourceType: parentType.toLowerCase(),
      resourceId: parentId,
      resourceTitle: parentData.title || parentData.businessObjective,
      promptData: {
        parentType,
        parentId,
        targetType,
        quantity,
        additionalContext,
        pageSource
      },
      aiModelUsed: `${llmSettings.provider}:${llmSettings.model}`,
      pageUrl: `/${pageSource}`,
      metadata: {
        requestId: `gen-${Date.now()}`,
        parentTitle: parentData.title || parentData.businessObjective
      }
    });

    // Initialize LLM service
    const llmService = new LLMService(llmSettings);

    // Generate candidates based on target type
    let result: any;
    let candidates: any[] = [];
    
    switch (targetType) {
      case 'Initiative':
        if (parentType !== 'BusinessBrief') {
          throw new Error('Initiatives can only be generated from Business Briefs');
        }
        result = await llmService.generateInitiativesWithQuantity(businessBriefData, quantity, additionalContext);
        candidates = result.initiatives || [];
        break;
        
      case 'Feature':
        if (parentType !== 'Initiative') {
          throw new Error('Features can only be generated from Initiatives');
        }
        result = await llmService.generateFeaturesWithQuantity(parentData, businessBriefData, quantity, additionalContext);
        candidates = result.features || [];
        break;
        
      case 'Epic':
        if (parentType !== 'Feature') {
          throw new Error('Epics can only be generated from Features');
        }
        // We need initiative and business brief context for epic generation
        // Follow the chain: Feature -> Initiative -> Business Brief
        
        if (!parentData.initiative_id) {
          throw new Error('Feature does not have an associated initiative');
        }
        
        const [initiativeRows] = await connection.execute(
          'SELECT * FROM initiatives WHERE id = ?',
          [parentData.initiative_id]
        );
        const initiativeData = (initiativeRows as any[])[0];
        
        if (!initiativeData) {
          throw new Error(`Initiative with ID ${parentData.initiative_id} not found`);
        }
        
        if (!initiativeData.business_brief_id) {
          throw new Error('Initiative does not have an associated business brief');
        }
        
        const [epicBriefRows] = await connection.execute(
          'SELECT * FROM business_briefs WHERE id = ?',
          [initiativeData.business_brief_id]
        );
        businessBriefData = (epicBriefRows as any[])[0];
        
        if (!businessBriefData) {
          throw new Error(`Business Brief with ID ${initiativeData.business_brief_id} not found`);
        }
        
        result = await llmService.generateEpicsWithQuantity(parentData, initiativeData, businessBriefData, quantity, additionalContext);
        candidates = result.epics || [];
        break;
        
      case 'Story':
        if (parentType !== 'Epic') {
          throw new Error('Stories can only be generated from Epics');
        }
        // We need feature, initiative, and business brief context for story generation
        // Follow the chain: Epic -> Feature -> Initiative -> Business Brief
        
        if (!parentData.feature_id) {
          throw new Error('Epic does not have an associated feature');
        }
        
        const [featureRows] = await connection.execute(
          'SELECT * FROM features WHERE id = ?',
          [parentData.feature_id]
        );
        const featureData = (featureRows as any[])[0];
        
        if (!featureData) {
          throw new Error(`Feature with ID ${parentData.feature_id} not found`);
        }
        
        if (!featureData.initiative_id) {
          throw new Error('Feature does not have an associated initiative');
        }
        
        const [initRows] = await connection.execute(
          'SELECT * FROM initiatives WHERE id = ?',
          [featureData.initiative_id]
        );
        const initData = (initRows as any[])[0];
        
        if (!initData) {
          throw new Error(`Initiative with ID ${featureData.initiative_id} not found`);
        }
        
        if (!initData.business_brief_id) {
          throw new Error('Initiative does not have an associated business brief');
        }
        
        const [storyBriefRows] = await connection.execute(
          'SELECT * FROM business_briefs WHERE id = ?',
          [initData.business_brief_id]
        );
        businessBriefData = (storyBriefRows as any[])[0];
        
        if (!businessBriefData) {
          throw new Error(`Business Brief with ID ${initData.business_brief_id} not found`);
        }
        
        result = await llmService.generateStoriesWithQuantity(parentData, businessBriefData, initData, featureData, quantity, additionalContext);
        candidates = result.stories || [];
        break;
        
      default:
        throw new Error(`Unsupported target type: ${targetType}`);
    }

    await connection.end();

    // Transform candidates to include required fields and generate temp IDs
    const transformedCandidates = candidates.map((candidate, index) => ({
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${index}`,
      title: candidate.title || `Untitled ${targetType}`,
      description: candidate.description || 'No description provided',
      acceptanceCriteria: candidate.acceptanceCriteria || ['To be defined'],
      tags: candidate.tags || [],
      estimations: {
        storyPoints: candidate.storyPoints || candidate.estimatedStoryPoints,
        estimatedEffort: candidate.estimatedEffort,
        sprintEstimate: candidate.sprintEstimate
      },
      links: {
        parentId,
        parentType
      },
      category: candidate.category || 'functional',
      priority: candidate.priority || 'medium',
      businessValue: candidate.businessValue || 'Business value to be determined',
      rationale: candidate.rationale || 'No rationale provided',
      labels: candidate.labels || [],
      testingNotes: candidate.testingNotes || '',
      rawModelOutput: JSON.stringify(candidate, null, 2)
    }));

    const generationTime = Date.now() - startTime;

    // Log generation results audit
    await auditService.logEvent({
      userId: 'system',
      sessionId: null,
      eventType: 'generation',
      featureCategory: targetType.toLowerCase() as any,
      action: 'candidates_generated',
      resourceType: parentType.toLowerCase(),
      resourceId: parentId,
      resourceTitle: parentData.title || parentData.businessObjective,
      generationData: {
        candidates: transformedCandidates,
        candidateCount: transformedCandidates.length,
        requestedQuantity: quantity
      },
      generationTimeMs: generationTime,
      aiModelUsed: `${llmSettings.provider}:${llmSettings.model}`,
      metadata: {
        success: true,
        promptUsed: result.promptUsed || 'N/A'
      }
    });

    const response = {
      success: true,
      data: {
        candidates: transformedCandidates,
        model: `${llmSettings.provider}:${llmSettings.model}`,
        promptUsed: result.promptUsed || 'Generation prompt not captured',
        metadata: {
          generationTime,
          requestedQuantity: quantity,
          actualQuantity: transformedCandidates.length,
          parentType,
          parentId,
          targetType
        }
      }
    };

    console.log(`✅ Generated ${transformedCandidates.length} ${targetType} candidates in ${generationTime}ms`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Generation error:', error);
    
    const generationTime = Date.now() - startTime;

    // Log error audit
    if (auditService) {
      try {
        await auditService.logEvent({
          userId: 'system',
          sessionId: null,
          eventType: 'generation',
          featureCategory: 'system',
          action: 'generation_failed',
          resourceType: body?.parentType?.toLowerCase() || 'unknown',
          resourceId: body?.parentId || null,
          generationTimeMs: generationTime,
          metadata: {
            error: error.message,
            success: false
          }
        });
      } catch (auditError) {
        console.error('Failed to log error audit:', auditError);
      }
    }

    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
