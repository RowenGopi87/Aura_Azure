-- =============================================
-- Aura SDLC Complete Database Initialization
-- This script sets up the entire database for Azure deployment
-- =============================================

-- Create the main database
CREATE DATABASE IF NOT EXISTS aura_playground 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE aura_playground;

-- =============================================
-- USERS AND PERMISSIONS
-- =============================================

-- Create users for different connection patterns (local, container, Azure)
CREATE USER IF NOT EXISTS 'aura_user'@'localhost' IDENTIFIED BY 'aura_password_123';
CREATE USER IF NOT EXISTS 'aura_user'@'127.0.0.1' IDENTIFIED BY 'aura_password_123';
CREATE USER IF NOT EXISTS 'aura_user'@'%' IDENTIFIED BY 'aura_password_123';

-- Grant permissions
GRANT ALL PRIVILEGES ON aura_playground.* TO 'aura_user'@'localhost';
GRANT ALL PRIVILEGES ON aura_playground.* TO 'aura_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON aura_playground.* TO 'aura_user'@'%';

-- Apply changes
FLUSH PRIVILEGES;

-- =============================================
-- CORE TABLES
-- =============================================

-- Portfolios table (for multi-portfolio support)
CREATE TABLE IF NOT EXISTS portfolios (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  business_owner VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Business Briefs table
CREATE TABLE IF NOT EXISTS business_briefs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  business_owner VARCHAR(255),
  lead_business_unit VARCHAR(255),
  additional_business_units TEXT,
  primary_strategic_theme VARCHAR(255),
  business_objective TEXT,
  quantifiable_business_outcomes TEXT,
  in_scope TEXT,
  impact_of_do_nothing TEXT,
  happy_path TEXT,
  exceptions TEXT,
  impacted_end_users TEXT,
  change_impact_expected TEXT,
  impact_to_other_departments TEXT,
  other_departments_impacted TEXT,
  impacts_existing_technology BOOLEAN DEFAULT FALSE,
  technology_solutions TEXT,
  relevant_business_owners TEXT,
  other_technology_info TEXT,
  supporting_documents TEXT,
  submitted_by VARCHAR(255),
  submitted_at TIMESTAMP NULL,
  status ENUM('draft', 'submitted', 'in_review', 'approved', 'rejected') DEFAULT 'draft',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  workflow_stage ENUM('idea', 'discovery', 'design', 'execution') DEFAULT 'idea',
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_workflow_stage (workflow_stage),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- RBAC SYSTEM TABLES
-- =============================================

-- Roles table
CREATE TABLE IF NOT EXISTS rbac_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  level ENUM('system', 'portfolio', 'project') DEFAULT 'project',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions table
CREATE TABLE IF NOT EXISTS rbac_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_resource (resource),
  INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table
CREATE TABLE IF NOT EXISTS rbac_users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  emirates_id VARCHAR(50),
  department VARCHAR(100),
  portfolio_id VARCHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_emirates_id (emirates_id),
  INDEX idx_portfolio_id (portfolio_id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- AUDIT SYSTEM TABLES
-- =============================================

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(36),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_resource_type (resource_type),
  INDEX idx_resource_id (resource_id),
  INDEX idx_timestamp (timestamp),
  FOREIGN KEY (user_id) REFERENCES rbac_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default portfolio
INSERT IGNORE INTO portfolios (id, name, description, business_owner) VALUES 
('default-portfolio', 'Default Portfolio', 'Default portfolio for initial setup', 'System Administrator');

-- Insert default roles
INSERT IGNORE INTO rbac_roles (id, name, description, level) VALUES 
('system-admin', 'system_administrator', 'Full system access', 'system'),
('portfolio-admin', 'portfolio_administrator', 'Portfolio-level administration', 'portfolio'),
('project-manager', 'project_manager', 'Project management access', 'project'),
('developer', 'developer', 'Development team access', 'project'),
('viewer', 'viewer', 'Read-only access', 'project');

-- Insert default permissions
INSERT IGNORE INTO rbac_permissions (id, name, description, resource, action) VALUES 
('perm-admin-all', 'admin_all', 'Full administrative access', '*', '*'),
('perm-brief-read', 'brief_read', 'Read business briefs', 'business_briefs', 'read'),
('perm-brief-write', 'brief_write', 'Create/edit business briefs', 'business_briefs', 'write'),
('perm-audit-read', 'audit_read', 'Read audit logs', 'audit_logs', 'read'),
('perm-audit-config', 'audit_config', 'Configure audit system', 'audit_config', 'write');

-- Insert default admin user
INSERT IGNORE INTO rbac_users (id, username, email, full_name, emirates_id, department, portfolio_id, is_active) VALUES 
('admin-user', 'admin', 'admin@aura.local', 'System Administrator', 'EK001', 'IT', 'default-portfolio', TRUE);

-- =============================================
-- VERIFICATION
-- =============================================

-- Verify setup
SELECT 'Database initialization completed successfully!' as Status;
SELECT COUNT(*) as 'Total Tables' FROM information_schema.tables WHERE table_schema = 'aura_playground';
SELECT COUNT(*) as 'Total Roles' FROM rbac_roles;
SELECT COUNT(*) as 'Total Users' FROM rbac_users;
SELECT COUNT(*) as 'Total Permissions' FROM rbac_permissions;
