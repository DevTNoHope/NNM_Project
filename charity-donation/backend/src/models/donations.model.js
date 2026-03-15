const { query } = require("../utils/dbQuery");

async function create({
  projectId,
  userId,
  donorWallet,
  amount,
  donationType = "CRYPTO",
  tokenAddress,
  status
}) {
  const sql = `
    INSERT INTO donations (
      project_id,
      user_id,
      donor_wallet,
      amount,
      donation_type,
      token_address,
      status,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const result = await query(sql, [
    projectId,
    userId,
    donorWallet || null,
    amount,
    donationType,
    tokenAddress || null,
    status
  ]);

  return result.insertId;
}

async function updateVnpTxnRef(id, txnRef) {
  const sql = `
    UPDATE donations
    SET vnp_txn_ref = ?
    WHERE id = ?
  `;
  await query(sql, [txnRef, id]);
}

async function findByVnpTxnRef(txnRef) {
  const sql = `SELECT * FROM donations WHERE vnp_txn_ref = ? LIMIT 1`;
  const rows = await query(sql, [txnRef]);
  return rows[0] || null;
}

async function findById(id) {
  const sql = `SELECT * FROM donations WHERE id = ? LIMIT 1`;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function findByProjectId(projectId) {
  const sql = `
    SELECT
      d.id,
      d.project_id,
      d.user_id,
      u.name AS donor_name,
      d.donor_wallet,
      d.amount,
      d.donation_type,
      d.tx_hash,
      d.status,
      d.created_at,
      d.confirmed_at
    FROM donations d
    LEFT JOIN users u ON u.id = d.user_id
    WHERE d.project_id = ?
    ORDER BY d.created_at DESC
  `;
  return query(sql, [projectId]);
}

async function markConfirmedByVnpTxnRef(txnRef, transactionNo = null) {
  const sql = `
    UPDATE donations
    SET
      status = 'CONFIRMED',
      vnp_transaction_no = ?,
      confirmed_at = NOW()
    WHERE vnp_txn_ref = ?
      AND status <> 'CONFIRMED'
  `;
  await query(sql, [transactionNo, txnRef]);
}

async function markFailedByVnpTxnRef(txnRef) {
  const sql = `
    UPDATE donations
    SET status = 'FAILED'
    WHERE vnp_txn_ref = ?
      AND status <> 'CONFIRMED'
  `;
  await query(sql, [txnRef]);
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

module.exports = {
  create,
  updateVnpTxnRef,
  findByVnpTxnRef,
  findById,
  findByProjectId,
  markConfirmedByVnpTxnRef,
  markFailedByVnpTxnRef,
  getTotalDonations
};

