-- =============================================
-- AURA RBAC System - Role Permissions Mapping
-- Based on Updated Permission Matrix
-- =============================================

-- First, let's get all the IDs we need
SET @module_access_perm = (SELECT id FROM permission_types WHERE name = 'module_access');

-- Module IDs
SET @ideas_module = (SELECT id FROM system_modules WHERE name = 'ideas');
SET @work_items_module = (SELECT id FROM system_modules WHERE name = 'work_items');
SET @design_module = (SELECT id FROM system_modules WHERE name = 'design');
SET @code_module = (SELECT id FROM system_modules WHERE name = 'code');
SET @test_cases_module = (SELECT id FROM system_modules WHERE name = 'test_cases');
SET @execution_module = (SELECT id FROM system_modules WHERE name = 'execution');
SET @defects_module = (SELECT id FROM system_modules WHERE name = 'defects');
SET @traceability_module = (SELECT id FROM system_modules WHERE name = 'traceability');
SET @dashboard_module = (SELECT id FROM system_modules WHERE name = 'dashboard');

-- Role IDs
SET @evp_role = (SELECT id FROM roles WHERE name = 'evp');
SET @svp_role = (SELECT id FROM roles WHERE name = 'svp');
SET @vp_role = (SELECT id FROM roles WHERE name = 'vp');
SET @manager_quality_role = (SELECT id FROM roles WHERE name = 'manager_quality_engineering');
SET @manager_product_role = (SELECT id FROM roles WHERE name = 'manager_product_delivery');
SET @manager_software_role = (SELECT id FROM roles WHERE name = 'manager_software_engineering');
SET @manager_product_eng_role = (SELECT id FROM roles WHERE name = 'manager_product_engineering');
SET @manager_architecture_role = (SELECT id FROM roles WHERE name = 'manager_software_architecture');
SET @principal_qa_role = (SELECT id FROM roles WHERE name = 'principal_qa_engineer');
SET @tech_pm_role = (SELECT id FROM roles WHERE name = 'technical_product_manager');
SET @rtl_role = (SELECT id FROM roles WHERE name = 'release_train_lead');
SET @principal_se_role = (SELECT id FROM roles WHERE name = 'principal_software_engineer');
SET @senior_qe_role = (SELECT id FROM roles WHERE name = 'senior_quality_engineer');
SET @lead_qe_role = (SELECT id FROM roles WHERE name = 'lead_quality_engineer');
SET @software_dev_role = (SELECT id FROM roles WHERE name = 'software_developer');
SET @tech_po_role = (SELECT id FROM roles WHERE name = 'technical_product_owner');
SET @system_admin_role = (SELECT id FROM roles WHERE name = 'system_administrator');

-- Helper procedure to insert permissions
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS InsertRolePermission(
    IN p_role_id VARCHAR(36),
    IN p_module_id VARCHAR(36),
    IN p_can_access BOOLEAN,
    IN p_can_read BOOLEAN,
    IN p_can_write BOOLEAN,
    IN p_can_delete BOOLEAN,
    IN p_can_admin BOOLEAN
)
BEGIN
    INSERT INTO role_permissions (
        id, role_id, module_id, permission_type_id,
        can_access, can_read, can_write, can_delete, can_admin
    ) VALUES (
        UUID(), p_role_id, p_module_id, @module_access_perm,
        p_can_access, p_can_read, p_can_write, p_can_delete, p_can_admin
    ) ON DUPLICATE KEY UPDATE
        can_access = p_can_access,
        can_read = p_can_read,
        can_write = p_can_write,
        can_delete = p_can_delete,
        can_admin = p_can_admin,
        updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- EVP/SVP/VP - Full access to all modules
-- EVP
CALL InsertRolePermission(@evp_role, @ideas_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@evp_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@evp_role, @design_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@evp_role, @code_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@evp_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@evp_role, @execution_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@evp_role, @defects_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@evp_role, @traceability_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@evp_role, @dashboard_module, TRUE, TRUE, TRUE, TRUE, TRUE);

