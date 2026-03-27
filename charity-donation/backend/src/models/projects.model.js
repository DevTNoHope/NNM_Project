const { query } = require("../utils/dbQuery");

async function findAll() {
  const sql = `
    SELECT p.id, p.founder_id, p.category_id, c.name as category_name, p.title, p.description, p.goal_amount, p.status,
           p.cover_image_url, p.vault_address, p.created_at, p.updated_at,
           (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE project_id = p.id AND status = 'CONFIRMED') as total_donated
    FROM projects p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `;
  return query(sql);
}

async function findById(id) {
  const sql = `
   SELECT 
      p.id,
      p.founder_id,
      u.name AS founder_name,
      p.category_id,
      c.name AS category_name,
      p.title,
      p.description,
      p.goal_amount,
      p.status,
      p.cover_image_url,
      p.vault_address,
      p.ipfs_cid,
      p.meta_hash,
      p.created_at,
      p.updated_at
    FROM projects p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON u.id = p.founder_id
    WHERE p.id = ?
    LIMIT 1;
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function create({
  founderId,
  categoryId,
  title,
  description,
  goalAmount,
  coverImageUrl,
}) {
  const sql = `
    INSERT INTO projects (founder_id, category_id, title, description, goal_amount, status, cover_image_url)
    VALUES (?, ?, ?, ?, ?, 'DRAFT', ?)
  `;
  const result = await query(sql, [
    founderId,
    categoryId,
    title,
    description,
    goalAmount,
    coverImageUrl,
  ]);
  return result.insertId;
}

async function countPublished() {
  const sql = `SELECT COUNT(*) as total FROM projects WHERE status = 'PUBLISHED'`;
  const rows = await query(sql);
  return rows[0].total;
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
    SET status = ?, updated_at = CURRENT_TIMESTAMP
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

async function findNewlyEligible(limit = 3, offset = 0) {
  const sql = `
    SELECT
      p.id,
      p.title,
      p.cover_image_url,
      p.goal_amount,
      p.description as excerpt,
      p.created_at,
      u.name AS founder_name,
      COALESCE(SUM(CASE WHEN d.status='CONFIRMED' THEN d.amount ELSE 0 END), 0) AS total_raised,
      COUNT(DISTINCT CASE WHEN d.status='CONFIRMED' THEN COALESCE(CAST(d.user_id AS CHAR), d.donor_wallet) END) AS total_donors
    FROM projects p
    LEFT JOIN donations d ON d.project_id = p.id
    LEFT JOIN users u ON p.founder_id = u.id
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
      p.id,
      p.title,
      p.cover_image_url,
      p.description as excerpt,
      p.goal_amount,
      p.created_at,
      u.name AS founder_name,
      COALESCE(SUM(CASE WHEN d.status='CONFIRMED' THEN d.amount ELSE 0 END), 0) AS total_raised,
      COUNT(DISTINCT CASE WHEN d.status='CONFIRMED' THEN COALESCE(CAST(d.user_id AS CHAR), d.donor_wallet) END) AS total_donors
    FROM projects p
    LEFT JOIN donations d ON d.project_id = p.id
    LEFT JOIN users u ON p.founder_id = u.id
    WHERE p.status = 'PUBLISHED'
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ?
  `;
  return query(sql, [limit]);
}

async function findLastUpdated(limit = 10) {
  const sql = `
    SELECT
      pu.id,
      pu.title,
      pu.image_url as cover_image_url,
      pu.updated_at,
      p.id as project_id,
      p.title as project_title
    FROM project_updates pu
    JOIN projects p ON p.id = pu.project_id
    WHERE p.status = 'PUBLISHED'
    ORDER BY pu.updated_at DESC
    LIMIT ?
  `;
  return query(sql, [limit]);
}
async function countByStatus(status) {
  const sql = `SELECT COUNT(*) as total FROM projects WHERE status = ?`;
  const rows = await query(sql, [status]);
  return rows[0].total;
}

async function findPublished() {
  const sql = `
    SELECT 
      p.id,
      p.founder_id,
      u.name AS founder_name,
      p.category_id,
      c.name AS category_name,
      p.title,
      p.description,
      p.goal_amount,
      p.status,
      p.cover_image_url,
      p.vault_address,
      p.created_at,
      p.updated_at,
      (
        SELECT COALESCE(SUM(d.amount), 0)
        FROM donations d
        WHERE d.project_id = p.id
          AND d.status = 'CONFIRMED'
      ) AS total_donated,
      (
        SELECT COUNT(DISTINCT d.user_id)
        FROM donations d
        WHERE d.project_id = p.id
          AND d.status = 'CONFIRMED'
      ) AS total_donors
    FROM projects p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON u.id = p.founder_id
    WHERE p.status = 'PUBLISHED'
    ORDER BY p.created_at DESC
  `;
  return query(sql);
}

async function findOwnedByUser(userId) {
  const sql = `
    SELECT 
      p.id,
      p.founder_id,
      p.category_id,
      c.name AS category_name,
      p.title,
      p.description,
      p.goal_amount,
      p.status,
      p.cover_image_url,
      p.vault_address,
      p.created_at,
      p.updated_at,
      (
        SELECT COALESCE(SUM(amount), 0)
        FROM donations
        WHERE project_id = p.id AND status = 'CONFIRMED'
      ) AS total_donated,
      (
        SELECT COUNT(DISTINCT user_id)
        FROM donations
        WHERE project_id = p.id AND status = 'CONFIRMED'
      ) AS total_donors
    FROM projects p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.founder_id = ?
    ORDER BY p.created_at DESC
  `;
  return query(sql, [userId]);
}

async function findFounderProjects(userId) {
  const sql = `
    SELECT 
      p.id,
      p.founder_id,
      p.category_id,
      c.name AS category_name,
      p.title,
      p.description,
      p.goal_amount,
      p.status,
      p.cover_image_url,
      p.vault_address,
      p.created_at,
      p.updated_at
    FROM projects p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.founder_id = ?
      AND p.status IN ('APPROVED', 'PUBLISHED')
    ORDER BY p.created_at DESC
  `;
  return query(sql, [userId]);
}

async function updateById(
  id,
  { categoryId, title, description, goalAmount, coverImageUrl },
) {
  const sql = `
    UPDATE projects
    SET
      category_id = ?,
      title = ?,
      description = ?,
      goal_amount = ?,
      cover_image_url = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const result = await query(sql, [
    categoryId,
    title,
    description,
    goalAmount,
    coverImageUrl,
    id,
  ]);
  return result.affectedRows;
}

