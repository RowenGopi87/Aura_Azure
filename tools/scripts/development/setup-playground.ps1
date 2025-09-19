# Aura Playground Database Setup Script
# This script will clone the existing aura_sdlc database to aura_playground

Write-Host "🚀 Setting up Aura Playground Database..." -ForegroundColor Green

# Database connection parameters
$DB_HOST = "127.0.0.1"
$DB_PORT = "3306"
$DB_ROOT_USER = "root"
$DB_ROOT_PASSWORD = ""  # Update this if your root user has a password

Write-Host "📋 Step 1: Creating playground database and user..." -ForegroundColor Yellow
try {
    # Run the basic setup script
    mysql -h $DB_HOST -P $DB_PORT -u $DB_ROOT_USER -e "source setup-aura-playground-database.sql"
    Write-Host "✅ Database and user created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create database and user: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 2: Cloning data from aura_sdlc to aura_playground..." -ForegroundColor Yellow
try {
    # Check if source database exists
    $sourceCheck = mysql -h $DB_HOST -P $DB_PORT -u $DB_ROOT_USER -e "SHOW DATABASES LIKE 'aura_sdlc';" --batch --skip-column-names
    
    if ($sourceCheck -eq "aura_sdlc") {
        Write-Host "✅ Source database 'aura_sdlc' found" -ForegroundColor Green
        
        # Get list of tables from source database
        $tables = mysql -h $DB_HOST -P $DB_PORT -u $DB_ROOT_USER -e "SELECT table_name FROM information_schema.tables WHERE table_schema = 'aura_sdlc' AND table_type = 'BASE TABLE';" --batch --skip-column-names
        
        if ($tables) {
            Write-Host "📊 Found tables to clone: $($tables.Count) tables" -ForegroundColor Blue
            
            foreach ($table in $tables) {
                Write-Host "  🔄 Cloning table: $table" -ForegroundColor Gray
                mysql -h $DB_HOST -P $DB_PORT -u $DB_ROOT_USER -e "CREATE TABLE IF NOT EXISTS aura_playground.$table AS SELECT * FROM aura_sdlc.$table;"
            }
            
            Write-Host "✅ All tables cloned successfully" -ForegroundColor Green
        } else {
            Write-Host "⚠️  No tables found in source database - this might be a fresh installation" -ForegroundColor Orange
        }
    } else {
        Write-Host "⚠️  Source database 'aura_sdlc' not found - will create empty playground database" -ForegroundColor Orange
        Write-Host "    You can run the standard database setup scripts to populate it" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed to clone data: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Continuing with empty database..." -ForegroundColor Gray
}

Write-Host "📋 Step 3: Running database setup scripts..." -ForegroundColor Yellow
try {
    # Run all setup scripts in the database/setup directory for the playground
    $setupScripts = @(
        "database/setup/03-create-tables.sql",
        "database/setup/04-create-vector-stores.sql", 
        "database/setup/05-create-procedures.sql",
        "database/setup/06-initial-data.sql"
    )
    
    foreach ($script in $setupScripts) {
        if (Test-Path $script) {
            Write-Host "  🔧 Running: $script" -ForegroundColor Gray
            mysql -h $DB_HOST -P $DB_PORT -u aura_user -paura_password_123 aura_playground -e "source $script"
        } else {
            Write-Host "  ⚠️  Script not found: $script" -ForegroundColor Orange
        }
    }
    
    Write-Host "✅ Database setup scripts completed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Some setup scripts may have failed: $($_.Exception.Message)" -ForegroundColor Orange
}

Write-Host "📋 Step 4: Verifying playground database..." -ForegroundColor Yellow
try {
    # Verify the setup
    $tableCount = mysql -h $DB_HOST -P $DB_PORT -u aura_user -paura_password_123 -e "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'aura_playground';" --batch --skip-column-names
    Write-Host "✅ Playground database has $tableCount tables" -ForegroundColor Green
    
    # Show table list
    $tableList = mysql -h $DB_HOST -P $DB_PORT -u aura_user -paura_password_123 -e "SHOW TABLES FROM aura_playground;" --batch --skip-column-names
    Write-Host "📊 Tables in playground database:" -ForegroundColor Blue
    foreach ($table in $tableList) {
        Write-Host "    • $table" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Failed to verify database: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Aura Playground Database Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update your .env file to use the playground database" -ForegroundColor White
Write-Host "   Set AURA_DB_NAME=aura_playground" -ForegroundColor Gray
Write-Host "2. Start your application to test the playground environment" -ForegroundColor White
Write-Host "3. Make your changes in the playground environment" -ForegroundColor White
Write-Host "4. When ready, you can merge changes back to production" -ForegroundColor White
Write-Host ""
