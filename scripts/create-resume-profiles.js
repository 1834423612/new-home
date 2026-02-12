import mysql from "mysql2/promise";

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  console.log("Connected to database, creating resume_profiles table...");

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS resume_profiles (
      id INT NOT NULL AUTO_INCREMENT,
      profile_name VARCHAR(100) NOT NULL,
      resume_data JSON NOT NULL,
      layout VARCHAR(50) DEFAULT 'classic',
      palette VARCHAR(50) DEFAULT 'clean-blue',
      show_icons BOOLEAN DEFAULT TRUE,
      font_scale INT DEFAULT 100,
      locale VARCHAR(10) DEFAULT 'en',
      device_token VARCHAR(200) DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_profile_name (profile_name),
      KEY idx_device_token (device_token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log("resume_profiles table created successfully!");
  await connection.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
