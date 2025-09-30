import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';
import { z } from 'zod';

const createBusinessBriefSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  businessOwner: z.string().optional(),
  leadBusinessUnit: z.string().optional(),
  additionalBusinessUnits: z.array(z.string()).optional(),
  primaryStrategicTheme: z.string().optional(),
  businessObjective: z.string().optional(),
  quantifiableBusinessOutcomes: z.string().optional(),
  inScope: z.string().optional(),
  outOfScope: z.string().optional(),
  impactOfDoNothing: z.string().optional(),
  happyPath: z.string().optional(),
  exceptions: z.string().optional(),
  impactedEndUsers: z.string().optional(),
  changeImpactExpected: z.string().optional(),
  impactToOtherDepartments: z.string().optional(),
  otherDepartmentsImpacted: z.array(z.string()).optional(),
  impactsExistingTechnology: z.boolean().optional(),
  technologySolutions: z.string().optional(),
  relevantBusinessOwners: z.string().optional(),
  otherTechnologyInfo: z.string().optional(),
  supportingDocuments: z.array(z.string()).optional(),
  submittedBy: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'on_hold']).default('draft'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Business Brief creation API called');
    
    const body = await request.json();
    console.log('📥 Request body:', {
      title: body.title,
      description: body.description?.substring(0, 100) + '...',
      businessOwner: body.businessOwner,
      priority: body.priority,
      status: body.status
    });

    // Validate request
    const validatedData = createBusinessBriefSchema.parse(body);
    console.log('✅ Request validation passed');

    // Generate ID if not provided
    const businessBriefId = body.id || `BB-${Date.now().toString(36).toUpperCase()}`;

    // Prepare business brief data for database
    const businessBriefData = {
      id: businessBriefId,
      title: validatedData.title,
      description: validatedData.description,
      businessOwner: validatedData.businessOwner || null,
      leadBusinessUnit: validatedData.leadBusinessUnit || null,
      additionalBusinessUnits: validatedData.additionalBusinessUnits?.join(',') || null,
      primaryStrategicTheme: validatedData.primaryStrategicTheme || null,
      businessObjective: validatedData.businessObjective || null,
      quantifiableBusinessOutcomes: validatedData.quantifiableBusinessOutcomes || null,
      inScope: validatedData.inScope || null,
      outOfScope: validatedData.outOfScope || null,
      impactOfDoNothing: validatedData.impactOfDoNothing || null,
      happyPath: validatedData.happyPath || null,
      exceptions: validatedData.exceptions || null,
      impactedEndUsers: validatedData.impactedEndUsers || null,
      changeImpactExpected: validatedData.changeImpactExpected || null,
      impactToOtherDepartments: validatedData.impactToOtherDepartments || null,
      otherDepartmentsImpacted: validatedData.otherDepartmentsImpacted?.join(',') || null,
      impactsExistingTechnology: validatedData.impactsExistingTechnology ? '1' : '0',
      technologySolutions: validatedData.technologySolutions || null,
      relevantBusinessOwners: validatedData.relevantBusinessOwners || null,
      otherTechnologyInfo: validatedData.otherTechnologyInfo || null,
      supportingDocuments: validatedData.supportingDocuments?.join(',') || null,
      submittedBy: validatedData.submittedBy || 'Anonymous',
      submittedAt: new Date().toISOString().slice(0, 19).replace('T', ' '), // Convert to MySQL datetime format
      priority: validatedData.priority,
      status: validatedData.status,
      workflowStage: validatedData.status === 'approved' ? 'planning' : 'idea',
      completionPercentage: validatedData.status === 'approved' ? 10 : 0
    };

    console.log('💾 Saving business brief to database...');

    // Connect to database and save business brief
    const connection = await createConnection();
    
    await connection.execute(`
      INSERT INTO business_briefs (
        id, title, description, business_owner, lead_business_unit, primary_strategic_theme,
        business_objective, quantifiable_business_outcomes, in_scope, impact_of_do_nothing,
        priority, status, submitted_by, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      businessBriefId,
      businessBriefData.title,
      businessBriefData.description,
      businessBriefData.businessOwner,
      businessBriefData.leadBusinessUnit,
      businessBriefData.primaryStrategicTheme,
      businessBriefData.businessObjective,
      businessBriefData.quantifiableBusinessOutcomes,
      businessBriefData.inScope,
      businessBriefData.impactOfDoNothing,
      businessBriefData.priority,
      businessBriefData.status,
      businessBriefData.submittedBy,
    ]);

    // Get the created business brief
    const [createdResult] = await connection.execute(
      'SELECT * FROM business_briefs WHERE id = ?',
      [businessBriefId]
    ) as any;

    await connection.end();

    const createdBusinessBrief = {
      id: createdResult[0].id,
      title: createdResult[0].title,
      description: createdResult[0].description,
      businessOwner: createdResult[0].business_owner,
      leadBusinessUnit: createdResult[0].lead_business_unit,
      primaryStrategicTheme: createdResult[0].primary_strategic_theme,
      businessObjective: createdResult[0].business_objective,
      quantifiableBusinessOutcomes: createdResult[0].quantifiable_business_outcomes,
      inScope: createdResult[0].in_scope,
      impactOfDoNothing: createdResult[0].impact_of_do_nothing,
      priority: createdResult[0].priority,
      status: createdResult[0].status,
      submittedBy: createdResult[0].submitted_by,
      submittedAt: createdResult[0].submitted_at,
      createdAt: createdResult[0].created_at,
      updatedAt: createdResult[0].updated_at
    };

    console.log('✅ Business brief saved successfully:', createdBusinessBrief.id);

    return NextResponse.json({
      success: true,
      message: 'Business brief created successfully',
      data: createdBusinessBrief
    });

  } catch (error: any) {
    console.error('❌ Failed to create business brief:', error);

    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid business brief data',
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create business brief',
        message: error.message
      },
      { status: 500 }
    );
  }
}
