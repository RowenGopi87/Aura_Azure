import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';
import { z } from 'zod';

const createTestCaseSchema = z.object({
  id: z.string(),
  workItemId: z.string(),
  workItemType: z.enum(['feature', 'epic', 'story']),
  testType: z.string().optional().default('functional'),
  description: z.string(),
  steps: z.string(),
  expectedResult: z.string(),
  status: z.enum(['pass', 'fail', 'not_run']).optional().default('not_run')
});

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test case creation API called');
    
    const body = await request.json();
    const validatedData = createTestCaseSchema.parse(body);

    console.log('📝 Creating test case:', validatedData.id);

    const connection = await createConnection();

    // Check if test case already exists
    const [existingTest] = await connection.execute(
      'SELECT COUNT(*) as count FROM test_cases WHERE id = ?',
      [validatedData.id]
    ) as any;

    if (existingTest[0].count > 0) {
      await connection.end();
      return NextResponse.json(
        {
          success: false,
          error: 'Test case already exists',
          message: `Test case with ID ${validatedData.id} already exists`
        },
        { status: 409 }
      );
    }

    // Insert test case
    await connection.execute(`
      INSERT INTO test_cases (
        id, work_item_id, work_item_type, test_type, description, 
        steps, expected_result, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      validatedData.id,
      validatedData.workItemId,
      validatedData.workItemType,
      validatedData.testType,
      validatedData.description,
      validatedData.steps,
      validatedData.expectedResult,
      validatedData.status
    ]);

    await connection.end();

    console.log(`✅ Successfully created test case: ${validatedData.id}`);

    return NextResponse.json({
      success: true,
      message: 'Test case created successfully',
      data: {
        id: validatedData.id,
        workItemId: validatedData.workItemId,
        workItemType: validatedData.workItemType,
        testType: validatedData.testType,
        description: validatedData.description,
        status: validatedData.status,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Failed to create test case:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create test case',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}



