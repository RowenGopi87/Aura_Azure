import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Portfolio list API called');
    
    const connection = await createConnection();
    
    // First try to get portfolios from portfolios table
    let portfoliosResults;
    try {
      [portfoliosResults] = await connection.execute(`
        SELECT 
          id,
          name,
          description,
          function,
          color,
          created_at,
          updated_at
        FROM portfolios
        ORDER BY name
      `);
    } catch (tableError) {
      console.log('📋 Portfolios table not found, creating and seeding...');
      
      // Create portfolios table if it doesn't exist
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS portfolios (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          function TEXT,
          color VARCHAR(10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      // Seed with Emirates organizational portfolios
      await connection.execute(`
        INSERT IGNORE INTO portfolios (id, name, description, function, color) VALUES
        ('PORTFOLIO-WEB-MOBILE', 'Web & Mobile', 'Customer-facing web and mobile applications development', 'Develops and maintains customer-facing digital touchpoints including websites, mobile apps, and progressive web applications', '#3B82F6'),
        ('PORTFOLIO-CUSTOMER', 'Customer Portfolio', 'Customer experience and engagement solutions', 'Manages customer-specific projects and specialized customer websites like rugby sevens, events, and customer portal solutions', '#10B981'),
        ('PORTFOLIO-COMMERCIAL', 'Commercial Portfolio', 'Agent systems and commercial booking platforms', 'Handles commercial booking systems, agent platforms like ResConnect, and B2B customer solutions for travel agents and corporate clients', '#F59E0B'),
        ('PORTFOLIO-GROUP-SERVICE', 'Group Service Portfolio', 'Internal systems and payment infrastructure', 'Manages internal operations including payroll systems, HR processes, hiring platforms, and payment gateway infrastructure for web and mobile frontends', '#8B5CF6'),
        ('PORTFOLIO-DNATA', 'dnata Portfolio', 'Ground operations and baggage handling systems', 'Handles below-the-wing airline operations including ground operations, baggage handling, cargo management, and airport operational systems', '#3B82F6')
      `);
      
      // Get the newly created portfolios
      [portfoliosResults] = await connection.execute(`
        SELECT 
          id,
          name,
          description,
          function,
          color,
          created_at,
          updated_at
        FROM portfolios
        ORDER BY name
      `);
    }
    
    await connection.end();
    
    const portfolios = (portfoliosResults as any[]).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      function: row.function,
      color: row.color,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    console.log(`✅ API returning ${portfolios.length} organizational portfolios:`, portfolios);
    
    return NextResponse.json({
      success: true,
      data: portfolios,
      message: 'Portfolios retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching portfolios:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch portfolios',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}