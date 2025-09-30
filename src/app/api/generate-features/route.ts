import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService } from '@/lib/services/llm-service';
import { createConnection } from '@/lib/database';

// Request validation schema for features
const generateFeaturesSchema = z.object({
  initiativeId: z.string(),
  businessBriefId: z.string(),
  initiativeData: z.object({
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
  llmSettings: z.object({
    provider: z.string(),
    model: z.string(),
    apiKey: z.string(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedData = generateFeaturesSchema.parse(body);
    const { initiativeId, businessBriefId, initiativeData, businessBriefData, llmSettings } = validatedData;

    // Initialize LLM service
    const llmService = new LLMService(llmSettings);

    // Generate features through iterative process with full context
    const result = await llmService.generateFeatures(initiativeData, businessBriefData);

    console.log(`💾 Saving ${result.features.length} generated features to database...`);

    // Connect to database and save features
    const connection = await createConnection();
    const savedFeatures = [];

    for (const feature of result.features) {
      try {
        const featureId = `feat-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;
        
        await connection.execute(`
          INSERT INTO features (
            id, initiative_id, title, description, business_value, acceptance_criteria,
            priority, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          featureId,
          initiativeId,
          feature.title,
          feature.description || '',
          feature.businessValue || '',
          JSON.stringify(feature.acceptanceCriteria || []),
          feature.priority || 'medium',
          'planning'
        ]);

        savedFeatures.push({
          id: featureId,
          initiativeId,
          businessBriefId,
          title: feature.title,
          description: feature.description,
          businessValue: feature.businessValue,
          acceptanceCriteria: feature.acceptanceCriteria,
          priority: feature.priority,
          status: 'planning'
        });

        console.log(`✅ Saved feature: ${feature.title} (ID: ${featureId})`);
      } catch (saveError) {
        console.error(`❌ Failed to save feature: ${feature.title}`, saveError);
      }
    }

    await connection.end();
    console.log(`✅ Successfully saved ${savedFeatures.length}/${result.features.length} features to database`);

    return NextResponse.json({
      success: true,
      data: {
        initiativeId,
        businessBriefId,
        features: savedFeatures, // Return the saved features with database IDs
        metadata: {
          generated: result.features.length,
          saved: savedFeatures.length,
          iterationCount: result.iterationCount,
          totalTokensUsed: result.totalTokensUsed,
          processingTime: result.processingTime,
          llmProvider: llmSettings.provider,
          llmModel: llmSettings.model,
        },
      },
    });
  } catch (error) {
    console.error('Error generating features:', error);

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