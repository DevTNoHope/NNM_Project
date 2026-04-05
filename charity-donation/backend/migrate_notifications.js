const pool = require("./src/config/db");

async function migrate() {
  const connection = await pool.promise().getConnection();
  try {
    console.log("Creating table `notifications` if not exists...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        related_id INT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Table `notifications` created successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();
