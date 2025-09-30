import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Initiatives list API called');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const businessBriefId = searchParams.get('businessBriefId');
    const status = searchParams.get('status');

    // Connect to database
    const connection = await createConnection();

    // Build query with filters
    let query = 'SELECT * FROM initiatives';
    const params = [];
    const conditions = [];
    
    if (businessBriefId) {
      conditions.push('business_brief_id = ?');
      params.push(businessBriefId);
    }
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';

    // Execute query
    const [initiativesResult] = await connection.execute(query, params) as any;
    
    // Transform database results to expected format
    const initiatives = initiativesResult.map((row: any) => ({
      id: row.id,
      businessBriefId: row.business_brief_id,
      title: row.title,
      description: row.description,
      businessValue: row.business_value,
      acceptanceCriteria: row.acceptance_criteria,
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to,
      portfolioId: row.portfolio_id,
      estimatedValue: row.estimated_value,
      workflowStage: row.workflow_stage,
      completionPercentage: row.completion_percentage,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    await connection.end();

    console.log('✅ Retrieved initiatives from database:', initiatives.length);

    return NextResponse.json({
      success: true,
      data: initiatives,
      count: initiatives.length,
      message: 'Initiatives retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching initiatives:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch initiatives',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
