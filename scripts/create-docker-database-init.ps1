# PowerShell script to create Docker database initialization from local database
# Excludes transactional data but keeps all foundational data

param(
    [string]$InputFile = "local-database-complete.sql",
    [string]$OutputFile = "containers/database/init-scripts/01-local-database-replica.sql"
)

Write-Host "🔄 Creating Docker database initialization from local database..." -ForegroundColor Cyan
Write-Host "📁 Input: $InputFile" -ForegroundColor Yellow
Write-Host "📁 Output: $OutputFile" -ForegroundColor Yellow

# Read the complete dump
$content = Get-Content $InputFile -Raw

# Tables to exclude (transactional data only - keep all foundational data)
$excludeTables = @(
    'initiatives',
    'features', 
    'epics',
    'stories',
    'test_cases',
    'designs',
    'code_items',
    'generation_analytics',
    'audit_events',
    'prompt_analytics'
)

Write-Host "📊 Your local database has 34 tables including:" -ForegroundColor Cyan
Write-Host "  ✅ Vector stores and RAG data" -ForegroundColor Green
Write-Host "  ✅ Complete RBAC (role_permission_matrix, user_permissions)" -ForegroundColor Green  
Write-Host "  ✅ Workflow and audit configuration" -ForegroundColor Green
Write-Host "  ✅ All foundational data" -ForegroundColor Green

Write-Host "🗑️ Excluding transactional tables: $($excludeTables -join ', ')" -ForegroundColor Red

# Split content into sections
$lines = $content -split "`n"
$outputLines = @()
$skipSection = $false
$currentTable = ""

foreach ($line in $lines) {
    # Check for table structure start
    if ($line -match "-- Table structure for table \`(.+)\`") {
        $currentTable = $matches[1]
        if ($excludeTables -contains $currentTable) {
            Write-Host "Skipping table: $currentTable" -ForegroundColor Yellow
            $skipSection = $true
        } else {
            Write-Host "✅ Including table: $currentTable" -ForegroundColor Green
            $skipSection = $false
        }
    }
    
    # Check for data dumping start
    if ($line -match "-- Dumping data for table \`(.+)\`") {
        $currentTable = $matches[1]
        if ($excludeTables -contains $currentTable) {
            Write-Host "Skipping data for: $currentTable" -ForegroundColor Yellow
            $skipSection = $true
        } else {
            Write-Host "📊 Including data for: $currentTable" -ForegroundColor Green
            $skipSection = $false
        }
    }
    
    # Reset skip when reaching next table or end
    if ($line -match "-- Table structure for table" -or $line -match "-- Dumping data for table" -or $line -match "UNLOCK TABLES") {
        # Don't reset here, let the above logic handle it
    }
    
    # Add line if not skipping
    if (-not $skipSection) {
        $outputLines += $line
    }
}

# Add header comment
$header = @"
-- =============================================
-- AURA SDLC DATABASE INITIALIZATION
-- =============================================
-- This file is generated from the local database dump
-- Includes all foundational data but excludes transactional data
-- Generated on: $(Get-Date)
-- Source: Local MariaDB database (aura_playground)
-- =============================================

"@

$finalContent = $header + ($outputLines -join "`n")

# Write to output file
$finalContent | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host "✅ Docker database initialization created successfully!" -ForegroundColor Green
Write-Host "📊 Original file: $(Get-ChildItem $InputFile | Select-Object -ExpandProperty Length) bytes" -ForegroundColor Cyan
Write-Host "📊 Cleaned file: $(Get-ChildItem $OutputFile | Select-Object -ExpandProperty Length) bytes" -ForegroundColor Cyan
Write-Host "🎯 Ready for Docker initialization!" -ForegroundColor Green
