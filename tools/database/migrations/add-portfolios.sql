-- =============================================
-- Add Portfolio Support to Existing Database
-- =============================================

USE aura_playground;

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    function TEXT,
    color VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add portfolio_id column to initiatives table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'initiatives' 
     AND column_name = 'portfolio_id' 
     AND table_schema = 'aura_playground') > 0,
    "SELECT 'Column portfolio_id already exists'",
    "ALTER TABLE initiatives ADD COLUMN portfolio_id VARCHAR(36), ADD FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE SET NULL, ADD INDEX idx_portfolio_id (portfolio_id)"
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Seed portfolios with company-specific data
INSERT IGNORE INTO portfolios (id, name, description, function, color) VALUES
('PORTFOLIO-WEB-MOBILE', 'Web & Mobile', 'Customer-facing web and mobile applications development', 'Develops and maintains customer-facing digital touchpoints including websites, mobile apps, and progressive web applications', '#3B82F6'),
('PORTFOLIO-CUSTOMER', 'Customer Portfolio', 'Customer experience and engagement solutions', 'Manages customer-specific projects and specialized customer websites like rugby sevens, events, and customer portal solutions', '#10B981'),
('PORTFOLIO-COMMERCIAL', 'Commercial Portfolio', 'Agent systems and commercial booking platforms', 'Handles commercial booking systems, agent platforms like ResConnect, and B2B customer solutions for travel agents and corporate clients', '#F59E0B'),
('PORTFOLIO-GROUP-SERVICE', 'Group Service Portfolio', 'Internal systems and payment infrastructure', 'Manages internal operations including payroll systems, HR processes, hiring platforms, and payment gateway infrastructure for web and mobile frontends', '#8B5CF6'),
('PORTFOLIO-DONATA', 'Donata Portfolio', 'Ground operations and baggage handling systems', 'Handles below-the-wing airline operations including ground operations, baggage handling, cargo management, and airport operational systems', '#EF4444');

-- Verify the setup
SELECT 'Portfolio tables created and seeded successfully!' as status;
SELECT COUNT(*) as portfolio_count FROM portfolios;
SELECT name, description FROM portfolios;
