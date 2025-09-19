-- =============================================
-- Aura SDLC Database Setup - Step 1
-- Create Database
-- =============================================

-- Create the main database for Aura Playground
CREATE DATABASE IF NOT EXISTS aura_playground 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Verify database creation
SHOW DATABASES LIKE 'aura_playground';

SELECT 'Database aura_playground created successfully!' as Status;
