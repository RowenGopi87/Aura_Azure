import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';
import { z } from 'zod';

const assignPortfolioSchema = z.object({
  assignments: z.array(z.object({
    initiativeId: z.string().min(1, 'Initiative ID is required'),
    portfolioId: z.string().min(1, 'Portfolio ID is required')
  })).min(1, 'At least one assignment is required')
});

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Initiative portfolio assignment API called');
    
    const body = await request.json();
    console.log('📥 Request body:', body);

    // Validate request
    const validatedData = assignPortfolioSchema.parse(body);
    const { assignments } = validatedData;

    await databaseService.initialize();

    // Process each assignment
    const results = [];
    for (const assignment of assignments) {
      try {
        const updatedInitiative = await databaseService.assignInitiativeToPortfolio(
          assignment.initiativeId,
          assignment.portfolioId
        );
        results.push({
          initiativeId: assignment.initiativeId,
          portfolioId: assignment.portfolioId,
          success: true,
          initiative: updatedInitiative
        });
        console.log(`✅ Assigned initiative ${assignment.initiativeId} to portfolio ${assignment.portfolioId}`);
      } catch (error) {
        console.error(`❌ Failed to assign initiative ${assignment.initiativeId}:`, error);
        results.push({
          initiativeId: assignment.initiativeId,
          portfolioId: assignment.portfolioId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`✅ Portfolio assignment completed: ${successCount} succeeded, ${failureCount} failed`);

    return NextResponse.json({
      success: failureCount === 0,
      data: {
        results,
        summary: {
          total: assignments.length,
          successful: successCount,
          failed: failureCount
        }
      },
      message: failureCount === 0 
        ? `Successfully assigned ${successCount} initiatives to portfolios`
        : `Completed with ${successCount} successes and ${failureCount} failures`
    });

  } catch (error: any) {
    console.error('❌ Failed to assign portfolios:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to assign portfolios',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
