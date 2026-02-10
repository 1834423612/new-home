-- v2: Add awards table, tools table, slug column, detail columns

ALTER TABLE `projects` ADD COLUMN IF NOT EXISTS `slug` VARCHAR(200) AFTER `id`;
ALTER TABLE `projects` ADD COLUMN IF NOT EXISTS `detail_zh` TEXT AFTER `description_en`;
ALTER TABLE `projects` ADD COLUMN IF NOT EXISTS `detail_en` TEXT AFTER `detail_zh`;

CREATE TABLE IF NOT EXISTS `awards` (
  `id` VARCHAR(100) PRIMARY KEY,
  `slug` VARCHAR(200) NOT NULL,
  `title_zh` VARCHAR(500) NOT NULL,
  `title_en` VARCHAR(500) NOT NULL,
  `description_zh` TEXT,
  `description_en` TEXT,
  `detail_zh` TEXT,
  `detail_en` TEXT,
  `org_zh` VARCHAR(500),
  `org_en` VARCHAR(500),
  `date` VARCHAR(100),
  `level` VARCHAR(100),
  `image` VARCHAR(1000),
  `official_links` JSON,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tools` (
  `id` VARCHAR(100) PRIMARY KEY,
  `title_zh` VARCHAR(500) NOT NULL,
  `title_en` VARCHAR(500) NOT NULL,
  `description_zh` TEXT,
  `description_en` TEXT,
  `url` VARCHAR(1000),
  `icon` VARCHAR(200),
  `tags` JSON,
  `type` ENUM('personal', 'tool') DEFAULT 'tool',
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add type column to sites table to distinguish personal vs tool
ALTER TABLE `sites` ADD COLUMN IF NOT EXISTS `type` VARCHAR(20) DEFAULT 'personal' AFTER `tags`;
