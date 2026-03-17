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

async function countPublished() {
  const sql = `SELECT COUNT(*) as total FROM projects WHERE status = 'PUBLISHED'`;
  const rows = await query(sql);
  return rows[0].total;
}

async function findNewlyEligible(limit = 3, offset = 0) {
  const sql = `
    SELECT
      p.id,
      p.title,
      p.cover_image_url,
      p.goal_amount,
      p.description as excerpt,
      p.created_at,
      COALESCE(SUM(CASE WHEN d.status='CONFIRMED' THEN d.amount ELSE 0 END), 0) AS total_raised
    FROM projects p
    LEFT JOIN donations d ON d.project_id = p.id
    WHERE p.status = 'PUBLISHED'
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  return query(sql, [limit, offset]);
}

async function findRecent(limit = 3) {
  const sql = `
    SELECT
      id,
      title,
      cover_image_url,
      description as excerpt,
      goal_amount,
      created_at
    FROM projects
    WHERE status = 'PUBLISHED'
    ORDER BY created_at DESC
    LIMIT ?
  `;
  return query(sql, [limit]);
}

async function findLastUpdated(limit = 10) {
  const sql = `
    SELECT
      id,
      title,
      cover_image_url,
      updated_at
    FROM projects
    WHERE status = 'PUBLISHED'
    ORDER BY updated_at DESC
    LIMIT ?
  `;
  return query(sql, [limit]);
}

module.exports = {
  findAll,
  findById,
  create,
  countPublished,
  findNewlyEligible,
  findRecent,
  findLastUpdated
};