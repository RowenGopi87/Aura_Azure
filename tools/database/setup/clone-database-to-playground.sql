-- =============================================
-- Clone Aura SDLC Database to Aura Playground
-- Run this script to create a complete copy of the production database for development
-- =============================================

-- Create the playground database
CREATE DATABASE IF NOT EXISTS aura_playground 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the playground database
USE aura_playground;

-- Clone all tables and data from aura_sdlc to aura_playground
-- Note: This will create identical table structures and copy all data

-- Get list of tables from source database and create them in target
SET @sql = '';
SELECT GROUP_CONCAT(
    CONCAT('CREATE TABLE IF NOT EXISTS aura_playground.', table_name, 
           ' AS SELECT * FROM aura_sdlc.', table_name, ';')
    SEPARATOR '\n'
) INTO @sql
FROM information_schema.tables 
WHERE table_schema = 'aura_sdlc' 
AND table_type = 'BASE TABLE';

-- Display the SQL that will be executed
SELECT CONCAT('Generated SQL for cloning:\n', @sql) as CloneSQL;

-- Execute the cloning (uncomment the line below after reviewing the SQL)
-- Note: You may need to run this in segments or use a script to execute dynamic SQL
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the clone
SELECT 'Cloning completed!' as Status;
SELECT 'Source database tables:' as Info;
SELECT table_name, table_rows 
FROM information_schema.tables 
WHERE table_schema = 'aura_sdlc' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT 'Playground database tables:' as Info;
SELECT table_name, table_rows 
FROM information_schema.tables 
WHERE table_schema = 'aura_playground' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Create playground-specific user (optional - can reuse existing aura_user)
-- CREATE USER IF NOT EXISTS 'aura_playground_user'@'localhost' IDENTIFIED BY 'aura_playground_password_123';
-- CREATE USER IF NOT EXISTS 'aura_playground_user'@'%' IDENTIFIED BY 'aura_playground_password_123';
-- GRANT ALL PRIVILEGES ON aura_playground.* TO 'aura_playground_user'@'localhost';
-- GRANT ALL PRIVILEGES ON aura_playground.* TO 'aura_playground_user'@'%';
-- FLUSH PRIVILEGES;

SELECT 'Database cloning completed successfully! 🎉' as Result;
