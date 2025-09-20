@echo off
echo ========================================
echo Setting up AURA Audit System
echo ========================================
echo.

echo [1/3] Creating audit system database tables...
mysql -u aura_user -p -h 127.0.0.1 -P 3306 aura_playground < "tools/database/setup/12-create-audit-system-tables.sql"

if %errorlevel% neq 0 (
    echo ERROR: Failed to create audit system tables
    pause
    exit /b 1
)

echo [2/3] Verifying audit system setup...
mysql -u aura_user -p -h 127.0.0.1 -P 3306 aura_playground -e "SHOW TABLES LIKE 'users'; SHOW TABLES LIKE 'audit_events'; SHOW TABLES LIKE 'generation_analytics';"

if %errorlevel% neq 0 (
    echo ERROR: Failed to verify audit system tables
    pause
    exit /b 1
)

echo [3/3] Checking mock users...
mysql -u aura_user -p -h 127.0.0.1 -P 3306 aura_playground -e "SELECT display_name, email, department FROM users;"

if %errorlevel% neq 0 (
    echo ERROR: Failed to verify mock users
    pause
    exit /b 1
)

echo.
echo ========================================
echo Audit System Setup Complete!
echo ========================================
echo.
echo Mock Emirates Users Created:
echo - sarah.ahmed@emirates.com (Business Analyst)
echo - mohammed.hassan@emirates.com (Product Manager) 
echo - fatima.ali@emirates.com (Technical Lead)
echo - admin@emirates.com (System Administrator)
echo.
echo The audit system is now ready to track:
echo - All generation activities
echo - Content edits and modifications
echo - Save/delete/export actions
echo - Prompt analytics and keywords
echo - User engagement patterns
echo - Integration usage (Jira, etc.)
echo.
echo Next Steps:
echo 1. Start the application: npm run dev
echo 2. Login with any mock user
echo 3. Use generation features to see audit tracking
echo 4. Check console logs for audit events
echo.
pause