-- SVP (same as EVP)
CALL InsertRolePermission(@svp_role, @ideas_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@svp_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@svp_role, @design_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@svp_role, @code_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@svp_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@svp_role, @execution_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@svp_role, @defects_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@svp_role, @traceability_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@svp_role, @dashboard_module, TRUE, TRUE, TRUE, TRUE, TRUE);

-- VP (same as EVP)
CALL InsertRolePermission(@vp_role, @ideas_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@vp_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@vp_role, @design_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@vp_role, @code_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@vp_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@vp_role, @execution_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@vp_role, @defects_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@vp_role, @traceability_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@vp_role, @dashboard_module, TRUE, TRUE, TRUE, TRUE, TRUE);

-- Portfolio Managers - Full access to all modules
CALL InsertRolePermission(@manager_quality_role, @ideas_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_quality_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_quality_role, @design_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_quality_role, @code_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_quality_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_quality_role, @execution_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_quality_role, @defects_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_quality_role, @traceability_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_quality_role, @dashboard_module, TRUE, TRUE, TRUE, TRUE, FALSE);

-- Repeat for other portfolio managers (same permissions)
CALL InsertRolePermission(@manager_product_role, @ideas_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_role, @design_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_role, @code_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_role, @execution_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_role, @defects_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_role, @traceability_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_role, @dashboard_module, TRUE, TRUE, TRUE, TRUE, FALSE);

CALL InsertRolePermission(@manager_software_role, @ideas_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_software_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_software_role, @design_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_software_role, @code_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_software_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_software_role, @execution_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_software_role, @defects_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_software_role, @traceability_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_software_role, @dashboard_module, TRUE, TRUE, TRUE, TRUE, FALSE);

CALL InsertRolePermission(@manager_product_eng_role, @ideas_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_eng_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_eng_role, @design_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_eng_role, @code_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_eng_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_eng_role, @execution_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_eng_role, @defects_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_eng_role, @traceability_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_product_eng_role, @dashboard_module, TRUE, TRUE, TRUE, TRUE, FALSE);

CALL InsertRolePermission(@manager_architecture_role, @ideas_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_architecture_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_architecture_role, @design_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_architecture_role, @code_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_architecture_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_architecture_role, @execution_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_architecture_role, @defects_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_architecture_role, @traceability_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@manager_architecture_role, @dashboard_module, TRUE, TRUE, TRUE, TRUE, FALSE);

-- Principal QA Engineer: ❌ Ideas, ✅ Work Items, ✅ Design, ✅ Code, ✅ Test Cases, ✅ Execution, ✅ Defects, ✅ Traceability, ✅ Dashboard
CALL InsertRolePermission(@principal_qa_role, @ideas_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@principal_qa_role, @work_items_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@principal_qa_role, @design_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@principal_qa_role, @code_module, TRUE, TRUE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@principal_qa_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@principal_qa_role, @execution_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@principal_qa_role, @defects_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@principal_qa_role, @traceability_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@principal_qa_role, @dashboard_module, TRUE, TRUE, FALSE, FALSE, FALSE);

-- Technical Product Manager: ✅ Ideas, ✅ Work Items, ✅ Design, ❌ Code, ✅ Test Cases, ❌ Execution, ❌ Defects, ❌ Traceability, ✅ Dashboard
CALL InsertRolePermission(@tech_pm_role, @ideas_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@tech_pm_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@tech_pm_role, @design_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@tech_pm_role, @code_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@tech_pm_role, @test_cases_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@tech_pm_role, @execution_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@tech_pm_role, @defects_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@tech_pm_role, @traceability_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@tech_pm_role, @dashboard_module, TRUE, TRUE, FALSE, FALSE, FALSE);

-- Release Train Lead: ✅ Ideas, ✅ Work Items, ✅ Design, ❌ Code, ✅ Test Cases, ❌ Execution, ❌ Defects, ❌ Traceability, ✅ Dashboard
CALL InsertRolePermission(@rtl_role, @ideas_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@rtl_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@rtl_role, @design_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@rtl_role, @code_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@rtl_role, @test_cases_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@rtl_role, @execution_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@rtl_role, @defects_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@rtl_role, @traceability_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@rtl_role, @dashboard_module, TRUE, TRUE, FALSE, FALSE, FALSE);

