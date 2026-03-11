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

async function findAllWithStats() {
  const sql = `
    SELECT u.id, u.email, u.google_sub, u.role, u.linked_wallet, u.created_at, u.updated_at,
           COUNT(DISTINCT d.project_id) as total_projects_donated,
           COALESCE(SUM(d.amount), 0) as total_amount_donated
    FROM users u
    LEFT JOIN donations d ON u.id = d.user_id AND d.status = 'CONFIRMED'
    GROUP BY u.id, u.email, u.google_sub, u.role, u.linked_wallet, u.created_at, u.updated_at
    ORDER BY u.created_at DESC
  `;
  return query(sql);
}

async function getUserDonationHistory(userId) {
  const sql = `
    SELECT d.id, d.project_id, p.title as project_title, d.amount, d.tx_hash, d.status, d.created_at
    FROM donations d
    LEFT JOIN projects p ON d.project_id = p.id
    WHERE d.user_id = ?
    ORDER BY d.created_at DESC
  `;
  return query(sql, [userId]);
}

module.exports = { findById, findByEmail, countAll, findAllWithStats, getUserDonationHistory };