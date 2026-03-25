const { query } = require("../utils/dbQuery");

const BadgeModel = {
  async getAll() {
    const rows = await query(
      "SELECT * FROM badges ORDER BY min_points ASC"
    );
    return rows;
  },

  async create(data) {
    const { name, slug, description, min_points, icon_url, color } = data;

    const result = await query(
      `INSERT INTO badges (name, slug, description, min_points, icon_url, color)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, slug, description, min_points, icon_url, color]
    );

    return { id: result.insertId, ...data };
  },

  async update(id, data) {
    const { name, slug, description, min_points, icon_url, color } = data;

    await query(
      `UPDATE badges 
       SET name=?, slug=?, description=?, min_points=?, icon_url=?, color=? 
       WHERE id=?`,
      [name, slug, description, min_points, icon_url, color, id]
    );

    return { id, ...data };
  },

  async delete(id) {
    await query("DELETE FROM badges WHERE id = ?", [id]);
  }
};

module.exports = BadgeModel;