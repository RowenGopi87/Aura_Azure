import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Initiative deletion API called');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Initiative ID is required',
          message: 'Please provide a valid initiative ID to delete'
        },
        { status: 400 }
      );
    }

    console.log('🔍 Attempting to delete initiative with ID:', id);

    // Use simple database connection (same as portfolios API)
    const connection = await createConnection();

    // Check if initiative exists
    const [initiativeCheck] = await connection.execute(
      'SELECT COUNT(*) as count FROM initiatives WHERE id = ?',
      [id]
    ) as any;

    if (initiativeCheck[0].count === 0) {
      await connection.end();
      return NextResponse.json(
        {
          success: false,
          error: 'Initiative not found',
          message: `Initiative with ID ${id} does not exist`
        },
        { status: 404 }
      );
    }

    // Delete cascading: stories -> epics -> features -> initiative
    await connection.execute('DELETE s FROM stories s JOIN epics e ON s.epic_id = e.id JOIN features f ON e.feature_id = f.id WHERE f.initiative_id = ?', [id]);
    await connection.execute('DELETE e FROM epics e JOIN features f ON e.feature_id = f.id WHERE f.initiative_id = ?', [id]);
    await connection.execute('DELETE FROM features WHERE initiative_id = ?', [id]);
    await connection.execute('DELETE FROM initiatives WHERE id = ?', [id]);

    await connection.end();

    console.log(`✅ Successfully deleted initiative: ${id}`);

    return NextResponse.json({
      success: true,
      message: `Initiative ${id} deleted successfully`
    });

  } catch (error) {
    console.error('❌ Failed to delete initiative:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete initiative',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}