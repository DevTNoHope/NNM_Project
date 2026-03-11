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
    SELECT id, email, google_sub, role, linked_wallet, created_at, updated_at
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

async function countAll() {
  const sql = `SELECT COUNT(*) as total FROM users`;
  const rows = await query(sql);
  return rows[0].total;
}

async function findAllWithStats() {
  const sql = `
    SELECT u.id, u.email, u.google_sub, u.role, u.linked_wallet, u.created_at, u.updated_at,
           COUNT(DISTINCT d.project_id) as total_projects_donated,
           COALESCE(SUM(d.amount), 0) as total_amount_donated
    FROM users u
    LEFT JOIN donations d ON u.id = d.user_id AND d.status = 'CONFIRMED'
    GROUP BY u.id, u.email, u.google_sub, u.role, u.linked_wallet, u.created_at, u.updated_at
    ORDER BY u.created_at DESC
  `;
  return query(sql);
}

async function getUserDonationHistory(userId) {
  const sql = `
    SELECT d.id, d.project_id, p.title as project_title, d.amount, d.tx_hash, d.status, d.created_at
    FROM donations d
    LEFT JOIN projects p ON d.project_id = p.id
    WHERE d.user_id = ?
    ORDER BY d.created_at DESC
  `;
  return query(sql, [userId]);
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

async function createGoogleUser({ email, googleSub, role = "USER" }) {
  const insertSql = `
    INSERT INTO users (email, google_sub, role)
    VALUES (?, ?, ?)
  `;
  const result = await query(insertSql, [email, googleSub, role]);
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

module.exports = {
  findByWallet,
  createWalletUser,
  findById,
  findByEmail,
  findByGoogleSub,
  createGoogleUser,
  attachGoogleSub,
  countAll, 
  findAllWithStats, 
  getUserDonationHistory
};
