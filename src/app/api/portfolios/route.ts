import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Portfolio list API called');
    
    await databaseService.initialize();
    const portfolios = await databaseService.getAllPortfolios();
    
    console.log(`✅ API returning ${portfolios.length} portfolios:`, portfolios);
    
    return NextResponse.json({
      success: true,
      data: portfolios,
      message: 'Portfolios retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching portfolios:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch portfolios',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
