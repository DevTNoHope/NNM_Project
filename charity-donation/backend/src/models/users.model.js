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
  const sql = `
    SELECT id, email, google_sub, role, linked_wallet, created_at, updated_at
    FROM users
    WHERE email = ?
    LIMIT 1
  `;
  const rows = await query(sql, [email]);
  return rows[0] || null;
}

async function findByGoogleSub(googleSub) {
  const sql = `
    SELECT id, email, google_sub, role, linked_wallet, created_at, updated_at
    FROM users
    WHERE google_sub = ?
    LIMIT 1
  `;
  const rows = await query(sql, [googleSub]);
  return rows[0] || null;
}

async function createGoogleUser({ email, googleSub, role = "USER" }) {
  const insertSql = `
    INSERT INTO users (email, google_sub, role)
    VALUES (?, ?, ?)
  `;
  const result = await query(insertSql, [email, googleSub, role]);
  return findById(result.insertId);
}

async function attachGoogleSub(userId, googleSub) {
  const sql = `
    UPDATE users
    SET google_sub = ?, updated_at = NOW()
    WHERE id = ?
  `;
  await query(sql, [googleSub, userId]);
  return findById(userId);
}

module.exports = {
  findById,
  findByEmail,
  findByGoogleSub,
  createGoogleUser,
  attachGoogleSub,
};