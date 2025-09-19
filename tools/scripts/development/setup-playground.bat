@echo off
echo =========================================
echo        AURA PLAYGROUND SETUP
echo =========================================
echo.

echo 🚀 Setting up Aura Playground Database...
echo.

REM Database connection parameters
set DB_HOST=127.0.0.1
set DB_PORT=3306
set DB_ROOT_USER=root

echo 📋 Step 1: Creating playground database and user...
echo.

REM Run the basic setup script
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_ROOT_USER% -e "source setup-aura-playground-database.sql"
if %ERRORLEVEL% EQU 0 (
    echo ✅ Database and user created successfully
) else (
    echo ❌ Failed to create database and user
    pause
    exit /b 1
)

echo.
echo 📋 Step 2: Checking for source database to clone...
echo.

REM Check if source database exists
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_ROOT_USER% -e "SHOW DATABASES LIKE 'aura_sdlc';" --batch --skip-column-names > temp_db_check.txt
set /p sourceCheck=<temp_db_check.txt
del temp_db_check.txt

if "%sourceCheck%"=="aura_sdlc" (
    echo ✅ Source database 'aura_sdlc' found
    echo 🔄 Cloning data from aura_sdlc to aura_playground...
    
    REM Get list of tables and clone them
    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_ROOT_USER% -e "SELECT table_name FROM information_schema.tables WHERE table_schema = 'aura_sdlc' AND table_type = 'BASE TABLE';" --batch --skip-column-names > temp_tables.txt
    
    for /f %%i in (temp_tables.txt) do (
        echo   🔄 Cloning table: %%i
        mysql -h %DB_HOST% -P %DB_PORT% -u %DB_ROOT_USER% -e "CREATE TABLE IF NOT EXISTS aura_playground.%%i AS SELECT * FROM aura_sdlc.%%i;"
    )
    
    del temp_tables.txt
    echo ✅ All tables cloned successfully
) else (
    echo ⚠️  Source database 'aura_sdlc' not found - will create empty playground database
    echo    You can run the standard database setup scripts to populate it
)

echo.
echo 📋 Step 3: Running database setup scripts...
echo.

REM Run setup scripts
set setupScripts=database\setup\03-create-tables.sql database\setup\04-create-vector-stores.sql database\setup\05-create-procedures.sql database\setup\06-initial-data.sql

for %%s in (%setupScripts%) do (
    if exist %%s (
        echo   🔧 Running: %%s
        mysql -h %DB_HOST% -P %DB_PORT% -u aura_user -paura_password_123 aura_playground -e "source %%s"
    ) else (
        echo   ⚠️  Script not found: %%s
    )
)

echo ✅ Database setup scripts completed
echo.

echo 📋 Step 4: Verifying playground database...
echo.

REM Verify the setup
mysql -h %DB_HOST% -P %DB_PORT% -u aura_user -paura_password_123 -e "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'aura_playground';" --batch --skip-column-names > temp_count.txt
set /p tableCount=<temp_count.txt
del temp_count.txt

echo ✅ Playground database has %tableCount% tables
echo.
echo 📊 Tables in playground database:
mysql -h %DB_HOST% -P %DB_PORT% -u aura_user -paura_password_123 -e "SHOW TABLES FROM aura_playground;" --batch --skip-column-names

echo.
echo 🎉 Aura Playground Database Setup Complete!
echo.
echo Next Steps:
echo 1. Update your .env file to use the playground database
echo    Set AURA_DB_NAME=aura_playground
echo 2. Start your application to test the playground environment
echo 3. Make your changes in the playground environment  
echo 4. When ready, you can merge changes back to production
echo.
echo =========================================
pause
