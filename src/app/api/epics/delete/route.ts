import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Epic deletion API called');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Epic ID is required',
          message: 'Please provide a valid epic ID to delete'
        },
        { status: 400 }
      );
    }

    console.log('🔍 Attempting to delete epic with ID:', id);

    const connection = await createConnection();

    // Check if epic exists
    const [epicCheck] = await connection.execute(
      'SELECT COUNT(*) as count FROM epics WHERE id = ?',
      [id]
    ) as any;

    if (epicCheck[0].count === 0) {
      await connection.end();
      return NextResponse.json(
        {
          success: false,
          error: 'Epic not found',
          message: `Epic with ID ${id} does not exist`
        },
        { status: 404 }
      );
    }

    // Delete cascading: stories -> epic
    await connection.execute('DELETE FROM stories WHERE epic_id = ?', [id]);
    await connection.execute('DELETE FROM epics WHERE id = ?', [id]);

    await connection.end();

    console.log(`✅ Successfully deleted epic and all child stories: ${id}`);

    return NextResponse.json({
      success: true,
      message: `Epic ${id} and all child stories deleted successfully`
    });

  } catch (error) {
    console.error('❌ Failed to delete epic:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete epic',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}