async function deleteById(id) {
  const sql = `DELETE FROM projects WHERE id = ?`;
  const result = await query(sql, [id]);
  return result.affectedRows;
}

async function getProjectsByUserId(userId) {
  const sql = `
    SELECT
      p.id,
      p.founder_id,
      p.category_id,
      p.title,
      p.description,
      p.goal_amount,
      p.status,
      p.cover_image_url,
      p.vault_address,
      p.created_at,
      p.updated_at
    FROM projects p
    WHERE p.founder_id = ?
      AND p.status = 'PUBLISHED'
    ORDER BY p.created_at DESC
  `;
  return await query(sql, [userId]);
}

async function updateVaultAndPublish(id, vaultAddress, ipfsCid, metaHash) {
  const sql = `
    UPDATE projects
    SET vault_address = ?, ipfs_cid = ?, meta_hash = ?, status = 'PUBLISHED', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const result = await query(sql, [vaultAddress, ipfsCid, metaHash, id]);
  return result.affectedRows;
}

module.exports = {
  findAll,
  findById,
  create,
  countPublished,
  findNewlyEligible,
  findRecent,
  findLastUpdated,
  findByStatus,
  updateStatus,
  countAll,
  countByStatus,
  findPublished,
  findOwnedByUser,
  findFounderProjects,
  updateById,
  deleteById,
  getProjectsByUserId,
  updateVaultAndPublish,
};
