const { query } = require("../utils/dbQuery");

async function assignBadge(userId, badgeId) {
  const sql = `
    INSERT IGNORE INTO user_badges (user_id, badge_id, is_selected, earned_at)
    VALUES (?, ?, 0, NOW())
  `;
  const result = await query(sql, [userId, badgeId]);
  return result.affectedRows > 0;
}

async function getUserBadges(userId) {
  const sql = `
    SELECT 
      ub.id as user_badge_id,
      ub.user_id,
      ub.badge_id,
      ub.earned_at,
      ub.is_selected,
      b.name,
      b.slug,
      b.description,
      b.min_points,
      b.color,
      b.icon_url
    FROM user_badges ub
    JOIN badges b ON b.id = ub.badge_id
    WHERE ub.user_id = ?
    ORDER BY b.min_points DESC
  `;
  return await query(sql, [userId]);
}

async function getSelectedBadge(userId) {
  const sql = `
    SELECT 
      ub.id as user_badge_id,
      b.id as badge_id,
      b.name,
      b.slug,
      b.color,
      b.icon_url
    FROM user_badges ub
    JOIN badges b ON b.id = ub.badge_id
    WHERE ub.user_id = ? AND ub.is_selected = 1
    LIMIT 1
  `;
  const rows = await query(sql, [userId]);
  return rows[0] || null;
}

async function setSelectedBadge(userId, badgeId) {
  // First, unset all selected badges for user
  const unsetSql = `UPDATE user_badges SET is_selected = 0 WHERE user_id = ?`;
  await query(unsetSql, [userId]);

  // Then set the specific badge
  const setSql = `UPDATE user_badges SET is_selected = 1 WHERE user_id = ? AND badge_id = ?`;
  const result = await query(setSql, [userId, badgeId]);
  return result.affectedRows > 0;
}

async function hasBadge(userId, badgeId) {
  const sql = `SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ? LIMIT 1`;
  const rows = await query(sql, [userId, badgeId]);
  return rows.length > 0;
}

module.exports = {
  assignBadge,
  getUserBadges,
  getSelectedBadge,
  setSelectedBadge,
  hasBadge,
};
