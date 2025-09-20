import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json();
    
    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Events must be an array' },
        { status: 400 }
      );
    }

    const connection = await createConnection();
    const eventIds: string[] = [];

    // Batch insert events to database
    for (const auditEvent of events) {
      const eventId = generateUUID();
      eventIds.push(eventId);
      
      // Check if user exists before inserting
      const [userCheck] = await connection.execute(
        'SELECT id FROM users WHERE id = ?', 
        [auditEvent.userId]
      );
      
      if ((userCheck as any[]).length === 0) {
        console.log(`Skipping audit event for non-existent user: ${auditEvent.userId}`);
        continue;
      }
      
      try {
        await connection.execute(`
          INSERT INTO audit_events (
            id, user_id, session_id, event_type, feature_category, action,
            resource_type, resource_id, resource_title, generation_data, prompt_data,
            ai_model_used, generation_time_ms, before_content, after_content,
            edit_type, fields_changed, was_saved, was_exported, was_integrated,
            integration_target, page_url, referrer_url, browser_info, metadata,
            user_satisfaction_score, content_quality_score, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          eventId,
          auditEvent.userId || null,
          auditEvent.sessionId || null,
          auditEvent.eventType || null,
          auditEvent.featureCategory || null,
          auditEvent.action || null,
          auditEvent.resourceType || null,
          auditEvent.resourceId || null,
          auditEvent.resourceTitle || null,
          auditEvent.generationData ? JSON.stringify(auditEvent.generationData) : null,
          auditEvent.promptData ? JSON.stringify(auditEvent.promptData) : null,
          auditEvent.aiModelUsed || null,
          auditEvent.generationTimeMs || null,
          auditEvent.beforeContent ? JSON.stringify(auditEvent.beforeContent) : null,
          auditEvent.afterContent ? JSON.stringify(auditEvent.afterContent) : null,
          auditEvent.editType || null,
          auditEvent.fieldsChanged ? JSON.stringify(auditEvent.fieldsChanged) : null,
          auditEvent.wasSaved || false,
          auditEvent.wasExported || false,
          auditEvent.wasIntegrated || false,
          auditEvent.integrationTarget || null,
          auditEvent.pageUrl || null,
          auditEvent.referrerUrl || null,
          auditEvent.browserInfo ? JSON.stringify(auditEvent.browserInfo) : null,
          auditEvent.metadata ? JSON.stringify(auditEvent.metadata) : null,
          auditEvent.userSatisfactionScore || null,
          auditEvent.contentQualityScore || null
        ]);
      } catch (insertError) {
        console.error('Failed to insert event:', insertError);
        // Continue with other events even if one fails
      }
    }

    await connection.end();

    // Log summary to console
    console.log(`Processing ${events.length} audit events: ${eventIds.length} saved successfully`);

    return NextResponse.json({ 
      success: true, 
      processedCount: eventIds.length,
      eventIds
    });
  } catch (error) {
    console.error('Failed to process audit event batch:', error);
    return NextResponse.json(
      { error: 'Failed to process audit event batch' },
      { status: 500 }
    );
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
