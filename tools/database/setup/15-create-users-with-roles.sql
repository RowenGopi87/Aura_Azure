-- =============================================
-- AURA RBAC System - Create Users with Role Assignments
-- Including Rowen Gopi as System Administrator
-- =============================================

-- Get department and role IDs for reference
SET @digital_transformation_dept = (SELECT id FROM departments WHERE name = 'Digital Transformation');
SET @it_ops_dept = (SELECT id FROM departments WHERE name = 'IT Operations');
SET @software_dept = (SELECT id FROM departments WHERE name = 'Software Engineering');
SET @quality_dept = (SELECT id FROM departments WHERE name = 'Quality Engineering');
SET @product_dept = (SELECT id FROM departments WHERE name = 'Product and Delivery');

SET @system_admin_role = (SELECT id FROM roles WHERE name = 'system_administrator');
SET @business_analyst_role = (SELECT id FROM roles WHERE name = 'technical_product_manager');
SET @product_manager_role = (SELECT id FROM roles WHERE name = 'manager_product_delivery');
SET @tech_lead_role = (SELECT id FROM roles WHERE name = 'principal_software_engineer');

SET @executive_level = (SELECT id FROM organizational_levels WHERE name = 'executive');
SET @portfolio_level = (SELECT id FROM organizational_levels WHERE name = 'portfolio');
SET @art_level = (SELECT id FROM organizational_levels WHERE name = 'art');

-- Clear existing mock users to recreate them properly
DELETE FROM user_role_assignments WHERE user_id IN (
    SELECT id FROM users WHERE email IN (
        'sarah.ahmed@emirates.com',
        'mohammed.hassan@emirates.com', 
        'fatima.ali@emirates.com',
        'admin@emirates.com'
    )
);

DELETE FROM users WHERE email IN (
    'sarah.ahmed@emirates.com',
    'mohammed.hassan@emirates.com', 
    'fatima.ali@emirates.com',
    'admin@emirates.com'
);

-- Insert updated Emirates users with proper role assignments
INSERT INTO users (
    id, entra_id, user_principal_name, email, display_name, given_name, surname,
    job_title, department, office_location, employee_id, business_phones, 
    manager_email, roles, department_id, primary_role_id, organizational_level_id
) VALUES
-- Sarah Ahmed - Technical Product Manager (ART Level)
(
    UUID(), 
    '11111111-1111-1111-1111-111111111111',
    'sarah.ahmed@emirates.com',
    'sarah.ahmed@emirates.com',
    'Sarah Ahmed',
    'Sarah',
    'Ahmed',
    'Technical Product Manager',
    'Product and Delivery',
    'Dubai HQ',
    'EK001001',
    JSON_ARRAY('+971 4 214 4444'),
    'manager@emirates.com',
    JSON_ARRAY('technical_product_manager'),
    @product_dept,
    @business_analyst_role,
    @art_level
),
-- Mohammed Hassan - Manager of Product and Delivery (Portfolio Level)
(
    UUID(),
    '22222222-2222-2222-2222-222222222222', 
    'mohammed.hassan@emirates.com',
    'mohammed.hassan@emirates.com',
    'Mohammed Hassan',
    'Mohammed',
    'Hassan',
    'Manager of Product and Delivery',
    'Product and Delivery',
    'Dubai HQ',
    'EK001002',
    JSON_ARRAY('+971 4 214 4445'),
    'director@emirates.com',
    JSON_ARRAY('manager_product_delivery'),
    @product_dept,
    @product_manager_role,
    @portfolio_level
),
-- Fatima Ali - Principal Software Engineer (ART Level)
(
    UUID(),
    '33333333-3333-3333-3333-333333333333',
    'fatima.ali@emirates.com',
    'fatima.ali@emirates.com',
    'Fatima Ali',
    'Fatima', 
    'Ali',
    'Principal Software Engineer',
    'Software Engineering',
    'Dubai HQ',
    'EK001003',
    JSON_ARRAY('+971 4 214 4446'),
    'manager@emirates.com',
    JSON_ARRAY('principal_software_engineer'),
    @software_dept,
    @tech_lead_role,
    @art_level
),
-- Rowen Gopi - System Administrator (Executive Level)
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
    JSON_ARRAY('system_administrator'),
    @it_ops_dept,
    @system_admin_role,
    @executive_level
),
-- Keep original admin for backward compatibility
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
    JSON_ARRAY('system_administrator'),
    @it_ops_dept,
    @system_admin_role,
    @executive_level
)
ON DUPLICATE KEY UPDATE is_active = VALUES(is_active);

-- Assign roles to users
INSERT INTO user_role_assignments (id, user_id, role_id, assigned_by, is_active) VALUES
-- Sarah Ahmed - Technical Product Manager
(UUID(), 
 (SELECT id FROM users WHERE email = 'sarah.ahmed@emirates.com'), 
 @business_analyst_role, 
 (SELECT id FROM users WHERE email = 'rowen.gopi@emirates.com'), 
 TRUE),

