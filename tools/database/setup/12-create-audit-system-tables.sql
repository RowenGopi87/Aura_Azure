-- =============================================
-- Aura Audit System - Database Tables
-- Emirates Organization User Tracking & Analytics
-- =============================================

-- Users table (Mock Azure Entra ID)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    entra_id VARCHAR(36) UNIQUE NOT NULL,
    user_principal_name VARCHAR(255) NOT NULL UNIQUE, -- john.doe@emirates.com
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
    roles JSON, -- Array of roles: ['business_analyst', 'product_manager']
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
);

-- User Sessions table
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
);

-- Comprehensive Audit Events table
CREATE TABLE IF NOT EXISTS audit_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36),
    event_type ENUM(
        'generation', 'edit', 'save', 'delete', 'export', 
        'integration', 'view', 'search', 'ai_enhancement'
    ) NOT NULL,
    feature_category ENUM(
        'brief', 'initiative', 'feature', 'epic', 'story', 
        'code', 'design', 'test', 'auth', 'system'
    ) NOT NULL,
    action VARCHAR(100) NOT NULL, -- Specific action taken
    resource_type VARCHAR(50), -- business_brief, initiative, epic, etc.
    resource_id VARCHAR(36),
    resource_title VARCHAR(500), -- Store title for easy reference
    
    -- Generation & Content Tracking
    generation_data JSON, -- Original generated content
    prompt_data JSON, -- User prompts and keywords
    ai_model_used VARCHAR(50), -- Which AI model was used
    generation_time_ms INT, -- Time taken for generation
    
    -- Edit Tracking
    before_content JSON, -- Content before edit
    after_content JSON, -- Content after edit
    edit_type ENUM('minor', 'major', 'complete_rewrite') NULL,
    fields_changed JSON, -- Array of field names that changed
    
    -- Value Indicators
    was_saved BOOLEAN DEFAULT FALSE,
    was_exported BOOLEAN DEFAULT FALSE,
    was_integrated BOOLEAN DEFAULT FALSE, -- Exported to Jira, etc.
    integration_target VARCHAR(50), -- 'jira', 'confluence', etc.
    
    -- Context & Metadata
    page_url VARCHAR(500),
    referrer_url VARCHAR(500),
    browser_info JSON,
    metadata JSON, -- Flexible storage for additional context
    
    -- Performance & Quality Metrics
    user_satisfaction_score INT NULL, -- 1-5 if user provides feedback
    content_quality_score DECIMAL(3,2) NULL, -- AI-assessed quality
    
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
);

-- Generation Analytics table (Pre-computed metrics for performance)
CREATE TABLE IF NOT EXISTS generation_analytics (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    feature_category ENUM(
        'brief', 'initiative', 'feature', 'epic', 'story', 
        'code', 'design', 'test'
    ) NOT NULL,
    resource_id VARCHAR(36) NOT NULL,
    
    -- Generation Metrics
    total_generations INT DEFAULT 0,
    generations_kept_without_edit INT DEFAULT 0,
    generations_edited INT DEFAULT 0,
    generations_deleted INT DEFAULT 0,
    
    -- Edit Metrics
    minor_edits INT DEFAULT 0,
    major_edits INT DEFAULT 0,
    complete_rewrites INT DEFAULT 0,
    ai_enhancements INT DEFAULT 0,
    
    -- Value Metrics
    saves_count INT DEFAULT 0,
    exports_count INT DEFAULT 0,
    integrations_count INT DEFAULT 0,
    
    -- Time Metrics
    first_generated_at TIMESTAMP NULL,
    last_modified_at TIMESTAMP NULL,
    total_time_spent_minutes INT DEFAULT 0,
    
    -- Quality Metrics
    avg_generation_time_ms INT DEFAULT 0,
    avg_content_quality_score DECIMAL(3,2) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_resource (user_id, feature_category, resource_id),
    INDEX idx_user_id (user_id),
    INDEX idx_feature_category (feature_category),
    INDEX idx_resource_id (resource_id)
);

-- Prompt Analytics table (Track keywords and prompt patterns)
CREATE TABLE IF NOT EXISTS prompt_analytics (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    feature_category ENUM(
        'brief', 'initiative', 'feature', 'epic', 'story', 
        'code', 'design', 'test'
    ) NOT NULL,
    prompt_text TEXT NOT NULL,
    keywords JSON, -- Extracted keywords from prompt
    prompt_length INT,
    complexity_score DECIMAL(3,2), -- AI-assessed prompt complexity
    success_rate DECIMAL(3,2), -- How often this type of prompt succeeds
    avg_generation_time_ms INT,
    usage_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_feature_category (feature_category),
    INDEX idx_keywords (keywords),
    INDEX idx_usage_count (usage_count)
);

-- Audit Configuration table
CREATE TABLE IF NOT EXISTS audit_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_name VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_setting_name (setting_name)
);

-- Insert default audit configuration
INSERT INTO audit_config (setting_name, setting_value, description) VALUES
('audit_enabled', 'true', 'Master switch for audit system'),
('log_level', 'detailed', 'Logging level: basic, detailed, verbose'),
('retention_days', '730', 'Audit log retention period in days (2 years)'),
('async_logging', 'true', 'Enable asynchronous logging for performance'),
('track_content_changes', 'true', 'Track detailed content changes'),
('track_prompt_analytics', 'true', 'Track and analyze user prompts'),
('performance_monitoring', 'true', 'Monitor generation performance metrics'),
('export_tracking', 'true', 'Track exports and integrations')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert mock Emirates users
INSERT INTO users (
    id, entra_id, user_principal_name, email, display_name, given_name, surname,
    job_title, department, office_location, employee_id, business_phones, 
    manager_email, roles
) VALUES
(
    UUID(), 
    '11111111-1111-1111-1111-111111111111',
    'sarah.ahmed@emirates.com',
    'sarah.ahmed@emirates.com',
    'Sarah Ahmed',
    'Sarah',
    'Ahmed',
    'Senior Business Analyst',
    'Digital Transformation',
    'Dubai HQ',
    'EK001001',
    JSON_ARRAY('+971 4 214 4444'),
    'manager@emirates.com',
    JSON_ARRAY('business_analyst')
),
(
    UUID(),
    '22222222-2222-2222-2222-222222222222', 
    'mohammed.hassan@emirates.com',
    'mohammed.hassan@emirates.com',
    'Mohammed Hassan',
    'Mohammed',
    'Hassan',
    'Product Manager',
    'IT Strategy',
    'Dubai HQ',
    'EK001002',
    JSON_ARRAY('+971 4 214 4445'),
    'director@emirates.com',
    JSON_ARRAY('product_manager')
),
(
    UUID(),
    '33333333-3333-3333-3333-333333333333',
    'fatima.ali@emirates.com',
    'fatima.ali@emirates.com',
    'Fatima Ali',
    'Fatima', 
    'Ali',
    'Technical Lead',
    'Software Development',
    'Dubai HQ',
    'EK001003',
    JSON_ARRAY('+971 4 214 4446'),
    'manager@emirates.com',
    JSON_ARRAY('tech_lead')
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
    JSON_ARRAY('admin')
)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_events_comprehensive 
ON audit_events (user_id, feature_category, event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_generation_analytics_reporting
ON generation_analytics (feature_category, created_at, total_generations);

-- CREATE INDEX IF NOT EXISTS idx_prompt_analytics_keywords
-- ON prompt_analytics (feature_category, keywords, usage_count);

SELECT 'Audit system tables created successfully!' as Status;
