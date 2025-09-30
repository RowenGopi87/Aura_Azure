@echo off
echo ========================================
echo  AURA AZURE DATABASE INITIALIZATION
echo ========================================
echo.

echo 🔍 Checking if database container is running...
docker ps | findstr aura-database >nul
if %errorlevel% neq 0 (
    echo ❌ Database container is not running!
    echo Please start containers first with: docker-compose -f docker-compose.local.yml up -d
    pause
    exit /b 1
)

echo ✅ Database container is running
echo.

echo 📋 Initializing Aura database schema and data...
echo This will set up the complete database structure for Azure deployment.
echo.

echo 🔧 Step 1: Creating database and users...
docker exec aura-database mariadb -u root -paura_root_password_123 < tools/database/setup/01-create-database.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create database
    pause
    exit /b 1
)
echo ✅ Database created

echo 🔧 Step 2: Creating users and permissions...
docker exec aura-database mariadb -u root -paura_root_password_123 < tools/database/setup/02-create-users.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create users
    pause
    exit /b 1
)
echo ✅ Users created

echo 🔧 Step 3: Creating core tables...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground < tools/database/setup/03-create-tables.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create tables
    pause
    exit /b 1
)
echo ✅ Core tables created

echo 🔧 Step 4: Creating vector stores...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground < tools/database/setup/04-create-vector-stores.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create vector stores
    pause
    exit /b 1
)
echo ✅ Vector stores created

echo 🔧 Step 5: Creating stored procedures...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground < tools/database/setup/05-create-procedures.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create procedures
    pause
    exit /b 1
)
echo ✅ Stored procedures created

echo 🔧 Step 6: Inserting initial data...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground < tools/database/setup/06-initial-data.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to insert initial data
    pause
    exit /b 1
)
echo ✅ Initial data inserted

echo 🔧 Step 7: Creating AuraV2 tables...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground < tools/database/setup/10-create-aurav2-tables.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create AuraV2 tables
    pause
    exit /b 1
)
echo ✅ AuraV2 tables created

echo 🔧 Step 8: Creating audit system...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground < tools/database/setup/12-create-audit-system-tables.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create audit system
    pause
    exit /b 1
)
echo ✅ Audit system created

echo 🔧 Step 9: Creating RBAC system...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground < tools/database/setup/13-create-rbac-system-tables.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create RBAC system
    pause
    exit /b 1
)
echo ✅ RBAC system created

echo 🔧 Step 10: Inserting role permissions...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground < tools/database/setup/14-insert-role-permissions.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to insert role permissions
    pause
    exit /b 1
)
echo ✅ Role permissions inserted

echo 🔧 Step 11: Creating users with roles...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground < tools/database/setup/15-create-users-with-roles.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create users with roles
    pause
    exit /b 1
)
echo ✅ Users with roles created

echo.
echo 🔍 Verifying database setup...
echo.

echo Testing database connection...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground -e "SELECT 'Database connection successful!' as Status;"
if %errorlevel% neq 0 (
    echo ❌ Database connection test failed
    pause
    exit /b 1
)

echo.
echo Checking table structure...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground -e "SHOW TABLES;"

echo.
echo Checking sample data...
docker exec aura-database mariadb -u aura_user -paura_password_123 aura_playground -e "SELECT COUNT(*) as 'Business Briefs' FROM business_briefs; SELECT COUNT(*) as 'Users' FROM rbac_users; SELECT COUNT(*) as 'Roles' FROM rbac_roles;"

echo.
echo ========================================
echo  🎉 DATABASE INITIALIZATION COMPLETE!
echo ========================================
echo.
echo ✅ Database: aura_playground
echo ✅ User: aura_user
echo ✅ Password: aura_password_123
echo ✅ All tables and procedures created
echo ✅ Initial data populated
echo ✅ RBAC system configured
echo ✅ Audit system enabled
echo.
echo 📋 Database is ready for Azure deployment!
echo.
echo 🔗 Test application connection:
echo   curl http://localhost:3000/api/database/health
echo.
pause
