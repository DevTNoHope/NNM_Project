const { query } = require("../utils/dbQuery");

async function getPlatformStats() {
  const projectsCountSql = "SELECT COUNT(*) AS count FROM projects WHERE status = 'PUBLISHED'";
  const usersCountSql = "SELECT COUNT(DISTINCT COALESCE(CAST(user_id AS CHAR), donor_wallet)) AS count FROM donations WHERE status = 'CONFIRMED'";
  const totalDonationsSql = "SELECT COALESCE(SUM(amount), 0) AS total FROM donations WHERE status = 'CONFIRMED'";

  const [projectsRes, usersRes, donationsRes] = await Promise.all([
    query(projectsCountSql),
    query(usersCountSql),
    query(totalDonationsSql)
  ]);

  return {
    projectsCount: projectsRes[0].count,
    usersCount: usersRes[0].count,
    totalDonations: donationsRes[0].total
  };
}

module.exports = { getPlatformStats };
