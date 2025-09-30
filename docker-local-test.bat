@echo off
echo ========================================
echo  AURA SDLC - LOCAL DOCKER TESTING
echo  Enterprise Docker Workflow
echo ========================================
echo.

echo 🚀 Starting Stage 2: Local Docker Testing...
echo.

cd /d "%~dp0"
call deployment\scripts\local\package-for-docker.bat

echo.
echo ========================================
echo  LOCAL DOCKER TESTING COMPLETE
echo ========================================
echo.
echo 📋 Next Steps:
echo   1. Test application: http://localhost:3000
echo   2. Verify all features work
echo   3. When ready, run: azure-deploy.bat
echo.
pause







