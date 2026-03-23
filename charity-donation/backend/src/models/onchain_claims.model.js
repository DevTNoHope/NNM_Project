const { query } = require("../utils/dbQuery");

const onchainClaimsModel = {
  create: async (data) => {
    const { withdraw_request_id, claim_tx_hash, status } = data;
    const sql = `
      INSERT INTO onchain_claims (withdraw_request_id, claim_tx_hash, status)
      VALUES (?, ?, ?)
    `;
    const result = await query(sql, [withdraw_request_id, claim_tx_hash, status || 'PENDING']);
    return result.insertId;
  },

  updateStatus: async (withdrawRequestId, status, txHash = null) => {
    let sql = `UPDATE onchain_claims SET status = ?`;
    const params = [status];
    
    if (status === 'CONFIRMED') {
      sql += `, confirmed_at = CURRENT_TIMESTAMP`;
    }
    
    if (txHash) {
      sql += `, claim_tx_hash = ?`;
      params.push(txHash);
    }
    
    sql += ` WHERE withdraw_request_id = ?`;
    params.push(withdrawRequestId);
    
    await query(sql, params);
  },

  findByWithdrawRequestId: async (withdrawRequestId) => {
    const rows = await query(
      "SELECT * FROM onchain_claims WHERE withdraw_request_id = ?",
      [withdrawRequestId]
    );
    return rows[0];
  }
};

module.exports = onchainClaimsModel;
