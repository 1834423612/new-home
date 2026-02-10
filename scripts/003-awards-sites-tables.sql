-- Create awards table
CREATE TABLE IF NOT EXISTS awards (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(100) NOT NULL,
  title_zh VARCHAR(255) NOT NULL DEFAULT '',
  title_en VARCHAR(255) NOT NULL DEFAULT '',
  description_zh TEXT,
  description_en TEXT,
  detail_zh TEXT,
  detail_en TEXT,
  org_zh VARCHAR(255) NOT NULL DEFAULT '',
  org_en VARCHAR(255) NOT NULL DEFAULT '',
  date VARCHAR(50) DEFAULT '',
  level VARCHAR(100) DEFAULT NULL,
  image VARCHAR(500) DEFAULT NULL,
  official_links JSON DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_awards_slug (slug)
);

-- Create sites_tools table
CREATE TABLE IF NOT EXISTS sites_tools (
  id VARCHAR(100) PRIMARY KEY,
  title_zh VARCHAR(255) NOT NULL DEFAULT '',
  title_en VARCHAR(255) NOT NULL DEFAULT '',
  description_zh TEXT,
  description_en TEXT,
  url VARCHAR(500) NOT NULL DEFAULT '',
  icon VARCHAR(200) DEFAULT NULL,
  tags JSON DEFAULT NULL,
  type ENUM('personal', 'tool') DEFAULT 'personal',
  since_year VARCHAR(10) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add slug and detail columns to projects if they don't exist
-- Use a procedure to conditionally add columns
DELIMITER //
CREATE PROCEDURE add_project_columns()
BEGIN
  IF NOT EXISTS (
    SELECT * FROM information_schema.COLUMNS
    WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'slug'
  ) THEN
    ALTER TABLE projects ADD COLUMN slug VARCHAR(100) DEFAULT NULL AFTER id;
  END IF;

  IF NOT EXISTS (
    SELECT * FROM information_schema.COLUMNS
    WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'detail_zh'
  ) THEN
    ALTER TABLE projects ADD COLUMN detail_zh TEXT AFTER description_en;
  END IF;

  IF NOT EXISTS (
    SELECT * FROM information_schema.COLUMNS
    WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'detail_en'
  ) THEN
    ALTER TABLE projects ADD COLUMN detail_en TEXT AFTER detail_zh;
  END IF;
END //
DELIMITER ;

CALL add_project_columns();
DROP PROCEDURE IF EXISTS add_project_columns;

-- Update slug from id where slug is null
UPDATE projects SET slug = id WHERE slug IS NULL;
