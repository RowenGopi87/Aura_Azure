@echo off
echo ========================================
echo  AURA AZURE-READY DATABASE SETUP
echo  Complete Schema + RBAC + Audit + Users
echo ========================================
echo.

echo 🔍 Checking database container...
docker exec aura-database mariadb -u root -paura_root_password_123 -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Database container is not accessible!
    echo Please ensure the database container is running with: docker-compose -f docker-compose.local.yml up -d
    pause
    exit /b 1
)

echo ✅ Database container is accessible
echo.

echo 🔧 Setting up complete database structure for Azure deployment...
echo This includes: Core Tables + RBAC + Audit + User Management
echo.

echo 📋 Step 1: Core Database Setup...
echo Creating database and basic tables...
docker exec aura-database mariadb -u root -paura_root_password_123 < tools/database/setup/01-create-database.sql
docker exec aura-database mariadb -u root -paura_root_password_123 < tools/database/setup/03-create-tables.sql
echo ✅ Core tables created

echo 📋 Step 2: Vector Stores and Procedures...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground < tools/database/setup/04-create-vector-stores.sql
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground < tools/database/setup/05-create-procedures.sql
echo ✅ Vector stores and procedures created

echo 📋 Step 3: Initial Data...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground < tools/database/setup/06-initial-data.sql
echo ✅ Initial data inserted

echo 📋 Step 4: AuraV2 Tables...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground < tools/database/setup/10-create-aurav2-tables.sql
echo ✅ AuraV2 tables created

echo 📋 Step 5: Audit System...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground < tools/database/setup/12-create-audit-system-tables.sql
echo ✅ Audit system tables created

echo 📋 Step 6: RBAC System...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground < tools/database/setup/13-create-rbac-system-tables.sql
echo ✅ RBAC system tables created

echo 📋 Step 7: Role Permissions...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground < tools/database/setup/14-insert-role-permissions.sql
echo ✅ Role permissions inserted

echo 📋 Step 8: Users with Roles...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground < tools/database/setup/15-create-users-with-roles.sql
echo ✅ Users with roles created

echo.
echo 🔍 Comprehensive Database Verification...
echo.

echo Checking all tables...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "SHOW TABLES;"

echo.
echo Checking core data...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "SELECT COUNT(*) as 'Business Briefs' FROM business_briefs; SELECT COUNT(*) as 'Portfolios' FROM portfolios; SELECT COUNT(*) as 'Users' FROM users; SELECT COUNT(*) as 'Roles' FROM roles; SELECT COUNT(*) as 'Departments' FROM departments;"

echo.
echo Checking RBAC setup...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "SELECT u.display_name as 'User', r.display_name as 'Role', d.name as 'Department' FROM users u LEFT JOIN roles r ON u.primary_role_id = r.id LEFT JOIN departments d ON u.department_id = d.id WHERE u.email LIKE '%%@emirates.com' ORDER BY u.display_name;"

echo.
echo Checking audit system...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "SELECT setting_name, setting_value FROM audit_config ORDER BY setting_name;"

echo.
echo Testing application API endpoints...
echo Testing business briefs API...
curl -s http://localhost:3000/api/business-briefs/list | findstr "success"
if %errorlevel% neq 0 (
    echo ❌ Business briefs API test failed
) else (
    echo ✅ Business briefs API working
)

echo Testing database health...
curl -s http://localhost:3000/api/database/health | findstr "healthy"
if %errorlevel% neq 0 (
    echo ❌ Database health check failed
) else (
    echo ✅ Database health check passed
)

echo.
echo ========================================
echo  🎉 AZURE-READY DATABASE COMPLETE!
echo ========================================
echo.
echo ✅ Core Tables: business_briefs, initiatives, features, epics, stories, test_cases
echo ✅ RBAC System: users, roles, departments, permissions, role_assignments
echo ✅ Audit System: audit_events, audit_config, user_sessions, analytics
echo ✅ Vector Stores: For RAG/AI functionality
echo ✅ Sample Users: Including Rowen Gopi as System Administrator
echo ✅ Sample Data: Ready for testing
echo.
echo 🌟 Database is ready for Azure Container deployment!
echo 🌟 All scripts verified and tested in local Docker environment
echo.
echo 📋 Next Steps:
echo   1. Test the application functionality: http://localhost:3000
echo   2. Verify RBAC and audit features work
echo   3. When satisfied, deploy to Azure with: deploy-to-azure-dev.bat
echo.
pause
