import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';
import { z } from 'zod';

const saveWorkItemSchema = z.object({
  type: z.enum(['feature', 'epic', 'story']),
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    businessValue: z.string().optional(),
    acceptanceCriteria: z.any().optional(),
    priority: z.string().optional(),
    status: z.string().optional(),
    assignedTo: z.string().optional(),
    storyPoints: z.number().optional(),
    workflowStage: z.string().optional(),
    completionPercentage: z.number().optional(),
    // Type-specific fields
    initiativeId: z.string().optional(), // for features
    featureId: z.string().optional(), // for epics  
    epicId: z.string().optional(), // for stories
    userStory: z.string().optional(), // for stories
  }))
});

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Work items save API called');
    
    const body = await request.json();
    const validatedData = saveWorkItemSchema.parse(body);
    const { type, items } = validatedData;

    console.log(`💾 Saving ${items.length} ${type}s to database...`);

    const connection = await createConnection();
    let savedCount = 0;

    for (const item of items) {
      try {
        switch (type) {
          case 'feature':
            const [featureResult] = await connection.execute(`
              INSERT INTO features (
                id, initiative_id, title, description, business_value, acceptance_criteria,
                priority, status, assigned_to, story_points, workflow_stage, completion_percentage
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              item.id,
              item.initiativeId,
              item.title,
              item.description || '',
              item.businessValue || '',
              Array.isArray(item.acceptanceCriteria) 
                ? JSON.stringify(item.acceptanceCriteria) 
                : JSON.stringify(item.acceptanceCriteria || []),
              item.priority || 'medium',
              item.status === 'draft' ? 'backlog' : (item.status || 'backlog'),
              item.assignedTo ?? null,
              item.storyPoints ?? null,
              item.workflowStage ?? null,
              item.completionPercentage ?? 0
            ]) as any;
            break;

          case 'epic':
            const [epicResult] = await connection.execute(`
              INSERT INTO epics (
                id, feature_id, title, description, business_value, acceptance_criteria,
                priority, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              item.id,
              item.featureId,
              item.title,
              item.description || '',
              item.businessValue || '',
              Array.isArray(item.acceptanceCriteria) 
                ? JSON.stringify(item.acceptanceCriteria) 
                : JSON.stringify(item.acceptanceCriteria || []),
              item.priority || 'medium',
              item.status === 'draft' ? 'backlog' : (item.status || 'backlog')
            ]) as any;
            break;

          case 'story':
            const [storyResult] = await connection.execute(`
              INSERT INTO stories (
                id, epic_id, title, description, user_story, acceptance_criteria,
                priority, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              item.id,
              item.epicId,
              item.title,
              item.description || '',
              item.userStory || '',
              Array.isArray(item.acceptanceCriteria) 
                ? JSON.stringify(item.acceptanceCriteria) 
                : JSON.stringify(item.acceptanceCriteria || []),
              item.priority || 'medium',
              item.status === 'draft' ? 'backlog' : (item.status || 'backlog')
            ]) as any;
            break;
        }
        console.log(`✅ Successfully saved ${type} ${item.id}`);
        savedCount++;
      } catch (saveError) {
        console.error(`❌ Failed to save ${type} ${item.id}:`, saveError);
        console.error(`❌ SQL Error details:`, saveError.message);
        console.error(`❌ Item data:`, item);
      }
    }

    await connection.end();

    console.log(`✅ Successfully saved ${savedCount}/${items.length} ${type}s to database`);

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${savedCount} ${type}s to database`,
      data: {
        type,
        saved: savedCount,
        total: items.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to save work items:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to save work items',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
