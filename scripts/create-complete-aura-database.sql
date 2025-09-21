-- =============================================
-- AURA SDLC COMPLETE DATABASE RECREATION SCRIPT
-- This script recreates the exact database structure from local environment
-- Includes ALL tables: Core + RBAC + Audit + AuraV2 + Vector Stores
-- =============================================

-- Create database
CREATE DATABASE IF NOT EXISTS aura_playground 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE aura_playground;

-- =============================================
-- STEP 1: CORE BUSINESS TABLES
-- =============================================

-- Portfolios (for multi-portfolio support)
CREATE TABLE IF NOT EXISTS portfolios (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  business_owner VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Business Briefs
CREATE TABLE IF NOT EXISTS business_briefs (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    business_owner VARCHAR(255),
    lead_business_unit VARCHAR(255),
    additional_business_units TEXT,
    primary_strategic_theme VARCHAR(255),
    business_objective TEXT,
    quantifiable_business_outcomes TEXT,
    in_scope TEXT,
    out_of_scope TEXT,
    impact_of_do_nothing TEXT,
    happy_path TEXT,
    exceptions TEXT,
    impacted_end_users TEXT,
    change_impact_expected TEXT,
    impact_to_other_departments TEXT,
    other_departments_impacted TEXT,
    impacts_existing_technology TEXT,
    technology_solutions TEXT,
    relevant_business_owners TEXT,
    other_technology_info TEXT,
    supporting_documents TEXT,
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP,
    status ENUM('draft', 'submitted', 'in_review', 'approved', 'rejected') DEFAULT 'draft',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    workflow_stage VARCHAR(50),
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initiatives
CREATE TABLE IF NOT EXISTS initiatives (
    id VARCHAR(255) PRIMARY KEY,
    business_brief_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    business_value TEXT,
    acceptance_criteria TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_brief_id) REFERENCES business_briefs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Features
CREATE TABLE IF NOT EXISTS features (
    id VARCHAR(255) PRIMARY KEY,
    initiative_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    acceptance_criteria TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Epics
CREATE TABLE IF NOT EXISTS epics (
    id VARCHAR(255) PRIMARY KEY,
    feature_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    acceptance_criteria TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stories
CREATE TABLE IF NOT EXISTS stories (
    id VARCHAR(255) PRIMARY KEY,
    epic_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    acceptance_criteria TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Designs
CREATE TABLE IF NOT EXISTS designs (
    id VARCHAR(255) PRIMARY KEY,
    work_item_id VARCHAR(255),
    work_item_type ENUM('feature', 'epic', 'story'),
    design_type VARCHAR(50),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Code Items
CREATE TABLE IF NOT EXISTS code_items (
    id VARCHAR(255) PRIMARY KEY,
    work_item_id VARCHAR(255),
    work_item_type ENUM('feature', 'epic', 'story'),
    language VARCHAR(50),
    code TEXT,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test Cases
CREATE TABLE IF NOT EXISTS test_cases (
    id VARCHAR(255) PRIMARY KEY,
    work_item_id VARCHAR(255),
    work_item_type ENUM('feature', 'epic', 'story'),
    test_type VARCHAR(50),
    description TEXT,
    steps TEXT,
    expected_result TEXT,
    status ENUM('pass', 'fail', 'not_run') DEFAULT 'not_run',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SAFe Mappings
CREATE TABLE IF NOT EXISTS safe_mappings (
    id VARCHAR(255) PRIMARY KEY,
    work_item_id VARCHAR(255),
    work_item_type ENUM('business_brief', 'initiative', 'feature', 'epic', 'story'),
    safe_level ENUM('portfolio', 'large_solution', 'essential'),
    safe_artifact VARCHAR(100),
    mapping_confidence DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documents (needed for vector stores)
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_path VARCHAR(500),
  file_type VARCHAR(50),
  file_size INT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_date TIMESTAMP NULL,
  processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_file_type (file_type),
  INDEX idx_processing_status (processing_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Work Items Context (for enhanced tracking)
CREATE TABLE IF NOT EXISTS work_items_context (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  work_item_id VARCHAR(255) NOT NULL,
  work_item_type ENUM('business_brief', 'initiative', 'feature', 'epic', 'story') NOT NULL,
  context_type VARCHAR(50) NOT NULL,
  context_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_work_item (work_item_id, work_item_type),
  INDEX idx_context_type (context_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 2: VECTOR STORES (Now that documents table exists)
-- =============================================

-- Vector Stores
CREATE TABLE IF NOT EXISTS vector_stores (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  database_name VARCHAR(255) NOT NULL,
  embedding_provider VARCHAR(50),
  embedding_model VARCHAR(100),
  embedding_dimension INT,
  description TEXT,
  document_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_database_name (database_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 3: AURAV2 TABLES
-- =============================================

-- AuraV2 Qualified Ideas
CREATE TABLE IF NOT EXISTS aurav2_qualified_ideas (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    original_idea TEXT NOT NULL,
    qualified_idea TEXT NOT NULL,
    business_value_score DECIMAL(3,2),
    feasibility_score DECIMAL(3,2),
    risk_score DECIMAL(3,2),
    overall_score DECIMAL(3,2),
    qualification_reasoning TEXT,
    ai_model_used VARCHAR(50),
    processing_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_overall_score (overall_score),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AuraV2 Business Brief Extensions
CREATE TABLE IF NOT EXISTS aurav2_business_brief_extensions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_brief_id VARCHAR(255) NOT NULL,
    ai_generated_content JSON,
    human_edited_content JSON,
    edit_history JSON,
    quality_score DECIMAL(3,2),
    completeness_score DECIMAL(3,2),
    ai_suggestions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_brief_id) REFERENCES business_briefs(id) ON DELETE CASCADE,
    INDEX idx_business_brief_id (business_brief_id),
    INDEX idx_quality_score (quality_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AuraV2 AI Consolidations
CREATE TABLE IF NOT EXISTS aurav2_ai_consolidations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    consolidation_type ENUM('portfolio', 'initiative', 'feature') NOT NULL,
    source_ids JSON NOT NULL,
    consolidated_content TEXT NOT NULL,
    consolidation_reasoning TEXT,
    confidence_score DECIMAL(3,2),
    ai_model_used VARCHAR(50),
    processing_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_consolidation_type (consolidation_type),
    INDEX idx_confidence_score (confidence_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AuraV2 User Roles (Enhanced user role tracking)
CREATE TABLE IF NOT EXISTS aurav2_user_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    role_context JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_role_name (role_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AuraV2 Workflow Stages
CREATE TABLE IF NOT EXISTS aurav2_workflow_stages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    stage_name VARCHAR(100) NOT NULL UNIQUE,
    stage_order INT NOT NULL,
    description TEXT,
    required_roles JSON,
    approval_required BOOLEAN DEFAULT FALSE,
    automation_rules JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stage_order (stage_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AuraV2 Workflow Progress
CREATE TABLE IF NOT EXISTS aurav2_workflow_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    work_item_id VARCHAR(255) NOT NULL,
    work_item_type ENUM('business_brief', 'initiative', 'feature', 'epic', 'story') NOT NULL,
    current_stage_id VARCHAR(36) NOT NULL,
    previous_stage_id VARCHAR(36),
    stage_entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stage_completed_at TIMESTAMP NULL,
    completed_by VARCHAR(36),
    approval_status ENUM('pending', 'approved', 'rejected', 'not_required') DEFAULT 'not_required',
    stage_notes TEXT,
    automation_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (current_stage_id) REFERENCES aurav2_workflow_stages(id),
    FOREIGN KEY (previous_stage_id) REFERENCES aurav2_workflow_stages(id),
    INDEX idx_work_item (work_item_id, work_item_type),
    INDEX idx_current_stage (current_stage_id),
    INDEX idx_approval_status (approval_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 4: AUDIT SYSTEM TABLES
-- =============================================

-- Users (Base user table for audit system)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    entra_id VARCHAR(36) UNIQUE NOT NULL,
    user_principal_name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    given_name VARCHAR(100),
    surname VARCHAR(100),
    job_title VARCHAR(255),
    department VARCHAR(100),
    office_location VARCHAR(100),
    employee_id VARCHAR(50) UNIQUE,
    business_phones JSON,
    manager_email VARCHAR(255),
    direct_reports JSON,
    roles JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    login_count INT DEFAULT 0,
    created_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_entra_id (entra_id),
    INDEX idx_email (email),
    INDEX idx_employee_id (employee_id),
    INDEX idx_department (department),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36),
    event_type ENUM('generation', 'edit', 'save', 'delete', 'export', 'integration', 'view', 'search', 'ai_enhancement') NOT NULL,
    feature_category ENUM('brief', 'initiative', 'feature', 'epic', 'story', 'code', 'design', 'test', 'auth', 'system') NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(36),
    resource_title VARCHAR(500),
    generation_data JSON,
    prompt_data JSON,
    ai_model_used VARCHAR(50),
    generation_time_ms INT,
    before_content JSON,
    after_content JSON,
    edit_type ENUM('minor', 'major', 'complete_rewrite') NULL,
    fields_changed JSON,
    was_saved BOOLEAN DEFAULT FALSE,
    was_exported BOOLEAN DEFAULT FALSE,
    was_integrated BOOLEAN DEFAULT FALSE,
    integration_target VARCHAR(50),
    page_url VARCHAR(500),
    referrer_url VARCHAR(500),
    browser_info JSON,
    metadata JSON,
    user_satisfaction_score INT NULL,
    content_quality_score DECIMAL(3,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_event_type (event_type),
    INDEX idx_feature_category (feature_category),
    INDEX idx_action (action),
    INDEX idx_resource_type (resource_type),
    INDEX idx_resource_id (resource_id),
    INDEX idx_created_at (created_at),
    INDEX idx_was_saved (was_saved),
    INDEX idx_was_exported (was_exported),
    INDEX idx_was_integrated (was_integrated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Generation Analytics
CREATE TABLE IF NOT EXISTS generation_analytics (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    feature_category ENUM('brief', 'initiative', 'feature', 'epic', 'story', 'code', 'design', 'test') NOT NULL,
    resource_id VARCHAR(36) NOT NULL,
    total_generations INT DEFAULT 0,
    generations_kept_without_edit INT DEFAULT 0,
    generations_edited INT DEFAULT 0,
    generations_deleted INT DEFAULT 0,
    minor_edits INT DEFAULT 0,
    major_edits INT DEFAULT 0,
    complete_rewrites INT DEFAULT 0,
    ai_enhancements INT DEFAULT 0,
    saves_count INT DEFAULT 0,
    exports_count INT DEFAULT 0,
    integrations_count INT DEFAULT 0,
    first_generated_at TIMESTAMP NULL,
    last_modified_at TIMESTAMP NULL,
    total_time_spent_minutes INT DEFAULT 0,
    avg_generation_time_ms INT DEFAULT 0,
    avg_content_quality_score DECIMAL(3,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_resource (user_id, feature_category, resource_id),
    INDEX idx_user_id (user_id),
    INDEX idx_feature_category (feature_category),
    INDEX idx_resource_id (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prompt Analytics
CREATE TABLE IF NOT EXISTS prompt_analytics (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    feature_category ENUM('brief', 'initiative', 'feature', 'epic', 'story', 'code', 'design', 'test') NOT NULL,
    prompt_text TEXT NOT NULL,
    keywords JSON,
    prompt_length INT,
    complexity_score DECIMAL(3,2),
    success_rate DECIMAL(3,2),
    avg_generation_time_ms INT,
    usage_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_feature_category (feature_category),
    INDEX idx_keywords (keywords),
    INDEX idx_usage_count (usage_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Configuration
CREATE TABLE IF NOT EXISTS audit_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_name VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_setting_name (setting_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 5: RBAC SYSTEM TABLES
-- =============================================

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_department_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_department_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Organizational Levels
CREATE TABLE IF NOT EXISTS organizational_levels (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    hierarchy_order INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hierarchy_order (hierarchy_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    organizational_level_id VARCHAR(36) NOT NULL,
    department_id VARCHAR(36) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizational_level_id) REFERENCES organizational_levels(id),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_role_name (name),
    INDEX idx_org_level (organizational_level_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System Modules
CREATE TABLE IF NOT EXISTS system_modules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    route_path VARCHAR(200),
    icon VARCHAR(50),
    module_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_module_name (name),
    INDEX idx_module_order (module_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permission Types
CREATE TABLE IF NOT EXISTS permission_types (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id VARCHAR(36) PRIMARY KEY,
    role_id VARCHAR(36) NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    permission_type_id VARCHAR(36) NOT NULL,
    can_access BOOLEAN DEFAULT FALSE,
    can_read BOOLEAN DEFAULT FALSE,
    can_write BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES system_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_type_id) REFERENCES permission_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_module_permission (role_id, module_id, permission_type_id),
    INDEX idx_role_permissions (role_id, module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update users table with RBAC foreign keys
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS department_id VARCHAR(36) NULL,
ADD COLUMN IF NOT EXISTS primary_role_id VARCHAR(36) NULL,
ADD COLUMN IF NOT EXISTS organizational_level_id VARCHAR(36) NULL;

-- Add foreign key constraints if they don't exist
SET @constraint_exists = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
                         WHERE TABLE_SCHEMA = 'aura_playground' 
                         AND TABLE_NAME = 'users' 
                         AND COLUMN_NAME = 'department_id' 
                         AND REFERENCED_TABLE_NAME = 'departments');

SET @sql = IF(@constraint_exists = 0, 
              'ALTER TABLE users ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL', 
              'SELECT "Foreign key already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- User Role Assignments
CREATE TABLE IF NOT EXISTS user_role_assignments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    assigned_by VARCHAR(36) NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_user_roles (user_id),
    INDEX idx_role_users (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STEP 6: VIEWS
-- =============================================

-- Role Permission Matrix View
CREATE OR REPLACE VIEW role_permission_matrix AS
SELECT 
    r.id as role_id,
    r.name as role_name,
    r.display_name as role_display_name,
    ol.name as organizational_level,
    d.name as department,
    sm.name as module_name,
    sm.display_name as module_display_name,
    rp.can_access,
    rp.can_read,
    rp.can_write,
    rp.can_delete,
    rp.can_admin
FROM roles r
LEFT JOIN organizational_levels ol ON r.organizational_level_id = ol.id
LEFT JOIN departments d ON r.department_id = d.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN system_modules sm ON rp.module_id = sm.id
ORDER BY ol.hierarchy_order, r.display_name, sm.module_order;

-- User Permissions View
CREATE OR REPLACE VIEW user_permissions AS
SELECT 
    u.id as user_id,
    u.display_name as user_name,
    u.email,
    r.name as role_name,
    r.display_name as role_display_name,
    sm.name as module_name,
    sm.display_name as module_display_name,
    sm.route_path,
    rp.can_access,
    rp.can_read,
    rp.can_write,
    rp.can_delete,
    rp.can_admin
FROM users u
JOIN user_role_assignments ura ON u.id = ura.user_id AND ura.is_active = TRUE
JOIN roles r ON ura.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN system_modules sm ON rp.module_id = sm.id
WHERE u.is_active = TRUE AND r.is_active = TRUE AND sm.is_active = TRUE
ORDER BY u.display_name, sm.module_order;

-- =============================================
-- STEP 7: INITIAL DATA
-- =============================================

-- Insert default portfolio
INSERT IGNORE INTO portfolios (id, name, description, business_owner) VALUES 
('default-portfolio', 'Default Portfolio', 'Default portfolio for initial setup', 'System Administrator');

-- Insert organizational levels
INSERT IGNORE INTO organizational_levels (id, name, hierarchy_order, description) VALUES
(UUID(), 'executive', 1, 'Executive Vice Presidents, Senior Vice Presidents, Vice Presidents'),
(UUID(), 'portfolio', 2, 'Portfolio level managers and directors'),
(UUID(), 'art', 3, 'Agile Release Train level roles'),
(UUID(), 'team', 4, 'Feature team level roles');

-- Insert departments
INSERT IGNORE INTO departments (id, name, description) VALUES
(UUID(), 'Quality Engineering', 'Quality assurance and testing'),
(UUID(), 'Product and Delivery', 'Product management and delivery'),
(UUID(), 'Software Engineering', 'Software development and architecture'),
(UUID(), 'Product Engineering', 'Product engineering and innovation'),
(UUID(), 'Software Architecture', 'Software architecture and design'),
(UUID(), 'IT Operations', 'IT operations and administration'),
(UUID(), 'Digital Transformation', 'Digital transformation initiatives');

-- Insert system modules
INSERT IGNORE INTO system_modules (id, name, display_name, description, route_path, icon, module_order) VALUES
(UUID(), 'ideas', 'Ideas', 'Business ideas and use cases', '/v1/use-cases', 'lightbulb', 1),
(UUID(), 'work_items', 'Work Items', 'Requirements and work items management', '/v1/requirements', 'clipboard-list', 2),
(UUID(), 'design', 'Design', 'System design and architecture', '/v1/design', 'palette', 3),
(UUID(), 'code', 'Code', 'Code generation and management', '/v1/code', 'code', 4),
(UUID(), 'test_cases', 'Test Cases', 'Test case management', '/v1/test-cases', 'test-tube', 5),
(UUID(), 'execution', 'Execution', 'Test execution and results', '/v1/execution', 'play', 6),
(UUID(), 'defects', 'Defects', 'Defect tracking and management', '/v1/defects', 'bug', 7),
(UUID(), 'traceability', 'Traceability', 'Requirements traceability matrix', '/v1/traceability', 'git-branch', 8),
(UUID(), 'dashboard', 'Dashboard', 'Analytics and reporting dashboard', '/v1/dashboard', 'bar-chart', 0);

-- Insert permission types
INSERT IGNORE INTO permission_types (id, name, description) VALUES
(UUID(), 'module_access', 'Basic module access permission'),
(UUID(), 'read', 'Read permission for data'),
(UUID(), 'write', 'Write/modify permission for data'),
(UUID(), 'delete', 'Delete permission for data'),
(UUID(), 'admin', 'Administrative permission for module');

-- Insert audit configuration
INSERT IGNORE INTO audit_config (setting_name, setting_value, description) VALUES
('audit_enabled', 'true', 'Master switch for audit system'),
('log_level', 'detailed', 'Logging level: basic, detailed, verbose'),
('retention_days', '730', 'Audit log retention period in days (2 years)'),
('async_logging', 'true', 'Enable asynchronous logging for performance'),
('track_content_changes', 'true', 'Track detailed content changes'),
('track_prompt_analytics', 'true', 'Track and analyze user prompts'),
('performance_monitoring', 'true', 'Monitor generation performance metrics'),
('export_tracking', 'true', 'Track exports and integrations');

-- Insert workflow stages
INSERT IGNORE INTO aurav2_workflow_stages (id, stage_name, stage_order, description) VALUES
(UUID(), 'idea', 1, 'Initial idea capture and basic definition'),
(UUID(), 'discovery', 2, 'Requirements discovery and analysis'),
(UUID(), 'design', 3, 'Solution design and architecture'),
(UUID(), 'execution', 4, 'Implementation and testing');

-- Insert sample Emirates users
INSERT IGNORE INTO users (
    id, entra_id, user_principal_name, email, display_name, given_name, surname,
    job_title, department, office_location, employee_id, business_phones, 
    manager_email, roles
) VALUES
(
    UUID(), 
    '55555555-5555-5555-5555-555555555555',
    'rowen.gopi@emirates.com',
    'rowen.gopi@emirates.com',
    'Rowen Gopi',
    'Rowen',
    'Gopi',
    'System Administrator',
    'IT Operations',
    'Dubai HQ', 
    'EK001005',
    JSON_ARRAY('+971 4 214 4450'),
    NULL,
    JSON_ARRAY('system_administrator')
),
(
    UUID(),
    '44444444-4444-4444-4444-444444444444',
    'admin@emirates.com',
    'admin@emirates.com',
    'System Administrator',
    'System',
    'Administrator',
    'System Administrator',
    'IT Operations',
    'Dubai HQ', 
    'EK001000',
    JSON_ARRAY('+971 4 214 4440'),
    NULL,
    JSON_ARRAY('system_administrator')
);

-- Insert sample business brief
INSERT IGNORE INTO business_briefs (id, title, description, business_owner, status) VALUES 
('sample-brief-001', 'Sample Business Brief', 'This is a sample business brief for testing the containerized application.', 'System Administrator', 'draft');

-- =============================================
-- VERIFICATION
-- =============================================

SELECT 'Complete Aura database created successfully!' as Status;
SELECT COUNT(*) as 'Total Tables' FROM information_schema.tables WHERE table_schema = 'aura_playground';

-- Show all tables
SHOW TABLES;
