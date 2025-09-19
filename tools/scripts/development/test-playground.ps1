# Test Aura Playground Database Setup
# This script verifies that the playground environment is working correctly

Write-Host "🧪 Testing Aura Playground Database Setup..." -ForegroundColor Green
Write-Host ""

# Database connection parameters
$DB_HOST = "127.0.0.1"
$DB_PORT = "3306"
$DB_USER = "aura_user"
$DB_PASSWORD = "aura_password_123"
$DB_NAME = "aura_playground"

$testsPassed = 0
$testsTotal = 0

function Test-DatabaseConnection {
    param($name, $command, $description)
    $global:testsTotal++
    
    Write-Host "🔍 Test $global:testsTotal`: $name" -ForegroundColor Cyan
    Write-Host "   $description" -ForegroundColor Gray
    
    try {
        $result = Invoke-Expression $command 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ PASSED" -ForegroundColor Green
            $global:testsPassed++
            return $true
        } else {
            Write-Host "   ❌ FAILED" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    Write-Host ""
}

# Test 1: Database Connection
Test-DatabaseConnection -name "Database Connection" `
    -command "mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e 'SELECT 1;' --batch --skip-column-names" `
    -description "Testing basic connection to playground database"

# Test 2: Database Exists
Test-DatabaseConnection -name "Database Exists" `
    -command "mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e 'SHOW DATABASES LIKE ''$DB_NAME'';' --batch --skip-column-names" `
    -description "Verifying that aura_playground database exists"

# Test 3: Table Structure
$tableCount = mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';" --batch --skip-column-names 2>$null
$testsTotal++
Write-Host "🔍 Test $testsTotal`: Table Structure" -ForegroundColor Cyan
Write-Host "   Checking if required tables are created" -ForegroundColor Gray
if ([int]$tableCount -gt 0) {
    Write-Host "   ✅ PASSED ($tableCount tables found)" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "   ❌ FAILED (No tables found)" -ForegroundColor Red
}

# Test 4: Core Tables
$coreTables = @("business_briefs", "initiatives", "epics", "features", "user_stories", "test_cases")
foreach ($table in $coreTables) {
    $tableExists = mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e "SHOW TABLES FROM $DB_NAME LIKE '$table';" --batch --skip-column-names 2>$null
    $testsTotal++
    Write-Host "🔍 Test $testsTotal`: Table '$table'" -ForegroundColor Cyan
    Write-Host "   Checking if core table exists" -ForegroundColor Gray
    if ($tableExists -eq $table) {
        Write-Host "   ✅ PASSED" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "   ❌ FAILED (Table not found)" -ForegroundColor Red
    }
}

# Test 5: Environment Configuration
$testsTotal++
Write-Host "🔍 Test $testsTotal`: Environment Configuration" -ForegroundColor Cyan
Write-Host "   Checking .env file configuration" -ForegroundColor Gray
if (Test-Path ".env") {
    $envContent = Get-Content ".env" | Where-Object { $_ -like "*AURA_DB_NAME*" }
    if ($envContent -like "*aura_playground*") {
        Write-Host "   ✅ PASSED (.env configured for playground)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "   ⚠️  WARNING (.env may not be configured for playground)" -ForegroundColor Orange
        Write-Host "      Expected: AURA_DB_NAME=aura_playground" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  WARNING (.env file not found)" -ForegroundColor Orange
    Write-Host "      Create .env file with playground configuration" -ForegroundColor Gray
}

# Test 6: Application API Test (if running)
$testsTotal++
Write-Host "🔍 Test $testsTotal`: Application API" -ForegroundColor Cyan
Write-Host "   Testing database health endpoint (if app is running)" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/database/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ PASSED (API responding)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "   ❌ FAILED (API returned status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  SKIPPED (Application not running on port 3000)" -ForegroundColor Orange
    Write-Host "      Start app with: npm run dev" -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "           TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$passPercentage = [math]::Round(($testsPassed / $testsTotal) * 100, 1)

if ($testsPassed -eq $testsTotal) {
    Write-Host "🎉 ALL TESTS PASSED! ($testsPassed/$testsTotal)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your Aura Playground is ready to use! 🚀" -ForegroundColor Green
} elseif ($passPercentage -ge 70) {
    Write-Host "✅ MOSTLY WORKING ($testsPassed/$testsTotal tests passed - $passPercentage%)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your playground should work, but check the failed tests above." -ForegroundColor Yellow
} else {
    Write-Host "❌ SETUP ISSUES DETECTED ($testsPassed/$testsTotal tests passed - $passPercentage%)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the failed tests before proceeding." -ForegroundColor Red
}

# Next Steps
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. If tests failed, run: .\setup-playground.ps1" -ForegroundColor White
Write-Host "2. Update .env file with playground configuration" -ForegroundColor White
Write-Host "3. Start your app: npm run dev" -ForegroundColor White
Write-Host "4. Visit: http://localhost:3000/api/database/health" -ForegroundColor White
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
