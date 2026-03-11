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

module.exports = {
  findByWallet,
  createWalletUser,
  findById,
  findByEmail,
  findByGoogleSub,
  createGoogleUser,
  attachGoogleSub,
};
