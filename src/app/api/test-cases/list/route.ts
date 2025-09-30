import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test cases list API called');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const workItemId = searchParams.get('workItemId');
    const workItemType = searchParams.get('workItemType');
    const status = searchParams.get('status');
    const testType = searchParams.get('testType');

    console.log('📥 Query params:', { workItemId, workItemType, status, testType });

    // Connect to database
    const connection = await createConnection();

    // Build query with filters
    let query = 'SELECT * FROM test_cases';
    const params = [];
    const conditions = [];
    
    if (workItemId) {
      conditions.push('work_item_id = ?');
      params.push(workItemId);
    }
    
    if (workItemType) {
      conditions.push('work_item_type = ?');
      params.push(workItemType);
    }
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (testType) {
      conditions.push('test_type = ?');
      params.push(testType);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';

    // Execute query
    const [testCasesResult] = await connection.execute(query, params) as any;
    
    // Transform database results to expected format
    const testCases = testCasesResult.map((row: any) => ({
      id: row.id,
      workItemId: row.work_item_id,
      workItemType: row.work_item_type,
      testType: row.test_type,
      description: row.description,
      steps: row.steps,
      expectedResult: row.expected_result,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    await connection.end();

    console.log('✅ Retrieved test cases from database:', testCases.length);

    return NextResponse.json({
      success: true,
      data: testCases,
      count: testCases.length,
      message: 'Test cases retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching test cases:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch test cases',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}