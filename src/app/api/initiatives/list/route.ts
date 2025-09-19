import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/service';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Initiatives list API called');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const businessBriefId = searchParams.get('businessBriefId');
    const status = searchParams.get('status');

    // Use database service to get properly mapped initiatives
    let initiatives;
    if (businessBriefId) {
      initiatives = await databaseService.getInitiativesByBusinessBrief(businessBriefId);
      if (status) {
        initiatives = initiatives.filter(init => init.status === status);
      }
    } else {
      initiatives = await databaseService.getAllInitiatives();
      if (status) {
        initiatives = initiatives.filter(init => init.status === status);
      }
    }

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
