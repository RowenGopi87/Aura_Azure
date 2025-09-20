import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const connection = await createConnection();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '7d';
    const eventType = searchParams.get('eventType') || 'all';
    const featureCategory = searchParams.get('featureCategory') || 'all';
    const userId = searchParams.get('userId') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Calculate date filter
    const daysBack = parseInt(dateRange.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    // Build WHERE clause for filtering
    let whereClause = `WHERE ae.created_at >= '${startDate.toISOString().slice(0, 19).replace('T', ' ')}'`;
    
    if (eventType !== 'all') {
      whereClause += ` AND ae.event_type = '${eventType}'`;
    }
    
    if (featureCategory !== 'all') {
      whereClause += ` AND ae.feature_category = '${featureCategory}'`;
    }
    
    if (userId !== 'all') {
      whereClause += ` AND ae.user_id = '${userId}'`;
    }

    // Get audit events with user information
    const [eventsResults] = await connection.execute(`
      SELECT 
        ae.id,
        ae.user_id as userId,
        u.display_name as userName,
        u.email as userEmail,
        ae.event_type as eventType,
        ae.feature_category as featureCategory,
        ae.action,
        ae.resource_type as resourceType,
        ae.resource_id as resourceId,
        ae.resource_title as resourceTitle,
        ae.was_saved as wasSaved,
        ae.was_exported as wasExported,
        ae.was_integrated as wasIntegrated,
        ae.integration_target as integrationTarget,
        ae.generation_time_ms as generationTimeMs,
        ae.ai_model_used as aiModelUsed,
        ae.created_at as createdAt,
        ae.before_content,
        ae.after_content,
        ae.edit_type,
        ae.fields_changed,
        ae.metadata
      FROM audit_events ae
      LEFT JOIN users u ON ae.user_id = u.id
      ${whereClause}
      ORDER BY ae.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Get total count for pagination
    const [countResults] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM audit_events ae
      ${whereClause}
    `);

    await connection.end();

    // Format the response
    const events = (eventsResults as any[]).map((row: any) => ({
      id: row.id,
      userId: row.userId,
      userName: row.userName || 'Unknown User',
      userEmail: row.userEmail || '',
      eventType: row.eventType,
      featureCategory: row.featureCategory,
      action: row.action,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      resourceTitle: row.resourceTitle,
      wasSaved: Boolean(row.wasSaved),
      wasExported: Boolean(row.wasExported),
      wasIntegrated: Boolean(row.wasIntegrated),
      integrationTarget: row.integrationTarget,
      generationTimeMs: row.generationTimeMs,
      aiModelUsed: row.aiModelUsed,
      createdAt: row.createdAt,
      // Parse JSON fields safely
      beforeContent: row.before_content ? JSON.parse(row.before_content) : null,
      afterContent: row.after_content ? JSON.parse(row.after_content) : null,
      editType: row.edit_type,
      fieldsChanged: row.fields_changed ? JSON.parse(row.fields_changed) : [],
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }));

    return NextResponse.json({
      events,
      total: (countResults as any)[0]?.total || 0,
      limit,
      offset
    });
    
  } catch (error) {
    console.error('Failed to fetch audit events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit events' },
      { status: 500 }
    );
  }
}
