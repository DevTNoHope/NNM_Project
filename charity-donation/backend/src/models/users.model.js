const { query } = require("../utils/dbQuery");

const findByWallet = async (walletAddress) => {
  const sql = `
    SELECT *
    FROM users
    WHERE linked_wallet = ?
    LIMIT 1
  `;
  const rows = await query(sql, [walletAddress]);
  return rows[0] || null;
};

const createWalletUser = async (walletAddress) => {
  const sql = `
    INSERT INTO users (linked_wallet, role)
    VALUES (?, 'USER')
  `;
  const result = await query(sql, [walletAddress]);

  return {
    id: result.insertId,
    linked_wallet: walletAddress,
    role: "USER",
  };
};

async function findById(id) {
  const sql = `
    SELECT 
      id,
      email,
      name,
      google_sub,
      role,
      linked_wallet,
      is_verified,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const sql = `
    SELECT id, email, google_sub, role, linked_wallet, created_at, updated_at
    FROM users
    WHERE email = ?
    LIMIT 1
  `;
  const rows = await query(sql, [email]);
  return rows[0] || null;
}

async function findByGoogleSub(googleSub) {
  const sql = `
    SELECT id, email, google_sub, role, linked_wallet, created_at, updated_at
    FROM users
    WHERE google_sub = ?
    LIMIT 1
  `;
  const rows = await query(sql, [googleSub]);
  return rows[0] || null;
}

async function createGoogleUser({ email, googleSub, name, role = "USER" }) {
  const insertSql = `
    INSERT INTO users (email, google_sub, name, role)
    VALUES (?, ?, ?, ?)
  `;

  const result = await query(insertSql, [email, googleSub, name, role]);
  return findById(result.insertId);
}

async function attachGoogleSub(userId, googleSub) {
  const sql = `
    UPDATE users
    SET google_sub = ?, updated_at = NOW()
    WHERE id = ?
  `;
  await query(sql, [googleSub, userId]);
  return findById(userId);
}

async function getPublicProfileById(userId) {
  const sql = `
    SELECT
      id,
      name,
      email,
      linked_wallet,
      is_verified,
      created_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [userId]);
  return rows[0] || null;
}

async function updateMyProfile(userId, payload) {
  const sql = `
    UPDATE users
    SET
      name = ?,
      email = ?,
      linked_wallet = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  return await query(sql, [
    payload.name,
    payload.email,
    payload.linked_wallet,
    userId,
  ]);
}

async function markVerified(userId) {
  const sql = `
    UPDATE users
    SET
      is_verified = 1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  return await query(sql, [userId]);
}

async function updateRole(userId, newRole) {
  const sql = `
    UPDATE users
    SET
      role = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  return await query(sql, [newRole, userId]);
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
    ORDER BY p.created_at DESC
  `;
  return await query(sql, [userId]);
}

async function getDonationsByUserId(userId) {
  const sql = `
    SELECT
      d.id,
      d.project_id,
      p.title AS project_title,
      d.user_id,
      d.donor_wallet,
      d.amount,
      d.donation_type,
      d.status,
      d.created_at,
      d.confirmed_at
    FROM donations d
    LEFT JOIN projects p ON p.id = d.project_id
    WHERE d.user_id = ?
    ORDER BY d.created_at DESC
  `;
  return await query(sql, [userId]);
}

async function getTotalReceivedByUserId(userId) {
  const sql = `
    SELECT COALESCE(SUM(d.amount), 0) AS total_received
    FROM donations d
    JOIN projects p ON p.id = d.project_id
    WHERE p.founder_id = ?
      AND d.status = 'CONFIRMED'
  `;

  const rows = await query(sql, [userId]);
  return rows[0]?.total_received || 0;
}
async function countAll() {
  const rows = await query(`
    SELECT COUNT(*) AS total
    FROM users
  `);

  return rows[0].total;
}
async function findAllWithStats() {
  const rows = await query(`
    SELECT 
      u.id,
      u.email,
      u.role,
      u.linked_wallet,
      u.created_at,

      COUNT(DISTINCT d.project_id) AS total_projects_donated,
      IFNULL(SUM(d.amount),0) AS total_amount_donated

    FROM users u
    LEFT JOIN donations d ON d.user_id = u.id

    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);

  return rows;
}
module.exports = {
  findByWallet,
  createWalletUser,
  findById,
  findByEmail,
  findByGoogleSub,
  createGoogleUser,
  attachGoogleSub,
  getPublicProfileById,
  updateMyProfile,
  markVerified,
  updateRole,
  getProjectsByUserId,
  getDonationsByUserId,
  getTotalReceivedByUserId,
  countAll,
  findAllWithStats,
};
