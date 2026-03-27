const { query } = require("../utils/dbQuery");

async function create({ name, slug, description, minPoints, color, iconUrl }) {
  const sql = `
    INSERT INTO badges (name, slug, description, min_points, color, icon_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [name, slug, description, minPoints, color, iconUrl]);
  return result.insertId;
}

async function update(id, { name, slug, description, minPoints, color, iconUrl }) {
  const sql = `
    UPDATE badges
    SET name = ?, slug = ?, description = ?, min_points = ?, color = ?, icon_url = ?
    WHERE id = ?
  `;
  await query(sql, [name, slug, description, minPoints, color, iconUrl, id]);
}

async function remove(id) {
  const sql = `DELETE FROM badges WHERE id = ?`;
  await query(sql, [id]);
}

async function findById(id) {
  const sql = `SELECT * FROM badges WHERE id = ? LIMIT 1`;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const sql = `SELECT * FROM badges WHERE slug = ? LIMIT 1`;
  const rows = await query(sql, [slug]);
  return rows[0] || null;
}

async function findAll() {
  const sql = `SELECT * FROM badges ORDER BY min_points ASC`;
  const rows = await query(sql);
  return rows;
}

module.exports = {
  create,
  update,
  remove,
  findById,
  findBySlug,
  findAll,
};
