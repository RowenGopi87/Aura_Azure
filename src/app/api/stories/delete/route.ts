import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Story deletion API called');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Story ID is required',
          message: 'Please provide a valid story ID to delete'
        },
        { status: 400 }
      );
    }

    console.log('🔍 Attempting to delete story with ID:', id);

    const connection = await createConnection();

    // Check if story exists
    const [storyCheck] = await connection.execute(
      'SELECT COUNT(*) as count FROM stories WHERE id = ?',
      [id]
    ) as any;

    if (storyCheck[0].count === 0) {
      await connection.end();
      return NextResponse.json(
        {
          success: false,
          error: 'Story not found',
          message: `Story with ID ${id} does not exist`
        },
        { status: 404 }
      );
    }

    // Delete the story
    await connection.execute('DELETE FROM stories WHERE id = ?', [id]);

    await connection.end();

    console.log(`✅ Successfully deleted story: ${id}`);

    return NextResponse.json({
      success: true,
      message: `Story ${id} deleted successfully`
    });

  } catch (error) {
    console.error('❌ Failed to delete story:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete story',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}



