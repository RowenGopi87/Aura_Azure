import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';

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

    await databaseService.initialize();

    // Check if initiative exists
    const initiative = await databaseService.getInitiative(id);
    if (!initiative) {
      return NextResponse.json(
        {
          success: false,
          error: 'Initiative not found',
          message: `No initiative found with ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Delete from database (this will also cascade delete related features, epics, stories)
    const deleted = await databaseService.deleteInitiative(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete initiative',
          message: `Could not delete initiative with ID: ${id}`
        },
        { status: 500 }
      );
    }

    console.log('✅ Initiative deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Initiative deleted successfully',
      data: { id, title: initiative.title }
    });

  } catch (error: any) {
    console.error('❌ Failed to delete initiative:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete initiative',
        message: error.message
      },
      { status: 500 }
    );
  }
}
