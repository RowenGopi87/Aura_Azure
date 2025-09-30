import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createConnection } from '@/lib/database';

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

    console.log('🔄 Connecting to database...');
    const connection = await createConnection();

    // Process each assignment using simple SQL queries (same approach as portfolios API)
    const results = [];
    for (const assignment of assignments) {
      try {
        // Check if initiative exists in database
        const [initiativeCheck] = await connection.execute(
          'SELECT COUNT(*) as count FROM initiatives WHERE id = ?', 
          [assignment.initiativeId]
        ) as any;
        
        if (initiativeCheck[0].count === 0) {
          console.log(`⚠️ Skipping assignment for initiative ${assignment.initiativeId} - not found in database`);
          results.push({
            initiativeId: assignment.initiativeId,
            portfolioId: assignment.portfolioId,
            success: false,
            error: 'Initiative not found in database - please save initiative first'
          });
          continue;
        }

        // Check if portfolio exists
        const [portfolioCheck] = await connection.execute(
          'SELECT COUNT(*) as count FROM portfolios WHERE id = ?', 
          [assignment.portfolioId]
        ) as any;
        
        if (portfolioCheck[0].count === 0) {
          console.log(`⚠️ Skipping assignment for portfolio ${assignment.portfolioId} - not found in database`);
          results.push({
            initiativeId: assignment.initiativeId,
            portfolioId: assignment.portfolioId,
            success: false,
            error: 'Portfolio not found in database'
          });
          continue;
        }

        // Update initiative with portfolio assignment
        await connection.execute(
          'UPDATE initiatives SET portfolio_id = ?, updated_at = NOW() WHERE id = ?',
          [assignment.portfolioId, assignment.initiativeId]
        );
        
        // Get the updated initiative
        const [updatedInitiative] = await connection.execute(
          'SELECT * FROM initiatives WHERE id = ?',
          [assignment.initiativeId]
        ) as any;

        results.push({
          initiativeId: assignment.initiativeId,
          portfolioId: assignment.portfolioId,
          success: true,
          initiative: updatedInitiative[0]
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

    await connection.end();

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

    return NextResponse.json({
      success: false,
      error: 'Failed to assign portfolios',
      message: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}