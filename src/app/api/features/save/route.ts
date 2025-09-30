import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Features save API called');
    
    const body = await request.json();
    const { features } = body;

    if (!features || !Array.isArray(features)) {
      return NextResponse.json({
        success: false,
        error: 'Features array is required'
      }, { status: 400 });
    }

    console.log(`💾 Saving ${features.length} features to database...`);

    const connection = await createConnection();
    let savedCount = 0;

    for (const feature of features) {
      try {
        // Simple INSERT with minimal required fields
        await connection.execute(
          'INSERT INTO features (id, initiative_id, title, description) VALUES (?, ?, ?, ?)',
          [
            feature.id,
            feature.initiativeId,
            feature.title,
            feature.description || ''
          ]
        );
        
        console.log(`✅ Saved feature: ${feature.title}`);
        savedCount++;
      } catch (saveError) {
        console.error(`❌ Failed to save feature ${feature.id}:`, saveError);
      }
    }

    await connection.end();

    console.log(`✅ Successfully saved ${savedCount}/${features.length} features to database`);

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${savedCount} features to database`,
      data: {
        saved: savedCount,
        total: features.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to save features:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to save features',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}



