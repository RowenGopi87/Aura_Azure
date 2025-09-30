import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createConnection } from '@/lib/database';
import { auditService } from '@/lib/audit/audit-service';

const keptItemSchema = z.object({
  tempId: z.string(),
  title: z.string(),
  description: z.string(),
  acceptanceCriteria: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  estimations: z.object({
    storyPoints: z.number().optional(),
    estimatedEffort: z.string().optional(),
    sprintEstimate: z.number().optional()
  }).optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  businessValue: z.string().optional(),
  rationale: z.string().optional(),
  labels: z.array(z.string()).optional(),
  testingNotes: z.string().optional()
});

const reviewDecisionSchema = z.object({
  candidateId: z.string(),
  action: z.enum(['kept', 'discarded']),
  reason: z.string().optional()
});

const persistRequestSchema = z.object({
  parentType: z.enum(['Initiative', 'Feature', 'Epic', 'BusinessBrief']),
  parentId: z.string(),
  targetType: z.enum(['Initiative', 'Feature', 'Epic', 'Story']),
  kept: z.array(keptItemSchema),
  decisions: z.array(reviewDecisionSchema),
  sessionId: z.string(),
  pageSource: z.enum(['business-brief', 'work-items'])
});

// Persist only the kept candidates to the database
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const validatedData = persistRequestSchema.parse(body);
    const { 
      parentType, 
      parentId, 
      targetType, 
      kept, 
      decisions, 
      sessionId, 
      pageSource 
    } = validatedData;

    console.log('💾 Persist request:', { 
      parentType, 
      parentId, 
      targetType, 
      keptCount: kept.length, 
      sessionId 
    });

    
    // Get database connection
    const connection = await createConnection();
    
    // Get parent data for context
    let parentData: any = null;
    if (parentType === 'BusinessBrief') {
      const [briefRows] = await connection.execute(
        'SELECT * FROM business_briefs WHERE id = ?',
        [parentId]
      );
      parentData = (briefRows as any[])[0];
    } else {
      const tableName = parentType.toLowerCase() + 's';
      const [workItemRows] = await connection.execute(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [parentId]
      );
      parentData = (workItemRows as any[])[0];
    }

    if (!parentData) {
      throw new Error(`${parentType} with ID ${parentId} not found`);
    }

    // Log all review decisions first
    for (const decision of decisions) {
      await auditService.logEvent({
        userId: 'system', // TODO: Get real user ID from session
        sessionId: null,
        eventType: 'generation',
        featureCategory: targetType.toLowerCase() as any,
        action: decision.action === 'kept' ? 'candidate_kept' : 'candidate_discarded',
        resourceType: parentType.toLowerCase(),
        resourceId: parentId,
        resourceTitle: parentData.title || parentData.businessObjective,
        metadata: {
          sessionId,
          candidateId: decision.candidateId,
          decision: decision.action,
          reason: decision.reason,
          pageSource
        }
      });
    }

    // Start transaction for persistence
    await connection.beginTransaction();

    const savedItems: any[] = [];
    const persistErrors: any[] = [];

    try {
      for (const item of kept) {
        try {
          const itemId = `${targetType.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
          let savedItem: any;

          switch (targetType) {
            case 'Initiative':
              await connection.execute(`
                INSERT INTO initiatives (
                  id, business_brief_id, title, description, priority,
                  acceptance_criteria, business_value, workflow_stage,
                  status, assigned_to, estimated_value, completion_percentage
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                itemId,
                parentId, // For initiatives, parentId is the businessBriefId
                item.title,
                item.description,
                item.priority || 'medium',
                JSON.stringify(item.acceptanceCriteria),
                item.businessValue || 'Business value to be determined',
                'planning',
                'planning',
                'Team',
                null, // estimated_value
                0 // completion_percentage
              ]);
              
              savedItem = {
                id: itemId,
                businessBriefId: parentId,
                title: item.title,
                description: item.description,
                category: item.category || 'strategic',
                priority: item.priority || 'medium',
                rationale: item.rationale || 'Generated by AI',
                acceptanceCriteria: item.acceptanceCriteria,
                businessValue: item.businessValue || 'Business value to be determined',
                workflowLevel: 'initiative',
                status: 'planning',
                assignedTo: 'Team',
                estimatedValue: null,
                completionPercentage: 0
              };
              break;

            case 'Feature':
              // Get the initiative's business_brief_id for proper relationship
              const [initForFeature] = await connection.execute(
                'SELECT business_brief_id FROM initiatives WHERE id = ?',
                [parentId]
              );
              const initiativeForFeature = (initForFeature as any[])[0];
              
              await connection.execute(`
                INSERT INTO features (
                  id, initiative_id, title, description, priority,
                  acceptance_criteria, business_value, status, assigned_to, story_points
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                itemId,
                parentId, // For features, parentId is the initiativeId
                item.title,
                item.description,
                item.priority || 'medium',
                JSON.stringify(item.acceptanceCriteria),
                item.businessValue || 'Business value to be determined',
                'planning',
                'Team',
                null // story_points
              ]);
              
              savedItem = {
                id: itemId,
                initiativeId: parentId,
                businessBriefId: initiativeForFeature?.business_brief_id || null,
                title: item.title,
                description: item.description,
                category: item.category || 'functional',
                priority: item.priority || 'medium',
                rationale: item.rationale || 'Generated by AI',
                acceptanceCriteria: item.acceptanceCriteria,
                businessValue: item.businessValue || 'Business value to be determined',
                workflowLevel: 'feature',
                status: 'draft',
                createdBy: 'AI System',
                assignedTo: 'Team'
              };
              break;

            case 'Epic':
              await connection.execute(`
                INSERT INTO epics (
                  id, feature_id, title, description, priority,
                  acceptance_criteria, business_value, status, assigned_to, story_points
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                itemId,
                parentId, // For epics, parentId is the featureId
                item.title,
                item.description,
                item.priority || 'medium',
                JSON.stringify(item.acceptanceCriteria),
                item.businessValue || 'Business value to be determined',
                'planning',
                'Team',
                item.estimations?.sprintEstimate || null // story_points
              ]);
              
              // Get the feature's initiative and business brief for proper relationships
              const [featureForEpic] = await connection.execute(
                'SELECT initiative_id FROM features WHERE id = ?',
                [parentId]
              );
              const featureEpicData = (featureForEpic as any[])[0];
              
              const [initForEpic] = await connection.execute(
                'SELECT business_brief_id FROM initiatives WHERE id = ?',
                [featureEpicData?.initiative_id]
              );
              const initEpicData = (initForEpic as any[])[0];
              
              savedItem = {
                id: itemId,
                featureId: parentId,
                initiativeId: featureEpicData?.initiative_id || null,
                businessBriefId: initEpicData?.business_brief_id || null,
                title: item.title,
                description: item.description,
                category: item.category || 'functional',
                priority: item.priority || 'medium',
                rationale: item.rationale || 'Generated by AI',
                acceptanceCriteria: item.acceptanceCriteria,
                businessValue: item.businessValue || 'Business value to be determined',
                workflowLevel: 'epic',
                estimatedEffort: item.estimations?.estimatedEffort || 'TBD',
                sprintEstimate: item.estimations?.sprintEstimate || 1,
                status: 'draft',
                createdBy: 'AI System',
                assignedTo: 'Team'
              };
              break;

            case 'Story':
              await connection.execute(`
                INSERT INTO stories (
                  id, epic_id, title, description, user_story, priority,
                  acceptance_criteria, status, assigned_to, story_points
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                itemId,
                parentId, // For stories, parentId is the epicId
                item.title,
                item.description,
                item.description, // user_story field
                item.priority || 'medium',
                JSON.stringify(item.acceptanceCriteria),
                'planning',
                'Team',
                item.estimations?.storyPoints || 1
              ]);
              
              // Get the epic's feature, initiative, and business brief for proper relationships
              const [epicForStory] = await connection.execute(
                'SELECT feature_id FROM epics WHERE id = ?',
                [parentId]
              );
              const epicStoryData = (epicForStory as any[])[0];
              
              const [featureForStory] = await connection.execute(
                'SELECT initiative_id FROM features WHERE id = ?',
                [epicStoryData?.feature_id]
              );
              const featureStoryData = (featureForStory as any[])[0];
              
              const [initForStory] = await connection.execute(
                'SELECT business_brief_id FROM initiatives WHERE id = ?',
                [featureStoryData?.initiative_id]
              );
              const initStoryData = (initForStory as any[])[0];
              
              savedItem = {
                id: itemId,
                epicId: parentId,
                featureId: epicStoryData?.feature_id || null,
                initiativeId: featureStoryData?.initiative_id || null,
                businessBriefId: initStoryData?.business_brief_id || null,
                title: item.title,
                description: item.description,
                category: item.category || 'functional',
                priority: item.priority || 'medium',
                rationale: item.rationale || 'Generated by AI',
                acceptanceCriteria: item.acceptanceCriteria,
                businessValue: item.businessValue || 'Business value to be determined',
                workflowLevel: 'story',
                storyPoints: item.estimations?.storyPoints || 1,
                labels: item.labels || [],
                testingNotes: item.testingNotes || '',
                status: 'draft',
                createdBy: 'AI System',
                assignedTo: 'Team'
              };
              break;

            default:
              throw new Error(`Unsupported target type: ${targetType}`);
          }

          savedItems.push(savedItem);

          // Log successful persistence audit
          await auditService.logEvent({
            userId: 'system',
            sessionId: null,
            eventType: 'save',
            featureCategory: targetType.toLowerCase() as any,
            action: 'item_persisted',
            resourceType: targetType.toLowerCase(),
            resourceId: itemId,
            resourceTitle: item.title,
            wasSaved: true,
            metadata: {
              sessionId,
              tempId: item.tempId,
              parentId,
              parentType,
              pageSource,
              persistedSuccessfully: true
            }
          });

          console.log(`✅ Persisted ${targetType}: ${item.title} (${itemId})`);

        } catch (itemError: any) {
          console.error(`❌ Failed to persist ${targetType}: ${item.title}`, itemError);
          
          persistErrors.push({
            tempId: item.tempId,
            title: item.title,
            error: itemError.message
          });

          // Log failed persistence audit
          await auditService.logEvent({
            userId: 'system',
            sessionId: null,
            eventType: 'save',
            featureCategory: targetType.toLowerCase() as any,
            action: 'item_persist_failed',
            resourceType: targetType.toLowerCase(),
            resourceId: null,
            resourceTitle: item.title,
            wasSaved: false,
            metadata: {
              sessionId,
              tempId: item.tempId,
              parentId,
              parentType,
              pageSource,
              error: itemError.message,
              persistedSuccessfully: false
            }
          });
        }
      }

      // Commit transaction if we have any successful saves
      if (savedItems.length > 0) {
        await connection.commit();
        console.log(`🎉 Committed ${savedItems.length} ${targetType}s to database`);
      } else {
        await connection.rollback();
        console.log('🚫 No items to persist, rolling back transaction');
      }

    } catch (transactionError: any) {
      await connection.rollback();
      throw transactionError;
    }

    await connection.end();

    const persistTime = Date.now() - startTime;

    // Log overall persistence completion
    await auditService.logEvent({
      userId: 'system',
      sessionId: null,
      eventType: 'save',
      featureCategory: targetType.toLowerCase() as any,
      action: 'persistence_completed',
      resourceType: parentType.toLowerCase(),
      resourceId: parentId,
      resourceTitle: parentData.title || parentData.businessObjective,
      generationTimeMs: persistTime,
      metadata: {
        sessionId,
        totalCandidates: decisions.length,
        keptCount: kept.length,
        discardedCount: decisions.length - kept.length,
        savedCount: savedItems.length,
        errorCount: persistErrors.length,
        pageSource,
        success: savedItems.length > 0
      }
    });

    const response = {
      success: true,
      data: {
        savedItems,
        savedCount: savedItems.length,
        errorCount: persistErrors.length,
        errors: persistErrors,
        metadata: {
          persistTime,
          sessionId,
          parentType,
          parentId,
          targetType,
          totalProcessed: kept.length
        }
      }
    };

    console.log(`✅ Persist operation completed: ${savedItems.length} saved, ${persistErrors.length} errors`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Persist error:', error);
    
    const persistTime = Date.now() - startTime;

    // Log error audit
    if (auditService) {
      try {
        await auditService.logEvent({
          userId: 'system',
          sessionId: null,
          eventType: 'save',
          featureCategory: 'system',
          action: 'persistence_failed',
          resourceType: body?.parentType?.toLowerCase() || 'unknown',
          resourceId: body?.parentId || null,
          generationTimeMs: persistTime,
          metadata: {
            error: error.message,
            sessionId: body?.sessionId,
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
