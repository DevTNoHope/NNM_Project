const { query } = require("../utils/dbQuery");

async function findAll() {
  const sql = `
    SELECT wr.*, p.title AS project_title, u.name AS founder_name, u.email AS founder_email, oc.claim_tx_hash
    FROM withdraw_requests wr
    LEFT JOIN projects p ON wr.project_id = p.id
    LEFT JOIN users u ON wr.founder_id = u.id
    LEFT JOIN onchain_claims oc ON wr.id = oc.withdraw_request_id
    ORDER BY wr.created_at DESC
  `;
  return query(sql);
}

async function findById(id) {
  const sql = `
    SELECT id, project_id, founder_id, amount, status, note, type, bank_name, account_number, account_name, verification_token, created_at, updated_at
    FROM withdraw_requests
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function findByVerificationToken(token) {
  const sql = `
    SELECT id, project_id, founder_id, amount, status, note, type, bank_name, account_number, account_name, created_at, updated_at
    FROM withdraw_requests
    WHERE verification_token = ?
    LIMIT 1
  `;
  const rows = await query(sql, [token]);
  return rows[0] || null;
}

async function create({ projectId, founderId, amount, note, type, bankName, accountNumber, accountName, verificationToken }) {
  const sql = `
    INSERT INTO withdraw_requests (project_id, founder_id, amount, note, type, bank_name, account_number, account_name, verification_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [projectId, founderId, amount, note, type, bankName, accountNumber, accountName, verificationToken]);
  return result.insertId;
}

async function updateStatus(id, status) {
  const sql = `UPDATE withdraw_requests SET status = ? WHERE id = ?`;
  return query(sql, [status, id]);
}

async function clearVerificationToken(id) {
  const sql = `UPDATE withdraw_requests SET verification_token = NULL WHERE id = ?`;
  return query(sql, [id]);
}

async function getSumByProjectAndType(projectId, type, statuses = ['APPROVED', 'CLAIMED', 'PENDING']) {
  const placeholders = statuses.map(() => '?').join(', ');
  const sql = `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM withdraw_requests
    WHERE project_id = ? AND type = ? AND status IN (${placeholders})
  `;
  const params = [projectId, type, ...statuses];
  const rows = await query(sql, params);
  return rows[0].total;
}

async function findByFounderId(founderId) {
  const sql = `
    SELECT wr.*, p.title AS project_title, oc.claim_tx_hash
    FROM withdraw_requests wr
    LEFT JOIN projects p ON wr.project_id = p.id
    LEFT JOIN onchain_claims oc ON wr.id = oc.withdraw_request_id
    WHERE wr.founder_id = ?
    ORDER BY wr.created_at DESC
  `;
  return query(sql, [founderId]);
}

module.exports = { findAll, findById, findByFounderId, findByVerificationToken, create, updateStatus, clearVerificationToken, getSumByProjectAndType };
