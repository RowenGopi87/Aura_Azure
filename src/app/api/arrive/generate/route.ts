import { NextRequest, NextResponse } from 'next/server';
import { ArriveFileServiceServer } from '@/lib/arrive/file-service-server';
import { z } from 'zod';

const generateArriveSchema = z.object({
  componentData: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    businessValue: z.string().optional(),
    acceptanceCriteria: z.array(z.string()).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    assignedTo: z.string().optional(),
    category: z.string().optional(),
    workflowLevel: z.enum(['initiative', 'feature', 'epic', 'story'])
  }),
  isEnabled: z.boolean().optional().default(true)
});

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 ARRIVE generation API called');
    
    const body = await request.json();
    const validatedData = generateArriveSchema.parse(body);
    
    console.log('🎯 Server-side ARRIVE generation request:', {
      componentId: validatedData.componentData.id,
      isEnabled: validatedData.isEnabled
    });
    
    // Generate ARRIVE files using server-side service
    const result = await ArriveFileServiceServer.generateArriveFiles(validatedData.componentData, validatedData.isEnabled);
    
    if (result.success) {
      console.log('✅ ARRIVE files generated successfully:', {
        arrive: result.arriveYamlPath,
        advances: result.advancesYamlPath
      });
    } else {
      console.log('⚠️ ARRIVE file generation failed:', result.error);
    }

    return NextResponse.json({
      success: result.success,
      data: {
        arriveYamlPath: result.arriveYamlPath,
        advancesYamlPath: result.advancesYamlPath
      },
      error: result.error
    });

  } catch (error) {
    console.error('❌ Error in ARRIVE generation API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'ARRIVE generation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