-- Principal Software Engineer: ❌ Ideas, ✅ Work Items, ✅ Design, ✅ Code, ✅ Test Cases, ✅ Execution, ✅ Defects, ✅ Traceability, ✅ Dashboard
CALL InsertRolePermission(@principal_se_role, @ideas_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@principal_se_role, @work_items_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@principal_se_role, @design_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@principal_se_role, @code_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@principal_se_role, @test_cases_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@principal_se_role, @execution_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@principal_se_role, @defects_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@principal_se_role, @traceability_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@principal_se_role, @dashboard_module, TRUE, TRUE, FALSE, FALSE, FALSE);

-- Senior Quality Engineer: ❌ Ideas, ✅ Work Items, ✅ Design, ❌ Code, ✅ Test Cases, ✅ Execution, ✅ Defects, ✅ Traceability, ✅ Dashboard
CALL InsertRolePermission(@senior_qe_role, @ideas_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@senior_qe_role, @work_items_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@senior_qe_role, @design_module, TRUE, TRUE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@senior_qe_role, @code_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@senior_qe_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@senior_qe_role, @execution_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@senior_qe_role, @defects_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@senior_qe_role, @traceability_module, TRUE, TRUE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@senior_qe_role, @dashboard_module, TRUE, TRUE, FALSE, FALSE, FALSE);

-- Lead Quality Engineer: (Same as Senior Quality Engineer)
CALL InsertRolePermission(@lead_qe_role, @ideas_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@lead_qe_role, @work_items_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@lead_qe_role, @design_module, TRUE, TRUE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@lead_qe_role, @code_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@lead_qe_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@lead_qe_role, @execution_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@lead_qe_role, @defects_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@lead_qe_role, @traceability_module, TRUE, TRUE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@lead_qe_role, @dashboard_module, TRUE, TRUE, FALSE, FALSE, FALSE);

-- Software Developer: ❌ Ideas, ✅ Work Items, ✅ Design, ✅ Code, ❌ Test Cases, ❌ Execution, ❌ Defects, ❌ Traceability, ✅ Dashboard
CALL InsertRolePermission(@software_dev_role, @ideas_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@software_dev_role, @work_items_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@software_dev_role, @design_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@software_dev_role, @code_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@software_dev_role, @test_cases_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@software_dev_role, @execution_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@software_dev_role, @defects_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@software_dev_role, @traceability_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@software_dev_role, @dashboard_module, TRUE, TRUE, FALSE, FALSE, FALSE);

-- Technical Product Owner: ✅ Ideas, ✅ Work Items, ✅ Design, ❌ Code, ❌ Test Cases, ❌ Execution, ❌ Defects, ❌ Traceability, ✅ Dashboard
CALL InsertRolePermission(@tech_po_role, @ideas_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@tech_po_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, FALSE);
CALL InsertRolePermission(@tech_po_role, @design_module, TRUE, TRUE, TRUE, FALSE, FALSE);
CALL InsertRolePermission(@tech_po_role, @code_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@tech_po_role, @test_cases_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@tech_po_role, @execution_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@tech_po_role, @defects_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@tech_po_role, @traceability_module, FALSE, FALSE, FALSE, FALSE, FALSE);
CALL InsertRolePermission(@tech_po_role, @dashboard_module, TRUE, TRUE, FALSE, FALSE, FALSE);

-- System Administrator: Full access to everything including admin functions
CALL InsertRolePermission(@system_admin_role, @ideas_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@system_admin_role, @work_items_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@system_admin_role, @design_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@system_admin_role, @code_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@system_admin_role, @test_cases_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@system_admin_role, @execution_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@system_admin_role, @defects_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@system_admin_role, @traceability_module, TRUE, TRUE, TRUE, TRUE, TRUE);
CALL InsertRolePermission(@system_admin_role, @dashboard_module, TRUE, TRUE, TRUE, TRUE, TRUE);

-- Clean up the procedure
DROP PROCEDURE IF EXISTS InsertRolePermission;

SELECT 'Role permissions inserted successfully!' as Status;
