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

module.exports = {
  findByWallet,
  createWalletUser,
};
