import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Stories list API called');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const epicId = searchParams.get('epicId');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM stories';
    const params: any[] = [];

    // Add filters
    const conditions = [];
    if (epicId) {
      conditions.push('epic_id = ?');
      params.push(epicId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const connection = await createConnection();
    const [stories] = await connection.execute(query, params);
    await connection.end();

    console.log('✅ Retrieved stories from database:', (stories as any[]).length);

    return NextResponse.json({
      success: true,
      data: stories,
      count: (stories as any[]).length,
      message: 'Stories retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching stories:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stories',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
