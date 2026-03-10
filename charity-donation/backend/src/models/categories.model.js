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

module.exports = { findAll, findById, create, update, remove };
