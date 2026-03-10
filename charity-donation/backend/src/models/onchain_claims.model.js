const { query } = require("../utils/dbQuery");

async function findAll() {
  const sql = `
    SELECT id, withdraw_request_id, claim_tx_hash, status, created_at, confirmed_at
    FROM onchain_claims
    ORDER BY created_at DESC
  `;
  return query(sql);
}

async function findById(id) {
  const sql = `
    SELECT id, withdraw_request_id, claim_tx_hash, status, created_at, confirmed_at
    FROM onchain_claims
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function create({ withdrawRequestId, claimTxHash }) {
  const sql = `
    INSERT INTO onchain_claims (withdraw_request_id, claim_tx_hash)
    VALUES (?, ?)
  `;
  const result = await query(sql, [withdrawRequestId, claimTxHash]);
  return result.insertId;
}

module.exports = { findAll, findById, create };
