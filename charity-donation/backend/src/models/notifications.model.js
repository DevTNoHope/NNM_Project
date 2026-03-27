const { query } = require("../utils/dbQuery");

async function createNotification(payload) {
  const { userId, title, message, type, relatedId } = payload;
  const sql = `
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [userId || null, title, message, type, relatedId || null]);
  
  // Trả về dữ liệu vừa tạo để emit qua socket
  return {
    id: result.insertId,
    user_id: userId || null,
    title,
    message,
    type,
    related_id: relatedId || null,
    is_read: 0,
    created_at: new Date()
  };
}

async function findByUserId(userId) {
  // Lấy thông báo cho 1 user cụ thể
  const sql = `
    SELECT id, user_id, title, message, type, related_id, is_read, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  return await query(sql, [userId]);
}

async function findForAdmins() {
  // Lấy thông báo chung cho admin (user_id IS NULL)
  const sql = `
    SELECT id, user_id, title, message, type, related_id, is_read, created_at
    FROM notifications
    WHERE user_id IS NULL
    ORDER BY created_at DESC
  `;
  return await query(sql, []);
}

async function markAsRead(id) {
  const sql = `
    UPDATE notifications
    SET is_read = 1
    WHERE id = ?
  `;
  await query(sql, [id]);
}

async function markAllAsReadForUser(userId) {
  const sql = `
    UPDATE notifications
    SET is_read = 1
    WHERE user_id = ? AND is_read = 0
  `;
  await query(sql, [userId]);
}

async function markAllAsReadForAdmins() {
  const sql = `
    UPDATE notifications
    SET is_read = 1
    WHERE user_id IS NULL AND is_read = 0
  `;
  await query(sql, []);
}

module.exports = {
  createNotification,
  findByUserId,
  findForAdmins,
  markAsRead,
  markAllAsReadForUser,
  markAllAsReadForAdmins
};
