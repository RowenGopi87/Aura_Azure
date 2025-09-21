@echo off
echo ========================================
echo  AURA SDLC - DOCKER PACKAGING SCRIPT
echo  Stage 2: Local Docker Testing
echo ========================================
echo.

echo 🔍 Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running!
    echo Please install Docker Desktop and ensure it's running.
    pause
    exit /b 1
)

echo ✅ Docker is available
echo.

echo 🔍 Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not available!
    echo Please ensure Docker Desktop is properly installed.
    pause
    exit /b 1
)

echo ✅ Docker Compose is available
echo.

echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.local.yml down --volumes --remove-orphans >nul 2>&1
echo ✅ Existing containers stopped

echo 🗄️ Ensuring fresh database initialization...
docker volume rm aura-db-data >nul 2>&1
echo ✅ Database volume reset for fresh initialization
echo.

echo 🧹 Cleaning up old images (optional)...
set /p cleanup="Do you want to remove old Aura Docker images? (y/N): "
if /i "%cleanup%"=="y" (
    echo Removing old Aura images...
    docker rmi aura-azure_aura-application aura-azure_aura-database aura-azure_aura-mcp-services >nul 2>&1
    echo ✅ Old images cleaned up
)
echo.

echo 🔧 Setting up environment variables...
if not exist ".env" (
    echo ⚠️ No .env file found. Creating from template...
    if exist "config\environment\env.template" (
        copy "config\environment\env.template" ".env" >nul
        echo ✅ Created .env file from template
        echo ⚠️ Please edit .env file with your API keys before continuing
        echo.
        set /p continue="Continue anyway? (y/N): "
        if /i not "%continue%"=="y" (
            echo Exiting. Please configure .env file and run again.
            pause
            exit /b 1
        )
    ) else (
        echo ❌ No environment template found!
        echo Please create a .env file with required configuration.
        pause
        exit /b 1
    )
)

echo ✅ Environment configuration ready
echo.

echo 🏗️ Building Docker containers...
echo This may take several minutes on first run...
echo.

echo 📦 Building Aura Application container...
docker build -f Dockerfile.aura-app -t aura-application:latest . 
if %errorlevel% neq 0 (
    echo ❌ Failed to build Aura Application container!
    pause
    exit /b 1
)
echo ✅ Aura Application container built successfully
echo.

echo 📦 Building MariaDB Database container...
docker build -f Dockerfile.mariadb -t aura-database:latest .
if %errorlevel% neq 0 (
    echo ❌ Failed to build MariaDB Database container!
    pause
    exit /b 1
)
echo ✅ MariaDB Database container built successfully
echo.

echo 📦 Building MCP Services container...
docker build -f Dockerfile.mcp-services -t aura-mcp-services:latest .
if %errorlevel% neq 0 (
    echo ❌ Failed to build MCP Services container!
    pause
    exit /b 1
)
echo ✅ MCP Services container built successfully
echo.

echo 🚀 Starting containerized services...
docker-compose -f docker-compose.local.yml up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start containers!
    echo.
    echo Checking logs for errors...
    docker-compose -f docker-compose.local.yml logs
    pause
    exit /b 1
)

echo ✅ All containers started successfully
echo.

echo ⏳ Waiting for services to initialize...
echo This may take 30-60 seconds...

timeout /t 10 /nobreak >nul
echo 🔍 Checking database readiness...
:check_db
docker exec aura-database mariadb-admin ping -h localhost -u root -paura_root_password_123 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⏳ Database still starting...
    timeout /t 5 /nobreak >nul
    goto check_db
)

echo ✅ Database is ready, checking initialization...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⏳ Database initialization still running...
    timeout /t 10 /nobreak >nul
    goto check_db
)
echo ✅ Database is fully initialized

echo.
echo 🔍 Checking MCP services readiness...
:check_mcp
curl -f http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ⏳ MCP services still starting...
    timeout /t 5 /nobreak >nul
    goto check_mcp
)
echo ✅ MCP services are ready

echo.
echo 🔍 Checking application readiness...
:check_app
curl -f http://localhost:3000/api/database/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ⏳ Application still starting...
    timeout /t 5 /nobreak >nul
    goto check_app
)
echo ✅ Application is ready

echo.
echo 🔧 Database should initialize automatically...
echo Waiting for automatic initialization to complete...

echo.
echo 🔍 Final verification - checking table count...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "SELECT COUNT(*) as 'Total_Tables' FROM information_schema.tables WHERE table_schema = 'aura_playground';"

echo.
echo ========================================
echo  🎉 DOCKER PACKAGING COMPLETED!
echo ========================================
echo.
echo 📋 Container Status:
docker-compose -f docker-compose.local.yml ps
echo.
echo 🌐 Service URLs:
echo   ✅ Aura Application: http://localhost:3000
echo   ✅ Database: localhost:3306
echo   ✅ MCP Bridge: http://localhost:8000
echo   ✅ Playwright MCP: http://localhost:8931
echo.
echo 🧪 Quick Health Check:
echo   Database: 
curl -s http://localhost:3000/api/database/health
echo.
echo   MCP Services:
curl -s http://localhost:8000/health
echo.
echo 📊 Container Resource Usage:
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo.
echo 📝 Next Steps:
echo   1. Visit http://localhost:3000 to test the application
echo   2. Verify all features work as expected
echo   3. Check screenshots in mcp/screenshots/ directory
echo   4. When satisfied, run deploy-to-azure-dev.bat for Stage 3
echo.
echo 🛠️ Useful Commands:
echo   View logs: docker-compose -f docker-compose.local.yml logs
echo   Stop containers: docker-compose -f docker-compose.local.yml down
echo   Restart: docker-compose -f docker-compose.local.yml restart
echo.
pause