-- Mohammed Hassan - Manager of Product and Delivery
(UUID(), 
 (SELECT id FROM users WHERE email = 'mohammed.hassan@emirates.com'), 
 @product_manager_role, 
 (SELECT id FROM users WHERE email = 'rowen.gopi@emirates.com'), 
 TRUE),

-- Fatima Ali - Principal Software Engineer
(UUID(), 
 (SELECT id FROM users WHERE email = 'fatima.ali@emirates.com'), 
 @tech_lead_role, 
 (SELECT id FROM users WHERE email = 'rowen.gopi@emirates.com'), 
 TRUE),

-- Rowen Gopi - System Administrator
(UUID(), 
 (SELECT id FROM users WHERE email = 'rowen.gopi@emirates.com'), 
 @system_admin_role, 
 (SELECT id FROM users WHERE email = 'rowen.gopi@emirates.com'), 
 TRUE),

-- Admin - System Administrator
(UUID(), 
 (SELECT id FROM users WHERE email = 'admin@emirates.com'), 
 @system_admin_role, 
 (SELECT id FROM users WHERE email = 'rowen.gopi@emirates.com'), 
 TRUE)
ON DUPLICATE KEY UPDATE is_active = VALUES(is_active);

-- Create additional sample users for testing different roles
INSERT INTO users (
    id, entra_id, user_principal_name, email, display_name, given_name, surname,
    job_title, department, office_location, employee_id, business_phones, 
    department_id, primary_role_id, organizational_level_id
) VALUES
-- Senior Quality Engineer
(
    UUID(), 
    '66666666-6666-6666-6666-666666666666',
    'ahmad.hassan@emirates.com',
    'ahmad.hassan@emirates.com',
    'Ahmad Hassan',
    'Ahmad',
    'Hassan',
    'Senior Quality Engineer',
    'Quality Engineering',
    'Dubai HQ',
    'EK001006',
    JSON_ARRAY('+971 4 214 4451'),
    @quality_dept,
    (SELECT id FROM roles WHERE name = 'senior_quality_engineer'),
    (SELECT id FROM organizational_levels WHERE name = 'team')
),
-- Software Developer
(
    UUID(), 
    '77777777-7777-7777-7777-777777777777',
    'layla.omar@emirates.com',
    'layla.omar@emirates.com',
    'Layla Omar',
    'Layla',
    'Omar',
    'Software Developer',
    'Software Engineering',
    'Dubai HQ',
    'EK001007',
    JSON_ARRAY('+971 4 214 4452'),
    @software_dept,
    (SELECT id FROM roles WHERE name = 'software_developer'),
    (SELECT id FROM organizational_levels WHERE name = 'team')
),
-- Technical Product Owner
(
    UUID(), 
    '88888888-8888-8888-8888-888888888888',
    'khalid.ali@emirates.com',
    'khalid.ali@emirates.com',
    'Khalid Ali',
    'Khalid',
    'Ali',
    'Technical Product Owner',
    'Product and Delivery',
    'Dubai HQ',
    'EK001008',
    JSON_ARRAY('+971 4 214 4453'),
    @product_dept,
    (SELECT id FROM roles WHERE name = 'technical_product_owner'),
    (SELECT id FROM organizational_levels WHERE name = 'team')
)
ON DUPLICATE KEY UPDATE is_active = VALUES(is_active);

-- Assign roles to additional sample users
INSERT INTO user_role_assignments (id, user_id, role_id, assigned_by, is_active) VALUES
(UUID(), 
 (SELECT id FROM users WHERE email = 'ahmad.hassan@emirates.com'), 
 (SELECT id FROM roles WHERE name = 'senior_quality_engineer'), 
 (SELECT id FROM users WHERE email = 'rowen.gopi@emirates.com'), 
 TRUE),

(UUID(), 
 (SELECT id FROM users WHERE email = 'layla.omar@emirates.com'), 
 (SELECT id FROM roles WHERE name = 'software_developer'), 
 (SELECT id FROM users WHERE email = 'rowen.gopi@emirates.com'), 
 TRUE),

(UUID(), 
 (SELECT id FROM users WHERE email = 'khalid.ali@emirates.com'), 
 (SELECT id FROM roles WHERE name = 'technical_product_owner'), 
 (SELECT id FROM users WHERE email = 'rowen.gopi@emirates.com'), 
 TRUE)
ON DUPLICATE KEY UPDATE is_active = VALUES(is_active);

-- Verify the setup
SELECT 
    u.display_name,
    u.email,
    u.job_title,
    d.name as department,
    r.display_name as role,
    ol.name as level
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN roles r ON u.primary_role_id = r.id
LEFT JOIN organizational_levels ol ON u.organizational_level_id = ol.id
WHERE u.email LIKE '%@emirates.com'
ORDER BY ol.hierarchy_order, u.display_name;

SELECT 'Users with roles created successfully!' as Status;
