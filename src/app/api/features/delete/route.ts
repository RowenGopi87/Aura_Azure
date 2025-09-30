import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Feature deletion API called');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Feature ID is required',
          message: 'Please provide a valid feature ID to delete'
        },
        { status: 400 }
      );
    }

    console.log('🔍 Attempting to delete feature with ID:', id);

    const connection = await createConnection();

    // Check if feature exists
    const [featureCheck] = await connection.execute(
      'SELECT COUNT(*) as count FROM features WHERE id = ?',
      [id]
    ) as any;

    if (featureCheck[0].count === 0) {
      await connection.end();
      return NextResponse.json(
        {
          success: false,
          error: 'Feature not found',
          message: `Feature with ID ${id} does not exist`
        },
        { status: 404 }
      );
    }

    // Delete cascading: stories -> epics -> feature
    await connection.execute('DELETE s FROM stories s JOIN epics e ON s.epic_id = e.id WHERE e.feature_id = ?', [id]);
    await connection.execute('DELETE FROM epics WHERE feature_id = ?', [id]);
    await connection.execute('DELETE FROM features WHERE id = ?', [id]);

    await connection.end();

    console.log(`✅ Successfully deleted feature and all child items: ${id}`);

    return NextResponse.json({
      success: true,
      message: `Feature ${id} and all child items deleted successfully`
    });

  } catch (error) {
    console.error('❌ Failed to delete feature:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete feature',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}



