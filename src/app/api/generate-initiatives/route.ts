import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService } from '@/lib/services/llm-service';
import { createConnection } from '@/lib/database';

// Request validation schema for initiatives
const generateInitiativesSchema = z.object({
  businessBriefId: z.string(),
  businessBriefData: z.object({
    title: z.string(),
    businessObjective: z.string(),
    quantifiableBusinessOutcomes: z.string(),
    inScope: z.string().optional(),
    impactOfDoNothing: z.string().optional(),
    happyPath: z.string().optional(),
    exceptions: z.string().optional(),
    acceptanceCriteria: z.array(z.string()).optional(),
    impactedEndUsers: z.string().optional(),
    changeImpactExpected: z.string().optional(),
    impactToOtherDepartments: z.string().optional(),
    businessOwner: z.string().optional(),
    leadBusinessUnit: z.string().optional(),
    primaryStrategicTheme: z.string().optional(),
  }),
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
    const validatedData = generateInitiativesSchema.parse(body);
    const { businessBriefId, businessBriefData, llmSettings } = validatedData;

    // Initialize LLM service
    const llmService = new LLMService(llmSettings);

    // Generate initiatives through iterative process
    const result = await llmService.generateInitiatives(businessBriefData);

    console.log(`💾 Saving ${result.initiatives.length} generated initiatives to database...`);

    // Connect to database using reliable method
    const connection = await createConnection();

    // Save each generated initiative to the database
    const savedInitiatives = [];
    for (const initiative of result.initiatives) {
      try {
        const initiativeData = {
          id: `INIT-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
          businessBriefId: businessBriefId,
          title: initiative.title,
          description: initiative.description,
          businessValue: initiative.businessValue || initiative.rationale || '',
          acceptanceCriteria: JSON.stringify(initiative.acceptanceCriteria || []), // Convert array to JSON string for database
          priority: initiative.priority || 'medium',
          status: 'planning',
          assignedTo: businessBriefData.businessOwner || 'Unassigned',
          estimatedValue: null, // Database expects null, not 0
          workflowStage: 'planning',
          completionPercentage: 0
        };

        console.log(`💾 Saving initiative "${initiative.title}" with data:`, {
          id: initiativeData.id,
          businessBriefId: initiativeData.businessBriefId,
          title: initiativeData.title,
          priority: initiativeData.priority,
          status: initiativeData.status,
          assignedTo: initiativeData.assignedTo
        });

        // Insert initiative using simple SQL
        await connection.execute(`
          INSERT INTO initiatives (
            id, business_brief_id, title, description, business_value, acceptance_criteria,
            priority, status, assigned_to, estimated_value, workflow_stage, completion_percentage,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          initiativeData.id,
          initiativeData.businessBriefId,
          initiativeData.title,
          initiativeData.description,
          initiativeData.businessValue,
          initiativeData.acceptanceCriteria,
          initiativeData.priority,
          initiativeData.status,
          initiativeData.assignedTo,
          initiativeData.estimatedValue,
          initiativeData.workflowStage,
          initiativeData.completionPercentage
        ]);

        // Get the saved initiative
        const [savedResult] = await connection.execute(
          'SELECT * FROM initiatives WHERE id = ?',
          [initiativeData.id]
        ) as any;

        const savedInitiative = savedResult[0];
        savedInitiatives.push({
          id: savedInitiative.id,
          businessBriefId: savedInitiative.business_brief_id,
          title: savedInitiative.title,
          description: savedInitiative.description,
          businessValue: savedInitiative.business_value,
          acceptanceCriteria: savedInitiative.acceptance_criteria,
          priority: savedInitiative.priority,
          status: savedInitiative.status,
          assignedTo: savedInitiative.assigned_to,
          estimatedValue: savedInitiative.estimated_value,
          workflowStage: savedInitiative.workflow_stage,
          completionPercentage: savedInitiative.completion_percentage,
          createdAt: savedInitiative.created_at,
          updatedAt: savedInitiative.updated_at
        });
        
        console.log(`✅ Saved initiative: ${savedInitiative.title} (ID: ${savedInitiative.id})`);
      } catch (saveError) {
        console.error(`❌ Failed to save initiative: ${initiative.title}`, saveError);
        console.error('Initiative data that failed:', initiative);
        // Continue with other initiatives even if one fails
      }
    }

    await connection.end();

    console.log(`✅ Successfully saved ${savedInitiatives.length}/${result.initiatives.length} initiatives to database`);

    return NextResponse.json({
      success: true,
      data: {
        businessBriefId,
        initiatives: savedInitiatives, // Return the saved initiatives with database IDs
        metadata: {
          generated: result.initiatives.length,
          saved: savedInitiatives.length,
          iterationCount: result.iterationCount,
          totalTokensUsed: result.totalTokensUsed,
          processingTime: result.processingTime,
          llmProvider: llmSettings.provider,
          llmModel: llmSettings.model,
        },
      },
    });
  } catch (error) {
    console.error('Error generating initiatives:', error);

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