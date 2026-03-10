const { query } = require("../utils/dbQuery");

async function findById(id) {
  const sql = `
    SELECT id, email, google_sub, role, linked_wallet, created_at, updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  // Nếu bạn dùng google-only, sau này sẽ findByGoogleSub
  const sql = `
    SELECT id, email, google_sub, role, linked_wallet, created_at, updated_at,
           NULL as password_hash
    FROM users
    WHERE email = ?
    LIMIT 1
  `;
  const rows = await query(sql, [email]);
  return rows[0] || null;
}

async function countAll() {
  const sql = `SELECT COUNT(*) as total FROM users`;
  const rows = await query(sql);
  return rows[0].total;
}

module.exports = { findById, findByEmail, countAll };