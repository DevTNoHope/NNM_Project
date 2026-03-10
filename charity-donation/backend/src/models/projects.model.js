const { query } = require("../utils/dbQuery");

async function findAll() {
  const sql = `
    SELECT id, founder_id, category_id, title, description, goal_amount, status,
           cover_image_url, vault_address, created_at, updated_at
    FROM projects
    ORDER BY created_at DESC
  `;
  return query(sql);
}

async function findById(id) {
  const sql = `
    SELECT id, founder_id, category_id, title, description, goal_amount, status,
           cover_image_url, vault_address, created_at, updated_at
    FROM projects
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function create({ founderId, categoryId, title, description, goalAmount, coverImageUrl }) {
  const sql = `
    INSERT INTO projects (founder_id, category_id, title, description, goal_amount, status, cover_image_url)
    VALUES (?, ?, ?, ?, ?, 'DRAFT', ?)
  `;
  const result = await query(sql, [founderId, categoryId, title, description, goalAmount, coverImageUrl]);
  return result.insertId;
}

async function findByStatus(status) {
  const sql = `
    SELECT id, founder_id, category_id, title, description, goal_amount, status,
           cover_image_url, vault_address, created_at, updated_at
    FROM projects
    WHERE status = ?
    ORDER BY created_at ASC
  `;
  return query(sql, [status]);
}

async function updateStatus(id, newStatus) {
  const sql = `
    UPDATE projects
    SET status = ?
    WHERE id = ?
  `;
  const result = await query(sql, [newStatus, id]);
  return result.affectedRows;
}

async function countAll() {
  const sql = `SELECT COUNT(*) as total FROM projects`;
  const rows = await query(sql);
  return rows[0].total;
}

async function countByStatus(status) {
  const sql = `SELECT COUNT(*) as total FROM projects WHERE status = ?`;
  const rows = await query(sql, [status]);
  return rows[0].total;
}

module.exports = { findAll, findById, create, findByStatus, updateStatus, countAll, countByStatus };