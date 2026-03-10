const { query } = require("../utils/dbQuery");

async function findAll() {
  const sql = `
    SELECT id, project_id, founder_id, amount, status, note, created_at, updated_at
    FROM withdraw_requests
    ORDER BY created_at DESC
  `;
  return query(sql);
}

async function findById(id) {
  const sql = `
    SELECT id, project_id, founder_id, amount, status, note, created_at, updated_at
    FROM withdraw_requests
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function create({ projectId, founderId, amount, note }) {
  const sql = `
    INSERT INTO withdraw_requests (project_id, founder_id, amount, note)
    VALUES (?, ?, ?, ?)
  `;
  const result = await query(sql, [projectId, founderId, amount, note]);
  return result.insertId;
}

module.exports = { findAll, findById, create };
