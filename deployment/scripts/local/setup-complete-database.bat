@echo off
echo ========================================
echo  AURA COMPLETE DATABASE SETUP
echo  For Azure Deployment
echo ========================================
echo.

echo 🔍 Checking database container...
docker exec aura-database mariadb -u root -paura_root_password_123 -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Database container is not accessible!
    echo Please ensure the database container is running.
    pause
    exit /b 1
)

echo ✅ Database container is accessible
echo.

echo 🔧 Creating complete database structure...

echo Creating business_briefs table...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "CREATE TABLE IF NOT EXISTS business_briefs (id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), title VARCHAR(255) NOT NULL, description TEXT, business_owner VARCHAR(255), lead_business_unit VARCHAR(255), additional_business_units TEXT, primary_strategic_theme VARCHAR(255), business_objective TEXT, quantifiable_business_outcomes TEXT, in_scope TEXT, impact_of_do_nothing TEXT, happy_path TEXT, exceptions TEXT, impacted_end_users TEXT, change_impact_expected TEXT, impact_to_other_departments TEXT, other_departments_impacted TEXT, impacts_existing_technology BOOLEAN DEFAULT FALSE, technology_solutions TEXT, relevant_business_owners TEXT, other_technology_info TEXT, supporting_documents TEXT, submitted_by VARCHAR(255), submitted_at TIMESTAMP NULL, status ENUM('draft', 'submitted', 'in_review', 'approved', 'rejected') DEFAULT 'draft', priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium', workflow_stage ENUM('idea', 'discovery', 'design', 'execution') DEFAULT 'idea', completion_percentage DECIMAL(5,2) DEFAULT 0.00, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_status (status), INDEX idx_priority (priority), INDEX idx_workflow_stage (workflow_stage), INDEX idx_created_at (created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

echo Creating initiatives table...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "CREATE TABLE IF NOT EXISTS initiatives (id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), business_brief_id VARCHAR(36), title VARCHAR(255) NOT NULL, description TEXT, status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft', priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (business_brief_id) REFERENCES business_briefs(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

echo Creating features table...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "CREATE TABLE IF NOT EXISTS features (id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), initiative_id VARCHAR(36), title VARCHAR(255) NOT NULL, description TEXT, status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

echo Creating epics table...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "CREATE TABLE IF NOT EXISTS epics (id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), feature_id VARCHAR(36), title VARCHAR(255) NOT NULL, description TEXT, status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

echo Creating stories table...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "CREATE TABLE IF NOT EXISTS stories (id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), epic_id VARCHAR(36), title VARCHAR(255) NOT NULL, description TEXT, status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

echo Creating test_cases table...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "CREATE TABLE IF NOT EXISTS test_cases (id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), story_id VARCHAR(36), title VARCHAR(255) NOT NULL, description TEXT, status ENUM('draft', 'active', 'passed', 'failed') DEFAULT 'draft', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

echo Creating portfolios table...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "CREATE TABLE IF NOT EXISTS portfolios (id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), name VARCHAR(255) NOT NULL UNIQUE, description TEXT, business_owner VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_name (name)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

echo Inserting default portfolio...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "INSERT IGNORE INTO portfolios (id, name, description, business_owner) VALUES ('default-portfolio', 'Default Portfolio', 'Default portfolio for initial setup', 'System Administrator');"

echo Creating sample business brief...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "INSERT IGNORE INTO business_briefs (id, title, description, business_owner, status) VALUES ('sample-brief-001', 'Sample Business Brief', 'This is a sample business brief for testing the containerized application.', 'System Administrator', 'draft');"

echo.
echo 🔍 Verifying database setup...
docker exec aura-database mariadb -u root -paura_root_password_123 aura_playground -e "SHOW TABLES; SELECT COUNT(*) as 'Business Briefs' FROM business_briefs; SELECT COUNT(*) as 'Portfolios' FROM portfolios;"

echo.
echo ========================================
echo  🎉 DATABASE SETUP COMPLETE!
echo ========================================
echo.
echo ✅ All core tables created
echo ✅ Sample data inserted
echo ✅ Ready for application testing
echo.
pause
