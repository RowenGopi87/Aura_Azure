@echo off
echo ========================================
echo  AURA SDLC - AZURE DEPLOYMENT
echo  Enterprise Azure Workflow
echo ========================================
echo.

echo 🚀 Starting Stage 3: Azure Deployment...
echo.

cd /d "%~dp0"
call deployment\scripts\azure\deploy-to-azure-dev.bat

echo.
echo ========================================
echo  AZURE DEPLOYMENT COMPLETE
echo ========================================
echo.
pause







