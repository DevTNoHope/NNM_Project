const { query } = require("../utils/dbQuery");

async function findAll() {
  const sql = `
    SELECT id, withdraw_request_id, admin_id, decision, admin_signature, nonce, deadline, decided_at
    FROM withdraw_approvals
    ORDER BY decided_at DESC
  `;
  return query(sql);
}

async function findById(id) {
  const sql = `
    SELECT id, withdraw_request_id, admin_id, decision, admin_signature, nonce, deadline, decided_at
    FROM withdraw_approvals
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function findByWithdrawRequestId(withdrawRequestId) {
  const sql = `
    SELECT id, withdraw_request_id, admin_id, decision, admin_signature, nonce, deadline, decided_at
    FROM withdraw_approvals
    WHERE withdraw_request_id = ? AND decision = 'APPROVED'
    LIMIT 1
  `;
  const rows = await query(sql, [withdrawRequestId]);
  return rows[0] || null;
}

async function create({ withdrawRequestId, adminId, decision, adminSignature, nonce, deadline }) {
  const sql = `
    INSERT INTO withdraw_approvals (withdraw_request_id, admin_id, decision, admin_signature, nonce, deadline)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [withdrawRequestId, adminId, decision, adminSignature, nonce, deadline]);
  return result.insertId;
}

module.exports = { findAll, findById, findByWithdrawRequestId, create };
