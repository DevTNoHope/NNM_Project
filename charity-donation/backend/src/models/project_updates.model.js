const { query } = require("../utils/dbQuery");

async function findAll() {
  const sql = `
    SELECT id, project_id, author_id, title, content, image_url, created_at, updated_at
    FROM project_updates
    ORDER BY created_at DESC
  `;
  return query(sql);
}

async function findById(id) {
  const sql = `
    SELECT id, project_id, author_id, title, content, image_url, created_at, updated_at
    FROM project_updates
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function findByProjectId(projectId) {
  const sql = `
    SELECT id, project_id, author_id, title, content, image_url, created_at, updated_at
    FROM project_updates
    WHERE project_id = ?
    ORDER BY created_at DESC
  `;
  return query(sql, [projectId]);
}

async function create({ projectId, authorId, title, content, imageUrl }) {
  const sql = `
    INSERT INTO project_updates (project_id, author_id, title, content, image_url)
    VALUES (?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [projectId, authorId, title, content, imageUrl]);
  return result.insertId;
}

module.exports = { findAll, findById, findByProjectId, create };
