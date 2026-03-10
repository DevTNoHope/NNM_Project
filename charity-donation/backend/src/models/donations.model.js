const { query } = require("../utils/dbQuery");

async function create({ projectId, userId, donorWallet, amount, txHash, chainId, tokenAddress, status }) {
  const sql = `
    INSERT INTO donations (
      project_id, user_id, donor_wallet, amount, tx_hash, chain_id, token_address, status, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const result = await query(sql, [
    projectId,
    userId,
    donorWallet,
    amount,
    txHash,
    chainId,
    tokenAddress,
    status
  ]);
  return result.insertId;
}

async function getTotalDonations() {
  const sql = `
    SELECT COUNT(*) as total_count, COALESCE(SUM(amount), 0) as total_amount
    FROM donations
  `;
  const rows = await query(sql);
  return {
    totalCount: rows[0].total_count,
    totalAmount: rows[0].total_amount
  };
}

module.exports = { create, getTotalDonations };