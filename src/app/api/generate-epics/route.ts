import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService } from '@/lib/services/llm-service';
import { createConnection } from '@/lib/database';
import { secretsManager, LLMProvider } from '@/lib/secrets/secrets-manager';

// Request validation schema for epics
const generateEpicsSchema = z.object({
  featureId: z.string(),
  initiativeId: z.string(),
  businessBriefId: z.string(),
  featureData: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    priority: z.string(),
    rationale: z.string(),
    acceptanceCriteria: z.array(z.string()),
    businessValue: z.string(),
    workflowLevel: z.string(),
  }),
  businessBriefData: z.object({
    title: z.string(),
    businessObjective: z.string(),
    quantifiableBusinessOutcomes: z.string(),
    inScope: z.string().nullable().optional(),
    impactOfDoNothing: z.string().nullable().optional(),
    happyPath: z.string().nullable().optional(),
    exceptions: z.string().nullable().optional(),
    impactedEndUsers: z.string().nullable().optional(),
    changeImpactExpected: z.string().nullable().optional(),
  }).optional(),
  initiativeData: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    priority: z.string(),
    rationale: z.string(),
    acceptanceCriteria: z.array(z.string()),
    businessValue: z.string(),
    workflowLevel: z.string(),
  }).optional(),
  llmConfig: z.object({
    provider: z.string(),
    model: z.string(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedData = generateEpicsSchema.parse(body);
    const { featureId, initiativeId, businessBriefId, featureData, businessBriefData, initiativeData, llmConfig } = validatedData;

    // 🔒 SECURITY: Get API key from server-side secrets manager
    const apiKey = await secretsManager.getApiKey(llmConfig.provider as LLMProvider);
    if (!apiKey) {
      throw new Error(`${llmConfig.provider} is not configured. Please set the API key in environment variables.`);
    }

    const llmSettings = {
      provider: llmConfig.provider,
      model: llmConfig.model,
      apiKey,
      temperature: llmConfig.temperature || 0.7,
      maxTokens: llmConfig.maxTokens || 4000
    };

    // Initialize LLM service
    const llmService = new LLMService(llmSettings);

    // Generate epics through iterative process with full context
    const result = await llmService.generateEpics(featureData, businessBriefData, initiativeData);

    console.log(`💾 Saving ${result.epics.length} generated epics to database...`);

    // Connect to database and save epics
    const connection = await createConnection();
    const savedEpics = [];

    for (const epic of result.epics) {
      try {
        const epicId = `epic-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;
        
        await connection.execute(`
          INSERT INTO epics (
            id, feature_id, title, description, business_value, acceptance_criteria,
            priority, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          epicId,
          featureId,
          epic.title,
          epic.description || '',
          epic.businessValue || '',
          JSON.stringify(epic.acceptanceCriteria || []),
          epic.priority || 'medium',
          epic.status === 'draft' ? 'backlog' : (epic.status || 'backlog')
        ]);

        savedEpics.push({
          id: epicId,
          featureId,
          initiativeId,
          businessBriefId,
          title: epic.title,
          description: epic.description,
          businessValue: epic.businessValue,
          acceptanceCriteria: epic.acceptanceCriteria,
          priority: epic.priority,
          status: 'planning'
        });

        console.log(`✅ Saved epic: ${epic.title} (ID: ${epicId})`);
      } catch (saveError) {
        console.error(`❌ Failed to save epic: ${epic.title}`, saveError);
      }
    }

    await connection.end();
    console.log(`✅ Successfully saved ${savedEpics.length}/${result.epics.length} epics to database`);

    return NextResponse.json({
      success: true,
      data: {
        featureId,
        initiativeId,
        businessBriefId,
        epics: savedEpics, // Return the saved epics with database IDs
        metadata: {
          generated: result.epics.length,
          saved: savedEpics.length,
          iterationCount: result.iterationCount,
          totalTokensUsed: result.totalTokensUsed,
          processingTime: result.processingTime,
          llmProvider: llmSettings.provider,
          llmModel: llmSettings.model,
        },
      },
    });
  } catch (error) {
    console.error('Error generating epics:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
} 