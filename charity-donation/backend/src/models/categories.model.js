const { query } = require("../utils/dbQuery");

async function findAll() {
  const sql = `
    SELECT 
      c.id, 
      c.name, 
      c.created_at, 
      c.updated_at,
      COALESCE(SUM(d.amount), 0) AS total_amount
    FROM categories c
    LEFT JOIN projects p ON p.category_id = c.id
    LEFT JOIN donations d ON d.project_id = p.id AND d.status = 'CONFIRMED'
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;
  return query(sql);
}

async function findById(id) {
  const sql = `
    SELECT id, name, created_at, updated_at
    FROM categories
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function create({ name }) {
  const sql = `
    INSERT INTO categories (name)
    VALUES (?)
  `;
  const result = await query(sql, [name]);
  return result.insertId;
}

async function update(id, name) {
  const sql = `
    UPDATE categories
    SET name = ?
    WHERE id = ?
  `;
  const result = await query(sql, [name, id]);
  return result.affectedRows;
}

async function remove(id) {
  const sql = `
    DELETE FROM categories
    WHERE id = ?
  `;
  const result = await query(sql, [id]);
  return result.affectedRows;
}

async function findProjectsByCategoryId(categoryId) {
  const sql = `
    SELECT 
      p.id, p.title, p.description, p.goal_amount, p.status, p.cover_image_url,
      p.created_at,
      COALESCE(SUM(d.amount), 0) AS total_donated
    FROM projects p
    LEFT JOIN donations d ON d.project_id = p.id AND d.status = 'CONFIRMED'
    WHERE p.category_id = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  return query(sql, [categoryId]);
}

module.exports = { findAll, findById, create, update, remove, findProjectsByCategoryId };
