@echo off
echo ========================================
echo  AURA SDLC - DOCKER CLEANUP SCRIPT
echo ========================================
echo.

echo 🛑 Stopping all Aura containers...
docker-compose -f docker-compose.local.yml down --volumes --remove-orphans
if %errorlevel% neq 0 (
    echo ⚠️ Some containers may not have been running
)
echo ✅ Containers stopped
echo.

echo 🧹 Cleaning up Docker resources...
set /p cleanup_images="Remove Aura Docker images? (y/N): "
if /i "%cleanup_images%"=="y" (
    echo Removing Aura images...
    docker rmi aura-application:latest >nul 2>&1
    docker rmi aura-database:latest >nul 2>&1
    docker rmi aura-mcp-services:latest >nul 2>&1
    echo ✅ Images removed
)

set /p cleanup_volumes="Remove database volumes (⚠️ This will delete all data)? (y/N): "
if /i "%cleanup_volumes%"=="y" (
    echo Removing volumes...
    docker volume rm aura-db-data >nul 2>&1
    echo ✅ Volumes removed
)

set /p cleanup_network="Remove Docker networks? (y/N): "
if /i "%cleanup_network%"=="y" (
    echo Removing networks...
    docker network rm aura-network >nul 2>&1
    echo ✅ Networks removed
)

echo.
echo 🧹 Running Docker system cleanup...
docker system prune -f >nul 2>&1
echo ✅ System cleanup completed

echo.
echo ========================================
echo  ✅ CLEANUP COMPLETED
echo ========================================
echo.
echo Docker resources have been cleaned up.
echo You can now run package-for-docker.bat to rebuild everything.
echo.
pause
