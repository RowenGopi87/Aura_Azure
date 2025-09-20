-- =============================================
-- AURA RBAC System - Enhanced Database Schema
-- Emirates Organization Role-Based Access Control
-- =============================================

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_department_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_department_name (name)
);

-- Organizational levels
CREATE TABLE IF NOT EXISTS organizational_levels (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    hierarchy_order INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hierarchy_order (hierarchy_order)
);

-- Roles table
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
);

-- Modules/Features table
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
);

-- Permission types
CREATE TABLE IF NOT EXISTS permission_types (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions (many-to-many with permission levels)
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
);

-- Update users table to include department and role assignments
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS department_id VARCHAR(36) NULL,
ADD COLUMN IF NOT EXISTS primary_role_id VARCHAR(36) NULL,
ADD COLUMN IF NOT EXISTS organizational_level_id VARCHAR(36) NULL,
ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
ADD FOREIGN KEY (primary_role_id) REFERENCES roles(id) ON DELETE SET NULL,
ADD FOREIGN KEY (organizational_level_id) REFERENCES organizational_levels(id) ON DELETE SET NULL;

-- User role assignments (for multiple roles per user)
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
);

-- Insert organizational levels
INSERT INTO organizational_levels (id, name, hierarchy_order, description) VALUES
(UUID(), 'executive', 1, 'Executive Vice Presidents, Senior Vice Presidents, Vice Presidents'),
(UUID(), 'portfolio', 2, 'Portfolio level managers and directors'),
(UUID(), 'art', 3, 'Agile Release Train level roles'),
(UUID(), 'team', 4, 'Feature team level roles')
ON DUPLICATE KEY UPDATE hierarchy_order = VALUES(hierarchy_order);

-- Insert departments
INSERT INTO departments (id, name, description) VALUES
(UUID(), 'Quality Engineering', 'Quality assurance and testing'),
(UUID(), 'Product and Delivery', 'Product management and delivery'),
(UUID(), 'Software Engineering', 'Software development and architecture'),
(UUID(), 'Product Engineering', 'Product engineering and innovation'),
(UUID(), 'Software Architecture', 'Software architecture and design'),
(UUID(), 'IT Operations', 'IT operations and administration'),
(UUID(), 'Digital Transformation', 'Digital transformation initiatives')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert system modules
INSERT INTO system_modules (id, name, display_name, description, route_path, icon, module_order) VALUES
(UUID(), 'ideas', 'Ideas', 'Business ideas and use cases', '/v1/use-cases', 'lightbulb', 1),
(UUID(), 'work_items', 'Work Items', 'Requirements and work items management', '/v1/requirements', 'clipboard-list', 2),
(UUID(), 'design', 'Design', 'System design and architecture', '/v1/design', 'palette', 3),
(UUID(), 'code', 'Code', 'Code generation and management', '/v1/code', 'code', 4),
(UUID(), 'test_cases', 'Test Cases', 'Test case management', '/v1/test-cases', 'test-tube', 5),
(UUID(), 'execution', 'Execution', 'Test execution and results', '/v1/execution', 'play', 6),
(UUID(), 'defects', 'Defects', 'Defect tracking and management', '/v1/defects', 'bug', 7),
(UUID(), 'traceability', 'Traceability', 'Requirements traceability matrix', '/v1/traceability', 'git-branch', 8),
(UUID(), 'dashboard', 'Dashboard', 'Analytics and reporting dashboard', '/v1/dashboard', 'bar-chart', 0)
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- Insert permission types
INSERT INTO permission_types (id, name, description) VALUES
(UUID(), 'module_access', 'Basic module access permission'),
(UUID(), 'read', 'Read permission for data'),
(UUID(), 'write', 'Write/modify permission for data'),
(UUID(), 'delete', 'Delete permission for data'),
(UUID(), 'admin', 'Administrative permission for module')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Get IDs for reference (we'll use these in the next part)
SET @executive_level = (SELECT id FROM organizational_levels WHERE name = 'executive');
SET @portfolio_level = (SELECT id FROM organizational_levels WHERE name = 'portfolio');
SET @art_level = (SELECT id FROM organizational_levels WHERE name = 'art');
SET @team_level = (SELECT id FROM organizational_levels WHERE name = 'team');

SET @quality_dept = (SELECT id FROM departments WHERE name = 'Quality Engineering');
SET @product_dept = (SELECT id FROM departments WHERE name = 'Product and Delivery');
SET @software_dept = (SELECT id FROM departments WHERE name = 'Software Engineering');
SET @product_eng_dept = (SELECT id FROM departments WHERE name = 'Product Engineering');
SET @architecture_dept = (SELECT id FROM departments WHERE name = 'Software Architecture');
SET @it_ops_dept = (SELECT id FROM departments WHERE name = 'IT Operations');

-- Insert roles with updated permissions
INSERT INTO roles (id, name, display_name, description, organizational_level_id, department_id) VALUES
-- Executive Level
(UUID(), 'evp', 'Executive Vice President', 'Executive Vice President with full system access', @executive_level, NULL),
(UUID(), 'svp', 'Senior Vice President', 'Senior Vice President with full system access', @executive_level, NULL),
(UUID(), 'vp', 'Vice President', 'Vice President with full system access', @executive_level, NULL),

-- Portfolio Level
(UUID(), 'manager_quality_engineering', 'Manager of Quality Engineering', 'Portfolio level quality engineering manager', @portfolio_level, @quality_dept),
(UUID(), 'manager_product_delivery', 'Manager of Product and Delivery', 'Portfolio level product and delivery manager', @portfolio_level, @product_dept),
(UUID(), 'manager_software_engineering', 'Manager of Software Engineering', 'Portfolio level software engineering manager', @portfolio_level, @software_dept),
(UUID(), 'manager_product_engineering', 'Manager of Product Engineering', 'Portfolio level product engineering manager', @portfolio_level, @product_eng_dept),
(UUID(), 'manager_software_architecture', 'Manager of Software Architecture', 'Portfolio level software architecture manager', @portfolio_level, @architecture_dept),

-- ART Level
(UUID(), 'principal_qa_engineer', 'Principal Quality Assurance Engineer', 'ART level principal QA engineer', @art_level, @quality_dept),
(UUID(), 'technical_product_manager', 'Technical Product Manager', 'ART level technical product manager', @art_level, @product_dept),
(UUID(), 'release_train_lead', 'Release Train Lead', 'ART level release train lead', @art_level, @product_dept),
(UUID(), 'principal_software_engineer', 'Principal Software Engineer', 'ART level principal software engineer', @art_level, @software_dept),

-- Team Level
(UUID(), 'senior_quality_engineer', 'Senior Quality Engineer', 'Team level senior quality engineer', @team_level, @quality_dept),
(UUID(), 'lead_quality_engineer', 'Lead Quality Engineer', 'Team level lead quality engineer', @team_level, @quality_dept),
(UUID(), 'software_developer', 'Software Developer', 'Team level software developer', @team_level, @software_dept),
(UUID(), 'technical_product_owner', 'Technical Product Owner', 'Team level technical product owner', @team_level, @product_dept),

-- System Administrator
(UUID(), 'system_administrator', 'System Administrator', 'Full system administrator access', @executive_level, @it_ops_dept)
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- Create a comprehensive view for easier role permission management
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

-- Create view for user permissions
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

SELECT 'RBAC system tables created successfully!' as Status;
