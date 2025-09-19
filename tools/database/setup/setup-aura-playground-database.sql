-- AURA PLAYGROUND Database Setup Script
-- Run this after connecting to MariaDB as root
-- This creates a separate playground environment

-- Create the playground database
CREATE DATABASE IF NOT EXISTS aura_playground
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create users for playground (using same credentials for simplicity, but separate database)
CREATE USER IF NOT EXISTS 'aura_user'@'localhost' IDENTIFIED BY 'aura_password_123';
CREATE USER IF NOT EXISTS 'aura_user'@'%' IDENTIFIED BY 'aura_password_123';

-- Grant privileges specifically for the playground database
GRANT ALL PRIVILEGES ON aura_playground.* TO 'aura_user'@'localhost';
GRANT ALL PRIVILEGES ON aura_playground.* TO 'aura_user'@'%';

-- Apply changes
FLUSH PRIVILEGES;

-- Switch to playground database
USE aura_playground;

-- Verify setup
SELECT 'Playground database and user created successfully!' as Result;
SHOW DATABASES LIKE 'aura_playground';
SELECT User, Host FROM mysql.user WHERE User = 'aura_user';
