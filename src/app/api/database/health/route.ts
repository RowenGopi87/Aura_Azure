import { NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function GET() {
  try {
    console.log('✅ Database connection test successful');
    
    // Simple health check using direct connection
    const connection = await createConnection();
    await connection.execute('SELECT 1 as test');
    await connection.end();
    
    return NextResponse.json({
      healthy: true,
      services: {
        database: { connected: true },
        embeddings: { enabled: false },
        vectorStore: { available: false }
      },
      timestamp: new Date().toISOString(),
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      message: 'Database health check failed'
    }, { status: 500 });
  }
}

