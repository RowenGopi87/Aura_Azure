import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService } from '@/lib/services/llm-service';
import { createConnection } from '@/lib/database';
import { secretsManager, LLMProvider } from '@/lib/secrets/secrets-manager';

// Request validation schema for stories
const generateStoriesSchema = z.object({
  epicId: z.string(),
  featureId: z.string(),
  initiativeId: z.string(),
  businessBriefId: z.string(),
  epicData: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    priority: z.string(),
    rationale: z.string(),
    acceptanceCriteria: z.array(z.string()),
    businessValue: z.string(),
    workflowLevel: z.string(),
    estimatedEffort: z.string().optional(),
    sprintEstimate: z.number().optional(),
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
  featureData: z.object({
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
    const validatedData = generateStoriesSchema.parse(body);
    const { epicId, featureId, initiativeId, businessBriefId, epicData, businessBriefData, initiativeData, featureData, llmConfig } = validatedData;

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

    // Generate stories through iterative process with full context
    const result = await llmService.generateStories(epicData, businessBriefData, initiativeData, featureData);

    console.log(`💾 Saving ${result.stories.length} generated stories to database...`);

    // Connect to database and save stories
    const connection = await createConnection();
    const savedStories = [];

    for (const story of result.stories) {
      try {
        const storyId = `story-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;
        
        await connection.execute(`
          INSERT INTO stories (
            id, epic_id, title, description, user_story, acceptance_criteria,
            priority, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          storyId,
          epicId,
          story.title,
          story.description || '',
          story.userStory || story.description || '',
          JSON.stringify(story.acceptanceCriteria || []),
          story.priority || 'medium',
          'planning'
        ]);

        savedStories.push({
          id: storyId,
          epicId,
          featureId,
          initiativeId,
          businessBriefId,
          title: story.title,
          description: story.description,
          userStory: story.userStory,
          acceptanceCriteria: story.acceptanceCriteria,
          priority: story.priority,
          status: 'planning'
        });

        console.log(`✅ Saved story: ${story.title} (ID: ${storyId})`);
      } catch (saveError) {
        console.error(`❌ Failed to save story: ${story.title}`, saveError);
      }
    }

    await connection.end();
    console.log(`✅ Successfully saved ${savedStories.length}/${result.stories.length} stories to database`);

    return NextResponse.json({
      success: true,
      data: {
        epicId,
        featureId,
        initiativeId,
        businessBriefId,
        stories: savedStories, // Return the saved stories with database IDs
        metadata: {
          generated: result.stories.length,
          saved: savedStories.length,
          iterationCount: result.iterationCount,
          totalTokensUsed: result.totalTokensUsed,
          processingTime: result.processingTime,
          llmProvider: llmSettings.provider,
          llmModel: llmSettings.model,
        },
      },
    });
  } catch (error) {
    console.error('Error generating stories:', error);

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