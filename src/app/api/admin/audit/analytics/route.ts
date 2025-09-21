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

    // Get analytics data
    const [analyticsResults] = await connection.execute(`
      SELECT 
        COUNT(CASE WHEN ae.event_type = 'generation' THEN 1 END) as totalGenerations,
        COUNT(CASE WHEN ae.event_type = 'edit' THEN 1 END) as totalEdits,
        COUNT(CASE WHEN ae.event_type = 'save' THEN 1 END) as totalSaves,
        COUNT(CASE WHEN ae.event_type = 'delete' THEN 1 END) as totalDeletes,
        COUNT(CASE WHEN ae.event_type = 'export' OR ae.event_type = 'integration' THEN 1 END) as totalExports,
        AVG(CASE WHEN ae.generation_time_ms IS NOT NULL THEN ae.generation_time_ms END) as avgGenerationTime
      FROM audit_events ae
      ${whereClause}
    `);

    // Get value metrics
    const [valueMetricsResults] = await connection.execute(`
      SELECT 
        COUNT(CASE WHEN ae.event_type = 'generation' AND ae.was_saved = 1 AND ae.resource_id NOT IN (
          SELECT DISTINCT resource_id FROM audit_events WHERE event_type = 'edit' AND resource_id = ae.resource_id
        ) THEN 1 END) as generationsKeptWithoutEdit,
        COUNT(CASE WHEN ae.event_type = 'edit' THEN 1 END) as generationsEdited,
        COUNT(CASE WHEN ae.event_type = 'delete' AND ae.resource_id IN (
          SELECT DISTINCT resource_id FROM audit_events WHERE event_type = 'generation' AND resource_id = ae.resource_id
        ) THEN 1 END) as generationsDeleted,
        AVG(edit_counts.edit_count) as averageEditCount
      FROM audit_events ae
      LEFT JOIN (
        SELECT resource_id, COUNT(*) as edit_count
        FROM audit_events 
        WHERE event_type = 'edit'
        GROUP BY resource_id
      ) edit_counts ON ae.resource_id = edit_counts.resource_id
      ${whereClause}
    `);

    // Get top users
    const [topUsersResults] = await connection.execute(`
      SELECT 
        u.display_name as name,
        COUNT(ae.id) as count
      FROM audit_events ae
      JOIN users u ON ae.user_id = u.id
      ${whereClause}
      GROUP BY ae.user_id, u.display_name
      ORDER BY count DESC
      LIMIT 10
    `);

    // Get feature usage
    const [featureUsageResults] = await connection.execute(`
      SELECT 
        ae.feature_category as feature,
        COUNT(ae.id) as count
      FROM audit_events ae
      ${whereClause}
      GROUP BY ae.feature_category
      ORDER BY count DESC
    `);

    // Get daily activity for the last 7 days
    const [dailyActivityResults] = await connection.execute(`
      SELECT 
        DATE(ae.created_at) as date,
        COUNT(CASE WHEN ae.event_type = 'generation' THEN 1 END) as generations,
        COUNT(CASE WHEN ae.event_type = 'edit' THEN 1 END) as edits,
        COUNT(CASE WHEN ae.event_type = 'save' THEN 1 END) as saves
      FROM audit_events ae
      WHERE ae.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(ae.created_at)
      ORDER BY date ASC
    `);

    // Get prompt analytics
    const [promptAnalyticsResults] = await connection.execute(`
      SELECT 
        pa.keywords,
        pa.usage_count as usageCount,
        pa.success_rate as successRate
      FROM prompt_analytics pa
      WHERE pa.created_at >= '${startDate.toISOString().slice(0, 19).replace('T', ' ')}'
      ORDER BY pa.usage_count DESC
      LIMIT 10
    `);

    await connection.end();

    // Format the response
    const analytics = {
      totalGenerations: (analyticsResults as any)[0]?.totalGenerations || 0,
      totalEdits: (analyticsResults as any)[0]?.totalEdits || 0,
      totalSaves: (analyticsResults as any)[0]?.totalSaves || 0,
      totalDeletes: (analyticsResults as any)[0]?.totalDeletes || 0,
      totalExports: (analyticsResults as any)[0]?.totalExports || 0,
      avgGenerationTime: Math.round((analyticsResults as any)[0]?.avgGenerationTime || 0),
      
      valueMetrics: {
        generationsKeptWithoutEdit: (valueMetricsResults as any)[0]?.generationsKeptWithoutEdit || 0,
        generationsEdited: (valueMetricsResults as any)[0]?.generationsEdited || 0,
        generationsDeleted: (valueMetricsResults as any)[0]?.generationsDeleted || 0,
        averageEditCount: Math.round(((valueMetricsResults as any)[0]?.averageEditCount || 0) * 10) / 10
      },
      
      topUsers: (topUsersResults as any[]).map((row: any) => ({
        name: row.name,
        count: row.count
      })),
      
      featureUsage: (featureUsageResults as any[]).map((row: any) => ({
        feature: row.feature.charAt(0).toUpperCase() + row.feature.slice(1),
        count: row.count
      })),
      
      dailyActivity: (dailyActivityResults as any[]).map((row: any) => ({
        date: new Date(row.date).toLocaleDateString(),
        generations: row.generations,
        edits: row.edits,
        saves: row.saves
      })),
      
      promptAnalytics: (promptAnalyticsResults as any[]).map((row: any) => {
        let keywords = [];
        try {
          keywords = JSON.parse(row.keywords || '[]');
        } catch (e) {
          keywords = [];
        }
        
        return keywords.map((keyword: string) => ({
          keyword,
          usage: row.usageCount,
          successRate: row.successRate || 0.5
        }));
      }).flat().slice(0, 10)
    };

    return NextResponse.json(analytics);
    
  } catch (error) {
    console.error('Failed to fetch audit analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit analytics' },
      { status: 500 }
    );
  }
}
