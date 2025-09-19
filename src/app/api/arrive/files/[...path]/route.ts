import { NextRequest, NextResponse } from 'next/server';
import { ArriveFileServiceServer } from '@/lib/arrive/file-service-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    console.log('📂 ARRIVE file request:', params.path);
    
    // Reconstruct the file path
    const filePath = params.path.join('/');
    
    // Security check: ensure the path is within arrive-yaml directory
    if (!filePath.startsWith('arrive-yaml/') || filePath.includes('..')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Read the file from filesystem
    const content = await ArriveFileServiceServer.readFileFromSystem(filePath);
    
    if (content === null) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Return the YAML content with appropriate headers
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-yaml',
        'Content-Disposition': `attachment; filename="${params.path[params.path.length - 1]}"`,
        'Access-Control-Allow-Origin': '*', // Allow external systems to access
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ Error serving ARRIVE file:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
