const { query } = require("../utils/dbQuery");

async function findAll() {
  const sql = `
    SELECT id, name, created_at, updated_at
    FROM categories
    ORDER BY created_at DESC
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

module.exports = { findAll, findById, create };
