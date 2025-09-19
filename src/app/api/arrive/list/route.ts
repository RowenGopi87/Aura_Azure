import { NextRequest, NextResponse } from 'next/server';
import { ArriveFileServiceServer } from '@/lib/arrive/file-service-server';

export async function GET(request: NextRequest) {
  try {
    console.log('📂 ARRIVE file list request');
    
    // Get list of all physical ARRIVE files
    const files = await ArriveFileServiceServer.listPhysicalFiles();
    
    // Organize files by component
    const components: { [key: string]: { arrive?: string; advances?: string } } = {};
    
    files.forEach(filePath => {
      const pathParts = filePath.split('/');
      if (pathParts.length >= 3 && pathParts[0] === 'arrive-yaml') {
        const componentName = pathParts[1];
        const fileName = pathParts[2];
        
        if (!components[componentName]) {
          components[componentName] = {};
        }
        
        if (fileName === 'arrive.yaml') {
          components[componentName].arrive = filePath;
        } else if (fileName === 'advances.yaml') {
          components[componentName].advances = filePath;
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalFiles: files.length,
        components: Object.keys(components).length,
        files: files,
        componentMap: components
      }
    });

  } catch (error) {
    console.error('❌ Error listing ARRIVE files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list ARRIVE files' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ ARRIVE files clear request');
    
    // Clear all physical ARRIVE files
    await ArriveFileServiceServer.clearPhysicalFiles();
    
    return NextResponse.json({
      success: true,
      message: 'All ARRIVE files cleared successfully'
    });

  } catch (error) {
    console.error('❌ Error clearing ARRIVE files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear ARRIVE files' },
      { status: 500 }
    );
  }
}
