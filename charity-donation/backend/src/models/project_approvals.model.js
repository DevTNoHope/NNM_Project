const { query } = require("../utils/dbQuery");

async function findAll() {
  const sql = `
    SELECT id, project_id, admin_id, decision, note, decided_at
    FROM project_approvals
    ORDER BY decided_at DESC
  `;
  return query(sql);
}

async function findById(id) {
  const sql = `
    SELECT id, project_id, admin_id, decision, note, decided_at
    FROM project_approvals
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function create({ projectId, adminId, decision, note }) {
  const sql = `
    INSERT INTO project_approvals (project_id, admin_id, decision, note)
    VALUES (?, ?, ?, ?)
  `;
  const result = await query(sql, [projectId, adminId, decision, note]);
  return result.insertId;
}

module.exports = { findAll, findById, create };
