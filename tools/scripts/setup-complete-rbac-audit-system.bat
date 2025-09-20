@echo off
echo ========================================
echo AURA Complete RBAC + Audit System Setup
echo Emirates Organization Integration
echo ========================================
echo.

echo [1/4] Setting up Audit System...
Get-Content "tools/database/setup/12-create-audit-system-tables.sql" | mysql -u aura_user -paura_password_123 -h 127.0.0.1 -P 3306 aura_playground

if %errorlevel% neq 0 (
    echo ERROR: Failed to create audit system tables
    pause
    exit /b 1
)

echo [2/4] Setting up RBAC System...
Get-Content "tools/database/setup/13-create-rbac-system-tables.sql" | mysql -u aura_user -paura_password_123 -h 127.0.0.1 -P 3306 aura_playground

if %errorlevel% neq 0 (
    echo ERROR: Failed to create RBAC system tables
    pause
    exit /b 1
)

echo [3/4] Configuring Role Permissions...
Get-Content "tools/database/setup/14-insert-role-permissions.sql" | mysql -u aura_user -paura_password_123 -h 127.0.0.1 -P 3306 aura_playground

if %errorlevel% neq 0 (
    echo ERROR: Failed to insert role permissions
    pause
    exit /b 1
)

echo [4/4] Creating Users with Roles...
Get-Content "tools/database/setup/15-create-users-with-roles.sql" | mysql -u aura_user -paura_password_123 -h 127.0.0.1 -P 3306 aura_playground

if %errorlevel% neq 0 (
    echo ERROR: Failed to create users with roles
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete! 🎉
echo ========================================
echo.
echo Emirates Users Created:
echo.
echo EXECUTIVE LEVEL:
echo - rowen.gopi@emirates.com (System Administrator) - FULL ACCESS
echo - admin@emirates.com (System Administrator) - FULL ACCESS
echo.
echo PORTFOLIO LEVEL:
echo - mohammed.hassan@emirates.com (Manager of Product and Delivery) - ALL MODULES
echo.
echo ART LEVEL:
echo - sarah.ahmed@emirates.com (Technical Product Manager) - Ideas, Work Items, Design, Test Cases, Dashboard
echo - fatima.ali@emirates.com (Principal Software Engineer) - Work Items, Design, Code, Test Cases, Execution, Defects, Traceability, Dashboard
echo.
echo TEAM LEVEL:
echo - layla.omar@emirates.com (Software Developer) - Work Items, Design, Code, Dashboard
echo - ahmad.hassan@emirates.com (Senior Quality Engineer) - Work Items, Design, Test Cases, Execution, Defects, Traceability, Dashboard
echo - khalid.ali@emirates.com (Technical Product Owner) - Ideas, Work Items, Design, Dashboard
echo.
echo ========================================
echo Features Implemented:
echo ========================================
echo.
echo ✅ Emirates-branded SSO login screen
echo ✅ Comprehensive audit system tracking all generations
echo ✅ Role-based access control with organizational hierarchy
echo ✅ Dynamic navigation based on user permissions
echo ✅ Route protection for unauthorized access
echo ✅ Admin dashboard for audit analytics
echo ✅ Configurable audit settings with toggle system
echo ✅ 2-year data retention policy
echo ✅ Asynchronous logging for performance
echo ✅ Prompt analytics and keyword tracking
echo.
echo ========================================
echo Testing Instructions:
echo ========================================
echo.
echo 1. Start the application: npm run dev
echo 2. Login with different users to test permissions:
echo    - Rowen Gopi: See all modules (admin access)
echo    - Layla Omar: See only Work Items, Design, Code, Dashboard
echo    - Ahmad Hassan: See QA-focused modules
echo    - Sarah Ahmed: See product management modules
echo.
echo 3. Try accessing restricted modules to see access denied screens
echo 4. Check console logs for audit events
echo 5. Admin users can access /admin/audit for analytics
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Test all user roles and permissions
echo 2. Verify audit tracking is working
echo 3. Check navigation filtering per role
echo 4. Review admin dashboard functionality
echo 5. Configure audit settings as needed
echo.
pause
