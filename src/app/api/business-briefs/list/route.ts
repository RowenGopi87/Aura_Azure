import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Business briefs list API called');

    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    console.log('📥 Query params:', { status, limit, offset });

    // Connect to database
    const connection = await createConnection();

    // Build query with optional filters
    let query = 'SELECT * FROM business_briefs';
    const params = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
      
      if (offset) {
        query += ' OFFSET ?';
        params.push(parseInt(offset));
      }
    }

    // Execute query
    const [businessBriefsResult] = await connection.execute(query, params) as any;
    
    // Transform database results to expected format
    const businessBriefs = businessBriefsResult.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      businessOwner: row.business_owner,
      leadBusinessUnit: row.lead_business_unit,
      additionalBusinessUnits: row.additional_business_units,
      primaryStrategicTheme: row.primary_strategic_theme,
      businessObjective: row.business_objective,
      quantifiableBusinessOutcomes: row.quantifiable_business_outcomes,
      inScope: row.in_scope,
      outOfScope: row.out_of_scope,
      impactOfDoNothing: row.impact_of_do_nothing,
      happyPath: row.happy_path,
      exceptions: row.exceptions,
      impactedEndUsers: row.impacted_end_users,
      changeImpactExpected: row.change_impact_expected,
      impactToOtherDepartments: row.impact_to_other_departments,
      otherDepartmentsImpacted: row.other_departments_impacted,
      impactsExistingTechnology: row.impacts_existing_technology,
      technologySolutions: row.technology_solutions,
      relevantBusinessOwners: row.relevant_business_owners,
      otherTechnologyInfo: row.other_technology_info,
      supportingDocuments: row.supporting_documents,
      submittedBy: row.submitted_by,
      submittedAt: row.submitted_at,
      status: row.status,
      priority: row.priority,
      workflowStage: row.workflow_stage,
      completionPercentage: row.completion_percentage,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    await connection.end();

    console.log('✅ Retrieved business briefs from database:', businessBriefs.length);

    // Transform database format to match UseCase interface expected by frontend
    const transformedBriefs = businessBriefs.map((brief: any) => ({
      id: brief.id,
      businessBriefId: brief.id, // Use database ID as business brief ID
      title: brief.title,
      description: brief.description,
      businessValue: brief.quantifiableBusinessOutcomes || brief.description,
      acceptanceCriteria: brief.acceptanceCriteria ? brief.acceptanceCriteria.split('\n').filter(Boolean) : [],
      submittedBy: brief.submittedBy || 'Anonymous',
      submittedAt: new Date(brief.submittedAt),
      status: brief.status,
      priority: brief.priority,
      // Business Brief fields
      businessOwner: brief.businessOwner,
      leadBusinessUnit: brief.leadBusinessUnit,
      additionalBusinessUnits: brief.additionalBusinessUnits ? brief.additionalBusinessUnits.split(',').filter(Boolean) : [],
      primaryStrategicTheme: brief.primaryStrategicTheme,
      businessObjective: brief.businessObjective,
      quantifiableBusinessOutcomes: brief.quantifiableBusinessOutcomes,
      inScope: brief.inScope,
      impactOfDoNothing: brief.impactOfDoNothing,
      happyPath: brief.happyPath,
      exceptions: brief.exceptions,
      // End users and stakeholders
      impactedEndUsers: brief.impactedEndUsers,
      changeImpactExpected: brief.changeImpactExpected,
      impactToOtherDepartments: brief.impactToOtherDepartments,
      otherDepartmentsImpacted: brief.otherDepartmentsImpacted ? brief.otherDepartmentsImpacted.split(',').filter(Boolean) : [],
      // Technology impact
      impactsExistingTechnology: brief.impactsExistingTechnology === '1' || brief.impactsExistingTechnology === true,
      technologySolutions: brief.technologySolutions,
      relevantBusinessOwners: brief.relevantBusinessOwners,
      otherTechnologyInfo: brief.otherTechnologyInfo,
      supportingDocuments: brief.supportingDocuments ? brief.supportingDocuments.split(',').filter(Boolean) : [],
      // Workflow tracking
      workflowStage: brief.workflowStage || 'idea',
      completionPercentage: brief.completionPercentage || 0,
    }));

    console.log('✅ Transformed business briefs for frontend:', transformedBriefs.length);

    return NextResponse.json({
      success: true,
      data: transformedBriefs,
      total: transformedBriefs.length
    });

  } catch (error: any) {
    console.error('❌ Failed to retrieve business briefs:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve business briefs',
        message: error.message
      },
      { status: 500 }
    );
  }
}
