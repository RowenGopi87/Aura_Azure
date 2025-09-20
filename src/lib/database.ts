import mysql from 'mysql2/promise';

// Simple database connection for API routes
export async function createConnection() {
  const connection = await mysql.createConnection({
    host: process.env.AURA_DB_HOST || 'localhost',
    port: parseInt(process.env.AURA_DB_PORT || '3306'),
    user: process.env.AURA_DB_USER || 'aura_user',
    password: process.env.AURA_DB_PASSWORD || 'aura_password_123',
    database: process.env.AURA_DB_NAME || 'aura_playground',
    ssl: process.env.AURA_DB_SSL === 'true'
  });

  return connection;
}
