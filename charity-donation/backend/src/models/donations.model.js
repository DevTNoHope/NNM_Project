const { query } = require("../utils/dbQuery");

async function create({
  projectId,
  userId,
  donorWallet,
  amount,
  donationType = "CRYPTO",
  txHash = null,
  status,
}) {
  const sql = `
    INSERT INTO donations (
      project_id,
      user_id,
      donor_wallet,
      amount,
      donation_type,
      tx_hash,
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
    txHash || null,
    status,
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

async function findByTxHash(txHash) {
  const sql = `SELECT * FROM donations WHERE tx_hash = ? LIMIT 1`;
  const rows = await query(sql, [txHash]);
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
    totalAmount: rows[0].total_amount,
  };
}

async function markCryptoConfirmed(id, txHash, donorWallet = null) {
  const sql = `
    UPDATE donations
    SET
      status = 'CONFIRMED',
      tx_hash = ?,
      donor_wallet = COALESCE(?, donor_wallet),
      confirmed_at = NOW()
    WHERE id = ?
      AND status <> 'CONFIRMED'
  `;
  await query(sql, [txHash, donorWallet, id]);
}

async function markCryptoFailed(id, txHash = null) {
  const sql = `
    UPDATE donations
    SET
      status = 'FAILED',
      tx_hash = COALESCE(?, tx_hash)
    WHERE id = ?
      AND status <> 'CONFIRMED'
  `;
  await query(sql, [txHash, id]);
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
      d.tx_hash,
      d.status,
      d.created_at,
      d.confirmed_at
    FROM donations d
    LEFT JOIN projects p ON p.id = d.project_id
    WHERE d.user_id = ?
      AND d.status = 'CONFIRMED'
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

async function getDonationsByProjectId(projectId) {
  const sql = `
    SELECT
      d.id,
      d.project_id,
      p.title AS project_title,
      d.user_id,
      u.name AS donor_name,
      d.donor_wallet,
      d.amount,
      d.donation_type,
      d.tx_hash,
      d.status,
      d.created_at,
      d.confirmed_at,
      stats.total_project_donations,
      stats.total_donors
    FROM donations d
    LEFT JOIN projects p ON p.id = d.project_id
    LEFT JOIN users u ON u.id = d.user_id
    LEFT JOIN (
      SELECT
        project_id,
        COALESCE(SUM(amount), 0) AS total_project_donations,
        COUNT(DISTINCT user_id) AS total_donors
      FROM donations
      WHERE status = 'CONFIRMED'
      GROUP BY project_id
    ) stats ON stats.project_id = d.project_id
    WHERE d.project_id = 11
      AND d.status = 'CONFIRMED'
    ORDER BY d.created_at DESC;
  `;
  return await query(sql, [projectId]);
}

module.exports = {
  create,
  updateVnpTxnRef,
  findByVnpTxnRef,
  findById,
  findByTxHash,
  findByProjectId,
  markConfirmedByVnpTxnRef,
  markFailedByVnpTxnRef,
  getTotalDonations,
  markCryptoConfirmed,
  markCryptoFailed,
  getDonationsByUserId,
  getTotalReceivedByUserId,
  getDonationsByProjectId,
};
